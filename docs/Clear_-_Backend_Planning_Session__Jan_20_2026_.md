# Clear - Backend Planning Session
**Date:** January 20, 2026  
**Phase:** 3 - Data Architecture & Backend Planning  
**Status:** Decisions Made, Ready for Implementation

---

## Session Summary

This session established the complete backend architecture for Clear, including data models, API design, authentication approach, and exercise library structure. All major decisions have been made and documented.

---

## Decisions Made

### 1. Authentication
**Decision:** Email/password via Supabase Auth  
**Rationale:** 
- Supabase has built-in auth, zero extra setup
- Works with both web (Vercel) and mobile (Capacitor → App Store)
- Can add social auth later if needed

### 2. Offline Support
**Decision:** Online-only for MVP  
**Rationale:** Simplifies development; most gyms have connectivity

### 3. Exercise Name Consistency
**Decision:** Canonical Exercise Library with Movement Patterns  
**Rationale:** Prevention over fuzzy matching; ensures historical data always links correctly

### 4. Streak Rules
**Decision:** Strict but fair
- **Streak RESETS if:**
  - 1 missed day (no workout, no rest marked)
  - 7 consecutive rest days
  - Workout < 5 minutes (doesn't count)
- **Streak PAUSES (no reset) if:**
  - Vacation mode enabled (future feature, schema supports it now)
  - Injury/sick marked
- **Streak PRESERVED if:**
  - Workout completed (≥5 min)
  - Rest day marked (up to 6 in a row)

### 5. Quick Start Behavior
**Decision:** Generate → Review (Screen 2)  
**Rationale:** User sees suggested workout before starting, can tap "Start Workout" to proceed

---

## Architecture Overview

### Tech Stack (Confirmed)
```
Frontend:     React (Vite) → Vercel (web)
              React + Capacitor → App Store (future)
              
Backend:      Supabase
              - PostgreSQL database
              - Built-in Auth
              - Edge Functions (for Claude API)
              - Row Level Security
              
AI:           Claude API (via Supabase Edge Functions)
```

### System Diagram
```
┌─────────────────┐     ┌─────────────────┐
│  React Web App  │     │  Capacitor App  │
│    (Vercel)     │     │  (App Store)    │
└────────┬────────┘     └────────┬────────┘
         │                       │
         └───────────┬───────────┘
                     ↓
         ┌─────────────────────┐
         │      Supabase       │
         │  - Auth             │
         │  - Database (PG)    │
         │  - Edge Functions   │
         │    (Claude API)     │
         │  - Row Level Sec.   │
         └─────────────────────┘
```

---

## Data Model

### Entity Relationship Diagram
```
┌─────────────────┐       ┌─────────────────┐
│     USER        │       │    LOCATION     │
│─────────────────│       │─────────────────│
│ id (PK)         │──┐    │ id (PK)         │
│ experience_level│  │    │ user_id (FK)    │──┐
│ goal_preset     │  │    │ name            │  │
│ limitations     │  │    │ tier            │  │
│ enabled_sections│  │    │ equipment[]     │  │
│ streak_*        │  │    │ is_default      │  │
│ onboarding_done │  │    └─────────────────┘  │
└─────────────────┘  │           │             │
         │           │           ▼             │
         │           │    ┌─────────────────┐  │
         │           └───▶│ WORKOUT_SESSION │◀─┘
         │                │─────────────────│
         │                │ id (PK)         │
         │                │ user_id (FK)    │
         │                │ location_id(FK) │
         │                │ anchor          │
         │                │ intensity       │
         │                │ mood            │
         │                │ is_rest_day     │
         │                │ prompt_version  │
         │                └─────────────────┘
         │                         │
         │                         │ 1:many
         │                         ▼
         │                ┌─────────────────┐
         │                │ WORKOUT_SECTION │
         │                │─────────────────│
         │                │ id (PK)         │
         │                │ session_id (FK) │
         │                │ section_type    │
         │                │ section_notes   │
         │                └─────────────────┘
         │                         │
         │                         │ 1:many
         │                         ▼
         │                ┌─────────────────┐
         │                │    EXERCISE     │
         │                │─────────────────│
         │                │ id (PK)         │
         │                │ section_id (FK) │
         │                │ exercise_id(FK) │ ← References library
         │                │ equipment_used  │
         │                │ sets, reps      │
         │                │ weight_logged   │
         │                │ exercise_notes  │
         │                └─────────────────┘
```

### Entity Schemas

#### USER
```typescript
interface User {
  id: string;                    // UUID, primary key
  created_at: timestamp;
  
  // Onboarding data
  experience_level: 'new' | 'some' | 'confident';
  goal_preset: 'strength' | 'balanced' | 'conditioning' | 'quick';
  limitations: string | null;    // Free text, parsed by LLM
  enabled_sections: string[];    // Array of section type IDs
  
  // Streak tracking
  streak_count: number;
  streak_start_date: date | null;
  streak_status: 'active' | 'paused';
  streak_pause_reason: 'injury' | 'sick' | 'vacation' | null;
  streak_pause_start: date | null;
  consecutive_rest_days: number; // Track for 7-day reset rule
  
  // App state
  onboarding_completed: boolean;
  default_location_id: string | null;
}
```

#### LOCATION
```typescript
interface Location {
  id: string;
  user_id: string;
  
  name: string;                  // "Building Gym", "Home"
  tier: 'minimal' | 'home' | 'building' | 'full';
  equipment: string[];           // Array of equipment IDs
  
  is_default: boolean;
  created_at: timestamp;
}
```

#### WORKOUT_SESSION
```typescript
interface WorkoutSession {
  id: string;
  user_id: string;
  location_id: string | null;    // Null for rest days
  
  date: date;
  
  // Generation inputs
  anchor: AnchorType;
  intensity: number;             // 1-10
  goal_preset: string;           // Snapshot at generation time
  time_target_mins: number | null;
  generation_notes: string | null;
  
  // Execution results
  duration_mins: number | null;
  mood: string | null;           // Emoji
  session_notes: string | null;
  counts_for_streak: boolean;    // False if duration < 5 min
  
  // Rest day handling
  is_rest_day: boolean;
  rest_day_reason: 'rest' | 'injury' | 'sick' | null;
  
  // Metadata
  prompt_version: string;        // Which prompt generated this
  created_at: timestamp;
  completed_at: timestamp | null;
}

type AnchorType = 
  | 'squat' | 'hinge' | 'press' | 'pull' | 'rotation' | 'surprise'
  | 'upper_body' | 'lower_body' | 'full_body';
```

#### WORKOUT_SECTION
```typescript
interface WorkoutSection {
  id: string;
  session_id: string;
  
  section_type: SectionType;
  order_index: number;
  section_notes: string | null;
  
  started_at: timestamp | null;
  completed_at: timestamp | null;
}

type SectionType = 
  | 'warmup' | 'mobility' | 'primary_lift' | 'accessory'
  | 'skill_power' | 'carries' | 'core' | 'stability_balance'
  | 'conditioning' | 'cooldown';
```

#### EXERCISE (Instance in a workout)
```typescript
interface Exercise {
  id: string;
  section_id: string;
  
  exercise_id: string;           // References canonical library
  equipment_used: string;        // Which equipment variant was used
  
  // Prescription (from AI)
  sets: number | null;
  reps: string;                  // "8" or "30 sec" or "5 breaths"
  effort_percent: number | null;
  tempo: string | null;
  rest_seconds: number | null;
  
  // User input during execution
  weight_logged: string | null;
  exercise_notes: string | null;
  
  order_index: number;
}
```

---

## Exercise Library Structure

### Design Approach
**Movement Patterns + Equipment Modifiers** — exercises are categorized by movement pattern, with equipment as a modifier rather than creating separate entries for every variation.

### Structure

#### Movement Patterns (~20-30 total)
```typescript
interface MovementPattern {
  id: string;                    // 'squat', 'hinge', 'horizontal-press'
  name: string;
  category: 'lower_body' | 'upper_body' | 'core' | 'full_body';
  anchor: AnchorType;            // Which anchor this maps to
  description: string;
}
```

#### Exercises (~100-200 total)
```typescript
interface ExerciseDefinition {
  id: string;                    // 'back-squat', 'goblet-squat'
  pattern_id: string;            // References MovementPattern
  name: string;                  // Display name: "Back Squat"
  
  equipment_options: string[];   // ['barbell', 'smith_machine']
  default_equipment: string;     // 'barbell'
  
  regression: string | null;     // Easier variant ID
  progression: string | null;    // Harder variant ID
  
  coaching_cues: string[];       // Default cues for this exercise
  sections: SectionType[];       // Which sections this can appear in
}
```

### Hierarchy Example
```
ANCHOR: SQUAT
└── MOVEMENT PATTERNS
    ├── squat (bilateral)
    │   ├── back-squat [barbell, smith]
    │   ├── front-squat [barbell]
    │   ├── goblet-squat [dumbbell, kettlebell]
    │   ├── air-squat [bodyweight]
    │   └── hack-squat [machine]
    │
    ├── split-squat (unilateral)
    │   ├── bulgarian-split-squat [dumbbell, barbell]
    │   ├── reverse-lunge [dumbbell, barbell, bodyweight]
    │   └── walking-lunge [dumbbell, barbell, bodyweight]
    │
    └── squat-accessory
        ├── leg-press [machine]
        ├── leg-extension [machine]
        └── wall-sit [bodyweight]

ANCHOR: HINGE
└── MOVEMENT PATTERNS
    ├── deadlift
    │   ├── conventional-deadlift [barbell]
    │   ├── romanian-deadlift [barbell, dumbbell]
    │   ├── trap-bar-deadlift [trap_bar]
    │   └── single-leg-rdl [dumbbell, kettlebell, bodyweight]
    │
    ├── hip-thrust
    │   ├── barbell-hip-thrust [barbell, bench]
    │   ├── glute-bridge [bodyweight, barbell]
    │   └── single-leg-glute-bridge [bodyweight]
    │
    └── hinge-accessory
        ├── leg-curl [machine]
        ├── good-morning [barbell]
        └── kettlebell-swing [kettlebell]
```

### Benefits of This Structure
| Benefit | How It Helps |
|---------|--------------|
| Smaller library | ~150 exercises vs 500+ variations |
| Smart filtering | "Show me all squat-pattern exercises I can do" |
| Built-in progressions | Air squat → Goblet → Back squat |
| Equipment flexibility | "I don't have a barbell today" → suggests dumbbell variant |
| Easier AI prompting | "Pick a squat-pattern exercise" vs listing every variation |
| Historical tracking | Track progress on "back-squat" regardless of equipment used |

### Building the Library
The exercise library will be built from workout examples (to be provided in future session). Process:
1. Extract every exercise mentioned
2. Categorize by movement pattern
3. Note equipment used
4. Identify regression/progression chains
5. Build the initial library (~100 exercises for MVP)

---

## Prompt Refinement System

### Design for Iteration
Workout generation quality lives in the **prompt**, not the code. The system is designed for easy refinement:

#### 1. Separate Prompt Templates from Code
```typescript
interface PromptConfig {
  id: string;
  version: string;              // "v1.2.0"
  system_prompt: string;
  user_prompt_template: string;
  output_schema: object;
  examples: WorkoutExample[];   // Few-shot examples
  active: boolean;
}
```

#### 2. Version Control for Prompts
```
/prompts
  /v1.0.0-initial.json
  /v1.1.0-added-tempo.json
  /v1.2.0-better-warmups.json
  /current.json → symlink to active version
```

#### 3. Track Which Prompt Generated Each Workout
`WorkoutSession.prompt_version` stores which prompt version generated it — useful for debugging quality issues.

#### 4. Few-Shot Examples
Gathered workout examples become few-shot prompts to steer output quality. This is the highest-leverage way to improve generation.

---

## API Endpoints

### Authentication (Supabase Auth)
```
POST /auth/signup
POST /auth/login
POST /auth/logout
GET  /auth/me
```

### User Profile
```
GET    /user/profile
PATCH  /user/profile
POST   /user/complete-onboarding
```

### Locations
```
GET    /locations
POST   /locations
PATCH  /locations/:id
DELETE /locations/:id
POST   /locations/:id/set-default
```

### Workout Sessions
```
GET    /sessions                    → List (paginated, filterable)
GET    /sessions/:id                → Full session with sections/exercises
POST   /sessions                    → Create (rest day or workout)
PATCH  /sessions/:id                → Update (notes, mood, completed_at)
DELETE /sessions/:id                → Delete (with cascade)
```

### Workout Generation
```
POST /generate/workout              → Full workout generation
POST /generate/section              → Regenerate single section
```

### Dashboard
```
GET /dashboard                      → Streak, week view, recent sessions, quick start suggestion
```

### Historical Data
```
GET /history/exercise/:id           → Weight range, occurrences, recent notes
```

---

## Implementation Phases

### Phase 1: Core Infrastructure
1. Set up Supabase project
2. Create tables (User, Location, WorkoutSession, WorkoutSection, Exercise)
3. Configure Row Level Security policies
4. Set up auth (email/password)
5. Basic CRUD endpoints

### Phase 2: Exercise Library
1. Build initial library from provided examples
2. Create movement patterns
3. Map exercises to patterns with equipment options
4. Implement equipment-based filtering

### Phase 3: Workout Generation
1. Create Edge Function for /generate/workout
2. Integrate Claude API
3. Build prompt construction logic
4. Implement few-shot example system
5. Validate and store generated workouts

### Phase 4: Historical Features
1. Exercise history aggregation
2. Streak calculation logic
3. Dashboard endpoint
4. Week view computation

### Phase 5: Polish
1. Section regeneration endpoint
2. Quick start logic
3. Error handling
4. Rate limiting

---

## Pending Items

### Waiting for Input
- **Workout examples** — Will be used to build exercise library and few-shot prompts
- Timing: Separate future session

### Future Features (Schema Supports)
- **Vacation mode** — `streak_pause_reason: 'vacation'` ready
- **Fuzzy exercise matching** — Can add if canonical IDs aren't sufficient
- **Offline support** — Can add later with local storage sync

---

## Files to Update

After this session, the following project files should be updated:

1. **Clear_-_Data_Model.md** — Replace with updated version including:
   - Exercise library structure
   - Refined streak rules
   - Prompt versioning

2. **New file: Clear_-_Exercise_Library_Template.md** — Template for populating exercises (after examples are provided)

---

## Next Steps

1. **Add this summary to project files** ✓
2. **Provide workout examples** (future session) → Build exercise library
3. **Begin implementation** with Claude Code:
   - Start with Supabase setup
   - Create database tables
   - Configure auth
   - Build basic endpoints

---

*Session completed: January 20, 2026*
