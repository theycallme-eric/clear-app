# Clear - Onboarding (Wireframe)
**Created:** December 22, 2025  
**Status:** Locked for MVP  
**Phase:** 2B Complete

---

## Purpose

First-time user setup flow. Collects only what makes workouts better — no fluff, no personal info.

**Context:** User launches app for the first time. Goal is to get them from download → first workout in under 3 minutes.

**Flow:** 5 steps, linear progression, no skipping.

---

## Step 1: Equipment / Location

**Purpose:** Know what exercises are possible based on available equipment.

```
┌─────────────────────────────────────┐
│  CLEAR                              │
├─────────────────────────────────────┤
│                                     │
│  WHAT'S YOUR GYM SETUP?             │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ ○  MINIMAL                  │   │
│  │    Bodyweight, bands, mat   │   │
│  ├─────────────────────────────┤   │
│  │ ○  HOME GYM                 │   │
│  │    Dumbbells, bench, basics │   │
│  ├─────────────────────────────┤   │
│  │ ●  BUILDING GYM             │   │  ← Selected
│  │    Rack, barbell, dumbbells │   │
│  ├─────────────────────────────┤   │
│  │ ○  FULL GYM                 │   │
│  │    Commercial, everything   │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ CUSTOMIZE EQUIPMENT      ▶  │   │  ← Accordion (closed)
│  └─────────────────────────────┘   │
│                                     │
│  You can add more locations later   │
│                                     │
├─────────────────────────────────────┤
│         [  NEXT  →  ]               │
│         Step 1 of 5                 │
└─────────────────────────────────────┘
```

**Accordion Expanded:**

```
│  ┌─────────────────────────────┐   │
│  │ CUSTOMIZE EQUIPMENT      ▼  │   │
│  │                             │   │
│  │ ┌─────┐┌─────┐┌─────┐┌─────┐│   │
│  │ │✓Barb││✓Dumb││✓Rack││✓Cabl││   │
│  │ └─────┘└─────┘└─────┘└─────┘│   │
│  │ ┌─────┐┌─────┐┌─────┐┌─────┐│   │
│  │ │✓Benc││○ KBs││○Band││○Pull││   │
│  │ └─────┘└─────┘└─────┘└─────┘│   │
│  │ ┌─────┐┌─────┐┌─────┐       │   │
│  │ │○TRX ││○Trea││○Mat │       │   │
│  │ └─────┘└─────┘└─────┘       │   │
│  └─────────────────────────────┘   │
```

**Interactions:**
- Tap tier → Selects it, populates equipment toggles
- Tap accordion → Expands to show equipment chips
- Tap chip → Toggles equipment on/off
- This becomes the user's default location

**Equipment by Tier:** See `Clear_-_Content_Definitions.md` for full list.

---

## Step 2: Experience Level

**Purpose:** Adjust exercise complexity and coaching cue verbosity.

```
┌─────────────────────────────────────┐
│  ← CLEAR                            │
├─────────────────────────────────────┤
│                                     │
│  HOW FAMILIAR ARE YOU               │
│  WITH THE GYM?                      │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ ○  NEW TO THIS              │   │
│  │                             │   │
│  │    Still learning the       │   │
│  │    movements. More          │   │
│  │    guidance is helpful.     │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ ○  SOME EXPERIENCE          │   │
│  │                             │   │
│  │    Know the basics.         │   │
│  │    Comfortable with         │   │
│  │    common exercises.        │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ ●  CONFIDENT                │   │  ← Selected
│  │                             │   │
│  │    Just tell me what to do. │   │
│  │    I'll figure it out.      │   │
│  └─────────────────────────────┘   │
│                                     │
├─────────────────────────────────────┤
│         [  NEXT  →  ]               │
│         Step 2 of 5                 │
└─────────────────────────────────────┘
```

**Interactions:**
- Tap option → Selects it (single select / radio behavior)
- Back arrow → Returns to Step 1

