## Session Goal
Wire the already-collected workout execution data (weights, exercise notes, structure results, section timestamps) through to the database on session finish.

## Context
- Reference: `Clear_-_Favorites_Spec_v2.md` → Prerequisites section
- Reference: `Clear_-_Data_Model_UPDATED.md` (exercises table, structure_results table)
- Reference: `Clear_-_Structure_Types_Spec.md` (structure_results schema)
- Figma: None needed — no UI changes
- Current state: Discovery report confirmed the gap. Here's what exists:
  - `useWorkoutSession.ts` line 42: `handleFinishSession()` calls `completeWorkoutSession()` with only `{ durationMins, mood, sessionNotes }`
  - `workout-api.ts:317-343`: `completeWorkoutSession()` does a single UPDATE to `workout_sessions`. No exercise writes. No structure_results writes.
  - `WorkoutScreen.tsx:16-17`: `loggedData` (Record<string, { weight?: string; reps?: string; notes?: string }>) and `structureResults` (Record<string, StructureResultData>) are collected in state
  - Both are passed to `handleFinishWorkout()` as a `WorkoutNotes` object, stored in state, then never read by `handleFinishSession()`
  - DB columns `weight_logged` and `exercise_notes` exist on `exercises` table with RLS UPDATE policy
  - `structure_results` table exists with full schema and RLS INSERT/UPDATE policies
  - `workout_sections` has `status`, `started_at`, `completed_at` columns — nothing writes to them either

### CRITICAL: ID Mapping Problem (discovered during codebase review)
The `loggedData` Record is keyed by **frontend exercise IDs** (e.g., `bench-press`, `primary_lift-0`), NOT database UUIDs. These frontend IDs are generated in `transformAPIWorkoutToFrontend()` in `workout-api.ts` (line 41): `id: ex.exercise_id || \`${section.section_type}-${exIndex}\``. The `save_generated_workout` RPC only returns the session UUID — individual exercise/section UUIDs are never sent back to the frontend. Same problem exists for `structureResults` keys (section IDs like `conditioning-5` vs DB UUIDs).

**Solution:** After `saveGeneratedWorkout()` returns the session ID, fetch the exercise and section DB UUIDs and inject them into the `GeneratedWorkout` object. This way all subsequent `handleLog()` calls naturally use DB UUIDs as keys, and the UPDATE queries work directly. Task 1 below handles this.

## Tasks

### 1. Inject DB UUIDs into GeneratedWorkout after save
**Do:** After `saveGeneratedWorkout()` returns `sessionId`, query the DB for the exercise and section rows just created, then update the `GeneratedWorkout` object with the real UUIDs.

**Query:**
```sql
SELECT e.id as exercise_id, e.order_index as exercise_order,
       ws.id as section_id, ws.order_index as section_order
FROM exercises e
JOIN workout_sections ws ON e.section_id = ws.id
WHERE ws.session_id = $sessionId
ORDER BY ws.order_index, e.order_index
```

**Then:** Walk through `generatedWorkout.sections` (which are in the same order) and replace:
- Each section's `id` with the DB `workout_sections.id` UUID
- Each exercise's `id` with the DB `exercises.id` UUID

**Where this happens:** The save + ID injection should happen together. Currently `saveGeneratedWorkout` is called in the workout flow somewhere before the workout starts. Find that callsite (likely in the generation/review flow), and after save succeeds, mutate the GeneratedWorkout in context with the real UUIDs.

**Acceptance:**
- [ ] After saving, `generatedWorkout.sections[n].id` contains a real DB UUID (not `primary_lift-0`)
- [ ] After saving, `generatedWorkout.sections[n].exercises[m].id` contains a real DB UUID (not `bench-press`)
- [ ] `loggedData` keys collected during workout are now DB UUIDs
- [ ] `structureResults` keys collected during workout are now DB UUIDs
- [ ] TypeScript compiles
- [ ] Workout flow still works end-to-end (generate → review → workout mode)

**Update:** None

---

### 2. Expand completeWorkoutSession to accept execution data
**Do:** Modify `completeWorkoutSession` in `workout-api.ts` to accept the full execution payload. The function currently takes `{ durationMins, mood, sessionNotes }`. It needs to also accept `loggedData` and `structureResults` from the `WorkoutNotes` object.

