# Clear - Data Model & Backend Architecture
**Created:** January 20, 2026  
**Updated:** January 20, 2026 (ROTATION → POWER anchor change)  
**Status:** Draft for Review  
**Phase:** 3 - Data Architecture

---

## Overview

This document defines the complete data architecture for Clear, derived from all wireframes, user journeys, and content definitions. It covers:

1. **Entities & Schemas** — What we store
2. **Relationships** — How entities connect
3. **API Endpoints** — What the frontend needs
4. **AI Integration** — Workout generation interface
5. **Computed Data** — Aggregations and derived values
6. **Decision Points** — Questions needing your input

---

## Entity Relationship Diagram (ASCII)

```
┌─────────────────┐       ┌─────────────────┐
│     USER        │       │    LOCATION     │
│─────────────────│       │─────────────────│
│ id (PK)         │──┐    │ id (PK)         │
│ created_at      │  │    │ user_id (FK)    │──┐
│ experience_level│  │    │ name            │  │
│ goal_preset     │  │    │ tier            │  │
│ limitations     │  │    │ equipment[]     │  │
│ enabled_sections│  │    │ is_default      │  │
│ streak_count    │  │    │ created_at      │  │
│ streak_start    │  │    └─────────────────┘  │
│ onboarding_done │  │           │             │
└─────────────────┘  │           │             │
         │           │           ▼             │
         │           │    ┌─────────────────┐  │
         │           └───▶│ WORKOUT_SESSION │◀─┘
         │                │─────────────────│
         │                │ id (PK)         │
         │                │ user_id (FK)    │
         │                │ location_id (FK)│
         │                │ date            │
         │                │ anchor          │
         │                │ intensity       │
         │                │ goal_preset     │
         │                │ duration_mins   │
         │                │ mood            │
         │                │ session_notes   │
         │                │ is_rest_day     │
         │                │ rest_day_reason │
         │                │ created_at      │
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
         │                │ order_index     │
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
         │                │ name            │
         │                │ sets            │
         │                │ reps            │
         │                │ effort_percent  │
         │                │ tempo           │
         │                │ rest_seconds    │
         │                │ coaching_cues   │
         │                │ regression      │
         │                │ weight_logged   │
         │                │ exercise_notes  │
         │                │ order_index     │
         │                └─────────────────┘
```

---

## Entity Schemas

### 1. USER

The core user profile, created during onboarding.

```typescript
interface User {
  id: string;                    // UUID, primary key
  created_at: timestamp;         // When account created
  
  // Onboarding data (Step 2-4)
  experience_level: 'new' | 'some' | 'confident';
  goal_preset: 'strength' | 'balanced' | 'conditioning' | 'quick';
  limitations: string | null;    // Free text, parsed by LLM
  enabled_sections: string[];    // Array of section type IDs
  
  // Streak tracking (Dashboard)
  streak_count: number;          // Current streak in days
  streak_start_date: date | null;// When current streak began
  streak_paused: boolean;        // True if injury/sick pause
  
  // App state
  onboarding_completed: boolean;
  default_location_id: string | null;  // FK to Location
}
```

**Notes:**
- `enabled_sections` stores the user's preferred workout structure (from onboarding Step 3)
- `limitations` is free text — the LLM interprets it during generation
- Streak logic lives here because it's user-level, not session-level

---

### 2. LOCATION

Equipment profiles for different workout locations.

```typescript
interface Location {
  id: string;                    // UUID, primary key
  user_id: string;               // FK to User
  
  name: string;                  // "Building Gym", "Home", etc.
  tier: 'minimal' | 'home' | 'building' | 'full';
  equipment: string[];           // Array of equipment IDs/names
  
  is_default: boolean;           // Only one per user
  created_at: timestamp;
}
```

**Equipment values (from Content Definitions):**
```typescript
const EQUIPMENT_OPTIONS = [
  // Minimal (always included)
  'bodyweight',      // Non-removable
  'resistance_bands',
  'mat',
  'foam_roller',
  
  // Home Gym
  'dumbbells',
  'kettlebells',
  'bench_flat',
  'pullup_bar',
  'trx',
  'treadmill',
  
  // Building Gym
  'barbell',
  'squat_rack',
  'cable_machine',
  'bench_adjustable',
  'lat_pulldown',
  'rowing_machine',
  
  // Full Gym
  'leg_press',
  'smith_machine',
  'hack_squat',
  'chest_press_machine',
  'shoulder_press_machine',
  'leg_curl_extension',
  'pec_deck',
  'assisted_pullup_dip',
  'battle_ropes',
  'assault_bike',
  'stair_climber'
];
```

---

### 3. WORKOUT_SESSION

A completed (or rest day) workout entry.

