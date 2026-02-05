# Clear — Favorites & Repeat Workouts Spec

> **Status:** STABLE  
> **Last Updated:** February 3, 2026  
> **Purpose:** Source of truth for saving, organizing, and repeating favorite workouts

---

## Overview

Users can save workouts they enjoy and return to them later. Saved workouts are exact copies — same exercises, same reps, same structure. This enables "beat your time" tracking for timed sections.

---

## Core Concepts

### What Gets Saved

A saved workout is a **complete snapshot** of the generated workout:
- All sections with their structure types
- All exercises with prescribed reps, sets, equipment
- Original intensity, anchor, duration metadata

**Not saved:** User's logged weights or completion data from the original session. Each repeat is a fresh attempt.

### Why Exact Copy

Saving the exact workout (not a template) enables:
- True "beat your previous best" comparisons
- Consistent benchmark workouts
- No ambiguity about what the workout contains

If users want variety with similar parameters, they regenerate — that flow already exists.

---

## User Flow

### Saving a Workout

**When:** Post-workout screen, or from Workout History

**Action:** User taps "Save to Favorites" (⭐ icon or button)

**Prompt:** 
```
Save to Favorites

Name this workout:
[ Hinge Focus — Feb 3 ]  ← pre-filled default

[Cancel]  [Save]
```

**Default naming:** `{Workout Title} — {Date}`
- Example: "Hinge Focus — Feb 3"
- User can edit before saving

**Result:** Workout added to Favorites section

---

### Accessing Favorites

**Location:** Dedicated "Favorites" section in app navigation

**Display:** List of saved workouts showing:
- User-given name (or default)
- Original workout title
- Anchor icon
- Duration
- Date saved
- Times completed badge (if repeated)

**Sorting:** Most recently saved first (user can change later)

---

### Starting a Favorite Workout

**Action:** User taps saved workout → "Start Workout"

