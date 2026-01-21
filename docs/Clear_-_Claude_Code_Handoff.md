# Clear - Claude Code Handoff
**Created:** December 22, 2025  
**Purpose:** Everything Claude Code needs to build the remaining screens

---

## Project Overview

Clear is a fitness app that generates personalized workouts using AI. The core workout flow (Generation → Review → Workout Mode) is already built in Lovable. Now we need to add supporting screens to complete the app.

**Tech Stack:**
- React (functional components, hooks)
- Tailwind CSS (custom config with Clear design tokens)
- TypeScript (if Lovable used it)
- Local storage for data persistence

---

## What Already Exists

The following screens are built and working:
- **Screen 1: Generation Input** — User sets intensity, anchor, generates workout
- **Screen 2: Review & Edit** — User reviews generated workout, can edit exercises
- **Screen 3: Workout Mode** — User executes workout section by section

The design system is also complete:
- Color tokens (purple, indigo, orange, rose, lime, neutral)
- Typography (Rajdhani, Inter, Oxanium)
- Component styles (buttons, inputs, cards, glassmorphic effects)
- Cyberpunk utilitarian aesthetic

---

## What Needs to Be Built

### Priority Order

1. **Home/Dashboard** — New entry point for returning users
2. **Onboarding (5 steps)** — First-time user setup flow
3. **Summary Screen** — Post-workout completion
4. **Workout History + Session Detail** — Past workout reference
5. **Settings** — Preference management

---

## Screen Specifications

### 1. Home/Dashboard

**File:** `Clear_-_Screen_0__Home_Dashboard__Wireframe_.md`

**Purpose:** Landing screen for returning users

**Key Elements:**
- Hero CTA: "Generate Workout" → navigates to Screen 1
- Quick Start: Auto-suggested intensity + anchor based on history → skips to Screen 3
- Streak tracker: Day count, week view (M-S boxes), "Mark Rest Day" button
- Recent workouts: Last 3 sessions, tap to view detail
- Hamburger menu → Settings

**Logic:**
- Quick Start intensity: Based on previous day's workout (recovery logic)
- Quick Start anchor: Auto-rotates to avoid recent repeats
- Rest day: 3+ consecutive rest days triggers "injury/sick" prompt
- If no workout history: Quick Start shows "Start your first workout"

---

### 2. Onboarding (5 Steps)

**File:** `Clear_-_Onboarding__Wireframe_.md`

**Purpose:** First-time user setup (< 3 minutes)

**Step 1: Equipment/Location**
- Select tier: Minimal / Home Gym / Building Gym / Full Gym
- Tier populates equipment checklist (accordion, closed by default)
- User can toggle equipment on/off
- Becomes default location

**Step 2: Experience Level**
- Select one: New to this / Some experience / Confident
- Affects exercise complexity and cue verbosity
- Does NOT lock users out of intensity levels

**Step 3: Goals & Structure**
- Select preset: Strength / Balanced / Conditioning / Quick & Effective
- Preset populates section toggles (accordion, closed by default)
- User can toggle sections on/off
- "What do these mean?" expands legend with descriptions
- **Important:** If Primary Lift is OFF, anchor options change (see Anchor Logic below)

**Step 4: Limitations**
- Free text textarea
- Optional (can skip)
- LLM parses later during workout generation

**Step 5: Confirmation**
- Summary of all selections
- [Edit] links back to specific steps
- "Generate First Workout" → saves preferences, goes to Screen 1

**Data to Store:**
```javascript
{
  location: {
    name: "Building Gym",
    equipment: ["barbell", "dumbbells", "rack", "cables", "bench"]
  },
  experienceLevel: "confident", // "new" | "some" | "confident"
  goal: "balanced", // "strength" | "balanced" | "conditioning" | "quick"
  sections: ["warmup", "mobility", "primary", "accessory", "core", "conditioning", "cooldown"],
  limitations: "Bad left shoulder, overhead pressing feels sketchy"
}
```

---

### 3. Summary Screen

**File:** `Clear_-_Summary_Screen__Wireframe_.md`

**Purpose:** Post-workout completion, mood capture, streak update

**Key Elements:**
- Celebration: 🎉 "NICE WORK!"
- Workout summary: Anchor, intensity, duration, section count
- Mood tracker: 5 emojis (😫 😕 😐 🙂 😀), tap to select
- Session notes: Optional textarea
- Streak update: "12 → 13 days 🔥" with week view
- "FINISH" button: Auto-saves everything, returns to Home

**Triggers:** User taps "Finish" on last section of Workout Mode

---

### 4. Workout History + Session Detail

**File:** `Clear_-_Workout_History__Wireframe_.md`

**Purpose:** View past workouts, reference weights/notes

