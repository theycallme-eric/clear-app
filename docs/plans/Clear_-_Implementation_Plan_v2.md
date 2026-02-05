# Implementation Plan: Workout Generation System v2

**Purpose:** Implement the refined workout generation system with new structure types, intensity model, and UI components.  
**Format:** Phased implementation with Antigravity-ready task handoffs  
**Estimated Total:** 6-8 sessions

---

## Overview

This plan implements five new specification documents:

| Document | What It Defines |
|----------|-----------------|
| `Clear_-_Structure_Types_Spec.md` | Structure types, parameters, tracking schema |
| `Clear_-_Intensity_Model_Spec.md` | How intensity 1-10 scales content |
| `Clear_-_UI_Component_Spec.md` | Timers, cards, CTAs, display patterns |
| `Clear_-_Favorites_Spec.md` | Save, repeat, beat your previous best |
| `Clear_-_Workout_Generation_Prompt_v2.md` | Updated AI prompt with examples |

---

## Phase Dependencies

```
Phase 1: Schema Updates (database)
    ↓
Phase 2: Prompt Update (edge function)
    ↓
Phase 3: Type Updates (frontend types)
    ↓
Phase 4: UI Components (cards, timers)
    ↓
Phase 5: Favorites Feature (new feature)
```

**Rule:** Complete each phase before starting the next. Each phase should result in a working app (no broken states).

---

## Phase 1: Schema Updates

### Session 1A: Add structure_results Table

```markdown
## Task
Create the `structure_results` table for tracking timed/scored workout sections.

## Context Files
Read these before starting:
- `docs/specs/Clear_-_Structure_Types_Spec.md` — Schema section
- `supabase/migrations/` — Existing migration patterns

## Skill
`supabase_workflow.md`

## Instructions

1. Create a new migration file in `supabase/migrations/`

2. Add the `structure_results` table:
```sql
CREATE TABLE structure_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID REFERENCES workout_sections(id) ON DELETE CASCADE,
  structure_type TEXT NOT NULL,
  
  -- Time tracking
  completion_time_seconds INTEGER,
  completed_under_cap BOOLEAN,
  
  -- Round tracking
  rounds_completed INTEGER,
  
  -- Rep scheme tracking
  rep_scheme TEXT,
  highest_rung INTEGER,
  
  -- Meta
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for querying by section
CREATE INDEX idx_structure_results_section_id ON structure_results(section_id);

