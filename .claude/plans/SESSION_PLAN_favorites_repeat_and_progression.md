## Session Goal
Build the Repeat flow (from history and favorites), "Last Time" weight display, "Beat Your Previous Best" progression, and verify the full end-to-end favorites feature.

## Context
- Reference: `Clear_-_Favorites_Spec_v2.md` — full feature spec (source of truth), filed at `docs/specs/Clear_-_Favorites_Spec_v2.md`
- Prerequisites: Sessions 1 (persistence), 2 (history rework), and 3A (favorites schema/UI/toggle) must all be complete
- Current state after Session 3A:
  - `saved_workouts` and `saved_workout_completions` tables exist with RLS
  - `favorites-api.ts` has saveFavorite, removeFavorite, getFavorites, getFavoriteDetail, recordFavoriteCompletion, isFavorited
  - History/Favorites tabs working on history screen
  - Star toggle wired on both history detail and summary screen
  - Repeat button exists on history detail as no-op (from Session 2)

### Key Routing Challenge
The Review screen currently expects data from `WorkoutFlowContext.generatedWorkout`, populated during the generation flow. For repeats, we need an alternate path:
1. Set `generatedWorkout` from a saved workout or history record
2. Signal "this is a repeat" so Review hides swap/regenerate actions
3. Create a new session row in the DB when starting a repeat (so exercise data has somewhere to save)

Check how the existing `handleResumeIncomplete` in `useWorkoutSession.ts` handles reconstruction — it already sets `generatedWorkout` from DB data. The repeat flow is similar but for completed (not incomplete) workouts.

### workout_snapshot JSONB Shape
The `workout_snapshot` stored on `saved_workouts` should match the `GeneratedWorkout` type shape so it can be loaded directly into context. Verify this matches what Session 3A implemented.

## Tasks

### 1. Build Repeat from History flow
**Do:** Connect the Repeat button on history detail (currently no-op from Session 2) to load the workout into the Review screen.

**Flow:**
1. Repeat button reads workout data from the existing session (sections + exercises from DB via `fetchWorkoutDetail`)
2. Reconstructs a `GeneratedWorkout` object (similar to `handleResumeIncomplete`)
3. Sets it in `WorkoutFlowContext` via `setGeneratedWorkout`
4. A new `workout_sessions` row must be created for the repeat (so exercise logging has a session to attach to). Call `saveGeneratedWorkout` or create a lightweight version that creates session + sections + exercises from the existing data.
5. After save, inject DB UUIDs into the new GeneratedWorkout (same pattern as Session 1, Task 1)
6. Navigate to `/review`

**Weight fields:** NOT pre-filled for history repeats (casual repeat, no progression context per spec).

**Review screen changes:** Add a flag/state to distinguish "fresh generation" from "repeat":
- Hide swap/regenerate/exercise-swap actions on repeat
- "START WORKOUT" button label stays the same
- Otherwise same UI

**Acceptance:**
- [ ] Repeat from history loads workout into Review screen correctly
- [ ] No AI call made during repeat flow
- [ ] A new session row is created in DB for the repeat
- [ ] Exercise IDs in the new session are DB UUIDs (Task 1 from Session 1 pattern)
- [ ] Review screen hides swap/regenerate for repeats
- [ ] Completing the repeated workout saves data normally (weights, notes, structure results)
- [ ] No weights pre-filled

**Update:** None

---

### 2. Build Repeat from Favorites flow
**Do:** Add a Start/Repeat button to the favorites detail view. Connect it to load the workout from `workout_snapshot` JSONB.

**Flow:**
1. User taps Start on a favorited workout
2. Read `workout_snapshot` from the `saved_workouts` record
3. Create a new `workout_sessions` row + sections + exercises (same as Task 1)
4. Inject DB UUIDs
5. Navigate to `/review`

**After completion:**
- Call `recordFavoriteCompletion(savedWorkoutId, newSessionId)` to increment `times_completed` and record the attempt
- This should happen in `handleFinishSession` — add a check: if the current workout is a favorite repeat, call the recording function

**How to know it's a favorite repeat:** Store the `savedWorkoutId` in context/state when starting a favorite repeat. On completion, check if it exists.

**Acceptance:**
- [ ] Start from Favorites loads workout into Review screen
- [ ] Completing a favorite repeat increments times_completed
- [ ] A `saved_workout_completions` row is created linking the new session
- [ ] No AI call made

**Update:** None

---

### 3. Add "Last Time" weight display for favorite repeats
**Do:** When starting a workout from Favorites, query the most recent completion's exercise data and show it as context.