**What This Affects (Under the Hood):**
- Exercise selection (goblet squat vs. barbell back squat)
- Coaching cue detail level
- Default intensity suggestion

**What This Does NOT Do:**
- Does not lock users out of any intensity level
- Does not require tutorials or external links
- Does not gatekeep movements

---

## Step 3: Goals & Workout Structure

**Purpose:** Customize what sections a workout includes.

```
┌─────────────────────────────────────┐
│  ← CLEAR                            │
├─────────────────────────────────────┤
│                                     │
│  WHAT ARE YOU GOING FOR?            │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ ○  STRENGTH                 │   │
│  │    Heavy lifts, longer rest │   │
│  ├─────────────────────────────┤   │
│  │ ●  BALANCED                 │   │  ← Selected
│  │    A little of everything   │   │
│  ├─────────────────────────────┤   │
│  │ ○  CONDITIONING             │   │
│  │    Circuits, shorter rest   │   │
│  ├─────────────────────────────┤   │
│  │ ○  QUICK & EFFECTIVE        │   │
│  │    Fewer sections, get done │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ CUSTOMIZE SECTIONS       ▶  │   │  ← Accordion (closed)
│  └─────────────────────────────┘   │
│                                     │
│  You can change this anytime        │
│                                     │
├─────────────────────────────────────┤
│         [  NEXT  →  ]               │
│         Step 3 of 5                 │
└─────────────────────────────────────┘
```

**Accordion Expanded:**

```
│  ┌─────────────────────────────┐   │
│  │ CUSTOMIZE SECTIONS       ▼  │   │
│  │                             │   │
│  │ ┌─────┐┌─────┐┌─────┐┌─────┐│   │
│  │ │✓Warm││✓Mobi││✓Prim││✓Accs││   │
│  │ └─────┘└─────┘└─────┘└─────┘│   │
│  │ ┌─────┐┌─────┐┌─────┐┌─────┐│   │
│  │ │○Skil││○Carr││✓Core││○Stab││   │
│  │ └─────┘└─────┘└─────┘└─────┘│   │
│  │ ┌─────┐┌─────┐              │   │
│  │ │✓Cond││✓Cool│              │   │
│  │ └─────┘└─────┘              │   │
│  │                             │   │
│  │ What do these mean?      ▶  │   │  ← Expandable legend
│  └─────────────────────────────┘   │
```

**Legend Expanded:**

```
│  │ What do these mean?      ▼  │   │
│  │                             │   │
│  │ WARM-UP                     │   │
│  │ Light movement to get your  │   │
│  │ body ready                  │   │
│  │                             │   │
│  │ MOBILITY                    │   │
│  │ Focused flexibility and     │   │
│  │ range of motion work        │   │
│  │                             │   │
│  │ PRIMARY LIFT                │   │
│  │ The main heavy movement —   │   │
│  │ squats, deadlifts, presses  │   │
│  │                             │   │
│  │ ACCESSORY                   │   │
│  │ Supporting work for the     │   │
│  │ primary lift                │   │
│  │                             │   │
│  │ SKILL / POWER               │   │
│  │ Explosive movements —       │   │
│  │ jumps, throws, Olympic lifts│   │
│  │                             │   │
│  │ CARRIES                     │   │
│  │ Loaded carries — farmer's   │   │
│  │ walks, suitcase carry       │   │
│  │                             │   │
│  │ CORE                        │   │
│  │ Rotational and stability    │   │
│  │ work for your midsection    │   │
│  │                             │   │
│  │ STABILITY / BALANCE         │   │
│  │ Single-leg work,            │   │
│  │ proprioception focus        │   │
│  │                             │   │
│  │ CONDITIONING                │   │
│  │ Cardio, circuits, or        │   │
│  │ higher-intensity finishers  │   │
│  │                             │   │
│  │ COOLDOWN                    │   │
│  │ Stretching and recovery     │   │
│  │ to end the session          │   │
│  └─────────────────────────────┘   │
```