```typescript
interface WorkoutSession {
  id: string;                    // UUID, primary key
  user_id: string;               // FK to User
  location_id: string | null;    // FK to Location (null for rest days)
  
  date: date;                    // YYYY-MM-DD
  
  // Generation inputs
  anchor: AnchorType;            // What the workout focused on
  intensity: number;             // 1-10
  goal_preset: string;           // Snapshot of user's preset at generation time
  time_target_mins: number | null; // Optional time constraint
  generation_notes: string | null; // "Shoulder feels tight today"
  
  // Execution results
  duration_mins: number | null;  // Actual time taken
  mood: string | null;           // Emoji captured post-workout
  session_notes: string | null;  // Overall session notes
  
  // Rest day handling
  is_rest_day: boolean;
  rest_day_reason: 'rest' | 'injury' | 'sick' | null;
  
  // Metadata
  created_at: timestamp;
  completed_at: timestamp | null;
}

type AnchorType = 
  // With Primary Lift
  | 'squat' | 'hinge' | 'press' | 'pull' | 'power' | 'surprise'
  // Without Primary Lift
  | 'upper_body' | 'lower_body' | 'full_body';
```

**Notes:**
- `goal_preset` is snapshotted at generation time (user might change settings later)
- `is_rest_day = true` means no sections/exercises — just a calendar entry
- `completed_at` is null if workout was abandoned mid-session
- **POWER anchor** includes explosive/Olympic movements (cleans, snatches, thrusters)

---

### 4. WORKOUT_SECTION

A section within a workout (Warm-up, Primary Lift, etc.).

```typescript
interface WorkoutSection {
  id: string;                    // UUID, primary key
  session_id: string;            // FK to WorkoutSession
  
  section_type: SectionType;     // Which section this is
  order_index: number;           // 0, 1, 2... for ordering
  
  section_notes: string | null;  // Notes for whole section
  
  // Timing (optional, for future analytics)
  started_at: timestamp | null;
  completed_at: timestamp | null;
}

type SectionType = 
  | 'warmup'
  | 'mobility'
  | 'primary_lift'
  | 'accessory'
  | 'skill_power'
  | 'carries'
  | 'core'
  | 'stability_balance'
  | 'conditioning'
  | 'cooldown';
```

---

### 5. EXERCISE

Individual exercises within a section.

```typescript
interface Exercise {
  id: string;                    // UUID, primary key
  section_id: string;            // FK to WorkoutSection
  
  // Generated by AI
  name: string;                  // "Barbell Bent-Over Row"
  sets: number | null;           // 4
  reps: string;                  // "8" or "30 sec" or "5 breaths"
  effort_percent: number | null; // 65 (for "@ 65%")
  tempo: string | null;          // "2-1-2"
  rest_seconds: number | null;   // 90
  coaching_cues: string | null;  // "Neutral spine, bar to ribcage"
  regression: string | null;     // "Seated Cable Row"
  progression: string | null;    // Future: harder alternative
  
  // User input during execution
  weight_logged: string | null;  // "185lbs" or "35lbs each"
  exercise_notes: string | null; // "Felt heavy but moved well"
  
  order_index: number;           // 0, 1, 2... within section
}
```

**Notes:**
- `reps` is a string to handle "8 reps", "30 sec", "5 breaths", "AMRAP"
- `weight_logged` is free text (user might write "185lbs x 8,8,8,7")
- `coaching_cues` come from AI generation, shown to beginners

---

## Computed Data & Aggregations

These are NOT stored — they're computed on-demand from the entities above.

### Streak Calculation
```typescript
function calculateStreak(sessions: WorkoutSession[]): number {
  // Sort by date descending
  // Count consecutive days with either:
  //   - is_rest_day = true (preserves streak)
  //   - completed_at != null (workout completed)
  // Break streak on gap > 1 day (unless paused for injury/sick)
}
```

### Historical Weight Range
For "Last: 115-135lbs" on Review screen:
```typescript
function getHistoricalRange(userId: string, exerciseName: string): { min: number, max: number } | null {
  // Query exercises where user_id matches and name ~= exerciseName
  // Extract numeric values from weight_logged
  // Return min/max range
  // Returns null if no history
}
```

### Quick Start Suggestion
For Dashboard auto-suggested anchor:
```typescript
function suggestNextAnchor(recentSessions: WorkoutSession[]): AnchorType {
  // Get last 3-5 anchors used
  // Rotate to least-recently-used
  // If yesterday was SQUAT, before was HINGE → suggest PRESS/PULL
}

function suggestNextIntensity(lastSession: WorkoutSession | null): number {
  // If yesterday was 8-10, suggest 5-6 (recovery)
  // If yesterday was 1-4, suggest 6-7 (build up)
  // Default: 6
}
```

### Week View (Dashboard)
```typescript
function getWeekView(userId: string, weekStartDate: date): DayStatus[] {
  // Returns array of 7 days (Mon-Sun)
  // Each day: { date, status: 'workout' | 'rest' | 'empty' }
}
```