-- Index for querying by structure type (for analytics)
CREATE INDEX idx_structure_results_type ON structure_results(structure_type);
```

3. Add RLS policies:
```sql
ALTER TABLE structure_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own structure results"
  ON structure_results FOR SELECT
  USING (
    section_id IN (
      SELECT ws.id FROM workout_sections ws
      JOIN workout_sessions wses ON ws.session_id = wses.id
      WHERE wses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own structure results"
  ON structure_results FOR INSERT
  WITH CHECK (
    section_id IN (
      SELECT ws.id FROM workout_sections ws
      JOIN workout_sessions wses ON ws.session_id = wses.id
      WHERE wses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own structure results"
  ON structure_results FOR UPDATE
  USING (
    section_id IN (
      SELECT ws.id FROM workout_sections ws
      JOIN workout_sessions wses ON ws.session_id = wses.id
      WHERE wses.user_id = auth.uid()
    )
  );
```

4. Run migration locally and verify

5. Regenerate TypeScript types:
```bash
npx supabase gen types typescript --local > src/types/database.ts
```

## Acceptance Criteria
- [ ] Migration file created and runs without errors
- [ ] Table exists with all columns
- [ ] RLS policies in place
- [ ] TypeScript types regenerated
- [ ] No TypeScript errors in project

## After Completion
- Update `SESSION_LOG.md`
- Update `PROJECT_MAP.md` with new table
```

---

### Session 1B: Add Section Status Field

```markdown
## Task
Add `status` field to `workout_sections` table for tracking completion state.

## Context Files
- `docs/specs/Clear_-_UI_Component_Spec.md` — Section Status section
- `supabase/migrations/` — Previous migrations

## Skill
`supabase_workflow.md`

## Instructions

1. Create migration to add status field:
```sql
-- Add status enum type
CREATE TYPE section_status AS ENUM ('not_started', 'completed', 'skipped');

-- Add status column with default
ALTER TABLE workout_sections 
ADD COLUMN status section_status DEFAULT 'not_started';

-- Update existing completed sections (if completed_at is set)
UPDATE workout_sections 
SET status = 'completed' 
WHERE completed_at IS NOT NULL;
```

2. Regenerate TypeScript types

## Acceptance Criteria
- [ ] Status field added to workout_sections
- [ ] Existing data migrated correctly
- [ ] TypeScript types updated
- [ ] No errors

## After Completion
- Update `SESSION_LOG.md`
```

---

## Phase 2: Prompt Update

### Session 2A: Update Edge Function System Prompt

```markdown
## Task
Replace the workout generation system prompt with v2.

## Context Files
Read these before starting:
- `docs/specs/Clear_-_Workout_Generation_Prompt_v2.md` — New prompt (IMPORTANT: read fully)
- `docs/specs/Clear_-_Structure_Types_Spec.md` — Structure definitions
- `docs/specs/Clear_-_Intensity_Model_Spec.md` — Intensity scaling
- `supabase/functions/generate-workout/index.ts` — Current implementation

## Skill
`supabase_workflow.md`

## Instructions

1. Open `supabase/functions/generate-workout/index.ts`

2. Replace the `SYSTEM_PROMPT` constant with the new system prompt from `Clear_-_Workout_Generation_Prompt_v2.md`
   - Copy the entire content inside the ``` block under "System Prompt"
   - Keep it as a template literal

3. Update the `ExerciseStructure` type to match new schema:
```typescript
type ExerciseStructure = 
  | { type: 'standard' }
  | { type: 'superset'; paired_with: string }
  | { type: 'circuit'; circuit_id: string; rounds: number }
  | { type: 'emom'; minutes: number }
  | { type: 'amrap'; minutes: number }
  | { type: 'for_time'; time_cap_mins: number };
```

4. Update `prompt_version` to `'v2.0.0'`

5. Test locally with different intensity levels:
   - Intensity 2 (should include ALL sections, light content)
   - Intensity 7 (standard workout)
   - Intensity 9 (push session)

## Acceptance Criteria
- [ ] System prompt replaced
- [ ] ExerciseStructure type updated
- [ ] Version bumped to v2.0.0
- [ ] Generation works for intensity 2, 7, and 9
- [ ] All sections appear at all intensities
- [ ] Structure types in output match new schema

## Validation Tests
Run these manually after deployment:
1. Generate intensity 2 workout → Verify primary_lift section exists (should be light/form-focused)
2. Generate intensity 7 workout → Verify conditioning uses for_time or amrap structure
3. Generate intensity 9 workout → Verify circuits have `rounds` parameter

## After Completion
- Update `SESSION_LOG.md`
- Note any issues with AI output for follow-up prompt tuning
```

---

## Phase 3: Frontend Type Updates

### Session 3A: Update Workout Types

```markdown
## Task
Update frontend TypeScript types to match new structure schema.

## Context Files
- `src/types/workout.ts` — Current workout types
- `src/types/database.ts` — Generated Supabase types
- `docs/specs/Clear_-_Structure_Types_Spec.md` — Structure definitions

## Skill
`component.md`

## Instructions

1. Update `ExerciseStructure` type in `src/types/workout.ts`:
```typescript
export type ExerciseStructure = 
  | { type: 'standard' }
  | { type: 'superset'; paired_with: string }
  | { type: 'circuit'; circuit_id: string; rounds: number }
  | { type: 'emom'; minutes: number }
  | { type: 'amrap'; minutes: number }
  | { type: 'for_time'; time_cap_mins: number };
```

2. Add `StructureResult` type:
```typescript
export interface StructureResult {
  id: string;
  section_id: string;
  structure_type: 'circuit' | 'emom' | 'amrap' | 'for_time';
  completion_time_seconds?: number;
  completed_under_cap?: boolean;
  rounds_completed?: number;
  rep_scheme?: string;
  highest_rung?: number;
  notes?: string;
  created_at: string;
}
```

3. Add `SectionStatus` type:
```typescript
export type SectionStatus = 'not_started' | 'completed' | 'skipped';
```

4. Update `WorkoutSection` interface to include status:
```typescript
export interface WorkoutSection {
  // ... existing fields
  status: SectionStatus;
}
```

5. Fix any TypeScript errors that arise from these changes

## Acceptance Criteria
- [ ] All types updated
- [ ] No TypeScript errors
- [ ] Types match database schema

## After Completion
- Update `SESSION_LOG.md`
```

---

## Phase 4: UI Components

### Session 4A: Global Workout Timer

```markdown
## Task
Add global timer component that tracks total workout duration.

## Context Files
- `docs/specs/Clear_-_UI_Component_Spec.md` — Timer System section
- `src/components/` — Existing component patterns
- `src/index.css` — Design tokens

## Skill
`component.md`

## Instructions

1. Create `src/components/workout/GlobalTimer.tsx`:

```typescript
interface GlobalTimerProps {
  isRunning: boolean;
  onTimeUpdate?: (seconds: number) => void;
}
```

2. Implement:
   - Count-up timer from 0:00
   - MM:SS format display
   - Starts when `isRunning` becomes true
   - Stops when `isRunning` becomes false
   - Calls `onTimeUpdate` every second with elapsed time

3. Style using design tokens:
   - Position: sticky top of workout screen
   - Background: surface color with slight transparency
   - Font: monospace for timer digits

4. Export from `src/components/workout/index.ts`

## Acceptance Criteria
- [ ] Timer counts up when running
- [ ] Timer stops when not running
- [ ] Displays MM:SS format
- [ ] Uses design tokens (no hardcoded colors)
- [ ] Sticky positioning works on scroll

## After Completion
- Update `SESSION_LOG.md`
```

---

### Session 4B: Inline Section Timer

```markdown
## Task
Create inline timer component for timed sections (AMRAP, For Time, EMOM).

## Context Files
- `docs/specs/Clear_-_UI_Component_Spec.md` — Structure-Specific UI section
- `docs/specs/Clear_-_Structure_Types_Spec.md` — Structure definitions
- `src/components/` — Existing patterns

## Skill
`component.md`

## Instructions

1. Create `src/components/workout/SectionTimer.tsx`:

```typescript
interface SectionTimerProps {
  structureType: 'amrap' | 'for_time' | 'emom';
  duration?: number;        // Total minutes (AMRAP, EMOM)
  timeCap?: number;         // Cap in minutes (For Time)
  onComplete: (result: TimerResult) => void;
}

interface TimerResult {
  elapsed_seconds: number;
  completed_under_cap?: boolean;  // For Time only
}
```

2. Implement three timer modes:

   **AMRAP Mode:**
   - Count-down from duration to 0
   - Auto-completes when timer hits 0
   - Shows "Time's up!" message

   **For Time Mode:**
   - Count-up from 0
   - Shows cap warning at 80% of cap (visual highlight)
   - "Complete" button stops timer and records time
   - If cap reached, auto-stops with "Cap reached" message

   **EMOM Mode:**
   - Count-down per minute (60, 59, 58... 0)
   - Auto-advances to next minute at 0
   - Shows current minute: "Minute 4 of 8"
   - Completes after final minute

3. UI States:
   - Idle: Shows "Start" button
   - Running: Shows timer + "Complete" button (For Time) or just timer (AMRAP/EMOM)
   - Complete: Shows result

4. Style with design tokens

## Acceptance Criteria
- [ ] AMRAP counts down, auto-completes at 0
- [ ] For Time counts up, has cap warning, stops on Complete
- [ ] EMOM counts per minute, auto-advances
- [ ] All three modes visually distinct
- [ ] Uses design tokens

## After Completion
- Update `SESSION_LOG.md`
```

---

### Session 4C: Structure-Specific Exercise Cards

```markdown
## Task
Update exercise cards to render differently based on structure type.

## Context Files
- `docs/specs/Clear_-_UI_Component_Spec.md` — Full document
- `docs/specs/Clear_-_Structure_Types_Spec.md` — Structure definitions
- `src/components/WorkoutCard.tsx` — Current implementation (or equivalent)

## Skill
`component.md`

## Instructions

1. Create structure-specific card variants:

   **StandardExerciseCard** — Single exercise with weight input
   
   **SupersetCard** — Grouped card showing 2 exercises, shared set counter
   
   **CircuitCard** — Grouped card showing 3+ exercises, round counter, optional timer
   
   **TimedSectionCard** — Wrapper that includes SectionTimer for AMRAP/For Time/EMOM

2. Card rendering logic:
```typescript
const renderExerciseCard = (exercise: Exercise, structure: ExerciseStructure) => {
  switch (structure.type) {
    case 'standard':
      return <StandardExerciseCard exercise={exercise} />;
    case 'superset':
      // Group with paired exercise
      return <SupersetCard exercises={[exercise, pairedExercise]} />;
    case 'circuit':
      // Handled at section level
      return null;
    case 'emom':
    case 'amrap':
    case 'for_time':
      // Handled at section level with TimedSectionCard
      return null;
  }
};
```

3. Section-level rendering for grouped structures:
```typescript
const renderSection = (section: WorkoutSection) => {
  const firstStructure = section.exercises[0]?.structure;
  
  if (firstStructure?.type === 'circuit') {
    return <CircuitCard section={section} />;
  }
  
  if (['emom', 'amrap', 'for_time'].includes(firstStructure?.type)) {
    return <TimedSectionCard section={section} />;
  }
  
  // Default: render exercises individually
  return section.exercises.map(ex => renderExerciseCard(ex, ex.structure));
};
```

4. Weight input component:
   - Single field per exercise
   - Editable at review + post-workout
   - Display-only during active workout
   - Shows suggestion if available: "Suggested: 135 lbs"

5. Use `equipment_display_names` for exercise names:
```typescript
const getDisplayName = (exercise, definition) => {
  return definition.equipment_display_names?.[exercise.equipment_used] 
    ?? definition.name;
};
```

## Acceptance Criteria
- [ ] Standard exercises render as single cards
- [ ] Supersets render as grouped cards with 2 exercises
- [ ] Circuits render as grouped cards with round counter
- [ ] Timed sections include inline timer
- [ ] Weight input works correctly
- [ ] Display names resolve from equipment_display_names
- [ ] All cards use design tokens

## After Completion
- Update `SESSION_LOG.md`
- Update `PROJECT_MAP.md` with new component structure
```

---

### Session 4D: Ladder/Rep Scheme Display

```markdown
## Task
Implement visual display for ladder and other rep schemes.

## Context Files
- `docs/specs/Clear_-_UI_Component_Spec.md` — Rep Scheme Display section
- `src/components/workout/` — Timer and card components from previous sessions

## Skill
`component.md`

## Instructions

1. Create `src/components/workout/LadderDisplay.tsx`:

```typescript
interface LadderDisplayProps {
  pattern: string;          // "15-12-9-6-3"
  currentRung?: number;     // Index of current rung (0-based)
  exerciseNames: string[];  // For inverse ladders with multiple exercises
}
```

2. Parse and display patterns:

   **Descending ladder:** "15-12-9-6-3"
   ```
   [15] ← current (highlighted)
    12
     9
     6
     3
   ```

   **Inverse ladder:** "10/1, 9/2, 8/3..."
   ```
   Round 1: 10 curls / 1 extension
   Round 2:  9 curls / 2 extensions
   Round 3:  8 curls / 3 extensions  ← current
   ```

   **N+1 (Death By):**
   ```
   Death By Burpees
   Round 7: Do 7 burpees this minute
   ```

3. Highlight current rung with accent color (design token)

4. Integrate into CircuitCard and TimedSectionCard when reps contain ladder pattern

5. Pattern detection helper:
```typescript
const isLadderPattern = (reps: string): boolean => {
  return /^\d+(-\d+)+$/.test(reps) || reps.includes('/');
};
```

## Acceptance Criteria
- [ ] Ladder patterns display visually with rungs
- [ ] Current rung highlighted
- [ ] Inverse ladders show both exercises
- [ ] N+1 shows current round context
- [ ] Uses design tokens for colors

## After Completion
- Update `SESSION_LOG.md`
```

---

### Session 4E: Section Completion Flow

```markdown
## Task
Implement section completion logic including status updates and result saving.

## Context Files
- `docs/specs/Clear_-_UI_Component_Spec.md` — Section Status, Incomplete Workout Handling
- `docs/specs/Clear_-_Structure_Types_Spec.md` — Tracking requirements
- `src/lib/workout-api.ts` — Existing API patterns

## Skill
`supabase_workflow.md`, `component.md`

## Instructions

1. Create `src/lib/section-tracking.ts`:

```typescript
// Update section status
export const updateSectionStatus = async (
  sectionId: string, 
  status: SectionStatus
): Promise<void>

// Save structure result (for timed sections)
export const saveStructureResult = async (
  result: Omit<StructureResult, 'id' | 'created_at'>
): Promise<StructureResult>

// Handle workout exit (mark remaining sections as skipped)
export const handleWorkoutExit = async (
  sessionId: string,
  currentSectionIndex: number
): Promise<void>
```

2. Integrate into workout flow:

   **On section complete:**
   - Update section status to 'completed'
   - If timed section, save structure_result
   - Advance to next section

   **On workout exit:**
   - Current section (if started): status stays 'not_started'
   - Remaining sections: status = 'skipped'
   - Save workout with completed_at = null (incomplete flag)

3. Add completion handlers to card components:
   - StandardExerciseCard: "Complete Exercise" → mark section complete
   - SupersetCard: "Complete Set" → track set, "Complete" on final set
   - CircuitCard: "Complete Round" → track round, complete on final round
   - TimedSectionCard: Timer completion → save result, mark section complete

## Acceptance Criteria
- [ ] Section status updates correctly
- [ ] Structure results save for timed sections
- [ ] Workout exit marks remaining sections as skipped
- [ ] Completed sections retain data
- [ ] No errors on normal flow or early exit

## After Completion
- Update `SESSION_LOG.md`
```

---

## Phase 5: Favorites Feature

### Session 5A: Favorites Schema

```markdown
## Task
Create database tables for saved workouts feature.

## Context Files
- `docs/specs/Clear_-_Favorites_Spec.md` — Schema section
- `supabase/migrations/` — Existing patterns

## Skill
`supabase_workflow.md`

## Instructions

1. Create migration for favorites tables:

```sql
-- Saved workouts
CREATE TABLE saved_workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  original_session_id UUID REFERENCES workout_sessions(id),
  workout_snapshot JSONB NOT NULL,
  anchor TEXT,
  intensity INTEGER,
  duration_mins INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Track completions of saved workouts (for "previous best")
CREATE TABLE saved_workout_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  saved_workout_id UUID REFERENCES saved_workouts(id) ON DELETE CASCADE,
  session_id UUID REFERENCES workout_sessions(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_saved_workouts_user ON saved_workouts(user_id);
CREATE INDEX idx_saved_workout_completions_workout ON saved_workout_completions(saved_workout_id);
```

2. Add RLS policies for both tables (user can only access own data)

3. Regenerate TypeScript types

## Acceptance Criteria
- [ ] Both tables created
- [ ] RLS policies in place
- [ ] Types regenerated
- [ ] No errors

## After Completion
- Update `SESSION_LOG.md`
- Update `PROJECT_MAP.md` with new tables
```

---

### Session 5B: Favorites API

```markdown
## Task
Create API functions for saving, loading, and tracking favorite workouts.

## Context Files
- `docs/specs/Clear_-_Favorites_Spec.md` — Full document
- `src/lib/workout-api.ts` — Existing patterns

## Skill
`supabase_workflow.md`

## Instructions

1. Create `src/lib/favorites-api.ts`:

```typescript
// Save a workout to favorites
export const saveToFavorites = async (
  sessionId: string,
  name: string
): Promise<SavedWorkout>

// Get user's saved workouts
export const getSavedWorkouts = async (
  userId: string
): Promise<SavedWorkout[]>

// Load a saved workout (returns the snapshot)
export const loadSavedWorkout = async (
  savedWorkoutId: string
): Promise<WorkoutSnapshot>

// Record a completion of a saved workout
export const recordSavedWorkoutCompletion = async (
  savedWorkoutId: string,
  sessionId: string
): Promise<void>

// Get previous best for a section in a saved workout
export const getPreviousBest = async (
  savedWorkoutId: string,
  sectionOrderIndex: number,
  structureType: string
): Promise<PreviousBest | null>

interface PreviousBest {
  type: 'time' | 'rounds';
  value: number;  // seconds for time, count for rounds
}
```

2. Implement previous best queries per spec:
   - For Time: MIN(completion_time_seconds)
   - AMRAP: MAX(rounds_completed)

3. Handle edge cases:
   - First completion (no previous best)
   - Incomplete attempts (only count completed sections)

## Acceptance Criteria
- [ ] Can save workout to favorites
- [ ] Can load saved workouts list
- [ ] Can load specific saved workout
- [ ] Can record completion
- [ ] Previous best returns correct values
- [ ] Returns null for first attempt

## After Completion
- Update `SESSION_LOG.md`
```

---

### Session 5C: Favorites UI

```markdown
## Task
Create the Favorites section UI and integrate with workout flow.

## Context Files
- `docs/specs/Clear_-_Favorites_Spec.md` — UI Elements section
- `docs/specs/Clear_-_UI_Component_Spec.md` — General patterns
- `src/components/` — Existing patterns

## Skill
`component.md`

## Instructions

1. Create `src/components/favorites/FavoritesList.tsx`:
   - List of saved workouts
   - Shows: name, anchor icon, duration, intensity, completion count
   - "Start" button on each item

2. Create `src/components/favorites/SaveToFavoritesModal.tsx`:
   - Appears post-workout or from history
   - Name input (pre-filled with workout title + date)
   - Save / Cancel buttons

3. Create `src/components/workout/PreviousBestBadge.tsx`:
   - Shows "Previous Best: 6:23" or "Previous Best: 5 rounds"
   - Only appears for timed sections when previous data exists
   - Positioned on section card

4. Create `src/components/workout/ResultComparison.tsx`:
   - Shows after completing a timed section
   - Compares to previous best
   - "🎉 New Personal Best!" if beaten
   - Shows both times/scores

5. Add Favorites to navigation:
   - New tab/section in app navigation
   - Route to FavoritesList

6. Integrate save flow:
   - Add "Save to Favorites" button on post-workout screen
   - Add star icon on workout history items

## Acceptance Criteria
- [ ] Favorites section accessible from navigation
- [ ] Can save workout with custom name
- [ ] Saved workouts display in list
- [ ] Can start a saved workout
- [ ] Previous best shows on timed sections (when data exists)
- [ ] Result comparison shows after section completion
- [ ] PR celebration displays when best is beaten

## After Completion
- Update `SESSION_LOG.md`
- Update `PROJECT_MAP.md` with new components
- Update `BACKLOG.md` — mark Favorites as complete
```

---

## Post-Implementation

### Final Session: Integration Testing & Cleanup

```markdown
## Task
End-to-end testing of complete workout generation v2 system.

## Test Scenarios

1. **Generation at all intensities:**
   - Generate intensity 1, 5, 10 workouts
   - Verify all sections appear
   - Verify content scales appropriately

2. **Structure types:**
   - Generate workout with circuit in conditioning
   - Generate workout with superset in accessory
   - Generate workout with AMRAP, For Time, EMOM
   - Verify each renders correctly

3. **Timer functionality:**
   - Complete an AMRAP section (verify timer + round tracking)
   - Complete a For Time section (verify time recording)
   - Complete an EMOM section (verify minute advancement)
   - Exit workout early (verify skipped status)

4. **Favorites flow:**
   - Save a completed workout
   - Load and start the saved workout
   - Complete it again
   - Verify "Previous Best" appears
   - Beat the previous time
   - Verify PR celebration

5. **Edge cases:**
   - Generate with user limitations (verify exercises respect them)
   - Exit mid-workout (verify section statuses)
   - Save workout that was never completed (should work)

## Acceptance Criteria
- [ ] All test scenarios pass
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Performance acceptable (no jank on timers)

## After Completion
- Update `SESSION_LOG.md` with test results
- Update `BACKLOG.md` — mark v2 system as complete
- Create any follow-up tickets for issues found
```

---

## File Location Reference

| What | Where |
|------|-------|
| New specs | `docs/specs/Clear_-_*.md` |
| Migrations | `supabase/migrations/` |
| Edge function | `supabase/functions/generate-workout/index.ts` |
| Frontend types | `src/types/workout.ts`, `src/types/database.ts` |
| New components | `src/components/workout/`, `src/components/favorites/` |
| API functions | `src/lib/section-tracking.ts`, `src/lib/favorites-api.ts` |
| Design tokens | `src/index.css`, `design-tokens.json` |

---

## Key Constraints (Remind Antigravity)

| Constraint | Details |
|------------|---------|
| Design Tokens | No hardcoded colors — use CSS variables |
| Type Safety | Regenerate types after DB changes |
| Structure Types | Use new schema: `for_time` not `afap`, circuit needs `rounds` |
| All Sections | Every intensity includes all sections — content scales, not presence |
| Equipment Names | Use `equipment_display_names` for display |

---

## Session Checklist (Every Session)

Before starting:
- [ ] Read `agent/skills/handoff.md`
- [ ] Read relevant skill for task type
- [ ] Read context files listed in task

After completing:
- [ ] Run `npm run dev` and test changes
- [ ] Check for TypeScript errors
- [ ] Update `SESSION_LOG.md`
- [ ] Update `PROJECT_MAP.md` if architecture changed
- [ ] Update `BACKLOG.md` if items completed
- [ ] Commit with clear message

---

*Plan created: February 3, 2026*
