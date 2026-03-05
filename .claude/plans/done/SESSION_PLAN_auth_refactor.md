# Session Plan: Auth System Refactor

## Session Goal
Replace the current multi-hook auth system (5+ hooks with race conditions) with a single AuthContext that fetches profile data once and provides explicit auth status to the entire app.

## Context
- **Reference:** `docs/plans/auth-refactor-plan.md` — Full implementation details with code samples (1000+ lines). Read this FIRST before starting any work.
- **Existing hooks to understand:** `src/hooks/useAuth.ts`, `src/hooks/usePreferencesSync.ts`, `src/hooks/useHomeData.ts`, `src/hooks/useOnboardingFlow.ts`
- **Routing:** `src/pages/Index.tsx` — Currently uses multiple boolean flags for navigation decisions
- **Supabase client:** `src/lib/supabase.ts`
- **Types:** `src/types/workout.ts` (UserPreferences, etc.)
- **Recommended skills:** `debug.md`, `supabase_workflow.md`
- **Current state:** Auth works but profile data is fetched 3-4 times on app init. Multiple hooks independently call `supabase.auth.getSession()` and query the `users` table, creating race conditions and inconsistent state.

## Problem Summary

The current auth system has these specific issues:

1. **Duplicate fetching:** `useAuth`, `usePreferencesSync`, and `useHomeData` all independently fetch profile data on mount
2. **Race conditions:** Multiple `onAuthStateChange` listeners fire in unpredictable order
3. **Inconsistent state:** Navigation depends on `isAuthenticated`, `onboardingComplete`, `userId`, and `authLoading` — these can briefly disagree
4. **No single source of truth:** Auth state is derived independently in each hook rather than flowing from one place

## Target Architecture

```
AuthContext (single provider)
├── status: 'loading' | 'unauthenticated' | 'authenticated'
├── user: { id, email, profile, locations, preferences }
├── actions: { signIn, signOut, updateProfile }
└── fetches profile + locations ONCE on auth

useHomeData (simplified)
├── Only fetches: workout history, streak data
├── Receives userId from AuthContext (no independent auth check)
└── Mounted check prevents state updates after unmount

Index.tsx (simplified routing)
├── Reads status from AuthContext
├── Single switch statement for navigation
└── No boolean flag combinations
```

---

## Tasks

### 1. Create AuthContext
**Do:**
1. Create `src/contexts/AuthContext.tsx`
2. Implement a single context that:
   - Subscribes to `supabase.auth.onAuthStateChange` (ONE listener for the whole app)
   - On `SIGNED_IN` / `TOKEN_REFRESHED`: fetches user profile, locations, and preferences in a single `Promise.all`
   - On `SIGNED_OUT`: clears all state
   - Exposes an explicit `status` field: `'loading' | 'unauthenticated' | 'authenticated'`
   - Exposes `user` object (null when unauthenticated) containing: `id`, `email`, `profile`, `locations`, `preferences`
   - Exposes `updateProfile` action for post-onboarding and settings updates
3. Export `AuthProvider` component and `useAuthContext` hook
4. Include a `mounted` ref check to prevent state updates after unmount

**Key design decisions (already made — do not change):**
- Status is a single string enum, NOT separate boolean flags
- Profile + locations + preferences are fetched together, not independently
- The context does NOT handle workout history or streak data (that stays in useHomeData)

**Acceptance:**
- [ ] `src/contexts/AuthContext.tsx` exists
- [ ] Exports `AuthProvider` and `useAuthContext`
- [ ] Only ONE `onAuthStateChange` subscription exists in the entire app
- [ ] Profile data fetched exactly once per auth event (verify in Network tab)
- [ ] TypeScript compiles with no errors
- [ ] `status` transitions: `loading` → `authenticated` (or `unauthenticated`)

---

### 2. Wire AuthProvider into App
**Do:**
1. Open `src/main.tsx` (or wherever the app root is)
2. Wrap the app in `<AuthProvider>` — it should be OUTSIDE any router but INSIDE any error boundaries
3. Remove any auth-related providers that are now redundant

**Acceptance:**
- [ ] `<AuthProvider>` wraps the app in main.tsx
- [ ] App still renders (no white screen)
- [ ] No duplicate provider warnings in console

---