---

## API Endpoints

### Authentication
```
POST /auth/signup          → Create user (minimal: email/password)
POST /auth/login           → Get session token
POST /auth/logout          → Invalidate session
GET  /auth/me              → Get current user
```

### User Profile
```
GET    /user/profile                → Get user settings
PATCH  /user/profile                → Update settings (experience, limitations, sections)
POST   /user/complete-onboarding    → Mark onboarding done, set defaults
```

### Locations
```
GET    /locations                   → List user's locations
POST   /locations                   → Create new location
PATCH  /locations/:id               → Update location (name, equipment)
DELETE /locations/:id               → Delete location
POST   /locations/:id/set-default   → Set as default
```

### Workout Sessions
```
GET    /sessions                    → List sessions (paginated, filterable)
GET    /sessions/:id                → Get full session with sections/exercises
POST   /sessions                    → Create new session (rest day or workout)
PATCH  /sessions/:id                → Update session (notes, mood, completed_at)
DELETE /sessions/:id                → Delete session (with cascade)
```

**Query params for GET /sessions:**
- `?limit=20&offset=0` — Pagination
- `?anchor=squat` — Filter by anchor
- `?intensity_min=7&intensity_max=10` — Filter by intensity range
- `?date_from=2025-12-01&date_to=2025-12-31` — Date range

### Workout Generation (AI)
```
POST /generate/workout
```

**Request:**
```typescript
{
  intensity: number;           // 1-10
  anchor: AnchorType;
  location_id: string;
  time_target_mins?: number;
  notes?: string;              // "Shoulder feels tight"
}
```

**Response:**
```typescript
{
  title: string;               // "High Intensity Pull Focus"
  overview: string;            // 2-3 sentence coach description
  estimated_mins: number;
  sections: GeneratedSection[];
}

interface GeneratedSection {
  section_type: SectionType;
  exercises: GeneratedExercise[];
}

interface GeneratedExercise {
  name: string;
  sets: number | null;
  reps: string;
  effort_percent: number | null;
  tempo: string | null;
  rest_seconds: number | null;
  coaching_cues: string | null;
  regression: string | null;
  historical_range?: { min: number, max: number } | null;  // Injected from DB
}
```

### Section Regeneration
```
POST /generate/section
```

**Request:**
```typescript
{
  session_context: {           // Partial context from current workout
    intensity: number;
    anchor: AnchorType;
    location_id: string;
  };
  section_type: SectionType;   // Which section to regenerate
  exclude_exercises?: string[]; // Don't suggest these again
}
```

### Dashboard Data
```
GET /dashboard
```

**Response:**
```typescript
{
  streak: {
    count: number;
    start_date: date | null;
    is_paused: boolean;
  };
  week_view: DayStatus[];      // 7 days Mon-Sun
  recent_sessions: SessionSummary[];  // Last 3
  quick_start_suggestion: {
    intensity: number;
    anchor: AnchorType;
  } | null;
}
```

### Historical Data
```
GET /history/exercise/:name
```

**Response:**
```typescript
{
  exercise_name: string;
  occurrences: number;
  weight_range: { min: number, max: number } | null;
  last_performed: date | null;
  recent_notes: string[];      // Last 3 notes for this exercise
}
```

---

## AI Integration Specification

### Workout Generation Prompt Structure

The backend constructs a prompt for Claude API that includes:

```
SYSTEM:
You are a fitness coach generating a workout. Return ONLY valid JSON.

USER CONTEXT:
- Experience: {confident|some|new}
- Limitations: "{free text or 'none'}"
- Available equipment: [list]
- Enabled sections: [list]

WORKOUT REQUEST:
- Intensity: {1-10}
- Anchor: {squat|hinge|press|pull|power|surprise|...}
- Time target: {X mins or 'no limit'}
- Notes: "{free text or 'none'}"

RECENT HISTORY (for variety):
- Last 5 anchors: [squat, hinge, pull, squat, press]
- Exercises to avoid repeating: [list from last 2-3 sessions]

INSTRUCTIONS:
1. Generate a workout matching the anchor and intensity
2. Only include sections from the enabled list
3. Only use exercises possible with available equipment
4. Respect any limitations mentioned
5. For intensity 1-3: lighter loads, mobility focus
6. For intensity 7-10: heavier loads, compound movements
7. Vary exercises from recent history
8. Include coaching cues for experience level "{level}"
9. Estimate realistic duration

Return JSON matching this schema:
{schema}
```

### Response Validation

Backend validates AI response:
- All required fields present
- Section types match user's enabled sections
- Exercise equipment requirements match location
- Reasonable sets/reps/rest values

If validation fails, retry with clarification or return error.

---

