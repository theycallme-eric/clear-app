# Plan: Auth Session Management

## Context
The app has no way for users to choose whether their session persists across browser restarts, and no way to sign out. Supabase defaults to localStorage (always persists). We need a "Stay logged in" checkbox on sign-in and a sign out button in Settings with confirmation.

**Branch:** `feature/auth-session-management` (off current `feature/workout-card-overhaul`)

---

## Step 1: Create custom storage adapter
**New file:** `src/lib/auth-storage.ts`

- A preference flag `clear.auth.stayLoggedIn` stored in **localStorage** (must survive browser close so the adapter knows which storage to read on reload)
- Exports: `getStayLoggedIn()`, `setStayLoggedIn(value)`, `clearStayLoggedIn()`
- Exports `authStorageAdapter` object with `getItem`/`setItem`/`removeItem`:
  - `getItem`: reads from active storage, falls back to the other (handles preference change between sessions)
  - `setItem`: writes to active storage, removes from the other (prevents stale tokens)
  - `removeItem`: clears both storages
- Default: `true` (stay logged in)

## Step 2: Wire adapter into Supabase client
**Modify:** `src/lib/supabase.ts`

- Import `authStorageAdapter` from `./auth-storage`
- Pass `{ auth: { storage: authStorageAdapter } }` as third arg to `createClient`
- HMR guard (`globalThis.__supabase`) still works — adapter reads the flag dynamically per call

## Step 3: Add "Stay logged in" checkbox to sign-in form
**Modify:** `src/pages/SignInScreen.tsx`

- Import `getStayLoggedIn`, `setStayLoggedIn` from `@/lib/auth-storage`
- Add state: `const [stayLoggedIn, setStayLoggedInState] = useState(getStayLoggedIn)`
- Replace the standalone "Forgot password?" button (lines 124-131) with a flex row:
  - Left: native `<input type="checkbox">` + "Stay logged in" label
  - Right: "Forgot password?" link (moved here)
- On checkbox change: update state + call `setStayLoggedIn(value)`
- In `handleSubmit`: call `setStayLoggedIn(stayLoggedIn)` before `signInWithPassword` (defensive)

## Step 4: Create sign-out confirmation modal
**New file:** `src/components/SignOutConfirmModal.tsx`

- Follow the `AbandonmentModal.tsx` pattern exactly: fixed overlay, `Card`, heading, description, two `CTAButton`s
- Props: `onConfirm`, `onCancel`
- Primary button: "Sign Out", secondary: "Cancel"

## Step 5: Add sign out to Settings hub
**Modify:** `src/pages/SettingsScreen.tsx`

- Add `onSignOut: () => void` to `SettingsScreenProps`
- Add `showSignOutConfirm` state
- After the last section in the hub view (after Developer section, ~line 396), add a sign-out button using `CTAButton` variant="secondary" with red text styling
- Render `SignOutConfirmModal` when `showSignOutConfirm` is true

## Step 6: Connect sign out through Index.tsx
**Modify:** `src/pages/Index.tsx`

- Add `signOut` to `useAuthContext()` destructuring (line 27-34)
- Pass `onSignOut={signOut}` to `<SettingsScreen>` (line 282-287)
- Navigation already handled: status → `'unauthenticated'` → navigates to welcome (line 80-84)

## Step 7: Clear preference on sign out
**Modify:** `src/contexts/AuthContext.tsx`

- Import `clearStayLoggedIn` from `@/lib/auth-storage`
- In `signOut` callback (line 391-393): call `clearStayLoggedIn()` after `supabase.auth.signOut()` so next login defaults to checked

---

## Files Summary

| File | Action |
|------|--------|
| `src/lib/auth-storage.ts` | Create — storage adapter + preference helpers |
| `src/lib/supabase.ts` | Modify — pass adapter to `createClient` |
| `src/pages/SignInScreen.tsx` | Modify — add checkbox + wire preference |
| `src/components/SignOutConfirmModal.tsx` | Create — confirmation modal |
| `src/pages/SettingsScreen.tsx` | Modify — add `onSignOut` prop + button + modal |
| `src/pages/Index.tsx` | Modify — pass `signOut` to SettingsScreen |
| `src/contexts/AuthContext.tsx` | Modify — clear preference on sign out |

## Verification
1. `npx tsc --noEmit` — TypeScript compiles
2. `npm run build` — build passes
3. Manual test: sign in with checkbox checked → close browser → reopen → still signed in
4. Manual test: sign in with checkbox unchecked → close browser → reopen → must sign in again
5. Manual test: Settings → Sign Out → confirm → returns to welcome screen
6. Manual test: after sign out, sign in again → checkbox defaults to checked
