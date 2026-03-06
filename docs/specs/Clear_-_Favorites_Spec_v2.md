# Clear — Favorites & Repeat Workouts Spec (v2)

> **Status:** DRAFT — pending review
> **Last Updated:** March 5, 2026
> **Replaces:** Clear_-_Favorites_Spec.md (Feb 3, 2026)
> **Purpose:** Source of truth for workout history, favorites, and repeat flows

---

## Overview

Completed workouts live in two places: **History** (automatic) and **Favorites** (intentional). History is a log of everything you've done. Favorites is a curated collection of workouts you want to return to — they accumulate meaning over time through progression tracking.

---

## Core Concepts

### History (Automatic)

Every completed workout appears in History automatically. It's a log, not a collection.

- Populated on workout completion — no user action required
- Displays as a read-only version of the Review card (same layout, no edit actions)
- Users can **favorite** a workout or **start it again** from here
- Eventually pruned (retention rules TBD — possibly 30 days or ~50 workouts for unfavorited items)

### Favorites (Intentional)

A favorite is a workout the user has explicitly starred. It persists indefinitely and becomes a living record that gets richer with each completion.

A favorite stores:
- The complete workout snapshot (sections, exercises, prescribed reps/sets, equipment)
- Original metadata (anchor, intensity, duration)
- **Times completed** — incremented each time the user finishes this workout
- **Last completed date** — updated on each completion
- **Completion history** — each attempt is a snapshot (weights, notes, times, structure results)

### What Gets Saved in a Favorite

A favorite is a **complete snapshot** of the generated workout:
- All sections with their structure types
- All exercises with prescribed reps, sets, equipment
- Original intensity, anchor, duration metadata

Unlike the previous spec, **previous logged data carries forward.** When repeating a favorite, the user sees their most recent weights in the weight fields as context ("last time" data).

### History vs. Favorites: The Distinction

| | History | Favorites |
|---|---|---|
| **Created** | Automatically on completion | User taps favorite toggle |
| **Lifespan** | Pruned eventually | Persists indefinitely |
| **Progression tracking** | None | Times completed, last completed, weight history, personal bests |
| **Actions available** | Favorite it, start again | Start, view completion history, remove |
| **Purpose** | Log | Curated collection |

---

## User Flows

### Favoriting a Workout

**Interaction:** Simple toggle (star icon). One tap. No naming modal, no extra ceremony.

**The favorite inherits the workout's existing title.** No user-provided name.

**Entry points:**
- **Summary screen (post-workout):** Star icon on the completion screen
- **History:** Star icon on any past workout card

**Result:** Workout appears in Favorites. If favorited from the summary screen, that session counts as the first completion (times_completed = 1, last_completed_at = now). If favorited from history, times_completed = 0 until the user repeats it.

### Repeating a Workout from History

**Flow:**
1. User taps a past workout in History
2. Workout loads into the Review screen — same UI as a freshly generated workout, read-only
3. User taps "Repeat"
4. Previous weights are **not** pre-filled (this is a casual repeat, no progression context)
5. No AI call. No regeneration. Exact same exercises, structure, reps.

**This does NOT create a saved_workout entry.** It's a one-time reuse. If the user wants to track progression, they favorite it.

### Starting a Workout from Favorites

**Flow:**
1. User taps a favorited workout
2. Workout loads into the Review screen
3. Weight fields show "last time" data from most recent completion (e.g., "Last: 135 lbs")
4. For timed sections: "Previous Best" badge displayed
5. User taps Start → full workout mode

**After completion:**
- `times_completed` increments
- `last_completed_at` updates
- A completion snapshot is recorded (weights, notes, structure results)
- Timed section results compared against personal bests

### Removing from Favorites

**Location:** Available when viewing a favorited workout (from Favorites list)

**Action:** Unfavorite toggle (same star icon) or explicit "Remove from Favorites" action

**Confirmation dialog required.** Unfavoriting has consequences:
- The workout returns to History under normal retention/pruning rules
- If the workout falls outside the retention window, the dialog warns: "This workout is older than [X] — removing it from favorites means it won't be visible in history."
- All progression tracking data (times completed, personal bests, completion history) is lost. The dialog warns: "Tracked data including completion history and personal bests will be lost."

