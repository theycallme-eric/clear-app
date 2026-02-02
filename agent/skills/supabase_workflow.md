# Supabase & Vite Workflow Skill

**Context:** This is a Vite + React Single Page Application (SPA). We use custom state-based routing in `src/pages/Index.tsx`.

1.  **The "Monolith" Warning:**
    * `src/pages/Index.tsx` contains the main routing logic and state.
    * **Rule:** When asking to update the UI, prefer extracting components *out* of this file into `src/components/` rather than adding more JSX to `Index.tsx`.

2.  **Type Safety (Vite):**
    * If you modify the database, run: `npx supabase gen types typescript --project-id "your-project-id" > src/types/database.ts`
    * Always import types from `src/types/database.ts`.

3.  **Environment Variables:**
    * Use `import.meta.env.VITE_SUPABASE_URL` (NOT process.env).
    * Never expose the service_role key in client-side code.

4.  **Verification:**
    * We do not use Server Components. All data fetching happens in `useEffect` or event handlers.
    * When implementing a feature, check the browser console for network errors.