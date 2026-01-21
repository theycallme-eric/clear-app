# Clear - Workout Generation Prompt Template
**Created:** January 21, 2026  
**Phase:** 3 - Workout Generation  
**Purpose:** Defines the prompt structure and few-shot examples for AI workout generation

---

## Overview

This document defines how the Clear app generates workouts using Claude API. It includes:
1. System prompt template
2. User prompt construction
3. Intensity-based workout rules
4. Few-shot examples for each intensity tier
5. Output schema

---

## System Prompt

```
You are a fitness coach generating personalized workouts for the Clear app. Your role is to create effective, safe, and appropriately challenging workouts based on user inputs.

CORE PRINCIPLES:
1. Respect the user's intensity level — this represents how much effort they want to exert today
2. Match exercises to available equipment only
3. Make warm-ups relevant to the anchor movement
4. Scale difficulty appropriately — intensity 1 is "I showed up", intensity 10 is "push my limits"
5. Keep workouts within the requested duration
6. Vary exercises from recent history to prevent staleness

INTENSITY MODEL:
- 1-3: Recovery/mobility focus. No primary lift. Gentle, low-impact movement. Think: "I'm sore from yesterday but want to move."
- 4: Light session. Primary lift with lighter loads. No conditioning finisher.
- 5-7: Standard session. Primary lift, accessory, core, conditioning finisher.
- 8-10: Push session. Heavier loads, challenging rep schemes, demanding conditioning.

WARM-UP RULES:
- Always anchor-relevant (SQUAT → hips/ankles/quads, HINGE → hamstrings/glutes/back, PRESS → shoulders/chest/triceps, PULL → lats/shoulders/grip, POWER → full body explosive prep)
- Intensity 1-4: Gentle, stretch-focused
- Intensity 5-7: Get blood moving, moderate heart rate elevation
- Intensity 8-10: Elevate heart rate, include dynamic movements (burpees, jumping jacks, high knees)

SECTION RULES:
- Conditioning finisher: Only at intensity 5+
- Core: Can appear in any workout regardless of anchor
- Accessory: Supports the primary lift, uses the anchor as a guide
- Primary Lift: Skip entirely at intensity 1-3

EQUIPMENT CONSTRAINTS:
- Only prescribe exercises the user can perform with their available equipment
- Offer regressions when appropriate for the user's experience level

OUTPUT FORMAT:
Return valid JSON matching the provided schema. No markdown, no explanation — just the JSON object.
```

---

## User Prompt Template

```
USER CONTEXT:
- Experience: {experience_level}
- Limitations: {limitations or "None"}
- Available equipment: {equipment_list}
- Enabled sections: {sections_list}

WORKOUT REQUEST:
- Intensity: {intensity}/10
- Anchor: {anchor}
- Duration: {duration_mins} minutes
- Location: {location_name}
- Notes: {user_notes or "None"}

RECENT HISTORY (avoid repeating):
- Last 3 anchors: {recent_anchors}
- Recent exercises to vary from: {recent_exercises}

Generate a workout matching these parameters. Return JSON only.
```

---

## Output Schema

```typescript
interface GeneratedWorkout {
  title: string;                    // e.g., "Moderate Hinge Focus"
  overview: string;                 // 2-3 sentence description
  estimated_duration_mins: number;
  intensity_description: string;    // e.g., "Standard session with conditioning finisher"
  
  sections: GeneratedSection[];
}

interface GeneratedSection {
  section_type: SectionType;
  section_title: string;            // e.g., "Warm-up" or "Primary Lift: Deadlift"
  section_notes: string | null;     // Optional coach notes for the section
  estimated_duration_mins: number;
  exercises: GeneratedExercise[];
}

interface GeneratedExercise {
  exercise_id: string;              // References canonical library
  name: string;                     // Display name
  equipment: string;                // Which equipment variant
  
  // Prescription
  sets: number | null;
  reps: string;                     // "8" or "30 sec" or "5 breaths" or "AMRAP"
  effort_percent: number | null;    // e.g., 70 for "@ 70%"
  tempo: string | null;             // e.g., "3-1-2" (eccentric-pause-concentric)
  rest_seconds: number | null;
  
  // Guidance
  coaching_cues: string[];          // 2-3 cues for form
  regression: string | null;        // Easier alternative if needed
  
  // Structure hints
  structure: ExerciseStructure;
}

type ExerciseStructure = 
  | { type: 'standard' }                                    // Regular sets × reps
  | { type: 'superset'; paired_with: string }              // Exercise ID it's paired with
  | { type: 'circuit'; circuit_id: string }                // Which circuit it belongs to
  | { type: 'emom'; minutes: number }                      // EMOM duration
  | { type: 'amrap'; minutes: number }                     // AMRAP duration
  | { type: 'ladder'; pattern: string }                    // e.g., "10-8-6-4-2"
  | { type: 'timed'; work_seconds: number; rest_seconds: number }  // Intervals

type SectionType = 
  | 'warmup' 
  | 'mobility' 
  | 'primary_lift' 
  | 'accessory'
  | 'core' 
  | 'conditioning' 
  | 'cooldown';
```