**Result:** Workout removed from Favorites. Progression data deleted. Workout appears in History if within retention window.

---

## Progression Tracking

### What's Tracked Per Favorite

| Data | Source | Display |
|---|---|---|
| Times completed | Incremented on each completion | Badge on Favorites list card |
| Last completed | Updated on each completion | Subtitle on Favorites list card |
| Personal best (For Time) | MIN(completion_time_seconds) across attempts | Badge on section card before start |
| Personal best (AMRAP) | MAX(rounds_completed) across attempts | Badge on section card before start |
| Last weights | Most recent loggedData per exercise | Pre-filled in weight fields |

### "Last Time" Weight Display (v1)

When repeating a favorited workout, each exercise shows the weight from the most recent completion.

**Important:** Weight data is stored as a string (e.g., `"185lbs"`, `"35lbs each"`, `"185lbs x 8,8,8,7"`). For v1, display the raw string as-is. Parsing into structured data is future work.

**Display:** Shown as helper text near the weight input field. Not editable — it's context, not a default value. The actual weight field starts empty for the user to fill in.

### Beat Your Previous Best

Applies to timed structures only:
- **For Time:** Previous best completion time
- **AMRAP:** Previous best rounds completed

Does NOT apply to: Standard, Superset, EMOM (binary completion), untimed Circuit.

**Before workout (on section card):** Section header shows structure type, time cap, and a "Previous Best" line below (e.g., "⏱ Previous Best: 6:23"). Styled to match existing section header treatment.

**After completing section (new PR):** Completion confirmation shows the user's time/rounds prominently, followed by a celebration message and the previous record (e.g., "🎉 New Personal Best! Previous: 6:23").

**After completing section (no PR):** Shows the user's time/rounds with the previous best below for reference.

**First attempt:** No "Previous Best" line shown. After completion: "First attempt recorded."

---

## UI Elements

### History Screen Layout

**Top-level:** Tabs — `History | Favorites` — replacing the current single-view approach.

**Filter bar** (History tab): Existing All / Anchor / Intensity filters remain.

**History list cards** (existing, minimal changes needed): Single-line cards showing workout type, anchor, intensity, duration, date. These are the entry point — tapping opens the detail view.

**Known bug:** `\u00D7` renders as literal text instead of `×` in the history detail view. Fix in this work.

### History Detail View (PREREQUISITE FIX)

The current history detail (flat list, minimal formatting) needs to adopt the Review card's visual hierarchy but as a read-only, retrospective view.

**Collapsed (default):** Section headers visible — styled like the Review card's orange section headers (e.g., "PRIMARY LIFT", "ACCESSORY", "CORE"). Tap a section to expand.

**Expanded:** Each exercise shows:
- Exercise name (bold, same visual weight as Review card)
- Sets × reps
- Equipment type
- Logged weight (what the user actually lifted — promoted, not hidden)
- Exercise notes (what the user wrote during the workout)

**Explicitly dropped** (not shown in history detail):
- Tempo
- Rest periods
- Effort % (@75% etc.)
- Easier alternatives
- Swap actions

**Actions on history detail:**
- Favorite toggle (star icon)
- Repeat button
- No other actions (no edit, no delete, no regenerate)

**Design reference:** Use the Review card's section header component and visual hierarchy. The difference is content focus — Review shows "what to do," History shows "what you did."

### Favorites Tab

Lives alongside History as a tab. Shows only favorited workouts.

**Favorites list card:** Same dimensions as history list card but includes progression data:
- Workout title (with star indicator)
- Anchor • duration • intensity
- Times completed • last completed date

**Favorites detail view:** Same layout as History detail view (collapsed sections, expand to see exercises) with additions:
- "Last time" weight shown per exercise (from most recent completion)
- Previous Best badges on timed sections
- Start / Repeat button
- Remove from Favorites action
- Completion history (list of past attempts with dates)

### Summary Screen (Post-Workout)

**Addition:** Favorite toggle (star icon) placed near the workout type badge area ("HYPERTROPHY • POWER • INTENSITY 7"). One tap to favorite. No modal, no naming prompt.

---

## Schema

### New Table: `saved_workouts`

