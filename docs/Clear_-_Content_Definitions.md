# Clear - Content Definitions
**Created:** December 22, 2025  
**Updated:** January 20, 2026 (ROTATION → POWER anchor change, Core section rename)  
**Status:** Locked for MVP  
**Phase:** 2B Content Definition

---

## Equipment List (By Tier)

Each tier includes everything from the tier below it. Users can toggle any item on/off in the customization accordion.

### Minimal
- Bodyweight *(always on, non-removable)*
- Resistance Bands
- Mat
- Foam Roller

### Home Gym
*Includes Minimal, plus:*
- Dumbbells
- Kettlebells
- Bench (flat)
- Pull-up Bar
- TRX / Suspension Trainer
- Treadmill

### Building Gym
*Includes Home Gym, plus:*
- Barbell
- Squat Rack / Cage
- Cable Machine
- Adjustable Bench (incline/decline)
- Lat Pulldown
- Rowing Machine

### Full Gym
*Includes Building Gym, plus:*
- Leg Press
- Smith Machine
- Hack Squat
- Chest Press Machine
- Shoulder Press Machine
- Leg Curl / Extension Machines
- Pec Deck / Fly Machine
- Assisted Pull-up/Dip Machine
- Battle Ropes
- Assault Bike / Air Bike
- Stair Climber

---

## Workout Sections

| Section | Description |
|---------|-------------|
| Warm-up | Light movement to get your body ready |
| Mobility | Focused flexibility and range of motion work |
| Primary Lift | The main heavy movement — squats, deadlifts, presses |
| Accessory | Supporting work for the primary lift |
| Skill / Power | Explosive movements — jumps, throws, Olympic lifts |
| Carries | Loaded carries — farmer's walks, suitcase carry |
| Core | Stability and strength work for your midsection |
| Stability / Balance | Single-leg work, proprioception focus |
| Conditioning | Cardio, circuits, or higher-intensity finishers |
| Cooldown | Stretching and recovery to end the session |

**Total: 10 sections**

**Note on Core Section:** Core exercises (Russian Twists, Bicycles, Planks, etc.) do not map to a specific anchor — they can appear in any workout regardless of anchor selection.

---

## Anchor Logic

The anchor selection on the Generation Screen (Screen 1) changes based on whether Primary Lift is included in the user's workout structure.

### Rule 1: Primary Lift determines anchor type

| Primary Lift Selected? | Anchor Options |
|------------------------|----------------|
| ✓ Yes | SQUAT, HINGE, PRESS, PULL, POWER, SURPRISE |
| ✗ No | UPPER BODY, LOWER BODY, FULL BODY |

**Visual on Generation Screen:**

```
PRIMARY LIFT SELECTED:          NO PRIMARY LIFT:

┌───────┬───────┬───────┐      ┌───────────┬───────────┐
│ SQUAT │ HINGE │ PRESS │      │   UPPER   │   LOWER   │
├───────┼───────┼───────┤      ├───────────┴───────────┤
│ PULL  │ POWER │SURPRISE│     │       FULL BODY       │
└───────┴───────┴───────┘      └───────────────────────┘
```

### Anchor Definitions

| Anchor | Description | Primary Lift Examples |
|--------|-------------|----------------------|
| SQUAT | Knee-dominant lower body | Back Squat, Front Squat, Leg Press |
| HINGE | Hip-dominant lower body | Deadlift, Romanian Deadlift |
| PRESS | Upper body push | Bench Press, Strict Press, Push Press |
| PULL | Upper body pull | Barbell Row, Deadlift (also HINGE) |
| POWER | Explosive/Olympic movements | Power Clean, Squat Clean, Hang Clean, Thruster |
| SURPRISE | Random/varied focus | Any of the above |

**Note on Deadlift:** Deadlift can serve both HINGE and PULL anchors depending on workout context.

### Rule 2: Accessory depends on Primary Lift

| Primary Lift Selected? | Accessory Available? |
|------------------------|---------------------|
| ✓ Yes | ✓ Yes (visible, toggleable) |
| ✗ No | ✗ No (hidden or disabled) |

**Rationale:** Accessory work supports the primary lift. Without a primary lift, the concept of "accessory" doesn't apply — the workout becomes more general movement-based.

### Rule 3: Section selection flows through the app

```
Onboarding (Step 3)          Settings
        │                        │
        └──────────┬─────────────┘
                   ▼
         User's Section Preferences
                   │
                   ▼
         Generation Screen (Screen 1)
         - Anchor options adapt
         - Available sections shown
                   │
                   ▼
         Generated Workout
         - Only includes selected sections
         - Exercises match anchor + sections
```

---

## Goal Presets

Each goal preset auto-selects a recommended set of sections. Users can customize after selecting.

### Strength
Focus: Heavy lifts, longer rest, minimal cardio

**Default sections:**
- ✓ Warm-up
- ✓ Mobility
- ✓ Primary Lift
- ✓ Accessory
- ○ Skill / Power
- ○ Carries
- ✓ Core
- ○ Stability / Balance
- ○ Conditioning
- ✓ Cooldown

### Balanced
Focus: A little of everything

**Default sections:**
- ✓ Warm-up
- ✓ Mobility
- ✓ Primary Lift
- ✓ Accessory
- ○ Skill / Power
- ○ Carries
- ✓ Core
- ○ Stability / Balance
- ✓ Conditioning
- ✓ Cooldown

### Conditioning
Focus: Circuits, supersets, shorter rest

**Default sections:**
- ✓ Warm-up
- ✓ Mobility
- ○ Primary Lift
- ○ Accessory
- ○ Skill / Power
- ✓ Carries
- ✓ Core
- ✓ Stability / Balance
- ✓ Conditioning
- ✓ Cooldown

*Note: No Primary Lift = anchor changes to UPPER/LOWER/FULL BODY*

### Quick & Effective
Focus: Fewer sections, get in and out

**Default sections:**
- ✓ Warm-up
- ○ Mobility
- ✓ Primary Lift
- ○ Accessory
- ○ Skill / Power
- ○ Carries
- ✓ Core
- ○ Stability / Balance
- ○ Conditioning
- ✓ Cooldown

*Note: 4 sections only — respects time constraint*

---

## Future Considerations

1. **Equipment categorization** — If list grows, group by type (Cardio, Machines, Free Weights, Accessories)

2. **Section ordering** — Should users be able to reorder sections, or is order fixed?

3. **Custom presets** — Should users be able to save their own goal preset?

4. **Equipment-section dependencies** — Some sections may require certain equipment (e.g., Carries needs kettlebells/dumbbells)

---

*Content definitions updated: January 20, 2026*