---

## Few-Shot Examples

### Example 1: Intensity 2, SQUAT Anchor, 25 min

**Input:**
```
USER CONTEXT:
- Experience: some
- Limitations: None
- Available equipment: bodyweight, mat, foam_roller, dumbbells, kettlebells
- Enabled sections: warmup, mobility, primary_lift, accessory, core, conditioning, cooldown

WORKOUT REQUEST:
- Intensity: 2/10
- Anchor: squat
- Duration: 25 minutes
- Location: Home Gym
- Notes: Legs are sore from hiking, want to recover actively
```

**Output:**
```json
{
  "title": "Active Recovery: Lower Body",
  "overview": "A gentle mobility session focused on your hips, ankles, and quads. No heavy lifting today — just movement to help you recover from your hike.",
  "estimated_duration_mins": 22,
  "intensity_description": "Recovery session — gentle movement, no primary lift",
  
  "sections": [
    {
      "section_type": "mobility",
      "section_title": "Lower Body Mobility Flow",
      "section_notes": "Move slowly, breathe deeply. This is about recovery, not intensity.",
      "estimated_duration_mins": 12,
      "exercises": [
        {
          "exercise_id": "foam-rolling",
          "name": "Foam Roll Quads & IT Band",
          "equipment": "foam_roller",
          "sets": 1,
          "reps": "90 sec each leg",
          "effort_percent": null,
          "tempo": null,
          "rest_seconds": null,
          "coaching_cues": ["Slow rolls, pause on tender spots", "Breathe through discomfort"],
          "regression": null,
          "structure": { "type": "standard" }
        },
        {
          "exercise_id": "squat-to-stand",
          "name": "Squat to Stand",
          "equipment": "bodyweight",
          "sets": 2,
          "reps": "8",
          "effort_percent": null,
          "tempo": "slow",
          "rest_seconds": 30,
          "coaching_cues": ["Hinge at hips on the way down", "Drive through heels to stand"],
          "regression": null,
          "structure": { "type": "standard" }
        },
        {
          "exercise_id": "cossack-squat",
          "name": "Cossack Squats",
          "equipment": "bodyweight",
          "sets": 2,
          "reps": "6 each side",
          "effort_percent": null,
          "tempo": "slow",
          "rest_seconds": 30,
          "coaching_cues": ["Keep heel down on working leg", "Chest up, sit deep"],
          "regression": "Hold onto something for balance",
          "structure": { "type": "standard" }
        },
        {
          "exercise_id": "worlds-greatest-stretch",
          "name": "World's Greatest Stretch",
          "equipment": "bodyweight",
          "sets": 2,
          "reps": "5 each side",
          "effort_percent": null,
          "tempo": "slow",
          "rest_seconds": null,
          "coaching_cues": ["Rotate through your thoracic spine", "Keep back knee off the ground"],
          "regression": "Back knee down",
          "structure": { "type": "standard" }
        }
      ]
    },
    {
      "section_type": "core",
      "section_title": "Gentle Core",
      "section_notes": "Low intensity — focus on control, not burn.",
      "estimated_duration_mins": 6,
      "exercises": [
        {
          "exercise_id": "dead-bugs",
          "name": "Dead Bugs",
          "equipment": "bodyweight",
          "sets": 2,
          "reps": "10 total",
          "effort_percent": null,
          "tempo": "slow",
          "rest_seconds": 30,
          "coaching_cues": ["Press lower back into floor", "Move opposite arm and leg"],
          "regression": null,
          "structure": { "type": "standard" }
        },
        {
          "exercise_id": "bird-dogs",
          "name": "Bird Dogs",
          "equipment": "bodyweight",
          "sets": 2,
          "reps": "8 each side",
          "effort_percent": null,
          "tempo": "slow",
          "rest_seconds": 30,
          "coaching_cues": ["Keep hips level", "Reach long, not high"],
          "regression": null,
          "structure": { "type": "standard" }
        }
      ]
    },
    {
      "section_type": "cooldown",
      "section_title": "Cooldown",
      "section_notes": null,
      "estimated_duration_mins": 4,
      "exercises": [
        {
          "exercise_id": "pigeon-stretch",
          "name": "Pigeon Stretch",
          "equipment": "bodyweight",
          "sets": 1,
          "reps": "60 sec each side",
          "effort_percent": null,
          "tempo": null,
          "rest_seconds": null,
          "coaching_cues": ["Relax into it", "Breathe deeply"],
          "regression": "Figure-4 stretch on back",
          "structure": { "type": "standard" }
        },
        {
          "exercise_id": "childs-pose",
          "name": "Child's Pose",
          "equipment": "bodyweight",
          "sets": 1,
          "reps": "60 sec",
          "effort_percent": null,
          "tempo": null,
          "rest_seconds": null,
          "coaching_cues": ["Sink hips back", "Reach arms forward"],
          "regression": null,
          "structure": { "type": "standard" }
        }
      ]
    }
  ]
}
```

