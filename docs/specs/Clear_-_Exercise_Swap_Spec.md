# Clear — Exercise Swap (Phase A)

> **Status:** DRAFT — Awaiting review  
> **Last Updated:** March 4, 2026  
> **Purpose:** Spec for single-exercise swap and unit-swap on the Review screen (Screen 2)

---

## Overview

Users can customize generated workouts before starting them. Phase A delivers context-aware exercise swapping on the Review screen:

- **Single Exercise Swap** — Replace one exercise without touching the rest (standard + circuit exercises)
- **Unit Swap** — Replace grouped exercises as a single unit (supersets, EMOM, AMRAP, afap/timed)
- **Swap History** — Track up to 3 previous swaps per slot so users can go back

The existing "Randomize Section" button is replaced by per-exercise (or per-group) swap icons inside expanded exercise details. This gives users granular control without the noise of a section-level CTA.

**Out of scope (Phase B — backlog):** Multi-select edit mode, mid-workout swaps on Screen 3.

---

## User Stories

**Single swap:** "I like this warm-up except for Arm Circles — my shoulder hates those. Give me something else for that one slot."

**Unit swap:** "This superset pairing doesn't feel right. Give me a new pair that fits the same role."

**Swap limit:** "I've swapped this three times and nothing feels right." → App nudges: "Consider regenerating the full workout with different inputs."

---

## Swap Behavior by Structure Type

| Structure Type | Swap Behavior | Icon Placement |
|----------------|---------------|----------------|
| Standard | Individual exercise swap | Swap icon on each exercise |
| Superset | Swap the pair as a unit | One swap icon on the superset group |
| Circuit | Individual swap within circuit (AI gets context of other circuit exercises) | Swap icon on each exercise inside the circuit |
| EMOM | Swap the entire block as a unit | One swap icon on the EMOM group |
| AMRAP | Swap the entire block as a unit | One swap icon on the AMRAP group |
| For Time (afap) / Timed | Swap the entire block as a unit | One swap icon on the group |

**Why circuits are individual:** Circuits often have 3-5 exercises. Swapping all of them is too destructive — if you hate one movement in the circuit, you shouldn't lose the other four. The AI receives the full circuit context so the replacement fits the flow.

**Why supersets are a unit:** A superset pair is designed to work together (agonist/antagonist, pre-exhaust, etc.). Swapping one leg without the other could break the training logic. Better to regenerate the pair.

---

## API Design

### Endpoint: `POST /generate/section` (New Edge Function)

A new Supabase Edge Function (`supabase/functions/generate-section/index.ts`), separate from the existing `generate-workout` function for separation of concerns. The AI receives full context about what's staying so the replacement fits.

```typescript
// Request
{
  session_context: {
    intensity: number;
    anchor: AnchorType;        // or goal if v3 prompt is live
    location_id: string;
  };
  section_type: SectionType;
  exclude_exercises?: string[];  // don't suggest these (from other sections)

  // Swap-specific fields
  swap_mode: 'section' | 'single' | 'unit';  // required
  swap_target: {
    exercise_name?: string;      // for single swap
    group_id?: string;           // for unit swap (superset id, circuit id, etc.)
    structure_type?: string;     // 'superset' | 'emom' | 'amrap' | 'afap' | 'timed'
  };
  keep_exercises: GeneratedExercise[];  // exercises staying in the section (provides context)
}
```

### Prompt Strategy

The prompt tells the AI exactly what's happening. Three variations based on `swap_mode`:

**Single swap (standard exercise):**
```
SWAP MODE: single
Replace ONLY "{exercise_name}" in this section.
Exercises staying (do not duplicate these): {keep_exercise_names}
The replacement should:
- Fit the same role in the section
- Use available equipment: {equipment}
- Match intensity level: {intensity}/10
- Not duplicate any exercise in the full workout
Return the full section with ONE exercise replaced.
```

**Single swap (circuit exercise):**
```
SWAP MODE: single (within circuit)
Replace ONLY "{exercise_name}" in this circuit.
Other circuit exercises (the replacement must complement these): {other_circuit_exercises}
Other section exercises (do not duplicate): {other_section_exercises}
The replacement should:
- Fit the circuit's flow and intent
- Use available equipment: {equipment}
- Maintain similar work/rest timing
Return the full section with ONE circuit exercise replaced.
```

