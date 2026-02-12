# Session Plan: Fix Auth Race Conditions and Onboarding Persistence

## Session Goal

Fix the AbortError during onboarding and ensure `onboarding_completed` persists to the database. Implement operation locking to prevent client-side race conditions and an atomic RPC for database-level transaction safety.

## Context

Reference: src/contexts/AuthContext.tsx
Reference: src/hooks/useOnboardingFlow.ts
Reference: supabase/migrations/00014_unique_location_names.sql

## Tasks

### Task 1: Add Operation Locking to AuthContext

**Do:**
- Add `operationLockRef` to track when critical write operations are in progress
- Create `acquireLock()` and `releaseLock()` helper functions
- Modify `onAuthStateChange` to skip `fetchUserData` when a lock is held
- This prevents TOKEN_REFRESHED from reading stale data during writes

**Acceptance:**
- `operationLockRef` exists as a `useRef<string | null>(null)`
- `onAuthStateChange` checks lock before calling `fetchUserData`
- Lock check logs a message when skipping (for debugging)
- TypeScript compiles: `npx tsc --noEmit`

---

### Task 2: Lock During completeOnboarding

**Do:**
- Wrap `completeOnboarding` body in lock acquisition
- Use try/finally to ensure lock is always released
- Throw error if lock cannot be acquired (another operation in progress)

**Acceptance:**
- `completeOnboarding` calls `acquireLock('completeOnboarding')` at start
- `releaseLock()` is called in `finally` block
- Lock is released even if an error is thrown
- TypeScript compiles: `npx tsc --noEmit`

---

### Task 3: Remove Promise.race Timeout Anti-pattern

**Do:**
- Remove the `Promise.race` with `timeoutPromise` from the `initialize` function
- Replace with direct `await supabase.auth.getSession()` call
- Let Supabase handle its own timeouts (they have built-in request timeouts)
- This eliminates the source of AbortError from abandoned-but-continuing requests

**Acceptance:**
- No `Promise.race` in `initialize` function
- No `timeoutPromise` variable
- `supabase.auth.getSession()` is awaited directly
- TypeScript compiles: `npx tsc --noEmit`

---

### Task 4: Create Atomic Onboarding RPC Migration

**Do:**
- Create new migration file `supabase/migrations/00015_complete_onboarding_rpc.sql`
- Implement `complete_onboarding()` function that:
  - Takes user_id, location data, and profile preferences
  - Upserts location with ON CONFLICT handling
  - Updates profile with onboarding_completed=true
  - Returns the location ID
  - All in a single transaction (implicit in PL/pgSQL)
- Use SECURITY DEFINER so RLS doesn't block the internal queries

**Acceptance:**
- File exists at `supabase/migrations/00015_complete_onboarding_rpc.sql`
- Function accepts all required parameters with correct types
- Uses INSERT...ON CONFLICT for location upsert
- Updates profile in same function body
- Returns UUID (location_id)

---

### Task 5: Update completeOnboarding to Use RPC

**Do:**
- Replace the two separate Supabase calls (location upsert + profile update) with single RPC call
- Call `supabase.rpc('complete_onboarding', {...})`
- Handle the response (locationId returned)
- Keep the local state update as-is
- Add fallback to sequential queries if RPC fails (for backwards compatibility during migration)

**Acceptance:**
- `completeOnboarding` uses `supabase.rpc('complete_onboarding', ...)`
- Parameters map correctly to RPC function signature
- Local state update uses returned location ID
- Error handling exists for RPC failure
- TypeScript compiles: `npx tsc --noEmit`

---

### Task 6: Update TypeScript Types for RPC

**Do:**
- Add the `complete_onboarding` function signature to `src/types/database.ts` in the Functions section
- This enables type-safe RPC calls

**Acceptance:**
- `complete_onboarding` function defined in `Database['public']['Functions']`
- Args and Returns types match the SQL function
- TypeScript compiles: `npx tsc --noEmit`

---

### Task 7: Verification

**Do:**
- Run `npm run build` to verify no build errors
- Document manual testing steps for user

**Acceptance:**
- `npm run build` passes
- Manual test plan provided:
  1. Create new account
  2. Complete onboarding
  3. Check console for AbortError (should be none)
  4. Sign out
  5. Sign back in
  6. Should go directly to home (not onboarding)
