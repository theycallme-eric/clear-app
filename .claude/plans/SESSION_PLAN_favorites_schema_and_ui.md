## Session Goal
Build the favorites foundation: schema, API layer, History/Favorites tabs, and favorite toggle wiring.

## Context
- Reference: `Clear_-_Favorites_Spec_v2.md` — full feature spec (source of truth), filed at `docs/specs/Clear_-_Favorites_Spec_v2.md`
- Reference: `Clear_-_Data_Model_UPDATED.md` — existing schema
- Figma: Review card, Summary screen for placement reference
- Prerequisites: Session 1 (persistence gap) and Session 2 (history rework) must both be complete
- Current state after Sessions 1+2:
  - Exercise data and structure results persist to DB on workout finish
  - History detail view has collapsible sections, shows logged data
  - Star icon exists in `icons.tsx`
  - Star icon and Repeat button exist on history detail but are wired to no-op handlers
  - No `saved_workouts` or `saved_workout_completions` tables yet
  - No favorites tab on history screen

### FK Reference Pattern
Existing tables use `REFERENCES auth.users(id)` for user FK (see `workout_sessions` table). The spec incorrectly says `REFERENCES users(id)` — use `auth.users(id)` to match the codebase.

### Post-Migration Step
After creating new tables, regenerate TypeScript types:
```bash
npx supabase gen types typescript --local > src/types/database.ts
```

## Tasks

### 1. Create schema — saved_workouts + saved_workout_completions
**Do:** Create a Supabase migration file (follow existing numbering in `supabase/migrations/`) with both tables and RLS policies.

