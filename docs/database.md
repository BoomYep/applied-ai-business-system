# Database Schema

## Complete SQL Setup

Run this SQL in your Supabase SQL editor to create the schema with all constraints, indexes, and Row-Level Security configuration.

```sql
-- Create the customer_requests table
CREATE TABLE customer_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Customer information
  customer_name TEXT NOT NULL
    CHECK (LENGTH(customer_name) BETWEEN 1 AND 100),
  email TEXT NOT NULL
    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  phone TEXT
    CHECK (phone IS NULL OR LENGTH(phone) <= 30),

  -- Original request
  original_message TEXT NOT NULL
    CHECK (LENGTH(original_message) BETWEEN 10 AND 2000),

  -- AI classification fields
  intent TEXT NOT NULL CHECK (intent IN (
    'Appointment Request',
    'Technical Support',
    'Sales Inquiry',
    'Billing Question',
    'General Inquiry',
    'Complaint',
    'Follow-Up'
  )),

  priority TEXT NOT NULL CHECK (priority IN (
    'Low',
    'Normal',
    'High',
    'Urgent'
  )),

  department TEXT NOT NULL CHECK (department IN (
    'Service',
    'Sales',
    'Billing',
    'Customer Support',
    'Operations'
  )),

  suggested_action TEXT NOT NULL
    CHECK (LENGTH(suggested_action) BETWEEN 1 AND 300),

  summary TEXT NOT NULL
    CHECK (LENGTH(summary) BETWEEN 1 AND 500),

  -- Workflow status
  status TEXT NOT NULL DEFAULT 'New' CHECK (status IN (
    'New',
    'In Review',
    'In Progress',
    'Completed'
  )),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX idx_customer_requests_created_at
  ON customer_requests (created_at DESC);

CREATE INDEX idx_customer_requests_department
  ON customer_requests (department);

CREATE INDEX idx_customer_requests_priority
  ON customer_requests (priority);

CREATE INDEX idx_customer_requests_status
  ON customer_requests (status);

CREATE INDEX idx_customer_requests_dept_priority
  ON customer_requests (department, priority);

-- Enable Row Level Security
ALTER TABLE customer_requests ENABLE ROW LEVEL SECURITY;

-- No policies are created
-- This means only the service role key can access the table
-- The anon key has no access even if it leaks

-- Grant necessary permissions to service role (already done by default in Supabase)
-- No additional grants needed
```

---

## Schema Explanation

### Primary Key

```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
```

**Why UUID instead of SERIAL:**
- UUIDs are globally unique (can merge data from multiple databases)
- UUIDs do not leak information (cannot guess next ID)
- UUIDs work well with distributed systems
- Performance difference is negligible for this table size

**Why not use a custom ID scheme:**
- UUIDs are standard
- No need to implement a counter or prefix logic
- Database generates them automatically

### Customer Information

```sql
customer_name TEXT NOT NULL CHECK (LENGTH(customer_name) BETWEEN 1 AND 100)
```

**Why TEXT instead of VARCHAR(100):**
- In PostgreSQL, TEXT and VARCHAR have identical performance
- TEXT is more flexible (no need to specify length)
- CHECK constraint enforces the length limit

```sql
email TEXT NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
```

**Why regex validation in the database:**
- Defense in depth (catches invalid emails even if application validation is bypassed)
- Prevents data corruption from bugs
- The regex is case-insensitive (~* operator)

**Why not use a more complex email regex:**
- Perfect email validation is impossible (RFC 5322 is 4000+ characters)
- This regex catches the vast majority of invalid inputs
- False negatives are rare (rejecting a valid email)

```sql
phone TEXT CHECK (phone IS NULL OR LENGTH(phone) <= 30)
```

**Why allow NULL:**
- Phone is optional in the intake form
- Many customers prefer not to provide phone numbers
- Email is sufficient for most communication

**Why max 30 characters:**
- International phone numbers with country codes: ~15 digits
- Formatting characters (spaces, dashes, parentheses): +5
- Extension ("ext 1234"): +10
- Total: 30 is generous

### Original Message

```sql
original_message TEXT NOT NULL CHECK (LENGTH(original_message) BETWEEN 10 AND 2000)
```

**Why 10 characters minimum:**
- "Help" (4 chars) is too vague to classify
- "I need help with billing" (26 chars) is classifiable
- 10 is a compromise (allows short but meaningful messages)

**Why 2000 characters maximum:**
- Most customer requests are 100-300 characters
- Long messages (>2000 chars) are usually copy-pasted policies or error logs
- Limiting length prevents database bloat
- The intake form enforces this client-side, but the database enforces it server-side

### AI Classification Fields

```sql
intent TEXT NOT NULL CHECK (intent IN ('Appointment Request', ...))
```

**Why TEXT with CHECK constraint instead of ENUM:**
- PostgreSQL ENUMs are immutable (adding a new value requires migration)
- CHECK constraints can be modified with ALTER TABLE
- The application code defines the allowed values (types/index.ts)
- The database enforces them at write time