### 3. Simplify useHomeData
**Do:**
1. Open `src/hooks/useHomeData.ts`
2. Remove all auth checking logic — it should receive `userId` as a parameter, not fetch it
3. Remove any `supabase.auth.getSession()` calls
4. Remove any profile/preferences fetching (that's now in AuthContext)
5. Keep ONLY: workout history fetching, streak data fetching, incomplete session check
6. Add a `mounted` ref check so async callbacks don't update state after unmount

**Acceptance:**
- [ ] `useHomeData` accepts `userId: string | null` as input
- [ ] Zero auth-related imports or calls remain in this hook
- [ ] Zero profile/preferences fetching in this hook
- [ ] Workout history and streak data still load correctly on home screen

---

### 4. Simplify useOnboardingFlow
**Do:**
1. Open `src/hooks/useOnboardingFlow.ts`
2. Replace any direct Supabase auth calls with `useAuthContext()`
3. After onboarding completes, call `updateProfile` from AuthContext instead of independently re-fetching
4. Remove any redundant state that duplicates what AuthContext provides

**Acceptance:**
- [ ] Onboarding flow still works end-to-end (complete all steps → land on home)
- [ ] No direct `supabase.auth` calls in this hook
- [ ] Profile updates flow through AuthContext.updateProfile

---

### 5. Update Index.tsx Navigation
**Do:**
1. Replace all current auth hook usage with `useAuthContext()`
2. Replace the multi-boolean navigation logic with a clean switch on `status`:
   ```
   if (status === 'loading') → show loading screen
   if (status === 'unauthenticated') → show welcome/auth screens
   if (status === 'authenticated' && !profile.onboarding_completed) → show onboarding
   if (status === 'authenticated' && profile.onboarding_completed) → show home
   ```
3. Remove any `useEffect` chains that were coordinating auth state between hooks

**Acceptance:**
- [ ] Navigation works for all four states above
- [ ] No `authLoading`, `isAuthenticated`, `onboardingComplete` boolean flags — replaced by `status` + profile check
- [ ] Index.tsx is shorter than before (fewer auth-related useEffects)

---

### 6. Delete Dead Code
**Do:**
1. Delete `src/hooks/useAuth.ts` (replaced by AuthContext)
2. Delete `src/hooks/usePreferencesSync.ts` (preferences now in AuthContext)
3. Search the entire codebase for imports of these deleted files and remove them
4. Search for any remaining direct `supabase.auth.getSession()` calls outside of AuthContext — there should be ZERO

**Acceptance:**
- [ ] `useAuth.ts` deleted
- [ ] `usePreferencesSync.ts` deleted
- [ ] `grep -r "useAuth" src/` returns only AuthContext references
- [ ] `grep -r "usePreferencesSync" src/` returns zero results
- [ ] `grep -r "getSession" src/` returns only AuthContext (and possibly supabase.ts if needed for token refresh)
- [ ] No TypeScript errors
- [ ] No runtime errors in console

---

### 7. End-to-End Verification
**Do:** Test these flows manually in the browser:

| Flow | Steps | Expected |
|------|-------|----------|
| **Fresh user** | Sign up → complete onboarding | Lands on home with data loaded |
| **Returning user** | Open app (already signed in) | Loading → home screen, no flash of welcome screen |
| **Settings** | Go to settings → change preference → save | Preference persists after page refresh |
| **Sign out / in** | Sign out → sign back in | Clean transition, no stale data |
| **Page refresh** | Refresh on any screen while authenticated | Returns to correct screen, no auth flash |

**Also verify in DevTools:**
- **Network tab:** Profile query fires exactly ONCE on app load (not 3-4 times)
- **Console:** No errors, no warnings about missing auth, no "setState on unmounted component"
- **React DevTools (if available):** Only one AuthContext provider in the tree

**Acceptance:**
- [ ] All five flows above pass
- [ ] Network tab shows single profile fetch
- [ ] Console is clean

---

## Design System Compliance
- No UI changes in this refactor — this is pure logic/state management
- Use existing design tokens if any new loading states are needed
- Follow existing code patterns (absolute imports `@/contexts/AuthContext`)
- Mobile-first (ensure no layout shifts during auth loading)

## Risk Notes
- **This is a critical-path refactor.** Auth touches everything. If something breaks mid-session, the app won't load.
- **Suggested approach:** Complete Tasks 1-2 first and verify the app still works with the old hooks + new context coexisting. Then migrate consumers (Tasks 3-5) one at a time, testing after each. Delete dead code (Task 6) only after everything works.
- **Rollback:** If things go sideways, `git stash` or revert. Don't push to main until all verification passes.

## After Session (REQUIRED — you are not done until this is complete)
- [ ] Update `docs/SESSION_LOG.md` with: Date, tasks completed, files created/modified/deleted
- [ ] Update `docs/wireframes/PROJECT_MAP.md` to reflect new AuthContext architecture (remove old hook descriptions, add context)
- [ ] Add to BACKLOG.md completed section: "Auth system refactor — single AuthContext replaces multi-hook system"
- [ ] Mark any related BACKLOG items as complete
- [ ] Run `npm run build` — zero errors
- [ ] Confirm: "Session complete. Auth refactor done. Single AuthContext replaces useAuth + usePreferencesSync. Profile fetched once. Log and backlog updated."