**Query:** Use the SQL from the spec — get `exercises.weight_logged` from the most recent `saved_workout_completions` session:
```sql
SELECT e.weight_logged, e.order_index, ws.order_index as section_order
FROM exercises e
JOIN workout_sections ws ON e.section_id = ws.id
JOIN saved_workout_completions swc ON ws.session_id = swc.session_id
WHERE swc.saved_workout_id = $savedWorkoutId
ORDER BY swc.completed_at DESC
LIMIT (number of exercises)
```

**Display:** In the weight input field area on `ActiveExerciseCard`, show helper text like "Last: 185lbs" below or near the weight input. Not editable — it's context. The actual weight field starts empty.

**Important:** Weight data is a raw string (e.g., "185lbs", "35lbs each"). Display as-is for v1. No parsing.

**Acceptance:**
- [ ] Favorite repeat shows "Last: [weight]" for exercises that had weights logged previously
- [ ] No "Last" text shown for exercises without previous data (first attempt)
- [ ] Weight field itself starts empty (Last is context only)
- [ ] Display handles all weight string formats gracefully
- [ ] Uses design tokens for the helper text styling

**Update:** None

---

### 4. Build "Beat Your Previous Best" display
**Do:** For favorited workout repeats, show progression data on timed sections.

**Before starting a timed section (on the section card in Review or Workout Mode):**
- Query previous best:
  - For Time: `MIN(completion_time_seconds)` across all completions
  - AMRAP: `MAX(rounds_completed)` across all completions
- If previous best exists: show "Previous Best: 6:23" (or "Previous Best: 5 rounds") on the section header
- If no previous best (first attempt): show nothing

**After completing a timed section:**
- Compare result to previous best
- If new PR: celebration message — "New Personal Best! (Previous: 6:23)"
- If not beaten: show previous best below the result for reference
- If first attempt: "First attempt recorded."

Each timed section tracks independently.

**Which sections get this treatment:** For Time and AMRAP only. NOT: Standard, Superset, EMOM, untimed Circuit, Ladder.

**Acceptance:**
- [ ] Previous Best badge shows on timed sections when history exists
- [ ] No badge on first attempt
- [ ] New PR celebration displays after beating previous best
- [ ] Non-PR result shows previous best for reference
- [ ] Multiple timed sections each show their own independent best
- [ ] Non-timed sections show no badges
- [ ] Uses design tokens for all styling

**Update:** None

---

### 5. Verify full end-to-end
**Do:** Complete the full verification flow from the spec:

1. Generate and complete a workout, entering weights and notes → verify data persists
2. View it in history → verify collapsed sections, logged data display
3. Favorite it from history → verify star state, appears in Favorites tab with times_completed = 0
4. Repeat it from Favorites → verify loads into Review with no "last time" data (times_completed was 0, no previous weights)
5. Complete the repeat → verify times_completed = 1, last_completed_at updates
6. Repeat again from Favorites → verify "Last: [weight]" shows, Previous Best badges show on timed sections
7. Complete again, beat a time → verify PR celebration
8. Unfavorite → verify confirmation dialog, data deleted, workout returns to History tab
9. Generate a new workout, favorite from summary screen → verify times_completed = 1 immediately

**Acceptance:**
- [ ] All 9 steps pass
- [ ] No console errors throughout
- [ ] No TypeScript errors
- [ ] Mobile layout works at 375px
- [ ] Tab switching between History and Favorites is smooth

**Update:** SESSION_LOG.md, BACKLOG.md, PROJECT_MAP.md (new tables, new API file, new routes)

## Design System Compliance
- Use tokens from `src/index.css` for all colors, spacing, typography
- "Last" weight text: muted treatment (e.g., `--text-paragraph` or `--text-disabled`)
- Previous Best badge: match existing section header treatment
- PR celebration: use `--text-header` with glow-emissive for emphasis
- No Lucide icons anywhere
- Mobile-first — test at 375px width minimum

## After Session (REQUIRED — you are not done until this is complete)
- [ ] Update SESSION_LOG.md with: Date, Tasks Completed, Files Touched
- [ ] Update BACKLOG.md — mark favorites feature as complete
- [ ] Update PROJECT_MAP.md — document new tables, API file, route changes
- [ ] Update `Clear_-_Data_Model_UPDATED.md` — add saved_workouts and saved_workout_completions tables
- [ ] Confirm: "Session complete. Log and Backlog updated. Ready for next plan."
