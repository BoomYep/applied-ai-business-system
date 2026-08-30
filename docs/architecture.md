# Architecture

## Request Lifecycle

This document traces a single customer request through the entire system, from form submission to database storage to dashboard display.

### Phase 1: Client-Side Validation (Browser)

1. User fills out the intake form
2. On every keystroke, Zod schemas validate field-level constraints:
   - Name: 1-100 characters
   - Email: valid email format
   - Phone: optional, max 30 characters
   - Message: 10-2000 characters
3. Submit button remains disabled until all fields are valid
4. Character counter shows remaining characters for the message field

No secrets are present in the browser. No API calls can bypass server validation.

### Phase 2: AI Analysis (Next.js Server → Claude API)

1. Browser POSTs to `/api/analyze` with only the message text
2. Server extracts client IP from headers (x-forwarded-for or x-real-ip)
3. Rate limiter checks IP against in-memory map (5 requests/minute)
   - If exceeded: return 429 with Retry-After header, stop here
4. Server validates message is a string, 10-2000 characters
   - If invalid: return 400, stop here
5. Server calls Claude API (claude-haiku-4-5-20251001) with system prompt
6. Claude returns text response (usually JSON, sometimes wrapped in markdown fences)
7. Server strips markdown fences if present
8. Server parses JSON
9. Server validates JSON against Zod analysis schema
   - If validation fails: retry once (step 5 again)
   - If second attempt fails: return 422, stop here
10. Return validated analysis JSON to browser (200)

At no point does the browser receive the raw Claude API response. The browser only sees validated, structured data.

### Phase 3: Database Save (Browser → Next.js Server → Supabase)

1. Browser POSTs to `/api/requests` with:
   - Customer name, email, phone (from form)
   - Original message (from form)
   - Analysis result (intent, priority, department, suggestedAction, summary)
2. Server validates customer data with Zod request schema
   - If invalid: return 400, stop here
3. Server validates analysis data with Zod analysis schema (again, never trust the client)
   - If invalid: return 400, stop here
4. Server calls `insertRequest()` which:
   - Maps camelCase field names to snake_case database columns
   - Inserts row into `customer_requests` table
   - Database CHECK constraints validate all enums and length limits
   - If database constraint fails: Supabase returns error, server catches it, returns 500
5. Database returns the created row with generated UUID
6. Server returns `{ id: "uuid" }` to browser (201)

If save fails, the browser still shows the analysis result to the user with a warning. The user's work is never lost due to a database error.

### Phase 4: Result Display (Browser)

1. Parent page component switches from "form" view to "result" view
2. Result component displays:
   - Customer information (name, email)
   - Original message in quoted panel
   - AI analysis with intent, priority, department, suggested action, summary
   - "Analyze Another Request" button to reset

The transformation is visually obvious: unstructured text on one side, structured classification on the other.

### Phase 5: Dashboard Access (Next.js Server → Supabase)

1. User navigates to `/dashboard`
2. Dashboard page is a Server Component (runs on server, not in browser)
3. Server reads `department` and `priority` from URL search params
4. Server calls `listRequests({ department, priority })` which:
   - Queries Supabase using service role key
   - Applies filters if present
   - Orders by created_at descending
5. Supabase returns rows (RLS is enabled but service role bypasses policies)
6. Server maps snake_case columns to camelCase TypeScript objects
7. Server formats relative timestamps (2h ago, 3d ago) to avoid hydration mismatch
8. Server renders HTML and sends to browser

The browser never queries Supabase directly. It only receives pre-rendered HTML or hydrated React components with props passed from the server.

### Phase 6: Status Update (Browser → Next.js Server → Supabase)

1. User clicks a status button (e.g., "In Progress")
2. StatusControl component immediately updates local state (optimistic update)
3. Component PATCHes to `/api/requests/[id]` with `{ status: "In Progress" }`
4. Server validates UUID format
   - If invalid: return 400
5. Server validates status is one of the four allowed values
   - If invalid: return 400