**Why these specific enum values:**
- They cover the majority of customer requests
- They are mutually exclusive (a request is not both "Sales Inquiry" and "Technical Support")
- They are operationally useful (each maps to a department)

```sql
suggested_action TEXT NOT NULL CHECK (LENGTH(suggested_action) BETWEEN 1 AND 300)
```

**Why 300 characters max:**
- Suggested actions should be one sentence
- "Investigate the login issue and provide a password reset link." (62 chars)
- "Contact customer to gather more details about the billing discrepancy and cross-reference with invoice records." (115 chars)
- 300 is generous for a one-sentence action

```sql
summary TEXT NOT NULL CHECK (LENGTH(summary) BETWEEN 1 AND 500)
```

**Why 500 characters max:**
- Summaries should be 1-3 sentences
- They provide context without repeating the full message
- 500 characters = ~75-100 words = 2-3 sentences

### Workflow Status

```sql
status TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'In Review', 'In Progress', 'Completed'))
```

**Why these four statuses:**
- They represent a typical workflow lifecycle
- They are sequential (New → In Review → In Progress → Completed)
- They are actionable (each status implies a next step)

**Why default to 'New':**
- All requests start as unprocessed
- The application does not need to specify status on insert
- Default values reduce boilerplate

### Timestamps

```sql
created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
```

**Why TIMESTAMPTZ instead of TIMESTAMP:**
- TIMESTAMPTZ stores time in UTC
- Converts to local time zone on read
- Prevents time zone bugs (daylight saving time, international customers)

**Why not use triggers to auto-update updated_at:**
- The application explicitly sets updated_at on status changes
- This makes updates auditable (you can see when the application updated it)
- Triggers are implicit magic (harder to debug)

---

## Indexes Explained

### created_at Descending

```sql
CREATE INDEX idx_customer_requests_created_at ON customer_requests (created_at DESC);
```

**Why:** The dashboard defaults to showing requests ordered by created_at descending (newest first). Without this index, PostgreSQL would scan the entire table and sort in memory.

**Performance impact:**
- Without index: O(n log n) (full table scan + sort)
- With index: O(1) (read from index in order)

### Single-Column Indexes

```sql
CREATE INDEX idx_customer_requests_department ON customer_requests (department);
CREATE INDEX idx_customer_requests_priority ON customer_requests (priority);
CREATE INDEX idx_customer_requests_status ON customer_requests (status);
```

**Why:** The FilterBar allows filtering by department, priority, or status individually.

**Query example:**
```sql
SELECT * FROM customer_requests
WHERE department = 'Sales'
ORDER BY created_at DESC;
```

PostgreSQL can use `idx_customer_requests_department` to filter, then use `idx_customer_requests_created_at` to order.

### Composite Index

```sql
CREATE INDEX idx_customer_requests_dept_priority ON customer_requests (department, priority);
```

**Why:** Users often filter by both department and priority simultaneously:

**Query example:**
```sql
SELECT * FROM customer_requests
WHERE department = 'Sales' AND priority = 'Urgent'
ORDER BY created_at DESC;
```

PostgreSQL can use the composite index to filter efficiently.

**Why department first, priority second:**
- More selective column goes first
- There are 5 departments but only 4 priorities
- `department = 'Sales'` narrows the result set more than `priority = 'Urgent'`

**Index size trade-off:**
- Each index consumes disk space
- More indexes = slower writes (index must be updated on every insert)
- This table is read-heavy (dashboard queries) and write-light (user submissions)
- The trade-off favors more indexes for faster reads

---

## Row-Level Security (RLS)

```sql
ALTER TABLE customer_requests ENABLE ROW LEVEL SECURITY;
```

**What this does:**
- Enables RLS on the table
- By default, **no one can access the table** (not even the anon key)

**Why no policies are defined:**
- This application uses the **service role key**, which bypasses RLS
- The service role key is server-side only
- Even if the anon key leaks, it cannot read or write this table

**What if you wanted to add public read access:**

```sql
CREATE POLICY "Allow public read access"
ON customer_requests FOR SELECT
USING (true);
```

This would allow anyone with the anon key to read all rows. **Do not do this for sensitive data.**

**What if you wanted user-scoped access:**

```sql
CREATE POLICY "Users can only see their own requests"
ON customer_requests FOR SELECT
USING (auth.uid() = user_id);
```

This would require:
- Adding a `user_id UUID REFERENCES auth.users(id)` column
- Implementing authentication (NextAuth, Clerk, Supabase Auth)
- Users could only see requests they submitted

For this demo, RLS is enabled but unused. The application accesses the database with the service role key from server-side code.

---

## Grants and Permissions

Supabase automatically grants the service role full access to all tables. No additional grants are needed.

If you were using a custom PostgreSQL setup (not Supabase), you would need:

```sql
GRANT SELECT, INSERT, UPDATE, DELETE ON customer_requests TO service_role;
GRANT USAGE, SELECT ON SEQUENCE customer_requests_id_seq TO service_role;
```

But Supabase handles this automatically.

---

## Data Migration

If you need to modify the schema after deployment:

### Adding a New Intent