**Unit swap (superset, EMOM, AMRAP, afap/timed):**
```
SWAP MODE: unit
Replace the entire {structure_type} group: {group_exercise_names}
Other exercises in this section (do not duplicate): {other_section_exercises}
The replacement group should:
- Serve the same training purpose as the original group
- Maintain the same structure type ({structure_type})
- Use available equipment: {equipment}
- Match intensity level: {intensity}/10
Return the full section with the group replaced.
```

### Response Handling

The AI always returns a full section. The frontend:
1. Identifies which exercise(s) changed
2. Patches only those into local state
3. Preserves everything else

### Required Type Change: Unified `group_id`

A `group_id: string` field must be added to every non-standard variant of the `ExerciseStructure` union type:

- `superset` — gets `group_id` (preserves existing `paired_with`)
- `circuit` — gets `group_id` (preserves existing `circuit_id`)
- `emom` — gets `group_id`
- `amrap` — gets `group_id`
- `afap` — gets `group_id`
- `timed` — gets `group_id`
- `standard` — does NOT get `group_id`

Existing fields (`paired_with`, `circuit_id`) are preserved for backward compatibility. The workout generation prompt must assign `group_id` to all exercises within a grouped structure (same ID for exercises in the same group).

---

## UI Specification

### Swap Icon Placement

**Location:** Inside expanded exercise details only (reduces visual noise when scanning collapsed cards).

**For individual exercises (standard + circuit):**
```
┌─────────────────────────────────────┐
│ ARM CIRCLES  BODYWEIGHT         ▼   │  ← collapsed: no swap icon
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ ARM CIRCLES  BODYWEIGHT         ▲   │  ← expanded
│ 1×10 each direction                 │
│ Tempo: controlled                   │
│ Coaching: Big circles, full ROM     │
│                                     │
│                            [ ↻ Swap ]│  ← swap icon/button
└─────────────────────────────────────┘
```

**For unit groups (superset, EMOM, AMRAP, afap/timed):**
```
┌─────────────────────────────────────┐
│ SUPERSET                        ▲   │
│                                     │
│  DB Bench Press — 3×10              │
│  DB Bent-Over Row — 3×10           │
│                                     │
│                     [ ↻ Swap Pair ] │  ← one icon for the unit
└─────────────────────────────────────┘
```

**Icon spec:**
- Icon: ↻ (swap/refresh)
- Size: 16–20px icon, 44×44px minimum touch target
- Default: Muted color (`text-muted` token)
- Hover/tap: Brightens to primary color
- Label text adapts: "Swap" for single, "Swap Pair" for superset, "Swap Block" for EMOM/AMRAP/afap/timed

### No More "Randomize Section" Button

The per-exercise/per-group swap icons replace the section-level "Randomize Section" button. Users now have more precise control. If someone wants to replace an entire section, they swap each exercise individually — or regenerate the whole workout.

**Connected structures are fully covered:** If a section is entirely one EMOM block or one superset pair, the unit swap icon is functionally identical to what "Randomize Section" used to do — it replaces everything in the section. The only tradeoff is sections with multiple standalone exercises (e.g., a warm-up with 4 standard exercises), which now require individual swaps rather than one bulk action. This is intentional — granular control is the goal.

---

## Swap Limits & History

### 3-Swap Limit Per Slot

Each exercise slot (or unit group slot) allows up to 3 swaps before locking.

**Tracking:** Maintain a swap history array per slot in local state:

```typescript
interface SwapSlot {
  current: GeneratedExercise | GeneratedExercise[];  // current exercise(s)
  history: (GeneratedExercise | GeneratedExercise[])[];  // up to 3 previous
  swapCount: number;
}
```

**After 3 swaps:** Swap icon becomes disabled. Show an **informational toast** (not error — the user hasn't done anything wrong, we're offering guidance):

```
Toast (informational style):
"Nothing feeling right? Try regenerating with different inputs."
[Regenerate Workout]
```

- Uses existing toast component with informational variant
- "Regenerate Workout" action takes the user back to Screen 1 (Generation Input) with current settings pre-filled
- Toast auto-dismisses after standard duration, but the swap icon stays disabled

### Undo / Swap History

Users can cycle back through their previous 3 exercises for that slot.

**UI pattern:** After the first swap, a small "Previous" link/button appears below the swap icon:

```
┌─────────────────────────────────────┐
│ DB LATERAL RAISE  DUMBBELLS     ▲   │
│ 3×12                                │
│ ...                                 │
│                                     │
│              [ ← Previous ] [ ↻ Swap ]│
└─────────────────────────────────────┘
```