---

### Example 2: Intensity 6, HINGE Anchor, 45 min

**Input:**
```
USER CONTEXT:
- Experience: confident
- Limitations: None
- Available equipment: bodyweight, mat, dumbbells, kettlebells, barbell, squat_rack, bench_adjustable
- Enabled sections: warmup, mobility, primary_lift, accessory, core, conditioning, cooldown

WORKOUT REQUEST:
- Intensity: 6/10
- Anchor: hinge
- Duration: 45 minutes
- Location: Building Gym
- Notes: None
```

**Output:**
```json
{
  "title": "Hinge Focus: Deadlift Day",
  "overview": "A solid deadlift session with accessory work to build your posterior chain. Finishes with a quick conditioning piece to elevate your heart rate.",
  "estimated_duration_mins": 44,
  "intensity_description": "Standard session with conditioning finisher",
  
  "sections": [
    {
      "section_type": "warmup",
      "section_title": "Warm-up",
      "section_notes": "Get your hamstrings and glutes firing before we load the barbell.",
      "estimated_duration_mins": 6,
      "exercises": [
        {
          "exercise_id": "air-squat",
          "name": "Air Squats",
          "equipment": "bodyweight",
          "sets": 1,
          "reps": "15",
          "effort_percent": null,
          "tempo": null,
          "rest_seconds": null,
          "coaching_cues": ["Full depth", "Chest up"],
          "regression": null,
          "structure": { "type": "standard" }
        },
        {
          "exercise_id": "single-leg-rdl",
          "name": "Single-Leg RDL (Bodyweight)",
          "equipment": "bodyweight",
          "sets": 2,
          "reps": "8 each side",
          "effort_percent": null,
          "tempo": "controlled",
          "rest_seconds": null,
          "coaching_cues": ["Hinge at hips", "Keep back flat", "Feel the hamstring stretch"],
          "regression": "Hold onto something for balance",
          "structure": { "type": "standard" }
        },
        {
          "exercise_id": "glute-bridge",
          "name": "Glute Bridges",
          "equipment": "bodyweight",
          "sets": 2,
          "reps": "12",
          "effort_percent": null,
          "tempo": "squeeze at top",
          "rest_seconds": null,
          "coaching_cues": ["Drive through heels", "Squeeze glutes at top"],
          "regression": null,
          "structure": { "type": "standard" }
        }
      ]
    },
    {
      "section_type": "primary_lift",
      "section_title": "Primary Lift: Deadlift",
      "section_notes": "Build to a moderate working weight. Focus on form — flat back, tight lats.",
      "estimated_duration_mins": 15,
      "exercises": [
        {
          "exercise_id": "deadlift",
          "name": "Barbell Deadlift",
          "equipment": "barbell",
          "sets": 5,
          "reps": "5",
          "effort_percent": 70,
          "tempo": null,
          "rest_seconds": 120,
          "coaching_cues": ["Brace your core", "Pull the slack out of the bar", "Drive through the floor"],
          "regression": "Trap bar deadlift",
          "structure": { "type": "standard" }
        }
      ]
    },
    {
      "section_type": "accessory",
      "section_title": "Accessory Work",
      "section_notes": "Superset these two movements to save time.",
      "estimated_duration_mins": 10,
      "exercises": [
        {
          "exercise_id": "db-rdl",
          "name": "Dumbbell Romanian Deadlift",
          "equipment": "dumbbells",
          "sets": 3,
          "reps": "10",
          "effort_percent": null,
          "tempo": "3-1-1",
          "rest_seconds": null,
          "coaching_cues": ["Soft knees", "Hinge until you feel hamstring stretch", "Squeeze glutes to stand"],
          "regression": null,
          "structure": { "type": "superset", "paired_with": "barbell-row" }
        },
        {
          "exercise_id": "barbell-row",
          "name": "Barbell Bent-Over Row",
          "equipment": "barbell",
          "sets": 3,
          "reps": "8",
          "effort_percent": null,
          "tempo": null,
          "rest_seconds": 90,
          "coaching_cues": ["Flat back, hinged over", "Pull to belly button", "Squeeze shoulder blades"],
          "regression": "Dumbbell row",
          "structure": { "type": "superset", "paired_with": "db-rdl" }
        }
      ]
    },
    {
      "section_type": "core",
      "section_title": "Core",
      "section_notes": null,
      "estimated_duration_mins": 5,
      "exercises": [
        {
          "exercise_id": "plank",
          "name": "Plank Hold",
          "equipment": "bodyweight",
          "sets": 3,
          "reps": "30 sec",
          "effort_percent": null,
          "tempo": null,
          "rest_seconds": 30,
          "coaching_cues": ["Squeeze glutes", "Don't let hips sag"],
          "regression": "Knees down",
          "structure": { "type": "standard" }
        },
        {
          "exercise_id": "russian-twists",
          "name": "Russian Twists",
          "equipment": "kettlebells",
          "sets": 2,
          "reps": "20 total",
          "effort_percent": null,
          "tempo": null,
          "rest_seconds": 30,
          "coaching_cues": ["Lean back slightly", "Rotate from your torso, not just arms"],
          "regression": "Feet on ground",
          "structure": { "type": "standard" }
        }
      ]
    },
    {
      "section_type": "conditioning",
      "section_title": "Conditioning Finisher",
      "section_notes": "Quick burner — keep moving, rest as needed.",
      "estimated_duration_mins": 6,
      "exercises": [
        {
          "exercise_id": "kb-swing",
          "name": "Kettlebell Swings",
          "equipment": "kettlebells",
          "sets": null,
          "reps": "15",
          "effort_percent": null,
          "tempo": null,
          "rest_seconds": null,
          "coaching_cues": ["Hip hinge, not squat", "Snap hips forward"],
          "regression": null,
          "structure": { "type": "ladder", "pattern": "15-12-9-6-3" }
        },
        {
          "exercise_id": "burpees",
          "name": "Burpees",
          "equipment": "bodyweight",
          "sets": null,
          "reps": "5",
          "effort_percent": null,
          "tempo": null,
          "rest_seconds": null,
          "coaching_cues": ["Chest to floor", "Jump with intent"],
          "regression": "Step back instead of jump",
          "structure": { "type": "ladder", "pattern": "5-4-3-2-1" }
        }
      ]
    },
    {
      "section_type": "cooldown",
      "section_title": "Cooldown",
      "section_notes": null,
      "estimated_duration_mins": 2,
      "exercises": [
        {
          "exercise_id": "downward-dog",
          "name": "Downward Dog",
          "equipment": "bodyweight",
          "sets": 1,
          "reps": "60 sec",
          "effort_percent": null,
          "tempo": null,
          "rest_seconds": null,
          "coaching_cues": ["Press heels toward floor", "Relax your neck"],
          "regression": null,
          "structure": { "type": "standard" }
        }
      ]
    }
  ]
}
```