**History List:**
- Search bar (disabled for MVP — future natural language)
- Filter chips: All / Anchor (dropdown) / Intensity (dropdown)
- Grouped by month
- Each card: Date, anchor, intensity, duration
- Tap card → Session Detail
- "Load More" pagination

**Session Detail:**
- Date as title
- Summary: Anchor, intensity, duration, goal preset, mood
- Each section with exercises, sets/reps, logged weights
- User notes (📝) inline where captured
- Session notes at bottom
- Read-only (no editing past workouts)

---

### 5. Settings

**File:** `Clear_-_Settings__Wireframe_.md`

**Purpose:** Manage preferences (reuses onboarding UI patterns)

**Settings Hub:**
- Locations / Equipment → sub-screen
- Experience Level → sub-screen
- Workout Structure → sub-screen
- Limitations → sub-screen
- Send Feedback → email/form
- About Clear → version info

**Sub-screens:** Mirror onboarding steps 1-4, with Save button instead of Next

**Locations sub-screen additions:**
- List of saved locations with radio for default
- [✎] edit button per location
- "+ Add Location" button
- Edit screen includes "Delete Location" option

---

## Content Definitions

**File:** `Clear_-_Content_Definitions.md`

### Equipment by Tier

**Minimal:** Bodyweight (always on), Resistance Bands, Mat, Foam Roller

**Home Gym:** + Dumbbells, Kettlebells, Bench (flat), Pull-up Bar, TRX, Treadmill

**Building Gym:** + Barbell, Squat Rack, Cable Machine, Adjustable Bench, Lat Pulldown, Rowing Machine

**Full Gym:** + Leg Press, Smith Machine, Hack Squat, Chest Press Machine, Shoulder Press Machine, Leg Curl/Extension, Pec Deck, Assisted Pull-up/Dip, Battle Ropes, Assault Bike, Stair Climber

### Workout Sections (10 total)

| Section | Description |
|---------|-------------|
| Warm-up | Light movement to get your body ready |
| Mobility | Focused flexibility and range of motion work |
| Primary Lift | The main heavy movement — squats, deadlifts, presses |
| Accessory | Supporting work for the primary lift |
| Skill / Power | Explosive movements — jumps, throws, Olympic lifts |
| Carries | Loaded carries — farmer's walks, suitcase carry |
| Core | Rotational and stability work for your midsection |
| Stability / Balance | Single-leg work, proprioception focus |
| Conditioning | Cardio, circuits, or higher-intensity finishers |
| Cooldown | Stretching and recovery to end the session |

### Anchor Logic

**If Primary Lift IS selected:**
- Anchor options: SQUAT, HINGE, PRESS, PULL, ROTATION, SURPRISE

**If Primary Lift is NOT selected:**
- Anchor options: UPPER BODY, LOWER BODY, FULL BODY
- Accessory section also hidden/disabled

This affects the Generation Screen (Screen 1) anchor grid.

### Goal Presets

**Strength:** Warm-up, Mobility, Primary Lift, Accessory, Core, Cooldown

**Balanced:** Warm-up, Mobility, Primary Lift, Accessory, Core, Conditioning, Cooldown

**Conditioning:** Warm-up, Mobility, Carries, Core, Stability/Balance, Conditioning, Cooldown (no Primary Lift)

**Quick & Effective:** Warm-up, Primary Lift, Core, Cooldown (4 sections only)

---

## Navigation Flow

**File:** `clear-navigation-flow.mermaid`

```
App Open
    ↓
[First time?]
    ├── Yes → Onboarding (5 steps) → Generation Screen
    └── No → Home/Dashboard
                ├── Generate Workout → Screen 1 → Screen 2 → Screen 3 → Summary → Home
                ├── Quick Start → Screen 3 → Summary → Home
                ├── History → Session Detail
                └── Settings → Sub-screens
```

---

## State Management Requirements

### User Preferences (persist across sessions)
```javascript
{
  locations: [{name, equipment}],
  defaultLocationId: string,
  experienceLevel: string,
  goal: string,
  sections: string[],
  limitations: string,
  onboardingComplete: boolean
}
```

### Workout History (persist across sessions)
```javascript
{
  workouts: [{
    id: string,
    date: Date,
    anchor: string,
    intensity: number,
    duration: number,
    goal: string,
    sections: [{
      name: string,
      exercises: [{
        name: string,
        sets: string,
        reps: string,
        weight: string,
        notes: string
      }]
    }],
    sessionNotes: string,
    mood: number // 1-5
  }]
}
```

### Streak Data (persist across sessions)
```javascript
{
  currentStreak: number,
  lastWorkoutDate: Date,
  restDays: Date[], // dates marked as rest
  weekView: { [date]: "workout" | "rest" | null }
}
```