**Pre-workout display:**
- Full workout preview (same as Review screen)
- For timed sections: "Previous Best: 6:23" badge (if they've done this workout before)
- Weight fields: Empty (user enters fresh each time)

**No regeneration:** Workout loads exactly as saved. No AI call.

---

## Beat Your Previous Best

### Applies To

Timed structures only:
- **For Time:** Previous best completion time
- **AMRAP:** Previous best rounds completed
- **Circuit (timed):** Previous best completion time

### Does Not Apply To

- Standard (weight-based progress is harder to compare — different days, different energy)
- Superset
- EMOM (completion is binary)
- Circuit (untimed)

### Display

**Before workout (on section card):**
```
For Time — 8 min cap
Previous Best: 6:23

[Start]
```

**After completing section:**
```
Your Time: 5:58

🎉 New Personal Best! (was 6:23)
```

Or if not beaten:
```
Your Time: 6:45

Previous Best: 6:23
```

### Tracking

Query `structure_results` for this saved workout's timed sections:
```sql
SELECT 
  MIN(completion_time_seconds) as best_time,  -- For Time, Circuit
  MAX(rounds_completed) as best_rounds        -- AMRAP
FROM structure_results
WHERE section_id IN (
  SELECT id FROM workout_sections 
  WHERE session_id IN (
    SELECT session_id FROM saved_workout_completions
    WHERE saved_workout_id = {this_saved_workout}
  )
)
AND structure_type = 'for_time';
```

---

## Editing Saved Workouts

**Rule:** Edits create a copy.

**Flow:**
1. User views saved workout
2. Taps "Edit"
3. Can modify exercises, reps, structure
4. On save: "Save as New Favorite" (creates new entry)
5. Original remains unchanged

**Why:** Preserves history integrity. "Previous Best" only makes sense if the workout is identical.

---

## Schema

### New Table: `saved_workouts`

```sql
CREATE TABLE saved_workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  
  -- User-facing
  name TEXT NOT NULL,                    -- User-given or default name
  
  -- Snapshot of original workout
  original_session_id UUID REFERENCES workout_sessions(id),
  workout_snapshot JSONB NOT NULL,       -- Full workout structure
  
  -- Metadata
  anchor TEXT,
  intensity INTEGER,
  duration_mins INTEGER,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### New Table: `saved_workout_completions`

Links repeat attempts to the saved workout for "previous best" queries.

```sql
CREATE TABLE saved_workout_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  saved_workout_id UUID REFERENCES saved_workouts(id),
  session_id UUID REFERENCES workout_sessions(id),  -- The completed session
  completed_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Query: Previous Best for For Time

```sql
SELECT MIN(sr.completion_time_seconds) as previous_best
FROM structure_results sr
JOIN workout_sections ws ON sr.section_id = ws.id
JOIN saved_workout_completions swc ON ws.session_id = swc.session_id
WHERE swc.saved_workout_id = {saved_workout_id}
  AND sr.structure_type = 'for_time'
  AND ws.order_index = {section_order_index};  -- Match specific section
```

### Query: Previous Best for AMRAP

```sql
SELECT MAX(sr.rounds_completed) as previous_best
FROM structure_results sr
JOIN workout_sections ws ON sr.section_id = ws.id
JOIN saved_workout_completions swc ON ws.session_id = swc.session_id
WHERE swc.saved_workout_id = {saved_workout_id}
  AND sr.structure_type = 'amrap'
  AND ws.order_index = {section_order_index};
```

---

## UI Elements

### Favorites List Item

```
┌─────────────────────────────────────────┐
│ ⭐ Hinge Destroyer                      │
│                                         │
│ 🏋️ Hinge  •  45 min  •  Intensity 7    │
│ Saved Feb 3  •  Completed 3 times       │
│                                         │
│                          [Start] →      │
└─────────────────────────────────────────┘
```

### Previous Best Badge (on section card)

```
┌─────────────────────────────────────────┐
│ Conditioning — For Time                 │
│ 8 min cap                               │
│                                         │
│ 21-15-9 KB Swings + Burpees             │
│                                         │
│ ⏱️ Previous Best: 6:23                  │
│                                         │
│              [Start]                    │
└─────────────────────────────────────────┘
```

### Post-Section Result (PR)

```
┌─────────────────────────────────────────┐
│ ✓ Conditioning Complete                 │
│                                         │
│ Your Time: 5:58                         │
│                                         │
│ 🎉 New Personal Best!                   │
│    Previous: 6:23                       │
│                                         │
│              [Next Section]             │
└─────────────────────────────────────────┘
```

### Post-Section Result (No PR)

```
┌─────────────────────────────────────────┐
│ ✓ Conditioning Complete                 │
│                                         │
│ Your Time: 6:45                         │
│                                         │
│ Previous Best: 6:23                     │
│                                         │
│              [Next Section]             │
└─────────────────────────────────────────┘
```

---

## Edge Cases

### First Time Completing Saved Workout

No "Previous Best" badge shown — this attempt establishes the baseline.

After completion: "First attempt recorded! Come back and beat it."

### Workout Saved But Never Completed

Saved workout exists but user never finished it (or never started a repeat).

Display: No "Previous Best" badge, no completion count.

### Incomplete Repeat Attempt

User starts saved workout but exits early.

- Completed sections: Data saved normally
- Timed sections completed: Count toward "Previous Best" pool
- Incomplete sections: Marked skipped, not counted

### Multiple Timed Sections

Each timed section tracks its own "Previous Best" independently.

Workout with AMRAP + For Time:
- AMRAP shows: "Previous Best: 5 rounds"
- For Time shows: "Previous Best: 7:12"

---

## Future Considerations (Out of Scope for v1)

1. **Share favorites** — Send saved workout to a friend
2. **Public library** — Browse community-saved workouts
3. **Suggested repeats** — "You haven't done 'Hinge Destroyer' in 3 weeks"
4. **Progress charts** — Graph of all attempts over time
5. **Favorite sections** — Save just a conditioning finisher, not full workout

---

## Related Documents

- `Clear_-_Structure_Types_Spec.md` — Structure definitions and `structure_results` schema
- `Clear_-_UI_Component_Spec.md` — Timer and card behaviors
- `Clear_-_Intensity_Model_Spec.md` — Intensity context for saved workouts