`saved_workouts`:
```sql
CREATE TABLE saved_workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  original_session_id UUID REFERENCES workout_sessions(id),
  workout_snapshot JSONB NOT NULL,
  title TEXT NOT NULL,
  anchor TEXT,
  intensity INTEGER,
  duration_mins INTEGER,
  times_completed INTEGER DEFAULT 0,
  last_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

`saved_workout_completions`:
```sql
CREATE TABLE saved_workout_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  saved_workout_id UUID REFERENCES saved_workouts(id) ON DELETE CASCADE,
  session_id UUID REFERENCES workout_sessions(id),
  completed_at TIMESTAMPTZ DEFAULT NOW()
);
```

RLS policies for both tables:
- Users can SELECT, INSERT, UPDATE, DELETE their own rows only
- For `saved_workouts`: match on `user_id = auth.uid()`
- For `saved_workout_completions`: join through `saved_workouts.user_id = auth.uid()`

Add indexes on: `saved_workouts(user_id)`, `saved_workout_completions(saved_workout_id)`, `saved_workouts(original_session_id)`.

Add `updated_at` trigger on `saved_workouts` (reuse existing `update_updated_at_column()` function).

After migration: run `npx supabase gen types typescript --local > src/types/database.ts`

**Acceptance:**
- [ ] Both tables exist in Supabase
- [ ] RLS policies active
- [ ] `ON DELETE CASCADE` works — deleting a saved_workout removes its completions
- [ ] Migration file committed with correct numbering
- [ ] `src/types/database.ts` regenerated with new table types

**Update:** None

---

### 2. Build favorites API layer
**Do:** Create `src/lib/favorites-api.ts` (separate file, follows existing pattern of `workout-api.ts` and `home-data.ts`).

**saveFavorite(sessionId: string, fromSummary: boolean):**
- Fetch the workout session + sections + exercises from DB (reuse the query pattern from `fetchWorkoutDetail` in `home-data.ts`)
- Build the JSONB snapshot — use the same shape as `GeneratedWorkout` type so it can be loaded back into the Review screen later
- INSERT into `saved_workouts` with title, anchor, intensity, duration_mins from the session
- If `fromSummary = true`: set `times_completed = 1`, `last_completed_at = NOW()`, and INSERT a `saved_workout_completions` row
- If `fromSummary = false`: set `times_completed = 0`, `last_completed_at = NULL`
- Return the `saved_workout` record

**removeFavorite(savedWorkoutId: string):**
- DELETE from `saved_workouts` (cascade handles completions)
- Return success/failure

**getFavorites():**
- SELECT all saved_workouts for current user (use `auth.uid()` via RLS), ordered by `created_at DESC`
- Return list

**getFavoriteDetail(savedWorkoutId: string):**
- SELECT saved_workout + all completions (with their sessions' logged data)
- Return detail including workout_snapshot, times_completed, last_completed_at, completion history

**recordFavoriteCompletion(savedWorkoutId: string, sessionId: string):**
- INSERT into `saved_workout_completions`
- UPDATE `saved_workouts` SET `times_completed = times_completed + 1`, `last_completed_at = NOW()`

**isFavorited(sessionId: string):**
- Check if a `saved_workouts` row exists with `original_session_id = sessionId`
- Return `{ isFavorited: boolean, savedWorkoutId?: string }`

**Acceptance:**
- [ ] All functions exist and handle errors gracefully (use `logger` for errors)
- [ ] saveFavorite from summary: creates favorite with times_completed = 1
- [ ] saveFavorite from history: creates favorite with times_completed = 0
- [ ] removeFavorite deletes the favorite and all completions
- [ ] getFavorites returns ordered list
- [ ] TypeScript types defined for all inputs/outputs
- [ ] No Lucide imports

**Update:** None

---

### 3. Add History / Favorites tabs to history screen
**Do:** Update `HistoryScreen.tsx` to add a tabbed layout:

**Tabs:** `HISTORY | FAVORITES` at the top of the screen, below the page header.

**History tab (default):**
- Existing history list + filter bar (All / Anchor / Intensity)
- No changes to existing behavior

**Favorites tab:**
- Fetch favorites via `getFavorites()`
- List using the same card dimensions as history list cards
- Each card shows: workout title (with Star icon indicator), anchor, duration, intensity, times completed, last completed date
- Tapping a card opens the favorites detail view (for now, navigate to a placeholder or reuse SessionDetailScreen with a `?source=favorite` param)
- If no favorites: empty state message ("No favorites yet. Star a workout from history or after completing one.")

Use design tokens for tab styling. Match existing UI patterns in the app for tab appearance.

**Acceptance:**
- [ ] Two tabs visible: History and Favorites
- [ ] History tab shows existing list + filters, unchanged behavior
- [ ] Favorites tab shows favorited workout cards with progression data
- [ ] Empty state on Favorites tab when no favorites exist
- [ ] Tab switching is smooth, no full page reload
- [ ] Uses design tokens for tab styling — no hardcoded colors
- [ ] Star icon from `icons.tsx` used (not Lucide)
- [ ] Mobile layout works at 375px

**Update:** None

---

### 4. Wire the favorite toggle on history detail
**Do:** Connect the Star icon (added in Session 2 as no-op) to the real `saveFavorite` / `removeFavorite` API.

**On history detail view:**
- On load: call `isFavorited(sessionId)` to determine initial star state
- Tap when unfavorited → `saveFavorite(sessionId, false)` (fromSummary = false)
- Tap when favorited → show confirmation dialog, then `removeFavorite(savedWorkoutId)`

**Unfavorite confirmation dialog:**
- Title: "Remove from Favorites?"
- Body: "Tracked data including completion history and personal bests will be lost."
- Buttons: "Cancel" / "Remove"
- Use existing dialog/modal patterns if they exist in the codebase, otherwise build a simple one with design tokens

**Acceptance:**
- [ ] Star icon on history detail reflects actual favorite state on load
- [ ] Favoriting from history creates saved_workout with times_completed = 0
- [ ] Unfavoriting shows confirmation dialog with data loss warning
- [ ] Confirming unfavorite deletes the favorite and completions
- [ ] Star icon updates immediately (optimistic UI)
- [ ] Newly favorited workout appears in Favorites tab

**Update:** None

---

### 5. Wire the favorite toggle on summary screen
**Do:** Add the Star icon to `SummaryScreen.tsx` near the workout type badge area ("HYPERTROPHY · POWER · INTENSITY 7").

- One tap to favorite. No modal, no naming prompt.
- Calls `saveFavorite(sessionId, true)` (fromSummary = true, counts as first completion)
- Once favorited, icon stays filled — no unfavorite from summary screen

**Acceptance:**
- [ ] Star icon visible on summary screen near workout metadata
- [ ] Tapping creates a favorite with times_completed = 1
- [ ] Star stays filled after favoriting (no toggle back)
- [ ] Star icon from `icons.tsx` (not Lucide)
- [ ] Works correctly when session has no logged data (edge case)

**Update:** None

---

### 6. Verify favorites foundation
**Do:** Test the full favorites foundation flow:
1. Complete a workout → see Star on summary screen → favorite it → verify times_completed = 1 in DB
2. Go to History → see the workout → Star should show as filled
3. Switch to Favorites tab → workout appears with "1× completed"
4. Go to a different (unfavorited) workout in History → Star should be empty
5. Favorite it → verify times_completed = 0 in DB
6. Switch to Favorites tab → both favorites visible
7. Unfavorite one → confirmation dialog → confirm → removed from Favorites tab

**Acceptance:**
- [ ] All 7 steps pass
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Mobile layout works at 375px

**Update:** SESSION_LOG.md, BACKLOG.md

## Design System Compliance
- Use tokens from `src/index.css` for all colors, spacing, typography
- Star icon: use `--icon-badge` or similar when active, `--text-disabled` when inactive
- Tabs styling: match existing UI patterns, use design tokens
- No Lucide icons anywhere — Star from `icons.tsx`
- Mobile-first — test at 375px width minimum

## After Session (REQUIRED — you are not done until this is complete)
- [ ] Update SESSION_LOG.md with: Date, Tasks Completed, Files Touched
- [ ] Update BACKLOG.md — mark favorites schema/UI/toggle as complete
- [ ] Confirm: "Session complete. Log and Backlog updated. Ready for next plan."
