# SESSION PLAN: Exercise Swap (Phase A)

## Session Goal
Implement context-aware exercise swapping on the Review screen (Screen 2) — single exercise swap, unit swap for grouped structures, swap history with 3-swap limit.

## Context
- **Spec:** `Clear_-_Exercise_Swap_Spec.md` — READ THIS FULLY BEFORE STARTING
- **Review screen wireframe:** `Clear_-_Screen_2__Review___Edit__Wireframe_.md`
- **Data model / API shape:** `Clear_-_Data_Model_UPDATED.md` (see `POST /generate/section`)
- **Prompt reference:** `Clear_-_Workout_Generation_Prompt_v3.md`
- **Structure types:** `Clear_-_Structure_Types_Spec.md`
- **Design tokens:** `design-tokens.json`, `design-tokens-colors.js`
- **Existing types:** `src/types/generation.ts` — `ExerciseStructure` union type
- **Existing section card:** `WorkoutSectionCard.tsx` — has `onRandomize` prop and `RefreshCw` icon
- **Existing edge function:** `supabase/functions/generate-workout/index.ts` — DO NOT modify this, we're creating a new one
- **Current state:** Review screen exists with "Randomize Section" button (not wired up). Exercise cards expand/collapse. No swap functionality exists yet.

## Important: Read the Spec First
The spec at `Clear_-_Exercise_Swap_Spec.md` contains all design decisions, API shapes, state management patterns, and acceptance criteria. Every task below references it. Read it fully before writing any code.

---

## Tasks

### 1. Add Unified `group_id` to ExerciseStructure Types
**Do:**
- Open `src/types/generation.ts`
- Add `group_id: string` to every non-standard variant of the `ExerciseStructure` union type:
  - `superset` — add `group_id: string` (preserve existing `paired_with`)
  - `circuit` — add `group_id: string` (preserve existing `circuit_id`)
  - `emom` — add `group_id: string`
  - `amrap` — add `group_id: string`
  - `afap` — add `group_id: string`
  - `timed` — add `group_id: string`
  - `standard` — does NOT get `group_id`
- Update type guards if they need to account for `group_id`
- Update the workout generation prompt to assign `group_id` to all exercises within grouped structures (same ID for exercises in the same group)
- Fix any resulting TypeScript errors across the codebase

**Acceptance:**
- [ ] All non-standard `ExerciseStructure` variants have `group_id: string`
- [ ] `standard` does NOT have `group_id`
- [ ] Existing fields (`paired_with`, `circuit_id`) preserved for backward compatibility
- [ ] Workout generation prompt assigns `group_id` to grouped exercises
- [ ] TypeScript compiles with no errors (`npx tsc --noEmit`)

---

### 2. Create `generate-section` Edge Function
**Do:**
- Create a NEW Supabase Edge Function at `supabase/functions/generate-section/index.ts`
- Do NOT modify the existing `generate-workout` edge function
- Add support for three swap modes: `swap_mode` ('section' | 'single' | 'unit'), `swap_target`, and `keep_exercises`
- Implement three prompt variations based on `swap_mode` (see spec → API Design → Prompt Strategy for exact prompt text):
  - `single` — replace one exercise, context of what stays
  - `single` within circuit — replace one exercise, context of other circuit exercises
  - `unit` — replace entire group (superset/EMOM/AMRAP/afap/timed), maintain structure type
- Validate that the AI response maintains the correct structure type for unit swaps
- Ensure response includes `group_id` on all non-standard exercises
- Add request/response type definitions

**Acceptance:**
- [ ] New edge function exists at `supabase/functions/generate-section/index.ts`
- [ ] Existing `generate-workout` edge function is NOT modified
- [ ] Single swap mode returns a full section with one exercise replaced
- [ ] Unit swap mode returns a full section with the group replaced, same structure type
- [ ] Circuit swap includes other circuit exercises in prompt context
- [ ] Response includes `group_id` on all non-standard exercises
- [ ] Request types updated in TypeScript

**Update:** `PROJECT_MAP.md` if edge function structure changes

---

### 3. Remove "Randomize Section" Button
**Do:**
- Open `src/components/WorkoutSectionCard.tsx`
- Remove the `onRandomize` prop from the `WorkoutSectionCardProps` interface
- Remove the `RefreshCw` icon import (if no longer used elsewhere)
- Remove the "Randomize Section" button JSX and its click handler
- Clean up parent components that pass the `onRandomize` prop (find all usages and remove the prop)
- Do NOT remove the underlying API call logic — we'll reuse it for the swap feature

**Acceptance:**
- [ ] No "Randomize Section" button visible on any section card
- [ ] `onRandomize` prop removed from `WorkoutSectionCardProps` interface
- [ ] `RefreshCw` import cleaned up if unused
- [ ] Parent components no longer pass `onRandomize`
- [ ] No console errors or broken layouts from removal
- [ ] Underlying section generation API utility still exists and is importable

---

### 4. Add Swap State Management
**Do:**
- Create swap state tracking alongside the existing `generatedWorkout` state (or equivalent) in the Review screen
- Implement the `SwapSlot` and `SwapState` interfaces from the spec:
  ```typescript
  interface SwapSlot {
    current: GeneratedExercise | GeneratedExercise[];
    history: (GeneratedExercise | GeneratedExercise[])[];
    swapCount: number;
  }
  ```
- State is keyed by section type + exercise index (for single) or section type + group ID (for unit)
- Note: index-based keying is safe because exercises do not reorder during preview
- Implement helper functions:
  - `performSwap(sectionType, targetIndex, newExercise)` — updates workout state, pushes old exercise to history, increments counter
  - `performUnitSwap(sectionType, groupId, newExercises)` — same but for grouped exercises, uses `group_id` to find all members of the target group
  - `revertToPrevious(sectionType, targetIndex)` — cycles backward through history, no API call
