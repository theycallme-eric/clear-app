---
name: supabase-workflow
description: Patterns for working with Supabase backend, database, and auth
trigger: When touching Backend, Database, or Auth
category: backend
---

# Skill: Supabase Workflow

## Context

This is a Vite + React SPA with Supabase backend. Understanding the architecture prevents common mistakes with types, env vars, and data fetching.

## Steps

1. **Check the Monolith**
   - `src/pages/Index.tsx` contains main routing and state
   - **Rule:** Extract components OUT of this file
   - Do NOT add more JSX to Index.tsx

2. **Type Safety**
   - If modifying database schema, regenerate types:
     ```bash
     npx supabase gen types typescript --project-id "qxckevxniacktaqecypl" > src/types/database.ts
     ```
   - Always import types from `src/types/database.ts`

3. **Environment Variables**
   - Use `import.meta.env.VITE_SUPABASE_URL` (NOT `process.env`)
   - Never expose `service_role` key in client code
   - Check `.env` for available variables

4. **Data Fetching**
   - No Server Components — this is a client-side SPA
   - Fetch data in `useEffect` or event handlers
   - Use Supabase client from `src/lib/supabase.ts`

5. **Migrations**
   - New migrations go in `supabase/migrations/`
   - Use incrementing numbers: `00012_description.sql`
   - Apply via Supabase Dashboard SQL Editor

6. **Edge Functions**
   - Located in `supabase/functions/`
   - Deploy: `supabase functions deploy function-name`

## Reference Files

- `src/lib/supabase.ts` — Supabase client
- `src/types/database.ts` — Generated types
- `supabase/migrations/` — Database migrations
- `supabase/functions/` — Edge functions
- `.env` — Environment variables

## Related Skills

- [debug](.claude/skills/debug.md) — Error resolution

## Checklist

- [ ] Types regenerated (if schema changed)
- [ ] Using `import.meta.env` (not `process.env`)
- [ ] No service_role key in client code
- [ ] Data fetching in useEffect/handlers
- [ ] Tested in browser console for network errors
