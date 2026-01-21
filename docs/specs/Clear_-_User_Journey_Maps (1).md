# Clear - User Journey Maps
**Created:** December 20, 2025  
**Status:** Draft (Session 1B)  
**Primary Persona:** Alex (Lazy Planner)

---

## Overview

Three journey maps covering the core user experiences:

1. **Onboarding** — First-time setup
2. **Typical Session** — Returning user generates and executes workout
3. **Edge Cases** — Equipment conflicts, injury mods, history review

---

## Journey 1: Onboarding (First-Time User)

**Goal:** Get user from download → first workout in under 3 minutes  
**Principle:** Collect only what makes workouts better. No fluff.

### Flow

```
App Launch (First Time)
    ↓
Step 1: Equipment / Location
    ↓
Step 2: Experience Level
    ↓
Step 3: Goals → Workout Structure
    ↓
Step 4: Limitations (Optional)
    ↓
Step 5: Confirmation
    ↓
→ Generate First Workout (Screen 1)
```

### Step 1: Equipment / Location

**Screen Purpose:** Know what exercises are possible

**User Actions:**
1. Select equipment tier:
   - **Minimal** — Bodyweight, bands, maybe a mat
   - **Home Gym** — Dumbbells, bench, basic equipment
   - **Building Gym** — Squat rack, barbells, cables, dumbbells
   - **Full Gym** — Commercial gym, all equipment available

2. Tier auto-populates equipment checklist

3. User can **add or remove** items:
   - Toggle items on/off
   - Structured selection (not free text)
   - Common equipment options provided

4. This becomes their default location

**Copy/Messaging:**
- "You can add more locations later"
- "Select what you have access to"

**Persona Notes:**
- Alex: Selects "Building Gym," maybe removes cable machine if not available
- Jordan: Might select "Home Gym" or "Minimal" — less intimidating
- Sam: Selects whatever's at their gym, moves fast through this

---

### Step 2: Experience Level

**Screen Purpose:** Adjust exercise complexity and cue verbosity

**User Actions:**
1. Select one:
   - **New to this** — Still learning, want guidance
   - **Some experience** — Know the basics
   - **Confident** — Just tell me what to do

**What This Affects (Under the Hood):**
- Exercise selection (goblet squat vs. barbell back squat)
- Coaching cue detail level
- Default intensity suggestion (beginners might default to 5, confident to 7)

**What This Does NOT Do:**
- Does not lock users out of any intensity level
- Does not require tutorials or external links
- Does not gatekeep movements

**Persona Notes:**
- Alex: "Confident" — minimal cues, trust the output
- Jordan: "New to this" — wants more guidance, will read cues
- Sam: "Confident" — knows what they're doing, just needs structure

---

### Step 3: Goals → Workout Structure

**Screen Purpose:** Customize what a workout includes

**User Actions:**

1. **First:** Select a preset goal:
   - **Strength** — Heavy lifts, longer rest, less cardio
   - **Balanced** — Mix of everything (default 6 sections)
   - **Conditioning** — Circuits, supersets, shorter rest
   - **Quick & Effective** — Fewer sections, time-optimized

2. **Then:** Customize sections (required to show, optional to change):
   - Preset maps to recommended sections
   - User sees which sections are included
   - Can toggle sections on/off
   - Can reorder sections (future consideration)

**Default Sections (Balanced):**
- ✓ Warm-up
- ✓ Primary Lift
- ✓ Accessory Work
- ✓ Rotational / Core
- ✓ Conditioning
- ✓ Cooldown

**Section Behavior:**
- Warm-up and Cooldown default ON
- User can toggle any section off
- Minimum: At least one section required

**Copy/Messaging:**
- "You can change this anytime"
- "Pick what fits your goals"

**Persona Notes:**
- Alex: Balanced, keeps all 6 sections
- Jordan: Might pick Balanced, fewer sections feels less overwhelming
- Sam: Quick & Effective, maybe 3-4 sections max

---

### Step 4: Limitations (Optional)

**Screen Purpose:** Avoid movements that cause pain or problems

**User Actions:**
1. Free text input field
2. Or skip ("Nothing right now")

**Example Inputs:**
- "Bad left shoulder, overhead pressing feels sketchy"
- "Knee surgery 2 years ago, careful with deep squats"
- "Lower back issues"

**How It Works:**
- Text passed to workout generation as context
- LLM parses and avoids problematic movements
- Can be updated anytime in settings

**Copy/Messaging:**
- "Anything we should keep in mind?"
- "Any injuries or limitations to work around?"
- (No "AI coach" language)

**Persona Notes:**
- Alex: Might add shoulder note, or skip
- Jordan: Might mention something, appreciates being asked
- Sam: Skips unless relevant — no time to waste

---

### Step 5: Confirmation

**Screen Purpose:** Review before starting

**Display:**
- Equipment/Location summary
- Experience level
- Workout structure (sections enabled)
- Limitations (if any)

**User Actions:**
- "Looks good" → Proceed to Generate (Screen 1)
- "Edit" → Go back to specific step

**Copy/Messaging:**
- "Here's your setup"
- "Ready to generate your first workout?"

---

## Journey 2: Typical Session (Returning User)

**Goal:** Workout ready in 30 seconds  
**Context:** Alex is walking out of locker room, phone in hand

### Flow

```
Open App
    ↓
Home / Dashboard (future) or Generation Screen
    ↓
Screen 1: Set Intensity, Anchor, (Optional: Time, Notes)
    ↓
Tap "Generate"
    ↓
Screen 2: Review Workout
    ↓
(Optional: Edit exercises, Randomize section)
    ↓
Tap "Start Workout"
    ↓
Screen 3: Execute (Section by Section)
    ↓
Complete all sections
    ↓
Summary Screen
    ↓
Save Session
    ↓
→ Return to Home / Generation Screen
```

