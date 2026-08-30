# Applied AI Business System

## What this is
A public portfolio project demonstrating how AI converts unstructured customer requests into structured business workflows. Next.js + TypeScript + Supabase + Claude API, deployed on Vercel.

## Hard rules
- This repository will be PUBLIC. Never write API keys, tokens, passwords, or credentials into any file except .env.local (which is gitignored).
- Never create variables prefixed with NEXT_PUBLIC_ for Supabase or Anthropic. All secrets stay server-side.
- Never run `git push`, `git remote add`, or create a GitHub repository. The user handles that manually at the end.
- All code, comments, commits, documentation and UI text in English.
- TypeScript must compile with zero errors. No placeholder code, no fake data, no unused components.

## Architecture
- Supabase is accessed ONLY from the server using the service role key. RLS is enabled with no public policies.
- Claude API is called ONLY from server-side route handlers.
- AI model: claude-haiku-4-5-20251001
- All AI JSON output is validated with Zod before it reaches the database.

## Working style
- Build only what is asked in the current step. Do not add features, dependencies, or abstractions that were not requested.
- Ask before installing any new npm package.