```sql
ALTER TABLE customer_requests
DROP CONSTRAINT customer_requests_intent_check;

ALTER TABLE customer_requests
ADD CONSTRAINT customer_requests_intent_check
CHECK (intent IN (
  'Appointment Request',
  'Technical Support',
  'Sales Inquiry',
  'Billing Question',
  'General Inquiry',
  'Complaint',
  'Follow-Up',
  'Refund Request'  -- New value
));
```

You must also update:
- `types/index.ts` (TypeScript type)
- `lib/validation/analysis.schema.ts` (Zod schema)
- `lib/ai/prompt.ts` (system prompt)

### Renaming a Column

```sql
ALTER TABLE customer_requests
RENAME COLUMN suggested_action TO recommended_action;
```

You must also update all TypeScript code that references this column.

### Adding a New Column

```sql
ALTER TABLE customer_requests
ADD COLUMN assigned_to TEXT;
```

Existing rows will have NULL for this column.

---

## Backup and Restore

Supabase automatically backs up your database. To manually export:

```bash
# Export schema only
pg_dump -h db.your-project.supabase.co -U postgres -s your-db > schema.sql

# Export data only
pg_dump -h db.your-project.supabase.co -U postgres -a your-db > data.sql

# Export everything
pg_dump -h db.your-project.supabase.co -U postgres your-db > backup.sql
```

To restore:

```bash
psql -h db.your-project.supabase.co -U postgres -d your-db < backup.sql
```

---

## Performance Considerations

### Query Performance

With proper indexes, queries are fast even with large datasets:

- Dashboard load benefits from the created_at index
- Filtered queries use department and priority indexes
- Request detail page uses primary key lookup
- Status updates target a single row by primary key

### Write Performance

Inserts are efficient:
- Single request inserts are fast
- Indexes update automatically
- No triggers or complex cascades

### Scaling

This schema is designed for operational databases of significant size. For typical business request volumes, the schema will not be the bottleneck. At very high scales, consider partitioning by created_at or archiving old data.

---

## Common Queries

### Get all requests for a specific department

```sql
SELECT * FROM customer_requests
WHERE department = 'Sales'
ORDER BY created_at DESC
LIMIT 50;
```

### Get urgent requests that are not completed

```sql
SELECT * FROM customer_requests
WHERE priority = 'Urgent' AND status != 'Completed'
ORDER BY created_at ASC;
```

### Count requests by intent

```sql
SELECT intent, COUNT(*)
FROM customer_requests
GROUP BY intent
ORDER BY COUNT(*) DESC;
```

### Average time to completion

```sql
SELECT AVG(updated_at - created_at) AS avg_completion_time
FROM customer_requests
WHERE status = 'Completed';
```

### Requests created in the last 24 hours

```sql
SELECT * FROM customer_requests
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

---

## Security Auditing

To verify RLS is enabled:

```sql
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'customer_requests';
```

Expected output:
```
 schemaname |     tablename      | rowsecurity
------------+--------------------+-------------
 public     | customer_requests  | t
```

`rowsecurity = t` means RLS is enabled.

To check policies (should be empty for this application):

```sql
SELECT * FROM pg_policies WHERE tablename = 'customer_requests';
```

Expected output: 0 rows (no policies defined).

To verify constraints:

```sql
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'customer_requests'::regclass;
```

This shows all CHECK constraints and their definitions.

---

## Troubleshooting

### Error: insert or update on table "customer_requests" violates check constraint

**Cause:** Application tried to insert invalid data.

**Fix:** Check which constraint failed:
```sql
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'customer_requests'::regclass
AND contype = 'c';
```

The constraint name indicates which field is invalid.

### Error: permission denied for table customer_requests

**Cause:** Using anon key instead of service role key.

**Fix:** Verify environment variable:
```bash
echo $SUPABASE_SERVICE_ROLE_KEY
```

Should be the service_role key, not the anon key.

### Error: relation "customer_requests" does not exist

**Cause:** Table not created yet.

**Fix:** Run the SQL from this document in Supabase SQL editor.

---

## Testing the Schema

To verify the schema works:

```sql
-- This should succeed
INSERT INTO customer_requests (
  customer_name, email, phone, original_message,
  intent, priority, department, suggested_action, summary
) VALUES (
  'John Doe',
  'john@example.com',
  '+1-555-0123',
  'I need help setting up my account.',
  'Technical Support',
  'Normal',
  'Customer Support',
  'Provide account setup instructions via email.',
  'Customer needs assistance with account setup.'
);

-- This should fail (intent not in enum)
INSERT INTO customer_requests (
  customer_name, email, phone, original_message,
  intent, priority, department, suggested_action, summary
) VALUES (
  'Jane Doe',
  'jane@example.com',
  NULL,
  'I want to buy your product.',
  'Purchase Request',  -- Invalid intent
  'Normal',
  'Sales',
  'Send product catalog.',
  'Customer interested in purchasing.'
);
```

The first insert succeeds. The second fails with:
```
ERROR: new row for relation "customer_requests" violates check constraint "customer_requests_intent_check"
```

This confirms the constraints are working.
