# Integration & Deployment Gap Audit

> Generated 2026-04-24. Research-only — no code changes made.
> Covers: deployment parity, hanging promises, silent failures, auth edge cases.

---

## How to read this

Findings are grouped by category, then sorted by severity within each group. Each finding includes the file, line(s), what's wrong, and what the user experiences.

Severity levels:
- **P0** — Blocks core flows (sign-out, session save, workout completion)
- **P1** — Degrades experience silently (data not saved, stale state)
- **P2** — Edge-case or hardening issue (multi-tab, retry UX, dev routes)

---

## 1. Deployment Parity

| # | Finding | Severity | Status |
|---|---------|----------|--------|
| D1 | SPA rewrite rule in vercel.json | OK | Catch-all `/(.*) -> /index.html` present |
| D2 | Env vars via `import.meta.env.VITE_*` | OK | Validated at init in `supabase.ts:8-10` |
| D3 | No hardcoded Supabase URLs in frontend | OK | Only in test scripts (acceptable) |
| D4 | Auth redirect URLs only configured for localhost | **P1** | See below |
| D5 | CORS allow-list for production domain | **P1** | See below |

### D4 — Auth redirect URLs (P1)

`supabase/config.toml:146-152` only lists `localhost` and `127.0.0.1` redirect URLs. The `config.toml` is local-only — production Supabase project needs separate configuration.

**What breaks:** Password reset emails link to localhost if production Supabase project isn't configured with the Vercel domain.

**Action:** Verify in Supabase Cloud Dashboard > Authentication > URL Configuration that:
- Site URL = production Vercel domain
- Redirect URLs includes `https://<domain>/reset-password`

### D5 — CORS allow-list (P1)

No explicit CORS config in codebase. All API calls go through Supabase SDK, which relies on the Supabase project's CORS settings.

**What breaks:** If the Vercel domain isn't in the Supabase project's API CORS allow-list, all `supabase.from()` calls fail silently in production.

**Action:** Verify in Supabase Cloud Dashboard > Settings > API > CORS that the production domain is listed.

---

## 2. Hanging Promises

| # | Finding | File | Lines | Severity |
|---|---------|------|-------|----------|
| H1 | `completeWorkoutSession` — `Promise.all` on 3 batches of DB writes, no timeout | `workout-api.ts` | 408-526 | **P0** |
| H2 | `supabase.functions.invoke()` calls with no timeout | `workout-api.ts` | 120-135, 181-193 | **P0** |
| H3 | `supabase.rpc()` calls with no timeout | `workout-api.ts` | 248, 630-651 | **P0** |
| H4 | Repeat workout flows — 3 sequential awaits, no timeout | `useWorkoutSession.ts` | 154-207 | **P1** |
| H5 | `.then()` chains without `.catch()` or mount safety | `SessionDetailScreen.tsx` | 242-257 | **P1** |
| H6 | `getSession()` fire-and-forget, no `.catch()` | `ResetPasswordScreen.tsx` | 30-34 | **P1** |
| H7 | `invalidateQueries` in `Promise.all`, no `.catch()` | `useHomeData.ts` | 35-46 | **P2** |

### H1 — completeWorkoutSession (P0)

Three `Promise.all()` calls batch-update exercises, structure_results, and sections. Each inner promise is a `supabase.from().update/insert()` with no timeout. If any single DB call hangs (network issue, Vercel edge timeout), the entire `Promise.all` hangs, blocking the user on the summary screen indefinitely.

**User experience:** Workout completed but "saving..." never finishes. User can't navigate away or sign out.

**Fix pattern:** Wrap each `Promise.all` in a `Promise.race` with a timeout, or use `AbortController` on the fetch layer.

### H2/H3 — Edge Function and RPC calls (P0)

`generateWorkout`, `generateSection`, `saveGeneratedWorkout`, and `createRepeatSession` all await Supabase Edge Functions or RPC calls with no timeout. Edge Functions on Vercel can timeout at ~25s; if the function hangs longer, the client promise never settles.

**User experience:** "Generating workout..." spinner runs forever.

### H5 — SessionDetailScreen .then() chains (P1)

```typescript
getFavoriteDetail(savedWorkoutId).then(detail => {
  if (detail?.title) setFavoriteName(detail.title);
});
```

No `.catch()`, no mount check. If the component unmounts before resolution, `setState` fires on an unmounted component.

---

## 3. Silent Failures

| # | Finding | File | Lines | Severity |
|---|---------|------|-------|----------|
| S1 | Favorite completion insert — error never checked | `favorites-api.ts` | 132-137 | **P0** |
| S2 | Sections fetch in `saveFavorite` — error not extracted | `favorites-api.ts` | 76-80 | **P1** |
| S3 | Completions fetch in `getFavoriteDetail` — error not extracted | `favorites-api.ts` | 228-237 | **P1** |
| S4 | Sign-out server revocation failure — no user feedback | `AuthContext.tsx` | 368-382 | **P1** |
| S5 | React Query cache not cleared on sign-out | `SettingsScreen.tsx` | 373 | **P1** |

### S1 — Favorite completion not recorded (P0)

```typescript
await supabase
  .from('saved_workout_completions')
  .insert({ saved_workout_id: saved.id, session_id: sessionId });
```