6. Server calls `updateRequestStatus(id, status)` which:
   - Updates status and updated_at timestamp
   - Database CHECK constraint validates status enum
7. Supabase returns updated row
   - If no row found: return 404
8. Server returns updated row (200)
9. Browser calls `router.refresh()` to update all Server Components
10. If request failed: revert local state, show error message

The user sees the change immediately. If the server rejects it, the UI reverts with an explanation.

---

## Isolation Strategy: Why the Browser Never Touches Secrets

### The Problem

Modern web applications often expose API keys or database credentials to the client-side JavaScript bundle. This happens in several ways:

1. **NEXT_PUBLIC_ variables** - Environment variables prefixed with NEXT_PUBLIC_ are embedded in the browser bundle by Next.js
2. **Client-side API calls** - Using @supabase/supabase-js with the anon key allows direct database queries from JavaScript
3. **Client-side AI SDKs** - Using @anthropic-ai/sdk in client components exposes the API key

Even if the developer "hides" the key in an environment variable, that variable still ends up in the JavaScript bundle sent to the browser. Anyone can read it.

### The Solution

This application uses a strict isolation boundary:

**Browser can only talk to Next.js server. Server can talk to everything.**

No exceptions. No shortcuts. No "it's fine for this one thing."

### Implementation Details

#### 1. No NEXT_PUBLIC_ Variables

Search the entire codebase for `NEXT_PUBLIC_`. You will find zero matches. Every environment variable is server-side only.

```typescript
// ❌ NEVER do this
const apiKey = process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY;

// ✅ Always do this
const apiKey = process.env.ANTHROPIC_API_KEY; // Only accessible on server
```

#### 2. Server-Only Module Guard

Every module that uses secrets has this line at the top:

```typescript
import "server-only";
```

If a client component tries to import this module, the build fails with a clear error message. The developer cannot accidentally expose secrets by importing the wrong file.

Files with this guard:
- `lib/ai/client.ts` - Anthropic client
- `lib/ai/analyze.ts` - AI analysis function
- `lib/supabase/server.ts` - Supabase client
- `lib/supabase/requests.ts` - Database queries

#### 3. API Routes as Firewall

All external API calls go through Next.js API routes:

```
Browser → /api/analyze → Claude API
Browser → /api/requests → Supabase
```

The API route:
- Validates all input (never trust the client)
- Applies rate limiting
- Calls external service with server-side credentials
- Validates all output
- Returns only necessary data to the client

The browser never knows the Claude API endpoint, the Supabase project URL, or any credentials.

#### 4. Server Components for Queries

The dashboard and detail pages are Server Components. They run on the server, not in the browser.

```typescript
// This runs on the server
export default async function DashboardPage({ searchParams }: Props) {
  const requests = await listRequests(searchParams); // Direct DB call
  return <RequestsTable requests={requests} />;
}
```

The browser receives HTML. It does not receive the database query, the service role key, or the raw database response. It only receives the rendered result.

#### 5. Row-Level Security with Zero Policies

Supabase RLS is enabled on all tables:

```sql
ALTER TABLE customer_requests ENABLE ROW LEVEL SECURITY;
```

But there are **zero policies defined**. This means:
- The anon key has no access (even if leaked)
- The service role key bypasses RLS (as intended)
- Client-side queries would return empty results even with valid credentials

The only way to access the database is with the service role key, which is server-only.

### Cost-Benefit Analysis

This architecture has trade-offs:

**Costs:**
- More API routes (every external call needs a route)
- Server Components cannot use hooks (useState, useEffect, etc.)
- Client Components cannot directly query the database

**Benefits:**
- Secrets cannot leak (build fails if attempted)
- Rate limiting cannot be bypassed
- Validation cannot be bypassed
- Users cannot inspect network requests to find API endpoints
- The attack surface is minimized to three API routes

For a production application handling sensitive customer data, these trade-offs are worth it.

---

## Why the AI Layer is Isolated

