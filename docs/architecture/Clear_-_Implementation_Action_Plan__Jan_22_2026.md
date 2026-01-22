# Clear - Implementation Action Plan (Jan 22, 2026)
**Purpose:** Handoff document for Claude Code implementation  
**Based on:** Session Recap (Jan 21, 2026)  
**Pattern:** Follows established documentation format from project files

---

## Document Purpose

This is a **handoff document for Claude Code**. Each phase contains:
- Clear goals and success criteria
- Specific files to create/modify
- Code examples and database operations
- References to existing project documentation
- Implementation guidelines

Use this document to maintain context and direction across Claude Code sessions. Each phase is self-contained and can be tackled independently.

---

## Current State Assessment

### ✅ Completed Infrastructure
- Supabase project configured with database tables
- RLS policies in place
- Anthropic API key stored in Supabase secrets
- `generate-workout` Edge Function deployed
- Auth flow wireframe documented
- Workout generation prompt with few-shot examples
- Complete data model defined
- Design system locked

### 🔄 In Progress
- Auth screens (Welcome, Sign In, Create Account)

### ⏳ Not Yet Started
- Onboarding persistence (screens exist, need database connection)
- Home Dashboard with real data
- Workout generation connected to database
- Workout execution with persistence
- History display with real sessions
- Locations management
- Settings persistence

---

## Implementation Phases

### Phase 1: Complete Auth Flow ⭐ START HERE
**Goal:** Users can sign up, sign in, and be routed correctly  
**Dependencies:** None

#### Task 1.1: Finish Auth Screens
**Files to create/modify:**
- `src/pages/Auth/Welcome.tsx`
- `src/pages/Auth/SignIn.tsx`
- `src/pages/Auth/CreateAccount.tsx`
- `src/pages/Auth/ForgotPassword.tsx`
- `src/lib/supabase.ts` (if not exists)

**Implementation Details:**
```typescript
// Key Supabase auth patterns to use:

// Sign Up
const { data, error } = await supabase.auth.signUp({
  email: email,
  password: password,
})

// Sign In
const { data, error } = await supabase.auth.signInWithPassword({
  email: email,
  password: password,
})

// Check session on app load
const { data: { session } } = await supabase.auth.getSession()
```

**Success Criteria:**
- User can create account → routed to Onboarding
- User can sign in → routed to Dashboard (if onboarding complete) or Onboarding
- User can reset password via email
- All validation errors display properly
- Design matches wireframe specs