---

### Example 3: Intensity 9, PRESS Anchor, 55 min

**Input:**
```
USER CONTEXT:
- Experience: confident
- Limitations: None
- Available equipment: bodyweight, mat, dumbbells, kettlebells, barbell, squat_rack, bench_adjustable, cable_machine
- Enabled sections: warmup, mobility, primary_lift, accessory, core, conditioning, cooldown

WORKOUT REQUEST:
- Intensity: 9/10
- Anchor: press
- Duration: 55 minutes
- Location: Building Gym
- Notes: Feeling strong today, want to push it
```

**Output:**
```json
{
  "title": "High Intensity Press Day",
  "overview": "Heavy bench press with challenging accessory work. The conditioning finisher will test your upper body endurance. You asked to push it — here it is.",
  "estimated_duration_mins": 54,
  "intensity_description": "Push session — heavy loads, demanding conditioning",
  
  "sections": [
    {
      "section_type": "warmup",
      "section_title": "Warm-up",
      "section_notes": "Get your shoulders warm and heart rate up before we go heavy.",
      "estimated_duration_mins": 7,
      "exercises": [
        {
          "exercise_id": "arm-circles",
          "name": "Arm Circles",
          "equipment": "bodyweight",
          "sets": 1,
          "reps": "20 each direction",
          "effort_percent": null,
          "tempo": null,
          "rest_seconds": null,
          "coaching_cues": ["Start small, get bigger"],
          "regression": null,
          "structure": { "type": "standard" }
        },
        {
          "exercise_id": "push-ups",
          "name": "Push-ups",
          "equipment": "bodyweight",
          "sets": 2,
          "reps": "12",
          "effort_percent": null,
          "tempo": null,
          "rest_seconds": 30,
          "coaching_cues": ["Full range of motion", "Core tight"],
          "regression": "Knees down",
          "structure": { "type": "standard" }
        },
        {
          "exercise_id": "burpees",
          "name": "Burpees",
          "equipment": "bodyweight",
          "sets": 2,
          "reps": "8",
          "effort_percent": null,
          "tempo": null,
          "rest_seconds": 30,
          "coaching_cues": ["Chest to floor", "Explode up"],
          "regression": null,
          "structure": { "type": "standard" }
        },
        {
          "exercise_id": "band-pull-aparts",
          "name": "Band Pull-Aparts",
          "equipment": "resistance_bands",
          "sets": 2,
          "reps": "15",
          "effort_percent": null,
          "tempo": null,
          "rest_seconds": null,
          "coaching_cues": ["Squeeze shoulder blades", "Control the return"],
          "regression": null,
          "structure": { "type": "standard" }
        }
      ]
    },
    {
      "section_type": "primary_lift",
      "section_title": "Primary Lift: Bench Press",
      "section_notes": "Working heavy today. Build to your working weight with 2 warm-up sets.",
      "estimated_duration_mins": 18,
      "exercises": [
        {
          "exercise_id": "bench-press-flat",
          "name": "Barbell Bench Press",
          "equipment": "barbell",
          "sets": 5,
          "reps": "5",
          "effort_percent": 85,
          "tempo": null,
          "rest_seconds": 180,
          "coaching_cues": ["Arch your back slightly", "Bar to chest", "Drive feet into floor"],
          "regression": "Dumbbell bench press",
          "structure": { "type": "standard" }
        }
      ]
    },
    {
      "section_type": "accessory",
      "section_title": "Accessory Work",
      "section_notes": "Volume work to build your press. Push through the burn.",
      "estimated_duration_mins": 12,
      "exercises": [
        {
          "exercise_id": "db-incline-press",
          "name": "Dumbbell Incline Press",
          "equipment": "dumbbells",
          "sets": 4,
          "reps": "8",
          "effort_percent": null,
          "tempo": "2-0-1",
          "rest_seconds": 75,
          "coaching_cues": ["Control the descent", "Full stretch at bottom"],
          "regression": null,
          "structure": { "type": "standard" }
        },
        {
          "exercise_id": "cable-chest-flys",
          "name": "Cable Chest Flys",
          "equipment": "cable_machine",
          "sets": 3,
          "reps": "12",
          "effort_percent": null,
          "tempo": "squeeze at center",
          "rest_seconds": 60,
          "coaching_cues": ["Slight bend in elbows", "Squeeze chest at the center"],
          "regression": "Dumbbell flys",
          "structure": { "type": "standard" }
        },
        {
          "exercise_id": "tricep-cable-pulldowns",
          "name": "Tricep Cable Pulldowns",
          "equipment": "cable_machine",
          "sets": 3,
          "reps": "12",
          "effort_percent": null,
          "tempo": null,
          "rest_seconds": 60,
          "coaching_cues": ["Elbows pinned to sides", "Full extension"],
          "regression": null,
          "structure": { "type": "standard" }
        }
      ]
    },
    {
      "section_type": "core",
      "section_title": "Core",
      "section_notes": "Quick and intense.",
      "estimated_duration_mins": 5,
      "exercises": [
        {
          "exercise_id": "plank",
          "name": "High Plank",
          "equipment": "bodyweight",
          "sets": null,
          "reps": null,
          "effort_percent": null,
          "tempo": null,
          "rest_seconds": null,
          "coaching_cues": ["Squeeze everything", "Don't let hips drop"],
          "regression": null,
          "structure": { "type": "emom", "minutes": 5 }
        },
        {
          "exercise_id": "shoulder-taps",
          "name": "Shoulder Taps",
          "equipment": "bodyweight",
          "sets": null,
          "reps": "10",
          "effort_percent": null,
          "tempo": null,
          "rest_seconds": null,
          "coaching_cues": ["Minimize hip rotation", "Controlled taps"],
          "regression": null,
          "structure": { "type": "emom", "minutes": 5 }
        }
      ]
    },
    {
      "section_type": "conditioning",
      "section_title": "Conditioning Finisher",
      "section_notes": "8 minute AMRAP. Push hard — this is what you came for.",
      "estimated_duration_mins": 8,
      "exercises": [
        {
          "exercise_id": "push-ups",
          "name": "Push-ups",
          "equipment": "bodyweight",
          "sets": null,
          "reps": "10",
          "effort_percent": null,
          "tempo": null,
          "rest_seconds": null,
          "coaching_cues": ["Chest to floor", "Full lockout"],
          "regression": "Knees down",
          "structure": { "type": "amrap", "minutes": 8 }
        },
        {
          "exercise_id": "db-push-press",
          "name": "Dumbbell Push Press",
          "equipment": "dumbbells",
          "sets": null,
          "reps": "8",
          "effort_percent": null,
          "tempo": null,
          "rest_seconds": null,
          "coaching_cues": ["Dip and drive", "Lock out overhead"],
          "regression": "Strict press",
          "structure": { "type": "amrap", "minutes": 8 }
        },
        {
          "exercise_id": "box-jumps",
          "name": "Box Jumps",
          "equipment": "box",
          "sets": null,
          "reps": "6",
          "effort_percent": null,
          "tempo": null,
          "rest_seconds": null,
          "coaching_cues": ["Land soft", "Step down"],
          "regression": "Step-ups",
          "structure": { "type": "amrap", "minutes": 8 }
        }
      ]
    },
    {
      "section_type": "cooldown",
      "section_title": "Cooldown",
      "section_notes": "You earned this. Breathe.",
      "estimated_duration_mins": 4,
      "exercises": [
        {
          "exercise_id": "thread-the-needle",
          "name": "Thread the Needle",
          "equipment": "bodyweight",
          "sets": 1,
          "reps": "8 each side",
          "effort_percent": null,
          "tempo": "slow",
          "rest_seconds": null,
          "coaching_cues": ["Rotate through thoracic spine", "Follow your hand with your eyes"],
          "regression": null,
          "structure": { "type": "standard" }
        },
        {
          "exercise_id": "childs-pose",
          "name": "Child's Pose",
          "equipment": "bodyweight",
          "sets": 1,
          "reps": "60 sec",
          "effort_percent": null,
          "tempo": null,
          "rest_seconds": null,
          "coaching_cues": ["Sink hips back", "Relax completely"],
          "regression": null,
          "structure": { "type": "standard" }
        }
      ]
    }
  ]
}
```

