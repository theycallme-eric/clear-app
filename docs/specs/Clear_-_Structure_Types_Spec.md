# Clear — Structure Types Spec

> **Status:** STABLE  
> **Last Updated:** February 3, 2026  
> **Purpose:** Source of truth for workout structure types, tracking, and schema

---

## Overview

This document defines workout structure types: what they are, what parameters they require, how they render in the UI, and what completion data gets tracked.

**Structures are format tools, not intensity gates.** Intensity affects the *content* within a structure (movement difficulty, rep count, weight) — not whether the structure appears.

---

## Structure Types

### 1. Standard

**What it is:** Traditional sets × reps format. Rest between sets.

**Where it appears:** Primary lift, accessory, warm-up, cooldown, core

**Parameters:**
```typescript
{ type: 'standard' }
```

**Prescription format:** `3×8` or `4×6-8`

**Tracking:** Weight used (single field per exercise)

**UI:** Weight input field (editable at review + post-workout), "Complete Exercise" button

**Progress signal:** "Last time: 135 lbs"

---

### 2. Superset

**What it is:** Two exercises performed back-to-back. Rest comes after completing both.

**Where it appears:** Accessory, core. Can be added for intensity/efficiency but not required everywhere.

**Parameters:**
```typescript
{ type: 'superset'; paired_with: string }
```

**Prescription format:** `A1/A2: 3×10 each`

**Tracking:** Weight used per exercise

**UI:** Grouped card showing both exercises, single "Complete Set" action

**Progress signal:** "Last time: A1 @ 95 lbs, A2 @ 25 lbs"

---

### 3. Circuit

**What it is:** 3+ exercises performed in sequence. Rounds are prescribed. Rest comes after completing each round.

**Where it appears:** Conditioning (primary home), accessory (for efficiency)

**Purpose:** Sustained effort, cardiovascular endurance, time efficiency

**Parameters:**
```typescript
{ type: 'circuit'; circuit_id: string; rounds: number }
```

**Prescription format:** `3 rounds: 10 KB swings, 10 push-ups, 10 rows`

**Intensity adjustment:** Higher intensity = more movements per circuit, more reps per movement, harder movement selection

**Tracking:** Time to complete (timer stops on final round), weight used per exercise

**UI:** Grouped card with timer, round indicator, "Complete Circuit" CTA stops timer

**Progress signal:** "Last time: 8:42"

---

### 4. EMOM (Every Minute On the Minute)

**What it is:** Fixed work at the top of each minute. Remaining time is rest.

**Where it appears:** Conditioning, accessory, skill work. **Not in warm-up or cooldown.**

**Purpose:** Pacing discipline, built-in rest management

**Parameters:**
```typescript
{ type: 'emom'; minutes: number }
```

**Prescription format:** `10 min EMOM: 5 power cleans`

**Intensity adjustment:** Harder movements (burpees vs inchworms), more reps per minute

**Related format:** Tabata (20s work / 10s rest for 8 rounds) is a specific EMOM variant.

**Tracking:** Weight used, user notes (modifications)

**UI:** Minute timer with rep target, "Minute Complete" button

**Progress signal:** "Last time: completed @ 135 lbs"

---

### 5. AMRAP (As Many Rounds As Possible)

**What it is:** Fixed time window. Goal is maximum rounds completed.

**Where it appears:** Conditioning primarily

**Purpose:** Test capacity, push effort within a time box

**Parameters:**
```typescript
{ type: 'amrap'; minutes: number }
```

**Prescription format:** `8 min AMRAP: 12 KB swings, 8 burpees, 6 box jumps`

**Intensity adjustment:** Harder movements, heavier weight, more reps per round

**Tracking:** Rounds completed, weight used

**UI:** Countdown timer, round counter, "Complete Round" button

**Progress signal:** "Last time: 5 rounds"

---

### 6. For Time (FT)

**What it is:** Fixed work. Goal is to finish as fast as possible. Always has a time cap.

**Where it appears:** Conditioning

**Purpose:** Race the clock, test speed/power endurance

**Parameters:**
```typescript
{ type: 'for_time'; time_cap_mins: number }
```

**Prescription format:** `For Time: 50 KB swings, 40 push-ups, 30 burpees — 10 min cap`

**Intensity adjustment:** More total reps, harder movements, heavier weight, tighter time cap

**Tracking:** Completion time, completed under cap (Y/N), weight used

**UI:** Count-up timer with cap warning, work checklist, "Complete" CTA stops timer

**Progress signal:** "Last time: 6:23" or "Last time: hit cap at round 3"

---

## Rep Schemes

Rep schemes modify how reps are prescribed *within* any structure. They're orthogonal to structure type.

