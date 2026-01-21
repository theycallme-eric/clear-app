# Clear - Exercise Library
**Created:** January 20, 2026  
**Status:** Initial Build (from workout notes)  
**Source:** User workout logs + expansion recommendations

---

## Overview

This library defines the canonical exercises for Clear's workout generation. Each exercise has:
- **Unique ID** (kebab-case)
- **Display Name**
- **Equipment Options**
- **Anchor(s)** it supports
- **Possible Sections** it can appear in
- **Can Be Primary** flag
- **Regression/Progression** where applicable

---

## Key Rules

1. **Barbell movements** → can be primary lift
2. **Leg Press** → can be primary lift (exception)
3. **All other equipment** (DB/KB/Cable/Machine/Bodyweight) → accessory only
4. **Primary lift exercises** can also be used as accessory (lighter load, don't duplicate exact movement in same workout)
5. **Bodyweight core/conditioning movements** → can also appear in Warm-up
6. **Deadlift** → can serve both HINGE and PULL anchors

---

## Anchors

| Anchor | Description |
|--------|-------------|
| SQUAT | Knee-dominant lower body |
| HINGE | Hip-dominant lower body |
| PRESS | Upper body push |
| PULL | Upper body pull |
| POWER | Explosive/Olympic movements |
| SURPRISE | Mixed/random focus |

**When Primary Lift not selected:** UPPER BODY, LOWER BODY, FULL BODY

---

## Sections

| Section | Description |
|---------|-------------|
| Warm-up | Light movement to prepare the body |
| Mobility | Focused flexibility and range of motion |
| Primary Lift | Main heavy movement of the workout |
| Accessory | Supporting work for the primary lift |
| Core | Midsection stability, rotation, anti-rotation |
| Conditioning | Cardio, circuits, higher-intensity finishers |
| Cooldown | Stretching and recovery |

---

## Exercise Library

### SQUAT Anchor

#### Primary Lift Eligible

| ID | Name | Equipment | Sections | Notes |
|----|------|-----------|----------|-------|
| back-squat | Back Squat | Barbell | Primary, Accessory | |
| front-squat | Front Squat | Barbell | Primary, Accessory | |
| leg-press | Leg Press | Machine | Primary, Accessory | Exception: machine but can be primary |
| sumo-squat | Sumo Squat (Straight Leg) | Barbell | Primary, Accessory | |

#### Accessory Only

| ID | Name | Equipment | Sections | Notes |
|----|------|-----------|----------|-------|
| goblet-squat | Goblet Squat | DB/KB | Accessory, Warm-up | |
| bulgarian-split-squat | Bulgarian Split Squat | DB | Accessory | |
| walking-lunges | Walking Lunges | DB | Accessory | |
| walking-lunges-oh | Walking Lunges (Overhead) | DB | Accessory | Also PRESS, POWER |
| reverse-lunges | Reverse Lunges | DB | Accessory | |
| goblet-reverse-lunges | Goblet Reverse Lunges | DB/KB | Accessory | |
| cossack-squat-weighted | Cossack Squat (Weighted) | DB/KB | Accessory | |
| box-step-ups | Box Step-ups | Box/DB | Accessory, Conditioning | |

---

### HINGE Anchor

#### Primary Lift Eligible

| ID | Name | Equipment | Sections | Notes |
|----|------|-----------|----------|-------|
| deadlift | Deadlift | Barbell | Primary, Accessory | Also PULL anchor |
| romanian-deadlift | Romanian Deadlift (RDL) | Barbell | Primary, Accessory | |

#### Accessory Only

| ID | Name | Equipment | Sections | Notes |
|----|------|-----------|----------|-------|
| db-rdl | Dumbbell RDL | DB | Accessory | |
| single-leg-rdl | Single-Leg RDL | DB/KB/Bodyweight | Accessory | |
| hip-thrust | Hip Thrust | Barbell/DB/Bodyweight | Accessory | Barbell version could be primary |
| glute-bridge | Glute Bridge | Bodyweight/DB | Accessory | |
| single-leg-glute-bridge | Single-Leg Glute Bridge (Hip Raise) | Bodyweight | Accessory, Core | Also Core section |
| kb-swing | Kettlebell Swing | KB | Accessory, Conditioning | |
| db-swing | Dumbbell Swing | DB | Accessory, Conditioning | |

---

### PRESS Anchor

#### Primary Lift Eligible

| ID | Name | Equipment | Sections | Notes |
|----|------|-----------|----------|-------|
| bench-press-flat | Bench Press (Flat) | Barbell | Primary, Accessory | |
| bench-press-incline | Bench Press (Incline) | Barbell | Primary, Accessory | |
| bench-press-decline | Bench Press (Decline) | Barbell | Primary, Accessory | |
| strict-press | Strict Press | Barbell | Primary, Accessory | |
| push-press | Push Press | Barbell | Primary, Accessory | |
| landmine-press | Landmine Press | Barbell | Primary, Accessory | |

#### Accessory Only

| ID | Name | Equipment | Sections | Notes |
|----|------|-----------|----------|-------|
| db-bench-press | Dumbbell Bench Press | DB | Accessory | |
| db-incline-press | Dumbbell Incline Press | DB | Accessory | |
| db-strict-press | Dumbbell Strict Press | DB | Accessory | |
| db-push-press | Dumbbell Push Press | DB | Accessory | |
| db-chest-flys | Dumbbell Chest Flys | DB | Accessory | |
| cable-chest-flys | Cable Chest Flys | Cable | Accessory | |
| tricep-extensions | Tricep Extensions | DB/KB/Cable | Accessory | |
| tricep-cable-pulldowns | Tricep Cable Pulldowns | Cable | Accessory | |
| lateral-raises | Lateral Raises | DB | Accessory | |
| frontal-raises | Frontal Raises | DB/Plate | Accessory | |
| dips | Dips | Bodyweight | Accessory | |
| push-ups | Push-ups | Bodyweight | Accessory, Conditioning, Warm-up | |
| decline-push-ups | Decline Push-ups | Bodyweight | Accessory, Conditioning | |
| renegade-push-ups | Renegade Push-ups | DB | Accessory, Conditioning | |

---

### PULL Anchor

#### Primary Lift Eligible

| ID | Name | Equipment | Sections | Notes |
|----|------|-----------|----------|-------|
| deadlift | Deadlift | Barbell | Primary, Accessory | Also HINGE anchor |
| barbell-row | Barbell Row (Bent Over) | Barbell | Primary, Accessory | Overhand or underhand |

#### Accessory Only

| ID | Name | Equipment | Sections | Notes |
|----|------|-----------|----------|-------|
| lat-pulldown | Lat Pulldown | Cable | Accessory | |
| cable-rows | Cable Rows | Cable | Accessory | |
| face-pulls | Face Pulls | Cable | Accessory | |
| rear-delt-flys | Rear Delt Flys | DB | Accessory | |
| shrugs | Shrugs | DB/Barbell | Accessory | |
| bicep-curls | Bicep Curls | DB | Accessory | |
| three-point-row | 3-Point Row | DB | Accessory | |
| pull-ups | Pull-ups | Bodyweight | Accessory | Strict or banded |
| assisted-pull-ups | Assisted Pull-ups | Machine | Accessory | |
| high-pulls | High Pulls | KB/DB | Accessory, Conditioning | |
| curl-to-press | Curl to Press | DB | Accessory | Also PRESS anchor |
| external-rotation | External Rotation | Cable/Band | Accessory | Rotator cuff |
| internal-rotation | Internal Rotation | Cable/Band | Accessory | Rotator cuff |

---

### POWER Anchor

#### Primary Lift Eligible

| ID | Name | Equipment | Sections | Notes |
|----|------|-----------|----------|-------|
| power-clean | Power Clean | Barbell | Primary, Accessory | |
| squat-clean | Squat Clean | Barbell | Primary, Accessory | |
| hang-clean | Hang Clean | Barbell | Primary, Accessory | |
| thruster | Thruster | Barbell | Primary, Accessory | |

#### Accessory Only

| ID | Name | Equipment | Sections | Notes |
|----|------|-----------|----------|-------|
| db-thruster | Dumbbell Thruster | DB | Accessory, Conditioning | |
| db-snatch | Dumbbell Snatch | DB | Accessory, Conditioning | |
| kb-snatch | Kettlebell Snatch | KB | Accessory, Conditioning | |
| sotts-press | Sotts Press | DB/KB | Accessory | OH press from squat bottom |
| walking-lunges-oh | Walking Lunges (Overhead) | DB | Accessory | Also SQUAT, PRESS |
| landmine-rotation | Landmine Rotation | Barbell | Accessory | |

---

### Core

All core movements are accessory-level (none are primary lifts).

| ID | Name | Equipment | Sections | Notes |
|----|------|-----------|----------|-------|
| russian-twists | Russian Twists | KB/SB/DB | Core | |
| bicycles | Bicycles | Bodyweight | Core, Warm-up, Conditioning | |
| flutter-kicks | Flutter Kicks | Bodyweight | Core, Warm-up, Conditioning | |
| leg-extensions-hollow | Leg Extensions (Hollow Hold) | DB/Bodyweight | Core, Warm-up, Conditioning | |
| mountain-cross-overs | Mountain Cross Overs | Bodyweight | Core, Warm-up, Conditioning | |
| skyscrapers | Skyscrapers | Bodyweight | Core, Warm-up, Conditioning | |
| hanging-knee-tucks | Hanging Knee Tucks | Bodyweight | Core, Warm-up, Conditioning | |
| hanging-knees-to-elbows | Hanging Knees to Elbows | Bodyweight | Core, Warm-up, Conditioning | Implies kip |
| toes-to-bar | Toes to Bar | Bodyweight | Core | |
| l-sit | L-Sit | Bodyweight | Core, Warm-up, Conditioning | |
| plank | Plank (High/Low) | Bodyweight | Core, Warm-up, Conditioning | |
| hollow-body-hold | Hollow Body Hold | Bodyweight | Core, Warm-up, Conditioning | |
| hollow-body-rocks | Hollow Body Rocks | Bodyweight | Core, Warm-up, Conditioning | |
| dead-bugs | Dead Bugs | Bodyweight | Core, Warm-up, Conditioning, Mobility | |
| bird-dogs | Bird Dogs | Bodyweight | Core, Warm-up, Conditioning, Mobility | |
| side-bends | Side Bends | DB | Core | |
| single-leg-hip-raise | Single-Leg Hip Raise | Bodyweight | Core, Accessory (HINGE) | Also HINGE accessory |
| toe-touches | Toe Touches | DB/SB/Bodyweight | Core | |
| sit-ups-weighted | Sit-ups (Weighted) | SB/DB | Core | |
| coffin-sit-up-throws | Coffin Sit-up Throws | SB | Core | |
| plank-hip-dips | Plank Hip Dips | Bodyweight | Core, Warm-up, Conditioning | |
| crunches | Crunches | Bodyweight | Core, Warm-up, Conditioning | |
| shoulder-taps | Shoulder Taps | Bodyweight | Core, Warm-up, Conditioning | |
| reach-backs | Reach Backs | Bodyweight | Core, Warm-up, Conditioning | |
| woodchops | Woodchops / Lumberjack Chops | DB/Cable | Core | |

---

### Conditioning

Movements primarily used in timed circuits, AMRAPs, EMOMs, etc.

| ID | Name | Equipment | Sections | Anchor (if also accessory) |
|----|------|-----------|----------|---------------------------|
| box-jumps | Box Jumps | Box | Conditioning, Warm-up | — |
| squat-jumps | Squat Jumps | Bodyweight | Conditioning, Warm-up | — |
| kb-swing | Kettlebell Swing | KB | Conditioning, Accessory | HINGE |
| db-swing | Dumbbell Swing | DB | Conditioning, Accessory | HINGE |
| high-pulls | High Pulls | KB/DB | Conditioning, Accessory | PULL |
| db-snatch | Dumbbell Snatch | DB | Conditioning, Accessory | POWER |
| kb-snatch | Kettlebell Snatch | KB | Conditioning, Accessory | POWER |
| hang-to-overhead | Hang to Overhead | DB/SB | Conditioning | — |
| squat-throws | Squat Throws | SB | Conditioning | — |
| sb-clean-to-overhead | Slam Ball Clean to Overhead | SB | Conditioning | — |
| burpees | Burpees | Bodyweight | Conditioning, Warm-up | — |
| box-step-ups | Box Step-ups | Box/DB | Conditioning, Accessory | SQUAT |
| low-box-runs | Low Box Runs | Box | Conditioning, Warm-up | — |
| up-and-overs | Up and Overs | Box | Conditioning, Warm-up | — |
| ground-to-jump-touch | Ground to Jump and Touch | Bodyweight | Conditioning, Warm-up | — |
| dl-jumps | Deadlift Jumps | SB | Conditioning | — |
| runners | Runners (High Knees) | Bodyweight | Conditioning, Warm-up | — |

---

### Warm-up / Mobility

Movements primarily used to prepare the body or improve range of motion.

| ID | Name | Equipment | Sections | Notes |
|----|------|-----------|----------|-------|
| squat-to-stand | Squat-to-Stand | Bodyweight | Warm-up, Mobility | |
| cossack-squat | Cossack Squat | Bodyweight | Warm-up, Mobility | Weighted = SQUAT accessory |
| samson-stretch | Samson Stretch | Bodyweight | Warm-up, Mobility | |
| air-squat | Air Squat | Bodyweight | Warm-up, Conditioning | |
| cat-cow | Cat-Cow | Bodyweight | Warm-up, Mobility | |
| leg-swings | Leg Swings | Bodyweight | Warm-up, Mobility | |
| arm-circles | Arm Circles | Bodyweight | Warm-up, Mobility | |
| hip-circles | Hip Circles | Bodyweight | Warm-up, Mobility | |
| worlds-greatest-stretch | World's Greatest Stretch | Bodyweight | Warm-up, Mobility | |
| pigeon-stretch | Pigeon Stretch | Bodyweight | Warm-up, Mobility, Cooldown | |
| couch-stretch | Couch Stretch | Bodyweight | Warm-up, Mobility, Cooldown | |
| 90-90-stretch | 90/90 Stretch | Bodyweight | Warm-up, Mobility, Cooldown | |
| thread-the-needle | Thread the Needle | Bodyweight | Warm-up, Mobility | |
| downward-dog | Downward Dog | Bodyweight | Warm-up, Mobility, Cooldown | |
| childs-pose | Child's Pose | Bodyweight | Warm-up, Mobility, Cooldown | |
| foam-rolling | Foam Rolling | Foam Roller | Warm-up, Cooldown | |

---

## Rep Scheme Structures

Captured from workout notes for AI generation reference.

| Structure | Format | Example | Description |
|-----------|--------|---------|-------------|
| Standard | Sets × Reps | 3×10 | Traditional strength format |
| Pyramid | Ascending/Descending reps | 10-8-6-4-2-4-6-8-10 | Reps change each set |
| Ladder | Ascending or descending | 10, 9, 8... 2, 1 | Countdown pattern |
| Inverse Ladder | Two movements, inverse reps | 10/1, 9/2, 8/3... | As one goes down, other goes up |
| EMOM | Every Minute On the Minute | 10 min EMOM: 4 reps | Fixed work, rest fills the minute |
| AMRAP | As Many Rounds As Possible | 7 min AMRAP | Max rounds in time |
| AFAP | As Fast As Possible | AFAP: 50 reps | Complete work, time is the measure |
| Timed Intervals | Work/Rest | 45s on / 15s off | Fixed intervals |
| Timed Circuit | Keep moving | 5 min alternate | No rep target, just keep moving |
| Time Cap | Target to beat | 7 min max | Complete work under time |
| Superset | Back-to-back | A SS B | Two movements, no rest between |
| Rounds | Circuit with reset | 3 rounds | Complete all movements, then rest |

---

## Equipment Reference

| ID | Display Name | Tier |
|----|--------------|------|
| bodyweight | Bodyweight | Minimal |
| resistance-bands | Resistance Bands | Minimal |
| mat | Mat | Minimal |
| foam-roller | Foam Roller | Minimal |
| dumbbells | Dumbbells | Home |
| kettlebells | Kettlebells | Home |
| bench-flat | Bench (Flat) | Home |
| pullup-bar | Pull-up Bar | Home |
| trx | TRX / Suspension Trainer | Home |
| treadmill | Treadmill | Home |
| box | Box | Home |
| slam-ball | Slam Ball / Medicine Ball | Home |
| barbell | Barbell | Building |
| squat-rack | Squat Rack / Cage | Building |
| cable-machine | Cable Machine | Building |
| bench-adjustable | Adjustable Bench | Building |
| lat-pulldown | Lat Pulldown Machine | Building |
| rowing-machine | Rowing Machine | Building |
| leg-press | Leg Press Machine | Full |
| smith-machine | Smith Machine | Full |
| hack-squat | Hack Squat Machine | Full |
| chest-press-machine | Chest Press Machine | Full |
| shoulder-press-machine | Shoulder Press Machine | Full |
| leg-curl-extension | Leg Curl / Extension Machines | Full |
| pec-deck | Pec Deck / Fly Machine | Full |
| assisted-pullup-dip | Assisted Pull-up/Dip Machine | Full |
| battle-ropes | Battle Ropes | Full |
| assault-bike | Assault Bike / Air Bike | Full |
| stair-climber | Stair Climber | Full |

---

## Notes for Expansion

This library is **seed data** based on one user's workout logs. It should be expanded to include:

1. **Additional squat variations:** Zercher squat, box squat, pause squat
2. **Additional hinge variations:** Good mornings, cable pull-throughs, Nordic curls
3. **Additional press variations:** Close-grip bench, Arnold press, Z-press
4. **Additional pull variations:** Meadows row, Pendlay row, chin-ups, inverted rows
5. **Additional power variations:** Clean and jerk, push jerk, split jerk
6. **Additional conditioning:** Assault bike intervals, rowing intervals, sled push/pull
7. **Additional mobility:** PNF stretching, banded stretches, specific yoga poses

The AI generation system should be able to suggest movements not in this library, but canonical exercises ensure consistent naming and historical tracking.

---

*Library created: January 20, 2026*