- Tapping "Previous" cycles backward through swap history (no API call — it's in memory)
- Tapping "Swap" generates a new option and pushes current to history
- History is capped at 3 entries (oldest drops off)

---

## State Management

### Local State Only

All swap state lives in memory. Nothing is persisted to the database until the user taps "Start Workout." This keeps swaps fully reversible and avoids unnecessary writes.

### State Shape

```typescript
// Per-section swap tracking
interface SectionSwapState {
  [exerciseIndex: number]: SwapSlot;  // keyed by position in section
}

// Top-level swap state alongside generatedWorkout
interface SwapState {
  [sectionType: string]: SectionSwapState;
}
```

> **Note on index-based keying:** Exercises do not reorder during preview, so keying by position is safe. If future features allow drag-to-reorder, this would need to switch to a stable exercise identifier.

### Single Exercise Swap
```typescript
// Replace one exercise within a section
setGeneratedWorkout(prev => ({
  ...prev,
  sections: prev.sections.map(s =>
    s.section_type === targetSectionType
      ? {
          ...s,
          exercises: s.exercises.map((ex, i) =>
            i === targetIndex ? newExercise : ex
          )
        }
      : s
  )
}));
```

### Unit Swap
```typescript
// Replace all exercises matching the group ID
setGeneratedWorkout(prev => ({
  ...prev,
  sections: prev.sections.map(s =>
    s.section_type === targetSectionType
      ? {
          ...s,
          exercises: s.exercises.map(ex =>
            ex.structure?.group_id === targetGroupId ? findReplacement(ex, newExercises) : ex
          )
        }
      : s
  )
}));
```

---

## Loading State

**Placeholder implementation for now.** Use a simple dim + spinner on the affected card(s). This will be revisited as part of a broader loading/feedback design pass.

- Single swap: Affected card dims (opacity 0.5), small spinner where swap icon was
- Unit swap: All cards in the group dim, spinner on the group
- Card height must NOT collapse during loading — maintain layout stability
- Placeholder is intentionally minimal — designed to be replaced

---

## Error Handling

- **API timeout / failure:** Show inline error on the affected card. Don't clear existing content. Let user retry. Error does not consume a swap attempt.
- **Invalid AI response:** Catch in validation, show error, let user retry.
- **Debounce:** 2-second minimum between swap calls per slot to prevent rapid-fire API hits.

---

## Acceptance Criteria

### Single Exercise Swap
- [ ] Swap icon visible inside expanded details on standard-structure exercises
- [ ] Swap icon visible on individual circuit exercises
- [ ] Tapping swap calls `POST /generate/section` with `swap_mode: 'single'` and full context
- [ ] Only the targeted exercise updates — rest of section unchanged
- [ ] AI receives context about exercises staying in the section/circuit
- [ ] Loading state visible on individual card during generation
- [ ] Error state preserves existing exercise

### Unit Swap
- [ ] Superset pairs show one swap icon for the group
- [ ] EMOM/AMRAP/afap/timed blocks show one swap icon for the group
- [ ] Tapping swap replaces the entire unit
- [ ] AI returns a replacement with the same structure type
- [ ] All cards in the group update together

### Swap Limits & History
- [ ] Swap counter increments per slot (not globally)
- [ ] After 3 swaps, icon disabled + "regenerate workout" nudge shown
- [ ] Failed swaps do not count toward the limit
- [ ] "Previous" button appears after first swap
- [ ] Cycling through history does not make API calls
- [ ] History capped at 3 entries per slot

### General
- [ ] No "Randomize Section" button — replaced by per-exercise/per-group swap icons
- [ ] No database writes until "Start Workout"
- [ ] Works on mobile (touch targets ≥ 44px)
- [ ] Uses design tokens for all colors, spacing, typography
- [ ] Debounced to prevent rapid-fire API calls

---

## Phase B (Backlog — Future Work)

For reference, Phase B adds the multi-select edit mode flow:

- Tap "Edit" on section header → section enters edit mode
- Each exercise becomes a selectable checkbox (multi-select, uses existing chip pattern from Generation screen)
- "Swap Selected" CTA appears at bottom of section
- AI replaces only selected exercises, returns section with swaps in place
- Possible: mid-workout swap on Screen 3
- Possible: smarter loading states (shimmer, "Finding alternatives..." messaging)

Phase B needs its own spec and design exploration before implementation.

---

*Draft created: March 4, 2026*  
*Decisions captured: March 4, 2026 — API Option A, unit swap rules, 3-swap limit with history, placeholder loading*
*Revised: March 4, 2026 — Fixed structure type names (afap/timed not ladder), added unified group_id to types, new generate-section edge function, index-keying safety note*