**Design References:**
- Use gradient background images: `docs/design/Mobile_-_grain.png` / `Desktop_-_grain.png`
- Colors: Orange primary (#F17B14), dark background
- Typography: Rajdhani (headers), Inter (body), JetBrains Mono (labels)
- See: `Clear_-_Auth_Screen_Wireframe.md` for full spec

---

### Phase 2: Onboarding Persistence
**Goal:** Connect existing onboarding screens to database so data persists  
**Dependencies:** Auth flow complete

**NOTE:** Onboarding UI screens already exist (built previously). This phase is about adding database persistence.

#### Task 2.1: Connect Onboarding to Database
**Reference:** `Clear_-_Onboarding__Wireframe_.md`

**Existing screens (already built):**
1. **Step 1:** Experience level (confident / some / new)
2. **Step 2:** Limitations (free text or "none")
3. **Step 3:** Equipment tier (minimal / home / building / full)
4. **Step 4:** Equipment customization (checklist)
5. **Step 5:** Enabled sections (warmup, mobility, etc.)

**Files to modify:**
- Existing onboarding step components (add database save logic)
- Add `src/contexts/OnboardingContext.tsx` if not exists (state management)

**Database Operations:**
```typescript
// On completion of Step 5, save to database:
await supabase.from('users').update({
  experience_level: 'confident',
  limitations: 'Right shoulder tweaky',
  onboarding_completed: true,
}).eq('id', user.id)

await supabase.from('locations').insert({
  user_id: user.id,
  name: 'Building Gym',
  tier: 'building',
  equipment: ['barbell', 'dumbbells', 'squat_rack', ...],
  is_default: true,
})

await supabase.from('user_sections').insert([
  { user_id: user.id, section_type: 'warmup', enabled: true },
  { user_id: user.id, section_type: 'mobility', enabled: true },
  // ... for each section
])
```

**Success Criteria:**
- User can navigate through 5 steps (with back/next)
- Progress indicator shows current step
- All data saves to database on final submit
- User routed to Home Dashboard after completion
- `onboarding_completed` flag set to true

**Design Notes:**
- Use progress dots at top: `● ○ ○ ○ ○` (step 1 of 5)
- Large touch targets for all options
- Equipment lists from `Clear_-_Data_Model.md` equipment arrays

---

### Phase 3: Home Dashboard with Real Data
**Goal:** Replace mock data with database queries  
**Dependencies:** Onboarding complete

#### Task 3.1: Update Home Screen
**Files to modify:**
- `src/pages/Home.tsx`
- Remove `generateMockWorkoutHistory()` 
- Add database queries

**Database Queries Needed:**
```typescript
// Fetch recent workouts
const { data: recentWorkouts } = await supabase
  .from('workout_sessions')
  .select('*')
  .order('date', { ascending: false })
  .limit(5)

// Calculate streak
const { data: last30Days } = await supabase
  .from('workout_sessions')
  .select('date, is_rest_day, counts_for_streak')
  .gte('date', thirtyDaysAgo)
  .order('date', { ascending: false })

// Apply streak logic (see streak rules in Backend Planning doc)
```

**New Components:**
- `src/components/StreakCounter.tsx` (calculates and displays streak)
- `src/components/RecentWorkoutCard.tsx` (shows anchor, intensity, date)
- `src/components/EmptyState.tsx` (for new users with no workouts)

**Streak Logic Implementation:**
Reference: `Clear_-_Backend_Planning_Session__Jan_20_2026_.md`
- Reset if: 1 missed day, 7 consecutive rest days, workout < 5 min
- Preserve if: workout ≥ 5 min, rest day marked (up to 6 consecutive)

**Success Criteria:**
- Home shows real workout history (or empty state)
- Streak count accurate based on rules
- Quick Start button functional
- Navigation to all screens works

---

### Phase 4: Connect Workout Generation to Database ⭐ CRITICAL
**Goal:** Save generated workouts, enable workout execution  
**Dependencies:** Home Dashboard complete

#### Task 4.1: Hook Up Generation to Edge Function
**Files to modify:**
- `src/pages/GenerationInput.tsx` (Screen 1)
- `src/lib/workout-api.ts` (use existing `saveWorkout` function)

**Flow:**
1. User fills out generation inputs (anchor, intensity, notes)
2. Call Supabase Edge Function with context:
```typescript
const { data, error } = await supabase.functions.invoke('generate-workout', {
  body: {
    user_profile: {
      experience: user.experience_level,
      limitations: user.limitations,
      enabled_sections: user.enabled_sections,
    },
    location: {
      equipment: selectedLocation.equipment,
    },
    request: {
      anchor: selectedAnchor,
      intensity: intensity,
      time_target_mins: timeLimit || null,
      notes: userNotes,
    },
    recent_history: {
      last_anchors: lastFiveAnchors,
      recent_exercises: recentExercises,
    }
  }
})
```

3. Edge Function returns structured workout JSON (validated against schema)
4. Call `saveWorkout()` to persist to database
5. Navigate to Screen 2 (Review) with workout ID

**Database Schema:**
See: `Clear_-_Data_Model.md` for full schema

**Tables to write:**
- `workout_sessions` (with generation inputs)
- `workout_sections` (for each section)
- `exercises` (for each exercise in each section)

**Success Criteria:**
- Generation creates workout via Claude API
- Workout saves to database with all sections/exercises
- User can see workout in Review screen
- `prompt_version` field populated correctly

---

#### Task 4.2: Build Review & Edit Screen (Screen 2)
**Reference:** `Clear_-_Screen_2__Review___Edit__Wireframe_.md`

**Files to create/modify:**
- `src/pages/ReviewWorkout.tsx`
- `src/components/SectionCard.tsx`
- `src/components/ExerciseCard.tsx`
- `src/components/HistoricalDataBadge.tsx`

**Data Loading:**
```typescript
// Load workout by ID
const { data: workout } = await supabase
  .from('workout_sessions')
  .select(`
    *,
    sections:workout_sections(
      *,
      exercises:exercises(*)
    )
  `)
  .eq('id', workoutId)
  .single()

// For each exercise, load historical data
const { data: history } = await supabase
  .from('exercises')
  .select('weight_logged')
  .eq('name', exerciseName)
  .not('weight_logged', 'is', null)
  .order('created_at', { ascending: false })
  .limit(3)
```

**Features to implement:**
- Display all sections in order
- Show coaching cues for beginners
- Display historical weights: "Last: 115-135 lbs"
- "Start Workout" button → Screen 3
- "Regenerate Section" (future enhancement, can defer)

**Success Criteria:**
- Workout displays with all exercises
- Historical data shows when available
- User can navigate to Workout Mode
- Responsive layout matches wireframe

---

#### Task 4.3: Build Workout Mode (Screen 3)
**Reference:** `Clear_-_Screen_3__Workout_Mode__Wireframe_.md`

**Files to create/modify:**
- `src/pages/WorkoutMode.tsx`
- `src/components/ExerciseExecutionCard.tsx`
- `src/components/WorkoutTimer.tsx`
- `src/components/RestTimer.tsx`

**State Management:**
- Track current section/exercise
- Track weights logged per exercise
- Track start time (for duration calculation)
- Track exercise notes

**User Interactions:**
- Log weight for each exercise (free text input)
- Add exercise notes
- Mark sets complete
- Start/pause rest timer
- Navigate next/previous exercise
- "Finish Workout" button

**On Finish Workout:**
```typescript
// Calculate duration
const duration = Math.floor((Date.now() - startTime) / 60000)

// Update workout session
await supabase.from('workout_sessions').update({
  completed_at: new Date().toISOString(),
  duration_mins: duration,
  counts_for_streak: duration >= 5, // Minimum 5 minutes
  mood: selectedMood, // Optional emoji
  session_notes: sessionNotes,
}).eq('id', workoutId)

// Save all exercise data (weights, notes)
await supabase.from('exercises').update({
  weight_logged: weight,
  exercise_notes: notes,
}).eq('id', exerciseId)
```

**Success Criteria:**
- User can execute workout step-by-step
- All data persists during workout (handle page refresh)
- Rest timers work correctly
- Finish saves all data to database
- User routed to Home (updated with new workout)
- Streak updates if applicable

---

### Phase 5: Locations Management
**Goal:** Users can create/edit gym locations with equipment  
**Dependencies:** Phase 4 complete

#### Task 5.1: Build Locations Management UI
**Files to create:**
- `src/pages/Settings/Locations.tsx`
- `src/pages/Settings/LocationForm.tsx` (create/edit)
- `src/components/EquipmentChecklist.tsx`

**Features:**
- List all locations (show default indicator)
- Add new location:
  - Name input
  - Tier selection (minimal / home / building / full)
  - Equipment checklist (pre-populated by tier, customizable)
  - Set as default toggle
- Edit existing location
- Delete location (with confirmation, prevent if used in history)

**Equipment Options by Tier:**
Reference: `Clear_-_Data_Model.md` for complete equipment arrays

**Database Operations:**
```typescript
// Create location
await supabase.from('locations').insert({
  user_id: user.id,
  name: locationName,
  tier: selectedTier,
  equipment: selectedEquipment,
  is_default: isDefault,
})

// Update default (only one default per user)
if (isDefault) {
  await supabase.from('locations')
    .update({ is_default: false })
    .eq('user_id', user.id)
    .neq('id', newLocationId)
}

// Delete with validation
const { data: usedInHistory } = await supabase
  .from('workout_sessions')
  .select('id')
  .eq('location_id', locationId)
  .limit(1)

if (usedInHistory.length > 0) {
  // Show error: "Cannot delete location used in workout history"
}
```

**Success Criteria:**
- User can create multiple locations
- Only one default location at a time
- Equipment lists work correctly
- Cannot delete location used in history
- Generation uses selected location's equipment

---

### Phase 6: Settings & User Preferences
**Goal:** Persist user settings across sessions  
**Dependencies:** Locations management complete

#### Task 6.1: Build Settings Screen
**Files to create:**
- `src/pages/Settings/index.tsx`
- `src/pages/Settings/Profile.tsx`
- `src/pages/Settings/Preferences.tsx`

**Settings to persist:**
- Experience level (can change over time)
- Limitations (update as needed)
- Default intensity (1-10)
- Enabled sections (which sections to include)
- Default location

**Database Operations:**
```typescript
// Load settings on app launch
const { data: profile } = await supabase
  .from('users')
  .select('*, sections:user_sections(*), locations(*)')
  .single()

// Update settings (immediate save, no "Save" button)
await supabase.from('users').update({
  experience_level: newLevel,
  limitations: newLimitations,
  default_intensity: newIntensity,
}).eq('id', user.id)

// Update sections
await supabase.from('user_sections')
  .update({ enabled: isEnabled })
  .eq('user_id', user.id)
  .eq('section_type', sectionType)
```

**UI Organization:**
- Profile section: Experience, Limitations
- Preferences section: Default intensity, Enabled sections
- Locations section: (links to Locations management)
- Account section: Email, Change password, Sign out

**Success Criteria:**
- All settings save immediately
- Settings load on app launch
- Changes reflected in workout generation
- Clean, organized interface

---

### Phase 7: History & Advanced Features
**Goal:** Complete the app experience  
**Dependencies:** Phase 6 complete

#### Task 7.1: Build History Screen
**Files to create:**
- `src/pages/History.tsx`
- `src/pages/WorkoutDetail.tsx`
- `src/components/Calendar.tsx` (optional month view)

**Features:**
- List view of all workouts (most recent first)
- Filter by date range
- Filter by anchor type
- Search by notes
- Tap workout → Detail view

**Workout Detail View:**
```typescript
// Load complete workout with all data
const { data: workout } = await supabase
  .from('workout_sessions')
  .select(`
    *,
    location:locations(*),
    sections:workout_sections(
      *,
      exercises:exercises(*)
    )
  `)
  .eq('id', workoutId)
  .single()
```

**Display:**
- Generation inputs (anchor, intensity, notes)
- Execution data (duration, mood, session notes)
- All exercises with logged weights and notes
- Location used

**Success Criteria:**
- Complete workout history accessible
- Detail view shows all data
- Good performance even with 100+ workouts

---

#### Task 7.2: Implement Quick Start
**Files to modify:**
- `src/pages/Home.tsx` (Quick Start button)

**Logic:**
1. Fetch user's default settings (intensity, location)
2. Fetch recent history (last 5 anchors, recent exercises)
3. Pick surprise anchor or user's least-used anchor
4. Call generation Edge Function with defaults
5. Route to Screen 2 (Review) instead of immediate start

**Success Criteria:**
- One-tap workout generation
- Uses intelligent anchor selection
- Routes to Review (not immediate execution)

---

#### Task 7.3: Rest Day Marking
**Files to create:**
- `src/components/RestDayModal.tsx`
- Add "Mark Rest Day" button to Home

**Flow:**
1. User taps "Mark Rest Day"
2. Modal shows reason options: Rest / Injury / Sick
3. Save to database:
```typescript
await supabase.from('workout_sessions').insert({
  user_id: user.id,
  date: today,
  is_rest_day: true,
  rest_day_reason: selectedReason,
  counts_for_streak: selectedReason === 'rest', // Only 'rest' preserves streak
  location_id: null,
})
```

**Success Criteria:**
- Rest days show in history
- Streak logic accounts for rest days correctly
- Cannot mark rest day in the future

---

### Phase 8: Polish & Edge Cases
**Goal:** Production-ready experience  
**Dependencies:** Phase 7 complete

#### Task 8.1: Error Handling
**Implement across all screens:**
- Network failures (show retry button)
- AI generation failures (retry with clarification)
- Database save failures (queue for retry)
- Session timeout (re-authenticate)

**Error Patterns:**
```typescript
try {
  const { data, error } = await supabase...
  if (error) throw error
  // Success path
} catch (error) {
  console.error('Database error:', error)
  setErrorMessage('Something went wrong. Please try again.')
  setShowRetry(true)
}
```

**Success Criteria:**
- No unhandled errors crash the app
- User always has path forward (retry, dismiss, contact support)
- Clear error messages (not technical jargon)

---

#### Task 8.2: Loading States
**Add to all async operations:**
- Generation in progress (animated loader, "Generating your workout...")
- Saving workout (spinner)
- Loading history (skeleton cards)
- Authenticating (spinner overlay)

**Component:**
```typescript
// Create reusable loading component
<LoadingState 
  message="Generating your workout..."
  subtitle="This takes about 10 seconds"
/>
```

**Success Criteria:**
- User never sees blank screen during load
- Loading states feel responsive
- Progress indication where appropriate

---

#### Task 8.3: Empty States
**Implement for:**
- No workouts yet (Home screen)
- No locations created (Settings)
- No history (History screen)

**Design Pattern:**
```
┌─────────────────────────┐
│                         │
│      [Large Icon]       │
│                         │
│   You haven't worked    │
│     out yet. Ready      │
│      to start?          │
│                         │
│   [Primary CTA Button]  │
│                         │
└─────────────────────────┘
```

**Success Criteria:**
- Empty states are encouraging, not discouraging
- Clear CTA to get started
- Good first-time user experience

---

#### Task 8.4: Workout Abandonment
**Scenario:** User starts workout, leaves app mid-session

**Implementation:**
- Detect if workout session has `completed_at: null`
- On Home screen load, check for incomplete workout:
```typescript
const { data: incomplete } = await supabase
  .from('workout_sessions')
  .select('*')
  .eq('user_id', user.id)
  .is('completed_at', null)
  .order('created_at', { ascending: false })
  .limit(1)

if (incomplete) {
  showModal({
    title: "Resume Workout?",
    message: "You have an incomplete workout. Do you want to continue?",
    actions: [
      { label: "Resume", action: () => navigate('/workout/' + incomplete.id) },
      { label: "Abandon", action: () => deleteWorkout(incomplete.id) }
    ]
  })
}
```

**Success Criteria:**
- Abandoned workouts don't clutter database
- User can resume where they left off
- Clear "Abandon" option

---

## Implementation Guidelines for Claude Code

### How to Use This Document
1. **Pick a phase** based on current progress and dependencies
2. **Reference the specific task** you want Claude Code to implement
3. **Copy the relevant context** (goal, files, code examples, success criteria)
4. **Use the prompt template** below to start your Claude Code session

### Session Structure
Each Claude Code session should:
- State which phase/task you're working on
- Reference this action plan document
- Include relevant wireframe/data model docs
- Specify expected deliverables
- End with testing the implementation

### Example Claude Code Prompt
```
I'm working on Clear (workout app). I need to implement Phase 2, Task 2.1 
from the Implementation Action Plan (Jan 22, 2026).

Reference documents:
- /mnt/project/Clear_-_Implementation_Action_Plan__Jan_22_2026_.md
- /mnt/project/Clear_-_Onboarding__Wireframe_.md  
- /mnt/project/Clear_-_Data_Model.md

Task: Connect existing onboarding screens to database. The UI already exists,
I just need to add the database save logic when user completes Step 5.

Please implement the database operations for saving user profile, location,
and enabled sections as shown in Task 2.1.
```

---

### File Organization
```
src/
├── components/          # Reusable UI components
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Card.tsx
│   ├── ExerciseCard.tsx
│   ├── SectionCard.tsx
│   └── ...
├── pages/              # Screen components
│   ├── Auth/
│   ├── Onboarding/
│   ├── Home.tsx
│   ├── GenerationInput.tsx
│   ├── ReviewWorkout.tsx
│   ├── WorkoutMode.tsx
│   ├── History.tsx
│   └── Settings/
├── lib/                # Utilities
│   ├── supabase.ts
│   ├── workout-api.ts
│   └── streak-calculator.ts
├── contexts/           # React Context
│   ├── AuthContext.tsx
│   └── OnboardingContext.tsx
└── types/              # TypeScript types
    └── database.ts
```

### Code Style Guidelines
- Use TypeScript for all files
- Follow React hooks best practices
- Use Tailwind CSS for styling (already in project)
- Match design system from `design-tokens-colors.js`
- Write clear, self-documenting code
- Add comments for complex logic only

### Database Query Patterns
```typescript
// Always use RLS - queries automatically filtered by user
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('some_field', value)

// Use select with joins for related data
.select('*, related_table(*)')

// Always handle errors
if (error) throw error
```

### Commit Messages
Follow this pattern:
```
feat: add workout generation screen
fix: correct streak calculation logic
refactor: extract equipment checklist component
docs: update README with setup instructions
```

---

## Testing Checklist

### Manual Testing Required
- [ ] Sign up → Onboarding → Dashboard flow
- [ ] Sign in → Dashboard (skip onboarding)
- [ ] Generate workout → Review → Execute → Finish
- [ ] View workout in history
- [ ] Create location → Use in generation
- [ ] Update settings → Verify in generation
- [ ] Mark rest day → Check streak
- [ ] Abandon workout → Resume or delete
- [ ] Test on mobile viewport
- [ ] Test with no internet (error handling)

---

## Success Metrics

### By End of Phase 4 (Critical Path)
- [ ] User can sign up and complete onboarding
- [ ] User can generate a workout via Claude API
- [ ] Workout saves to database with all data
- [ ] User can execute workout and finish
- [ ] Workout appears in history
- [ ] Streak updates correctly

### By End of Phase 8 (Full MVP)
- [ ] All core flows work end-to-end
- [ ] No critical bugs or crashes
- [ ] Error states handled gracefully
- [ ] Loading states feel responsive
- [ ] App works on mobile and desktop
- [ ] Data persists across sessions
- [ ] Ready for beta testing

---

## Deployment Checklist

### Pre-Deployment
- [ ] All TypeScript errors resolved
- [ ] All ESLint warnings addressed
- [ ] Environment variables set in Vercel
- [ ] Supabase RLS policies tested
- [ ] Edge Functions deployed and tested

### Post-Deployment
- [ ] Test production URL on mobile
- [ ] Verify Supabase connection works
- [ ] Test auth flow end-to-end
- [ ] Generate test workout
- [ ] Check error logging (Vercel/Supabase)

---

## Next Steps

**Immediate Action (Today):**
Start with Phase 1 - Complete Auth Flow. Use this document as reference.

**Claude Code Prompt Template:**
```
I'm working on the Clear workout app. I need to implement [PHASE/TASK] 
from the Implementation Action Plan (Jan 22, 2026).

Reference documents:
- Clear_-_Implementation_Action_Plan__Jan_22_2026_.md (this doc)
- Clear_-_Auth_Screen_Wireframe.md (for auth screens)
- Clear_-_Data_Model.md (for database schema)
- design-tokens-colors.js (for styling)

Please [specific request].
```

**Documentation Updates:**
After completing each phase, update:
- Session recap with progress
- Known issues if any blockers found
- This action plan with completion checkmarks

---

*Action Plan created: January 22, 2026*  
*Ready for Claude Code implementation*