The AI analysis function is isolated behind a single API route for several reasons:

### 1. Cost Control

AI API calls are expensive. If the browser could call Claude directly:
- Users could spam the API
- Malicious actors could drain the API budget
- No rate limiting would be possible

By routing through `/api/analyze`, the server can:
- Rate limit by IP (5 requests per minute)
- Log all requests for monitoring
- Stop processing if the user is abusing the system

### 2. Prompt Secrecy

The classification system prompt is valuable intellectual property. It defines:
- The exact enum values the system expects
- The priority classification criteria
- The tone and format of the output

If the browser sent the prompt, users could:
- Extract the prompt from network requests
- Modify the prompt to get different outputs
- Understand the system's decision-making process

By keeping the prompt server-side, it remains proprietary.

### 3. Validation Enforcement

The server validates AI output before accepting it. This prevents:
- Malformed JSON from reaching the database
- Invalid enum values from being stored
- Partial responses from causing errors

If the browser called Claude directly, it could:
- Skip validation and send fake analysis to `/api/requests`
- Store arbitrary data by bypassing Zod checks

By isolating AI behind the server, validation cannot be bypassed.

### 4. Retry Logic

When AI validation fails, the system retries once. This requires:
- Tracking whether this is the first or second attempt
- Making a second API call if needed
- Returning an error after two failures

Client-side retry logic would be:
- Visible in browser dev tools (users could see it failing)
- Vulnerable to manipulation (users could skip retries)
- Harder to debug (no server-side logging)

Server-side retry logic is:
- Hidden from users
- Logged with console.error for debugging
- Impossible to bypass

### 5. Future Flexibility

If the AI strategy changes, only the server code needs updating:
- Switch from Claude to GPT-4 → change `lib/ai/client.ts`
- Add caching for repeated requests → add Redis in API route
- Switch to a fine-tuned model → update model name

The browser code does not change. The API contract (`POST /api/analyze`) remains the same.

---

## Deployment Architecture on Vercel

Vercel runs Next.js applications as serverless functions:

```
[Browser] → [Vercel Edge Network]
                ↓
[Next.js Serverless Functions]
                ↓
    [Claude API]    [Supabase]
```

Each API route becomes a separate serverless function:
- `/api/analyze` → analyze.func
- `/api/requests` → requests.func
- `/api/requests/[id]` → [id].func

Server Components are rendered on-demand in serverless functions.

Environment variables are injected at runtime (not build time), so:
- Secrets never appear in the build output
- Functions cannot start without valid credentials
- Rotating keys requires only updating Vercel settings, not redeploying

The rate limiter is in-memory per function instance. This means:
- Cold starts reset the rate limit (deliberate limitation for demo)
- Production should use Vercel KV or Upstash Redis for persistent state

---

## Alternative Architectures Considered

### Option A: Client-Side AI SDK with API Key Proxy

Use @anthropic-ai/sdk in the browser, proxy requests through a server that adds the API key.

**Rejected because:**
- Browser can inspect requests and extract the prompt
- Browser can modify requests before proxying
- No server-side validation before AI call
- Rate limiting is harder (need to track in proxy)

### Option B: Supabase Anon Key with RLS Policies

Use @supabase/supabase-js in the browser with RLS policies for access control.

**Rejected because:**
- Browser can query the database directly (inspect schema)
- Anon key can be rate-limited but not prevented from listing tables
- Server-side validation is bypassed (client can insert anything allowed by RLS)
- Harder to audit (need to check both RLS policies and application code)

### Option C: Traditional REST API with Separate Backend

Build a separate Express/Fastify API server, deploy it independently from Next.js.

**Rejected because:**
- More infrastructure to maintain (two deployments instead of one)
- Next.js API routes are sufficient for this application
- Serverless scales automatically (no need to manage servers)
- Vercel optimizes routing for Next.js API routes

The chosen architecture (all secrets server-side, browser talks only to Next.js) is the right balance for a production-grade demo.
