# Clear — UI Component Spec

> **Status:** STABLE  
> **Last Updated:** February 3, 2026  
> **Purpose:** Source of truth for workout UI behaviors, timers, and tracking display

---

## Overview

This document defines how workout structures render in the UI, including timer behaviors, card layouts, CTAs, and tracking. It builds on the Structure Types Spec and Intensity Model Spec.

---

## Timer System

Clear uses two timer layers:

### 1. Global Timer
- **Location:** Top of screen, persistent during workout
- **Behavior:** Count-up from 0:00
- **Starts:** When user begins first section
- **Stops:** When user completes last section (or exits)
- **Display:** `MM:SS` format

### 2. Inline Section Timer
- **Location:** Inside the card for timed structures
- **Behavior:** Varies by structure type (see below)
- **Shows:** Timer + context (time cap, AMRAP duration, etc.)
- **CTA:** "Start" button → becomes "Complete" when running

---

## Structure-Specific UI

### 1. Standard

**Card layout:** Single exercise card

**Elements:**
- Exercise display name (resolved via `equipment_display_names`)
- Prescription: "3×8" or "4×6-8"
- Weight input field (single field, editable)
- Coaching cues (expandable)
- Regression note if present

**Timer:** None

**CTA:** "Complete Exercise"

**Tracking stored:** `weight_logged` on exercises table

---

### 2. Superset

**Card layout:** Grouped card showing both exercises

**Elements:**
- Header: "Superset" or "A1/A2"
- Two exercises stacked
- Each exercise shows: name, reps, weight input
- Shared set counter: "Set 1 of 3"

**Timer:** None

**CTA:** "Complete Set" (advances set counter, or completes superset on final set)

**Tracking stored:** `weight_logged` per exercise

---

### 3. Circuit

**Card layout:** Grouped card showing all exercises in circuit

**Elements:**
- Header: "Circuit — 3 Rounds"
- All exercises listed with reps
- Weight input per weighted exercise
- Round indicator: "Round 1 of 3"

**Timer:** 
- **In accessory section:** None — just round counter
- **In conditioning (For Time context):** Inline timer with count-up and time cap

**CTA:** 
- Without timer: "Complete Round" → "Complete Circuit" on final round
- With timer: "Start" → "Complete" (stops timer)

**Tracking stored:** 
- Without timer: `weight_logged` per exercise
- With timer: `completion_time_seconds` on `structure_results`, `weight_logged` per exercise

---

### 4. EMOM (Every Minute On the Minute)

**Card layout:** Exercise(s) with minute duration

**Elements:**
- Header: "EMOM — 8 Minutes"
- Exercise(s) with per-minute rep target
- Current minute indicator: "Minute 4 of 8"
- Weight input (if applicable)

**Timer:** 
- Inline timer, count-down per minute
- Auto-advances at each minute mark (no user interaction between minutes)
- Runs continuously for full EMOM duration

**CTA:** "Start" → timer runs → "Complete" (available after final minute)

**Tracking stored:** `weight_logged`, `notes` on `structure_results`

---

### 5. AMRAP (As Many Rounds As Possible)

**Card layout:** Grouped exercises with time limit

**Elements:**
- Header: "AMRAP — 8 Minutes"
- All exercises in round listed with reps
- Round counter: "Rounds: 4"
- Weight input per weighted exercise

**Timer:** 
- Inline timer, count-down from AMRAP duration
- Shows remaining time

**CTA:** "Start" → "Complete Round" (increments counter) → auto-completes when timer hits 0

**Tracking stored:** `rounds_completed` on `structure_results`, `weight_logged` per exercise

---

### 6. For Time (FT)

**Card layout:** Grouped exercises with time cap

**Elements:**
- Header: "For Time — 8 min cap"
- Work to complete (may show ladder pattern: "21-15-9")
- Visual progress through work (current rung highlighted for ladders)
- Weight input per weighted exercise

**Timer:**
- Inline timer, count-up
- Shows elapsed time
- Cap warning at 80% of cap (visual + optional haptic)
- If cap hit: timer stops, shows "Cap reached"

**CTA:** "Start" → "Complete" (stops timer, records time)

**Tracking stored:** `completion_time_seconds`, `completed_under_cap` on `structure_results`, `weight_logged` per exercise