| Scheme | Pattern | Example | Notes |
|--------|---------|---------|-------|
| `fixed` | Same reps each set/round | 3×10 | Default |
| `ladder_down` | Descending | 15-12-9-6-3 | Creates momentum |
| `ladder_up` | Ascending | 3-6-9-12-15 | Builds difficulty |
| `pyramid` | Up then down | 3-6-9-12-9-6-3 | Peak in middle |
| `inverse` | Two movements, opposite direction | 10/1, 9/2, 8/3... 1/10 | Paired exercises |
| `n_plus_one` | Add 1 each round until failure | 1, 2, 3, 4... | "Death by" format |

**Where rep schemes apply:**

- Circuits (ladder down is common for conditioning)
- For Time (ladders create natural pacing)
- AMRAP (n+1 pairs well)
- Accessory (pyramids for volume)
- Core (ladders for challenge)

**Tracking for incomplete ladders/n+1:** Highest rung reached

---

## Structure × Section Matrix

| Section | Allowed Structures | Common Rep Schemes |
|---------|-------------------|-------------------|
| Warm-up | standard | fixed |
| Mobility | standard | fixed |
| Primary Lift | standard only | fixed |
| Accessory | standard, superset, circuit | fixed, pyramid, ladder |
| Core | standard, superset, circuit | fixed, ladder |
| Conditioning | circuit, emom, amrap, for_time | ladder_down, n_plus_one, inverse |
| Cooldown | standard | fixed |

---

## Schema

### Existing Table: `exercises`

Weight tracking lives here. One field, editable at two moments.

```sql
exercises (
  id UUID PRIMARY KEY,
  section_id UUID REFERENCES workout_sections(id),
  exercise_id TEXT,              -- References exercise library
  equipment_used TEXT,
  sets INTEGER,
  reps TEXT,                     -- "15" or "30 sec"
  weight_logged TEXT,            -- User's actual weight, editable at review + post-workout
  exercise_notes TEXT,
  order_index INTEGER
)
```

**Weight edit flow:**

1. AI generates workout, computes suggestion from history
2. UI pre-fills `weight_logged` with suggestion
3. User edits during review → updates `weight_logged`
4. Workout executes (weight display-only)
5. User can correct post-workout → updates `weight_logged`

### New Table: `structure_results`

Section-level tracking for timed/scored structures.

```sql
CREATE TABLE structure_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID REFERENCES workout_sections(id),
  structure_type TEXT NOT NULL,       -- 'circuit', 'amrap', 'for_time', 'emom'
  
  -- Time tracking
  completion_time_seconds INTEGER,    -- For circuit, for_time
  completed_under_cap BOOLEAN,        -- For for_time
  
  -- Round tracking  
  rounds_completed INTEGER,           -- For amrap
  
  -- Rep scheme tracking
  rep_scheme TEXT,                    -- 'ladder_down', 'n_plus_one', etc.
  highest_rung INTEGER,               -- If incomplete (ladder or n+1)
  
  -- Meta
  notes TEXT,                         -- User modifications
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Weight Recommendation Logic

AI suggestions are **computed at generation time, not stored**. The query considers context:

```sql
SELECT weight_logged 
FROM exercises e
JOIN workout_sections ws ON e.section_id = ws.id
WHERE e.exercise_id = 'kb-swing'
  AND e.equipment_used = 'kettlebells'
  AND e.reps = '15'
  AND ws.section_type = 'conditioning'
ORDER BY ws.created_at DESC
LIMIT 3
```

**Context factors for recommendation:**

- `exercise_id` — which movement
- `equipment_used` — barbell vs dumbbell variant (uses equipment ID like `kettlebells`, not display name)
- `reps` — 10 reps vs 50 reps requires different weight
- `section_type` — conditioning vs primary lift context

**Note:** Queries use `equipment_used` (the equipment ID like `kettlebells`), not the display name. Display name resolution happens at the UI layer via `equipment_display_names` mapping in the exercise library. See `Clear_-_Exercise_Library.md` for the equipment naming convention.

**Note:** Queries use `equipment_used` (the equipment ID like `kettlebells`), not the display name. Display name resolution happens at the UI layer via `equipment_display_names` mapping in the exercise library.

**UI display:** "Suggested: 24kg (based on last time)" — user confirms or overrides.

---

## Open Items (Future Sessions)

1. **Intensity model refinement** — How intensity maps to movement difficulty, rep counts, and weight within each structure
2. **Tabata handling** — Confirm as EMOM variant or needs separate flag
3. **UI component specs** — Timer behavior, CTA patterns, progress display per structure type
4. **Favorites/repeat workouts** — How saved workouts leverage structure_results for "beat your time" features

---

## Related Documents

- `Clear_-_Workout_Generation_Prompt.md` — System prompt for AI generation
- `Clear_-_Data_Model.md` — Full database schema
- `Clear_-_Exercise_Library.md` — Canonical exercise definitions