- History capped at 3 entries per slot (oldest drops off)
- Nothing persists to database — all in-memory until "Start Workout"

**Acceptance:**
- [ ] Swap state initializes empty when workout loads
- [ ] `performSwap` updates the correct exercise and tracks history
- [ ] `performUnitSwap` uses `group_id` to find and update all exercises in a group
- [ ] `revertToPrevious` restores the prior exercise without API call
- [ ] History stays capped at 3
- [ ] Swap counter increments correctly

---

### 5. Single Exercise Swap UI
**Do:**
- Add a swap icon (↻) inside expanded exercise details on exercises with `structure.type === 'standard'`
- Add the same swap icon on individual exercises inside circuits (`structure.type === 'circuit'`)
- Icon is ONLY visible when the exercise card is expanded — not visible in collapsed state
- Icon spec: 16-20px icon, 44×44px touch target, muted color default, primary on hover/tap
- Use design tokens for all colors — no hardcoded values
- On tap:
  1. Disable icon, show placeholder loading state (dim card to opacity 0.5, spinner replaces swap icon)
  2. Call the new `generate-section` edge function with `swap_mode: 'single'`, exercise context, and `keep_exercises`
  3. Extract replacement exercise from response
  4. Call `performSwap()` to update state
  5. Card updates with new exercise
- Debounce: 2-second minimum between swap calls per slot
- On error: show inline error on card, preserve existing exercise, do not count toward swap limit
- After first swap on a slot, show "← Previous" button next to swap icon
- "Previous" taps call `revertToPrevious()` — no API call, cycles through history
- After 3 swaps: disable swap icon, fire informational toast: "Nothing feeling right? Try regenerating with different inputs." with "Regenerate Workout" action that navigates to Screen 1 with current settings pre-filled
- Toast auto-dismisses after standard duration; swap icon stays disabled
- Use existing toast component with informational variant

**Acceptance:**
- [ ] Swap icon visible only inside expanded details on standard + circuit exercises
- [ ] Swap icon hidden on collapsed cards
- [ ] Swap icon hidden on superset/EMOM/AMRAP/afap/timed exercises (these use unit swap)
- [ ] Tapping swap triggers API call to `generate-section` with full context
- [ ] Only the targeted exercise updates
- [ ] Loading state: card dims, spinner on icon
- [ ] Error preserves existing exercise
- [ ] "Previous" button appears after first swap
- [ ] Previous cycles through history without API calls
- [ ] After 3 swaps: icon disabled + informational toast shown
- [ ] Touch target ≥ 44px
- [ ] All styling uses design tokens

---

### 6. Unit Swap UI
**Do:**
- For superset groups: add one swap icon labeled "Swap Pair" on the expanded superset container
- For EMOM/AMRAP/afap/timed blocks: add one swap icon labeled "Swap Block" on the expanded block container
- Icon placement: bottom of the expanded group, same style as single swap icon
- On tap:
  1. Dim all cards in the group, show spinner on the group container
  2. Call the new `generate-section` edge function with `swap_mode: 'unit'`, group context
  3. Extract replacement group from response
  4. Call `performUnitSwap()` to update state — keyed off `group_id`
  5. All cards in the group update together
- Same swap limit (3), history, previous, and toast behavior as single swap — but tracked per group, not per exercise within the group
- Debounce: 2-second minimum

**Acceptance:**
- [ ] Superset pairs show "Swap Pair" icon on expanded group
- [ ] EMOM/AMRAP/afap/timed blocks show "Swap Block" icon on expanded group
- [ ] No individual swap icons on exercises within these groups
- [ ] Tapping swap replaces the entire unit
- [ ] AI returns replacement with same structure type
- [ ] All cards in the group update together
- [ ] Loading state dims all group cards
- [ ] Swap limit + history + previous work per group

---

### 7. Verify Edge Cases
**Do:**
- Test: Section with one standard exercise (swap icon appears, works normally)
- Test: Section that is entirely one EMOM block (unit swap = full section replacement)
- Test: Circuit with 4 exercises, swap one — other 3 unchanged
- Test: Swap 3 times on same slot → icon disables, toast fires
- Test: Use "Previous" to cycle back through all 3 history entries
- Test: Error during swap → exercise preserved, counter not incremented
- Test: Rapid tapping swap → debounce prevents multiple API calls
- Test: `group_id` correctly identifies all members of a group across structure types
- Test on mobile viewport — touch targets ≥ 44px, no layout shifts during loading

**Acceptance:**
- [ ] All edge cases pass
- [ ] `group_id` grouping works correctly for all structure types
- [ ] No layout shifts or broken states
- [ ] Mobile-friendly

---

## Design System Compliance
- Use tokens from `design-tokens.json` — no hardcoded colors, spacing, or font values
- Match existing exercise card patterns and component structure
- Toast uses existing toast component with informational variant
- Icons use existing icon system/library
- Mobile-first: all touch targets ≥ 44px

## After Session (REQUIRED — you are not done until this is complete)
- [ ] Update `SESSION_LOG.md` with: Date, Tasks Completed, Files Touched
- [ ] Update `PROJECT_MAP.md` if architecture changed (edge function extension, new state patterns)
- [ ] Add to `BACKLOG.md`: "Exercise Swap Phase B — multi-select edit mode" (if not already there)
- [ ] Mark completed items as `[x]` in `BACKLOG.md`
- [ ] Confirm: "Session complete. Log and Backlog updated. Ready for next plan."