**Ladder display:**
```
21-15-9 KB Swings + Burpees

[ 21 ] ← current (highlighted)
  15
   9
```

---

## Exercise Display

### Resolving Display Name

```typescript
const getDisplayName = (
  exercise: Exercise, 
  definition: ExerciseDefinition
): string => {
  return definition.equipment_display_names?.[exercise.equipment_used] 
    ?? definition.name;
};
```

**Example:**
- `exercise.equipment_used = "dumbbells"`
- `definition.name = "Bench Press"`
- `definition.equipment_display_names = { "barbell": "Barbell Bench Press", "dumbbells": "Dumbbell Bench Press" }`
- **Result:** "Dumbbell Bench Press"

### Card Elements

Each exercise displays:
1. **Display name** (resolved as above)
2. **Prescription** — sets × reps, or rep scheme pattern
3. **Weight input** — single field, editable at review + post-workout
4. **Coaching cues** — expandable/collapsible, 2-3 cues
5. **Regression** — shown if present, smaller text

---

## Weight Input

**Field:** Single text input per exercise

**Editable at:**
1. Review screen (after generation, before workout starts)
2. Post-workout (after completing workout)

**During workout:** Display only (shows what was entered at review, or blank)

**Suggestion display:** "Suggested: 135 lbs" shown at review, based on history query (see Structure Types Spec → Weight Recommendation Logic). User confirms by leaving it, or overrides by editing.

**Storage:** `weight_logged` on `exercises` table

---

## Rep Scheme Display

### Fixed
Standard display: "3×10" or "4×6-8"

### Ladder (down, up, pyramid)
Show pattern with current position highlighted:

```
15-12-9-6-3

[15] ← current
 12
  9
  6
  3
```

As user progresses, highlight moves down.

### Inverse Ladder
Show both movements with current rung:

```
Round 1: 10 curls / 1 extension
Round 2:  9 curls / 2 extensions
Round 3:  8 curls / 3 extensions  ← current
...
```

### N+1 (Death By)
Show current round and running context:

```
Death By Burpees
Round 7: Do 7 burpees this minute

[Complete Minute]
```

If incomplete, track `highest_rung` reached.

---

## Progress Signals (Future)

**Current state:** Track data per Structure Types Spec schema, but do not display "Last time" badges yet.

**Infrastructure to build now:**
- Store `completion_time_seconds`, `rounds_completed`, `highest_rung` on `structure_results`
- Store `weight_logged` on `exercises`
- Query context: `exercise_id` + `equipment_used` + `reps` + `section_type`

**Future display (not implemented yet):**
- "Last time: 6:23" on For Time cards
- "Last time: 5 rounds" on AMRAP cards
- "Last time: 135 lbs" on weight inputs
- "Beat your time?" prompt on repeat workouts

---

## Section Status

Each section tracks completion state:

```typescript
type SectionStatus = 'not_started' | 'completed' | 'skipped';
```

**Behavior:**
- Sections start as `not_started`
- When user completes section CTA → `completed`
- If user exits mid-workout → current section stays `not_started`, remaining sections marked `skipped`
- Completed sections retain their tracking data

---

## Incomplete Workout Handling

If user exits before completing all sections:

1. **Last completed section:** Saved with full tracking data
2. **Current section (if started but not completed):** Marked `skipped`, partial data discarded
3. **Remaining sections:** Marked `skipped`
4. **Workout record:** Saved with `completed_at = null` or flagged as incomplete

---

## Screen Flow Reference

### Review Screen (Post-Generation)
- Shows all sections collapsed
- User can expand to see exercises
- Weight fields editable
- "Start Workout" CTA

### Workout Mode
- One section active at a time
- Global timer running at top
- Section card with inline timer (if applicable)
- Section CTA to complete/advance
- "Next Section" transition between sections

### Post-Workout
- Summary of completed sections
- Editable weight fields (final chance to correct)
- Tracking results displayed (time, rounds, etc.)
- "Save Workout" CTA

---

## Related Documents

- `Clear_-_Structure_Types_Spec.md` — Structure definitions and tracking schema
- `Clear_-_Intensity_Model_Spec.md` — How intensity affects content
- `Clear_-_Workout_Generation_Prompt.md` — AI generation (to be updated)