---

### Example 4: Intensity 5, PULL Anchor, 40 min

**Input:**
```
USER CONTEXT:
- Experience: some
- Limitations: Bad left shoulder — avoid overhead movements
- Available equipment: bodyweight, mat, dumbbells, kettlebells, cable_machine, lat_pulldown
- Enabled sections: warmup, primary_lift, accessory, core, conditioning, cooldown

WORKOUT REQUEST:
- Intensity: 5/10
- Anchor: pull
- Duration: 40 minutes
- Location: Building Gym
- Notes: None
```

**Output:**
```json
{
  "title": "Moderate Pull Day",
  "overview": "Building your back and biceps with horizontal pulls — no overhead work today to respect your shoulder. Conditioning finisher keeps it moving.",
  "estimated_duration_mins": 39,
  "intensity_description": "Standard session with conditioning finisher",
  
  "sections": [
    {
      "section_type": "warmup",
      "section_title": "Warm-up",
      "section_notes": "Get your lats and upper back activated. No overhead reaching.",
      "estimated_duration_mins": 5,
      "exercises": [
        {
          "exercise_id": "cat-cow",
          "name": "Cat-Cow",
          "equipment": "bodyweight",
          "sets": 1,
          "reps": "10",
          "effort_percent": null,
          "tempo": "slow",
          "rest_seconds": null,
          "coaching_cues": ["Breathe into the movement", "Full range of motion"],
          "regression": null,
          "structure": { "type": "standard" }
        },
        {
          "exercise_id": "band-pull-aparts",
          "name": "Band Pull-Aparts",
          "equipment": "resistance_bands",
          "sets": 2,
          "reps": "15",
          "effort_percent": null,
          "tempo": null,
          "rest_seconds": null,
          "coaching_cues": ["Squeeze shoulder blades together", "Arms stay straight"],
          "regression": null,
          "structure": { "type": "standard" }
        },
        {
          "exercise_id": "dead-bugs",
          "name": "Dead Bugs",
          "equipment": "bodyweight",
          "sets": 1,
          "reps": "10 total",
          "effort_percent": null,
          "tempo": null,
          "rest_seconds": null,
          "coaching_cues": ["Press lower back into floor", "Controlled movement"],
          "regression": null,
          "structure": { "type": "standard" }
        }
      ]
    },
    {
      "section_type": "primary_lift",
      "section_title": "Primary Lift: Cable Rows",
      "section_notes": "Horizontal pull focus — safe for your shoulder. Build to a challenging weight.",
      "estimated_duration_mins": 12,
      "exercises": [
        {
          "exercise_id": "cable-rows",
          "name": "Seated Cable Row",
          "equipment": "cable_machine",
          "sets": 4,
          "reps": "10",
          "effort_percent": 70,
          "tempo": "2-1-2",
          "rest_seconds": 90,
          "coaching_cues": ["Sit tall, chest up", "Pull to belly button", "Squeeze at the back"],
          "regression": null,
          "structure": { "type": "standard" }
        }
      ]
    },
    {
      "section_type": "accessory",
      "section_title": "Accessory Work",
      "section_notes": "More horizontal pulling and bicep work.",
      "estimated_duration_mins": 10,
      "exercises": [
        {
          "exercise_id": "three-point-row",
          "name": "3-Point Dumbbell Row",
          "equipment": "dumbbells",
          "sets": 3,
          "reps": "10 each side",
          "effort_percent": null,
          "tempo": null,
          "rest_seconds": 60,
          "coaching_cues": ["Flat back", "Pull elbow to hip", "Control the lower"],
          "regression": null,
          "structure": { "type": "standard" }
        },
        {
          "exercise_id": "face-pulls",
          "name": "Face Pulls",
          "equipment": "cable_machine",
          "sets": 3,
          "reps": "15",
          "effort_percent": null,
          "tempo": null,
          "rest_seconds": 60,
          "coaching_cues": ["Pull to face level", "Externally rotate at the end"],
          "regression": null,
          "structure": { "type": "standard" }
        },
        {
          "exercise_id": "bicep-curls",
          "name": "Dumbbell Bicep Curls",
          "equipment": "dumbbells",
          "sets": 2,
          "reps": "12",
          "effort_percent": null,
          "tempo": null,
          "rest_seconds": 45,
          "coaching_cues": ["Control the negative", "No swinging"],
          "regression": null,
          "structure": { "type": "standard" }
        }
      ]
    },
    {
      "section_type": "core",
      "section_title": "Core",
      "section_notes": null,
      "estimated_duration_mins": 4,
      "exercises": [
        {
          "exercise_id": "plank",
          "name": "Plank Hold",
          "equipment": "bodyweight",
          "sets": 3,
          "reps": "30 sec",
          "effort_percent": null,
          "tempo": null,
          "rest_seconds": 20,
          "coaching_cues": ["Squeeze glutes", "Breathe steadily"],
          "regression": "Knees down",
          "structure": { "type": "standard" }
        }
      ]
    },
    {
      "section_type": "conditioning",
      "section_title": "Conditioning Finisher",
      "section_notes": "5 minute AMRAP — keep it moving, no overhead.",
      "estimated_duration_mins": 5,
      "exercises": [
        {
          "exercise_id": "kb-swing",
          "name": "Kettlebell Swings",
          "equipment": "kettlebells",
          "sets": null,
          "reps": "12",
          "effort_percent": null,
          "tempo": null,
          "rest_seconds": null,
          "coaching_cues": ["Hip hinge", "Snap hips forward"],
          "regression": null,
          "structure": { "type": "amrap", "minutes": 5 }
        },
        {
          "exercise_id": "three-point-row",
          "name": "3-Point Row (Light)",
          "equipment": "dumbbells",
          "sets": null,
          "reps": "8 each side",
          "effort_percent": null,
          "tempo": null,
          "rest_seconds": null,
          "coaching_cues": ["Fast but controlled"],
          "regression": null,
          "structure": { "type": "amrap", "minutes": 5 }
        }
      ]
    },
    {
      "section_type": "cooldown",
      "section_title": "Cooldown",
      "section_notes": null,
      "estimated_duration_mins": 3,
      "exercises": [
        {
          "exercise_id": "thread-the-needle",
          "name": "Thread the Needle",
          "equipment": "bodyweight",
          "sets": 1,
          "reps": "6 each side",
          "effort_percent": null,
          "tempo": "slow",
          "rest_seconds": null,
          "coaching_cues": ["Rotate through upper back", "Keep hips stacked"],
          "regression": null,
          "structure": { "type": "standard" }
        },
        {
          "exercise_id": "childs-pose",
          "name": "Child's Pose",
          "equipment": "bodyweight",
          "sets": 1,
          "reps": "45 sec",
          "effort_percent": null,
          "tempo": null,
          "rest_seconds": null,
          "coaching_cues": ["Relax and breathe"],
          "regression": null,
          "structure": { "type": "standard" }
        }
      ]
    }
  ]
}
```