## Database Technology Recommendation

### Supabase (Recommended)
**Pros:**
- PostgreSQL (relational, good for this schema)
- Built-in auth
- Row Level Security (RLS) for user data isolation
- Real-time subscriptions (future: live updates)
- Generous free tier
- Direct from frontend OR via backend

**Implementation:**
- Tables map directly to entities above
- RLS policies ensure users only see their own data
- Edge Functions for AI generation endpoint (keeps API key secure)

### Alternative: Firebase
**Pros:**
- NoSQL (flexible schema)
- Easy auth
- Good mobile SDKs

**Cons:**
- Denormalized data = more complex queries
- Harder to do relational joins (exercise history aggregation)
- Would need to restructure schema for document model

**Recommendation:** Use **Supabase** — the relational model fits this data well.

---

## Decision Points (Need Your Input)

### 1. Authentication Approach
**Options:**
- **A) Email/password only** — Simplest, works everywhere
- **B) Magic link (email)** — No password to remember, but requires email access
- **C) Social auth (Google/Apple)** — Fastest signup, but adds complexity
- **D) Anonymous + optional upgrade** — Start using immediately, create account later

**Recommendation:** Start with **A** (email/password) for MVP. Add social auth later if friction is high.

**Your call?**

---

### 2. Offline Support
**Question:** Should the app work offline (generate/execute workouts without internet)?

**Options:**
- **A) Online-only** — Simpler, always have latest data
- **B) Offline-capable** — Cache user profile + last few workouts, queue syncs

**Trade-offs:**
- Offline requires local storage strategy (IndexedDB), sync logic, conflict resolution
- Your users are at the gym — usually has wifi/cellular
- "Walking out of locker room" scenario might have spotty connection

**Recommendation:** **A** (Online-only) for MVP. Most gyms have connectivity. Add offline later if users complain.

**Your call?**

---

### 3. Exercise Name Matching
**Question:** How strict should historical data matching be?

**Example:** User did "Barbell Row" last week. AI generates "Bent-Over Barbell Row" today. Should we show historical data?

**Options:**
- **A) Exact match only** — "Barbell Row" ≠ "Bent-Over Barbell Row"
- **B) Fuzzy match** — Normalize names, match on similarity (more complex)
- **C) Exercise ID system** — AI references canonical exercise IDs, not free text names

**Recommendation:** **A** (Exact match) for MVP. Historical data is "nice to have" — occasional misses are acceptable. Consider **C** long-term.

**Your call?**

---

### 4. Rest Day Streak Rules
**Question:** How generous should streak preservation be?

**Current spec from wireframe:**
- 1 rest day = streak preserved
- 3+ consecutive rest days = prompt ("Everything okay?")
- "Injury/sick" = pause streak (doesn't break)

**Questions:**
- How many rest days before streak breaks? (2? 3? 7?)
- Should weekends auto-count as rest? Or require explicit marking?

**Recommendation:** 
- Streak breaks after **2 consecutive unmarked days**
- User must explicitly "Mark Rest Day" to preserve streak
- "Injury/sick" pauses indefinitely until user resumes

**Your call?**

---

### 5. Quick Start Behavior
**Question:** What exactly does "Quick Start" generate?

**Current spec:** "Skips Screen 1 & 2, goes directly to Screen 3"

**But this implies:**
- Workout is generated automatically with suggested intensity/anchor
- User doesn't review before starting

**Options:**
- **A) Generate → Start immediately** — Truly quick, but no review
- **B) Generate → Show Review briefly → Auto-start after 5s** — Gives peek, can cancel
- **C) Generate → Go to Review (Screen 2)** — Not really "quick", just pre-filled

**Recommendation:** **A** — Trust the AI, get moving. User can always tap "Back" if needed.

**Your call?**

---

## Implementation Order (Suggested)

### Phase 1: Core Infrastructure (First Session)
1. Set up Supabase project
2. Create tables (User, Location, WorkoutSession, WorkoutSection, Exercise)
3. Configure RLS policies
4. Set up auth (email/password)
5. Basic CRUD endpoints

### Phase 2: Workout Generation (Second Session)
1. Create Edge Function for /generate/workout
2. Integrate Claude API
3. Build prompt construction logic
4. Validate and store generated workouts
5. Test with real inputs

### Phase 3: Historical Features (Third Session)
1. Exercise history aggregation
2. Streak calculation logic
3. Dashboard endpoint
4. Week view computation

### Phase 4: Polish (Fourth Session)
1. Section regeneration endpoint
2. Quick start logic
3. Error handling
4. Rate limiting

---

## Next Steps

1. **Review this document** — Flag anything that doesn't match your vision
2. **Answer decision points** — I'll incorporate your choices
3. **Choose starting point** — Infrastructure first, or prototype AI generation?

Ready when you are! 🚀