### Current Session (in memory, saved on Finish)
```javascript
{
  startTime: Date,
  anchor: string,
  intensity: number,
  sections: [...],
  exerciseNotes: { [exerciseId]: string },
  sectionNotes: { [sectionId]: string },
  mood: number,
  sessionNotes: string
}
```

---

## Design System Reference

### Colors
```javascript
purple: '#9966CC'   // Primary brand
indigo: '#4F479A'   // Secondary
orange: '#F17B14'   // Accent, CTAs
rose: '#B62F57'     // High intensity
lime: '#8DE937'     // Low intensity, success
neutral: {
  50: '#FFFEFB',    // Off-white (text)
  900: '#161313'    // Near-black (background)
}
```

### Typography
- **Display/Headers:** Rajdhani (500, 600, 700) — uppercase, wide tracking
- **Body:** Inter (400, 500, 600)
- **Technical/Data:** Oxanium (400) — monospace, uppercase labels

### Component Patterns
- **Primary CTA:** Orange gradient, glowing border
- **Ghost/Secondary:** Transparent bg, outline border
- **Cards:** Glassmorphic (backdrop blur, semi-transparent bg, subtle border)
- **Inputs:** Dark transparent bg, colored left accent stripe
- **Accordions:** Closed by default, chevron indicator

### Aesthetic
- Cyberpunk utilitarian
- Dark background (#161313)
- Soft glows and blur effects
- Sharp corners (0 border radius)
- Grain texture overlay (subtle)

---

## Build Checklist

### Phase 1: Home/Dashboard
- [ ] Create Home component
- [ ] Implement Hero CTA (link to Generation)
- [ ] Implement Quick Start (auto-suggest logic, skip to Workout Mode)
- [ ] Implement Streak tracker (visual only for now)
- [ ] Implement Recent workouts list
- [ ] Add hamburger menu → Settings
- [ ] Update routing (Home as default for returning users)

### Phase 2: Onboarding
- [ ] Create Onboarding wrapper with step state
- [ ] Step 1: Equipment/Location
- [ ] Step 2: Experience Level
- [ ] Step 3: Goals & Structure (with accordion + legend)
- [ ] Step 4: Limitations
- [ ] Step 5: Confirmation
- [ ] Save preferences to local storage
- [ ] Update routing (Onboarding for first-time users)

### Phase 3: Summary
- [ ] Create Summary component
- [ ] Implement mood tracker (5 emoji buttons)
- [ ] Implement session notes textarea
- [ ] Implement streak update display
- [ ] Connect Finish button (save data, return to Home)
- [ ] Update Workout Mode to navigate to Summary on completion

### Phase 4: History
- [ ] Create History list component
- [ ] Implement filter dropdowns (Anchor, Intensity)
- [ ] Implement month grouping
- [ ] Create Session Detail component
- [ ] Connect to stored workout data
- [ ] Add navigation from Home

### Phase 5: Settings
- [ ] Create Settings hub
- [ ] Create Locations sub-screen (list, edit, add, delete)
- [ ] Create Experience Level sub-screen
- [ ] Create Workout Structure sub-screen
- [ ] Create Limitations sub-screen
- [ ] Connect to stored preferences
- [ ] Add navigation from hamburger menu

### Phase 6: Integration
- [ ] Wire up onboarding-complete flag
- [ ] Wire up Quick Start logic (recent workout analysis)
- [ ] Wire up streak calculation
- [ ] Wire up anchor logic (Primary Lift on/off)
- [ ] Test full user flows
- [ ] Polish and bug fixes

---

## Files to Reference

All wireframes and specs are in the Documents folder:

- `Clear_-_Screen_0__Home_Dashboard__Wireframe_.md`
- `Clear_-_Onboarding__Wireframe_.md`
- `Clear_-_Summary_Screen__Wireframe_.md`
- `Clear_-_Workout_History__Wireframe_.md`
- `Clear_-_Settings__Wireframe_.md`
- `Clear_-_Content_Definitions.md`
- `Clear_-_User_Personas.md`
- `Clear_-_User_Journey_Maps.md`
- `clear-navigation-flow.mermaid`
- `clear-sitemap.mermaid`

Existing code is in the code folder (Lovable export).

---

## Notes for Claude Code

1. **Match existing patterns.** Look at how Lovable structured Screen 1-3 and follow the same conventions.

2. **Reuse components.** Many UI elements repeat (accordions, toggle chips, cards). Extract reusable components.

3. **Onboarding + Settings share UI.** Build onboarding steps as reusable components that Settings can import.

4. **Local storage first.** No backend for MVP. All data persists in localStorage or IndexedDB.

5. **Mobile-first.** All layouts should work on 375px width. Touch targets minimum 48px.

6. **Don't break existing screens.** The core workout flow (Screen 1-3) should continue to work as-is.

---

*Handoff document created: December 22, 2025*