**Interactions:**
- Tap goal preset → Selects it, updates section toggles to preset defaults
- Tap accordion → Expands section chips
- Tap chip → Toggles section on/off
- "What do these mean?" → Expands legend with descriptions
- Back arrow → Returns to Step 2

**Sections:** See `Clear_-_Content_Definitions.md` for full list and goal preset mappings.

**Anchor Logic:** If Primary Lift is toggled OFF, the Generation Screen will show UPPER/LOWER/FULL BODY anchors instead of SQUAT/HINGE/PRESS/PULL/ROTATION/SURPRISE.

---

## Step 4: Limitations

**Purpose:** Avoid movements that cause pain or problems.

```
┌─────────────────────────────────────┐
│  ← CLEAR                            │
├─────────────────────────────────────┤
│                                     │
│  ANYTHING WE SHOULD                 │
│  WORK AROUND?                       │
│                                     │
│  Old injuries, problem areas,       │
│  or movements you want to avoid.    │
│                                     │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │ Bad left shoulder from      │   │
│  │ years ago. Overhead press   │   │
│  │ feels sketchy sometimes.    │   │
│  │                             │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│                                     │
│                                     │
│                                     │
│                                     │
│                                     │
├─────────────────────────────────────┤
│  [ SKIP FOR NOW ]   [  NEXT  →  ]  │
│         Step 4 of 5                 │
└─────────────────────────────────────┘
```

**Interactions:**
- Type in textarea → Free text, LLM parses later
- "Skip for now" → Proceeds without limitations (can add later in Settings)
- "Next" → Proceeds with entered text
- Back arrow → Returns to Step 3

**How It Works:**
- Text passed to workout generation as context
- LLM parses and avoids problematic movements
- Can be updated anytime in Settings

---

## Step 5: Confirmation

**Purpose:** Review setup before generating first workout.

```
┌─────────────────────────────────────┐
│  ← CLEAR                            │
├─────────────────────────────────────┤
│                                     │
│  HERE'S YOUR SETUP                  │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ LOCATION                      │ │
│  │ Building Gym                  │ │
│  │ Barbell, Dumbbells, Rack,     │ │
│  │ Cables, Bench                 │ │
│  │                        [Edit] │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ EXPERIENCE                    │ │
│  │ Confident                     │ │
│  │                        [Edit] │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ WORKOUT STRUCTURE             │ │
│  │ Balanced (6 sections)         │ │
│  │                        [Edit] │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ LIMITATIONS                   │ │
│  │ "Bad left shoulder..."        │ │
│  │                        [Edit] │ │
│  └───────────────────────────────┘ │
│                                     │
├─────────────────────────────────────┤
│  [  GENERATE FIRST WORKOUT  →  ]   │
│         Step 5 of 5                 │
└─────────────────────────────────────┘
```

**Interactions:**
- Review all selections
- Tap [Edit] → Returns to that specific step
- "Generate First Workout" → Saves setup, proceeds to Generation Screen (Screen 1)
- Back arrow → Returns to Step 4

---

## Navigation Summary

| Screen | Back | Next |
|--------|------|------|
| Step 1: Equipment | — | Step 2 |
| Step 2: Experience | Step 1 | Step 3 |
| Step 3: Goals | Step 2 | Step 4 |
| Step 4: Limitations | Step 3 | Step 5 (or Skip) |
| Step 5: Confirmation | Step 4 | Generation Screen |

---

## Data Saved After Onboarding

- Default location name
- Equipment list (toggles)
- Experience level
- Goal preset
- Enabled sections
- Limitations text

All stored locally. Used for every workout generation going forward.

---

## Design Notes

- **Progress indicator:** "Step X of 5" shown on every screen
- **Back enabled:** After Step 1, user can always go back
- **No skip for core steps:** Only Limitations (Step 4) has skip option
- **Accordion pattern:** Equipment and Sections use same collapsible UI
- **Helper text outside accordion:** Reassurance copy ("You can change this anytime") stays visible

---

*Onboarding wireframe locked: December 22, 2025*