---

## Implementation Notes for Claude Code

### 1. Prompt Construction
Build the user prompt dynamically from:
- User profile (experience, limitations, enabled sections)
- Location (equipment list)
- Generation inputs (intensity, anchor, duration, notes)
- Recent workout history (last 3-5 sessions for variety)

### 2. Validation
After receiving Claude's response:
- Verify all `exercise_id` values exist in the Exercise Library
- Verify equipment matches what's available at the location
- Verify section types match user's enabled sections
- Verify estimated duration is within ±10% of requested duration

### 3. Error Handling
If validation fails:
- Retry once with clarification in the prompt
- If still failing, return error to user with option to regenerate

### 4. Prompt Versioning
Store `prompt_version` with each generated workout for debugging and iteration:
- Start with `v1.0.0`
- Increment minor version for prompt tweaks
- Increment major version for schema changes

---

## Anchor-Specific Warm-up Guidelines

| Anchor | Focus Areas | Example Movements |
|--------|-------------|-------------------|
| SQUAT | Hips, ankles, quads | Air squats, squat-to-stand, leg swings, cossack squats |
| HINGE | Hamstrings, glutes, lower back | Glute bridges, single-leg RDL, good mornings, hip circles |
| PRESS | Shoulders, chest, triceps | Arm circles, band pull-aparts, push-ups, shoulder dislocates |
| PULL | Lats, upper back, grip | Cat-cow, band pull-aparts, dead hangs, scap pull-ups |
| POWER | Full body, explosive prep | Jumping jacks, burpees, high knees, box jumps (low) |

---

## Rep Scheme Guidelines by Intensity

| Intensity | Primary Lift | Accessory | Conditioning |
|-----------|--------------|-----------|--------------|
| 1-3 | None | None | None |
| 4 | 3x8-10 @ moderate | 2-3 sets, higher reps | None |
| 5-6 | 4x6-8 @ 65-70% | 3 sets, moderate reps | 5-8 min AMRAP or ladder |
| 7-8 | 5x5 @ 75-80% | 3-4 sets, varied | 6-10 min AMRAP or EMOM |
| 9-10 | 5x3-5 @ 85%+ | 4 sets, push volume | 8-12 min demanding AMRAP |

---

*Document ready for Claude Code implementation*