Then update `handleFinishSession` in `useWorkoutSession.ts` to pass `workoutNotes.loggedData` and `workoutNotes.structureResults` through to the function.

**Acceptance:**
- [ ] `completeWorkoutSession` accepts loggedData and structureResults as parameters
- [ ] `handleFinishSession` reads from `workoutNotes` state and passes both through
- [ ] TypeScript compiles with no errors
- [ ] Existing session completion (mood, notes, duration) still works — don't break what's working

**Update:** None

---

### 3. Persist exercise-level data
**Do:** Inside `completeWorkoutSession` (or a helper it calls), loop over `loggedData` and write each entry to the `exercises` table.

Each loggedData entry is keyed by **DB exercise UUID** (thanks to Task 1) and contains: `{ weight?: string, reps?: string, notes?: string }`

Write:
```sql
UPDATE exercises
SET weight_logged = entry.weight, exercise_notes = entry.notes
WHERE id = exerciseId
```

Use `Promise.all()` to batch the updates. Fail silently per exercise (log errors via `logger`, don't block session completion).

**Acceptance:**
- [ ] Finish a workout with weights entered → `exercises` rows have `weight_logged` populated in Supabase
- [ ] Finish a workout with exercise notes → `exercise_notes` populated
- [ ] Empty loggedData (user entered nothing) → no errors, session completes normally
- [ ] One update failing doesn't block the others or crash the finish flow

**Update:** None

---

### 4. Persist structure results
**Do:** In the same flow, loop over `structureResults` and INSERT into `structure_results` table.

Each entry is keyed by **DB section UUID** (thanks to Task 1) and contains:
```typescript
{
  structure_type: string,
  rounds_completed?: number,
  completion_time_seconds?: number,
  completed_under_cap?: boolean,
  rep_scheme?: string,
  highest_rung?: number | null,
  notes?: string | null
}
```

Write:
```sql
INSERT INTO structure_results
(section_id, structure_type, completion_time_seconds, completed_under_cap,
 rounds_completed, rep_scheme, highest_rung, notes)
VALUES (...)
```

`section_id` is the key from the Record (now a real DB UUID). Use `Promise.all()`. Same silent-fail-per-row pattern.

**Acceptance:**
- [ ] Complete a For Time section → `structure_results` row exists with `completion_time_seconds` and `completed_under_cap`
- [ ] Complete an AMRAP section → row exists with `rounds_completed`
- [ ] Session with no timed sections → no errors, no rows inserted
- [ ] Only write rows where data actually exists (skip empty entries)

**Update:** None

---

### 5. Persist section timestamps
**Do:** When writing structure results, also update the corresponding `workout_sections` row:

```sql
UPDATE workout_sections
SET status = 'completed', completed_at = NOW()
WHERE id = sectionId
```

Note: There is no section-start event in the current UI (`SectionRenderer` doesn't emit a "started" signal), so skip `started_at` for now. Just write `completed_at` + `status` for all sections the user navigated through.

**Acceptance:**
- [ ] Completed sections have `status = 'completed'` and `completed_at` timestamp in Supabase
- [ ] Skipped sections remain unchanged
- [ ] No errors on sessions with no timed sections

**Update:** None

---

### 6. Verify end-to-end
**Do:** Run a full workout manually. Enter weights on at least two exercises, add a note on one, complete at least one timed section. Then check Supabase table editor:
- `exercises` rows for that session have `weight_logged` / `exercise_notes` values
- `structure_results` rows exist for completed timed sections
- `workout_sections` rows have `completed_at` timestamps
- `generatedWorkout` exercise IDs in React DevTools are DB UUIDs, not frontend-generated strings

Also verify: History view still loads correctly. The new writes must not break existing reads.

**Acceptance:**
- [ ] Data visible in Supabase after workout completion
- [ ] History view unaffected
- [ ] No TypeScript errors
- [ ] No console errors during normal flow
- [ ] Session with no logged data at all (user just taps through) completes cleanly

**Update:** SESSION_LOG.md, BACKLOG.md

## Design System Compliance
N/A — no UI changes in this session.

## After Session (REQUIRED — you are not done until this is complete)
- [ ] Update SESSION_LOG.md with: Date, Tasks Completed, Files Touched
- [ ] Update BACKLOG.md — add "Data persistence gap" as completed item
- [ ] Confirm: "Session complete. Log and Backlog updated. Ready for next plan."