### Key Moments

**Opening the App:**
- MVP: Opens directly to Generation Screen (Screen 1)
- Future: Home/Dashboard with recent workouts + Generate CTA

**Generation (Screen 1):**
- Intensity slider (1-10) — primary input
- Anchor selection (6 buttons) — what's the focus?
- Location preset (if multiple locations set up)
- Optional: Time estimate, notes for today
- **30 seconds max** to hit Generate

**Review (Screen 2):**
- Scan workout title and overview
- Expand sections to see exercises
- Vibe check: "Does this feel right?"
- If yes → Start Workout
- If no → Edit exercise or Randomize Section

**Execution (Screen 3):**
- One section at a time (paginated)
- See exercises, sets, reps
- Add notes as you go (weight used, how it felt)
- Tap Next to advance sections
- Timer tracks section and overall time

**Completion:**
- Summary shows workout + notes
- Save Session stores data locally
- Return to start for next time

### Intensity & Sections Interaction

| Intensity | Workout Character | Likely Sections |
|-----------|------------------|-----------------|
| 1-2 | Movement day. Mobility, stretching, light activity. "I showed up." | Warm-up, Mobility/Stretch, Cooldown |
| 3-4 | Easy day. Light resistance, nothing taxing. | Warm-up, Light Accessory, Cooldown |
| 5-6 | Moderate. Solid workout, sustainable effort. | All 6 sections, moderate loads |
| 7-8 | Hard. Challenging lifts, real effort. | All 6 sections, heavier loads, longer rest |
| 9-10 | All out. Heavy, intense, leave it on the floor. | All 6 sections, peak effort |

**Logic:**
- Intensity shapes *how hard* sections are (load, reps, rest)
- User's section preferences shape *what's included*
- Some combos don't make sense — UI/AI can suggest adjustments but user decides
- Warm-up and Cooldown should always be encouraged (but can be skipped)

---

## Journey 3: Edge Cases

### Edge Case A: Equipment Conflict

**Scenario:** Alex is doing a Pull day. Workout includes Barbell Bent-Over Row. The squat rack is taken.

**Current Flow (Screen 2 or 3):**
1. See exercise that requires unavailable equipment
2. Tap exercise name → Edit modal
3. Change to alternative (e.g., "DB Bent-Over Row")
4. Or: Tap "Randomize Section" to get new suggestions

**Future Enhancement:**
- "Quick Swap" suggestions (AI offers 2-3 alternatives)
- Equipment conflict detection based on location profile

**Persona Notes:**
- Alex: Knows alternatives, will edit quickly
- Jordan: Might not know what to swap — needs suggestions
- Sam: Needs instant swap, no friction

---

### Edge Case B: Injury / Modification Mid-Workout

**Scenario:** Jordan is doing workout, shoulder starts hurting on overhead press.

**Current Flow (Screen 3):**
1. In workout execution, tap exercise
2. Add note: "Shoulder hurt, skipped" or "Did lateral raises instead"
3. Continue workout
4. (Limitation not saved permanently — just this session)

**Future Enhancement:**
- "Flag this exercise" → Adds to limitations in settings
- Regression suggestion appears automatically

**Persona Notes:**
- Alex: Modifies on the fly, knows what to do
- Jordan: Might feel stuck — needs guidance or permission to skip
- Sam: Swaps fast, moves on

---

### Edge Case C: Checking History

**Scenario:** Alex wants to see what weight they used last time for Deadlift.

**Current Flow (MVP):**
- Historical data shown on Screen 2: "Last: 185-225lbs"
- Range based on past sessions with that movement

**Future Flow:**
- History screen with past workouts
- Tap workout → See full details with notes
- Search by exercise name

**Persona Notes:**
- Alex: Glances at range, adjusts based on feel
- Jordan: Might not have history yet — sees "No history" gracefully
- Sam: Quick check, moves on

---

### Edge Case D: Changing Settings Post-Onboarding

**Scenario:** Sam joins a new gym with more equipment.

**Flow:**
1. Go to Settings (from menu)
2. Locations section
3. Add new location with equipment checklist
4. Set as default (or select per-workout)

**What's Editable in Settings:**
- Locations / Equipment
- Experience level
- Default workout structure (sections)
- Limitations
- (Future: Account, sync, export)

---

## Friction Points Identified

| Moment | Friction | Mitigation |
|--------|----------|------------|
| Onboarding equipment setup | Could be tedious | Tier presets auto-populate; edit only what's wrong |
| Choosing workout structure | Overwhelming options | Preset goals first, customize optional but visible |
| Exercise unfamiliar (Jordan) | Doesn't know movement | Coaching cues visible; regression prominent |
| Equipment conflict | Flow disruption | Easy edit access; future: quick swap suggestions |
| Workout runs long (Sam) | Trust broken | Accurate time estimates; respect time input |
| AI suggests same exercises | Boredom, trust erosion | Rotation logic uses history; randomize section option |

---

## Open Questions (For Future Sessions)

1. **Home/Dashboard screen:** What does returning user see first? Generate CTA + recent workouts?

2. **Multiple locations:** How does user switch between them on Screen 1? Dropdown? Accordion?

3. **Section reordering:** Can users change section order, or just toggle on/off?

4. **Workout templates:** Should users be able to save a workout structure as a personal template?

5. **Progress/streaks:** Any habit reinforcement UI? Or keep it purely functional?

---

## Next Steps

**Phase 2:** Screen Definition & Wireframing
- Onboarding screens (Steps 1-5)
- Home/Dashboard screen
- Settings screen
- History screen

---

*Journey maps validated: December 20, 2025*