```sql
CREATE TABLE saved_workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),

  -- Snapshot of original workout
  original_session_id UUID REFERENCES workout_sessions(id),
  workout_snapshot JSONB NOT NULL,       -- Full workout structure

  -- Metadata from original workout
  title TEXT NOT NULL,                    -- Inherited from workout title
  anchor TEXT,
  intensity INTEGER,
  duration_mins INTEGER,

  -- Progression (denormalized for fast reads)
  times_completed INTEGER DEFAULT 0,
  last_completed_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Changes from v1 spec:**
- `name` → `title` (no user-provided name, inherited from workout)
- Added `times_completed` (denormalized counter)
- Added `last_completed_at` (denormalized timestamp)

### New Table: `saved_workout_completions`

Links each completion attempt to the saved workout. Enables progression queries.

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
  AND ws.order_index = {section_order_index};
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

### Query: Last Weights for Exercise

```sql
SELECT e.exercise_name, e.weight_logged, e.exercise_notes
FROM exercises e
JOIN workout_sections ws ON e.section_id = ws.id
JOIN saved_workout_completions swc ON ws.session_id = swc.session_id
WHERE swc.saved_workout_id = {saved_workout_id}
ORDER BY swc.completed_at DESC
LIMIT 1;
```

Note: This returns weights from the most recent completion only. Weight values are strings — display as-is for v1.

---

## Prerequisites

### 1. Data Persistence Gap (MUST ship first)

The workout execution data (weights, exercise notes, structure results) is collected in the UI but not written to the database. Without this, favorites have no progression data to display.

**What needs wiring:**
- `loggedData` → UPDATE `exercises` SET `weight_logged`, `exercise_notes`
- `structureResults` → INSERT INTO `structure_results`
- `workout_sections` status/timestamps (started_at, completed_at)

See: Discovery Report (March 5, 2026) for exact code locations and data shapes.

### 2. History Detail View Rework + Bug Fix

History detail view needs to adopt the Review card's visual hierarchy (collapsed sections, expand to see exercises, focused on "what you did"). The current flat list layout doesn't support the favorites flow.

Additionally, there's an encoding bug: `\u00D7` renders as literal text instead of `×` in exercise prescriptions. Fix alongside the rework.

---

## Edge Cases

### First Completion of a Favorite
No "Previous Best" badge. After completion: "First attempt recorded."

### Favorite Never Completed
Saved but never started. Display: No completion count, no "Previous Best," no "last time" weights.

### Incomplete Attempt (Abandoned Workout)
User starts a favorited workout but exits early.
- Completed sections: Data saved normally
- Timed sections completed: Count toward "Previous Best" pool
- Incomplete sections: Not counted
- **`times_completed` does NOT increment** — only full completions count. Partial data is saved but doesn't affect the progression counter.

### Multiple Timed Sections
Each timed section tracks its own "Previous Best" independently.

### Unfavoriting a Workout with Completion History
Hard delete — progression data is permanently removed. User is warned via confirmation dialog before proceeding. The underlying workout returns to History under normal retention rules.

---

## Out of Scope (v1)

- Weight value parsing (structured numbers from string data)
- Weight suggestion from history on non-favorited workouts
- Per-exercise progression charts
- History pruning rules (retention policy)
- Share favorites
- Public workout library
- "Suggested repeats" ("You haven't done this in 3 weeks")
- Editing a saved workout (creates copy — deferred)
- Sorting/filtering favorites list

---

## Resolved Decisions (March 5, 2026)

1. **First completion:** Favoriting from summary screen counts that session as first completion (times_completed = 1). Favoriting from history starts at 0.
2. **Abandoned workouts:** Only full completions increment times_completed. Partial session data still saves normally.
3. **Unfavorite behavior:** Hard delete of progression data with confirmation dialog warning about data loss and potential history expiration.
4. **Repeat verb:** "Repeat" is the label for starting a past workout again.

---

## Related Documents

- `Clear_-_Data_Model_UPDATED.md` — exercises table, structure_results table schema
- `Clear_-_Structure_Types_Spec.md` — Structure definitions and structure_results schema
- `Clear_-_UI_Component_Spec.md` — Timer and card behaviors
- `Clear_-_Workout_History__Wireframe_.md` — History list screen
- `Clear_-_Implementation_Plan_v2.md` — Phase 5 sessions (5A/5B/5C)