The `{ error }` return is never checked. If this insert fails, the function returns success. User thinks their favorite completion was recorded; it wasn't.

### S2/S3 — Supabase queries with unchecked errors (P1)

In `saveFavorite`, sections are fetched with `const { data: sections } = await supabase.from(...)` — the `error` property is never destructured or checked. If the query fails, `sections` is `undefined`, and the snapshot is saved with missing data.

Same pattern in `getFavoriteDetail` for completions — `completions || []` silently returns empty array on failure.

### S5 — Stale query cache after sign-out (P1)

When user signs out, React Query cache is not invalidated. If a different user signs in before cache expires (staleTime: 5 min), they could briefly see the previous user's data.

**Fix:** Add `queryClient.clear()` in the `signOut` function.

---

## 4. Auth Edge Cases

| # | Finding | File | Lines | Severity |
|---|---------|------|-------|----------|
| A1 | No cross-tab sign-out synchronization | `AuthContext.tsx` / `auth-storage.ts` | — | **P1** |
| A2 | Email confirmation flow not handled | `CreateAccountScreen.tsx` | 49-66 | **P1** |
| A3 | Multiple TOKEN_REFRESHED events race | `AuthContext.tsx` | 308-357 | **P1** |
| A4 | No auto-retry on 401/expired token | `AuthContext.tsx` | 109-110 | **P2** |
| A5 | Password reset link expiry not detected | `ResetPasswordScreen.tsx` | 22-37 | **P2** |
| A6 | Profile fetch failure still marks user authenticated | `AuthContext.tsx` | 238-255 | **P2** |
| A7 | Dev routes unguarded (`/dev/gallery`, `/dev/test-workout`) | `App.tsx` | 84-85 | **P2** |
| A8 | No "Supabase down" retry UX | `AuthContext.tsx` | 270-277 | **P2** |

### A1 — No cross-tab sign-out (P1)

No `BroadcastChannel` or `storage` event listener exists. Signing out in Tab A leaves Tab B fully authenticated with a valid token. Tab B continues making authenticated requests until its token expires naturally.

**Fix:** Add a `storage` event listener in AuthContext that detects when auth keys are removed and triggers local sign-out.

### A2 — Email confirmation not handled (P1)

`supabase.auth.signUp()` may return `{ data: { user, session: null } }` when email confirmation is enabled. The current code doesn't check for this — user sees "Account created!" toast but no redirect, no "check your email" message.

### A3 — TOKEN_REFRESHED race (P1)

Multiple rapid `TOKEN_REFRESHED` events each trigger `fetchUserData()` with no deduplication. Two concurrent profile fetches could interleave state updates, causing brief UI flickers or stale profile data.

**Fix:** Add a `fetchInProgressRef` guard so only one `fetchUserData()` runs at a time.

### A7 — Dev routes in production (P2)

`/dev/gallery` and `/dev/test-workout` have no auth guard and no `import.meta.env.DEV` check. They're accessible to anyone with the URL in production.

---

## Priority Summary

### P0 — Fix first (blocks core flows)

| # | One-liner |
|---|-----------|
| H1 | Add timeout to `completeWorkoutSession` DB write batches |
| H2 | Add timeout to `supabase.functions.invoke()` calls |
| H3 | Add timeout to `supabase.rpc()` calls |
| S1 | Check error on favorite completion insert |

### P1 — Fix next (silent data loss or degraded UX)

| # | One-liner |
|---|-----------|
| D4 | Verify production auth redirect URLs in Supabase Dashboard |
| D5 | Verify production domain in Supabase CORS allow-list |
| H4 | Add timeout to repeat workout flows |
| H5 | Add `.catch()` + mount safety to SessionDetailScreen `.then()` chains |
| H6 | Add `.catch()` to ResetPasswordScreen `getSession()` |
| S2 | Check error on sections fetch in `saveFavorite` |
| S3 | Check error on completions fetch in `getFavoriteDetail` |
| S4 | Surface sign-out revocation failure to user |
| S5 | Clear React Query cache on sign-out |
| A1 | Add cross-tab sign-out via storage event |
| A2 | Handle email confirmation flow in sign-up |
| A3 | Deduplicate concurrent TOKEN_REFRESHED handlers |

### P2 — Hardening (edge cases, defense in depth)

| # | One-liner |
|---|-----------|
| H7 | Add `.catch()` to query invalidation in useHomeData |
| A4 | Auto-retry API calls on 401 after token refresh |
| A5 | Detect expired password reset links |
| A6 | Handle profile fetch failure gracefully |
| A7 | Gate dev routes behind `import.meta.env.DEV` |
| A8 | Add retry UX when Supabase is unreachable |

---

## Suggested fix order

A practical sequence that groups related changes:

1. **Timeout wrapper utility** — Create a `withTimeout(promise, ms)` helper. Apply to H1, H2, H3, H4.
2. **favorites-api.ts error handling pass** — Fix S1, S2, S3 in one sweep.
3. **Auth hardening** — Fix A1 (cross-tab), A3 (dedup), S5 (cache clear) together since they all touch AuthContext/sign-out.
4. **Supabase Dashboard verification** — D4, D5 are config-only, no code changes.
5. **Remaining P1s** — H5, H6, S4, A2.
6. **P2 hardening** — A4-A8, H7 as time allows.
