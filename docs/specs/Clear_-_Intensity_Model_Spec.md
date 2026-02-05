# Clear — Intensity Model Spec

> **Status:** STABLE  
> **Last Updated:** February 3, 2026  
> **Purpose:** Source of truth for how intensity (1-10) affects workout generation

---

## Overview

Intensity is a 1-10 scale that represents how much effort the user wants to exert today. It does **not** control which sections or structures appear — it controls the **content** within each section.

**Core principle:** Every workout has the same structural skeleton. Intensity dials the difficulty within each section.

---

## What Intensity Controls

1. **Movement difficulty** — Which exercises are selected
2. **Rep count** — How many reps per set/round/minute
3. **Load/weight** — Percentage of working capacity
4. **Time caps** — Generous vs aggressive pacing targets
5. **Section scaling** — Vibe and volume within each section

---

## 1. Movement Difficulty

Intensity determines which exercises are appropriate. Scales quickly from gentle to demanding.

| Intensity | Movement Selection | Examples |
|-----------|-------------------|----------|
| 1-2 | Gentle, low-impact | Inchworms, bodyweight squats, glute bridges, bird dogs, cat-cow |
| 3-4 | Moderate complexity | Goblet squats, DB RDL, push-ups, lunges, kettlebell deadlifts |
| 5-7 | Full range | Barbell lifts, kettlebell swings, box jumps, pull-ups |
| 8-10 | Most demanding available | Power cleans, burpees, heavy compounds, plyometrics, barbell complexes |

**AI guidance:** At low intensity, prefer regressions even if the user has equipment for harder variations. At high intensity, use the most challenging variation the user's equipment and experience allows.

---

## 2. Rep Count

Reps scale with intensity, but the direction depends on the structure and section.

| Intensity | EMOM (per minute) | AMRAP (per round) | Circuit (per movement) | Standard (per set) |
|-----------|------------------|-------------------|----------------------|-------------------|
| 1-2 | 5-6 easy reps | 5-8 reps | 6-10 reps | 10-15 reps (light) |
| 3-4 | 6-8 reps | 8-10 reps | 8-12 reps | 8-12 reps |
| 5-7 | 8-10 reps | 10-12 reps | 10-15 reps | 6-10 reps |
| 8-10 | 10-12 reps | 12-15 reps | 12-20 reps | 3-6 reps (heavy) |

**Note:** Standard structure flips — low intensity uses higher reps with light weight (endurance/movement focus), high intensity uses lower reps with heavy weight (strength focus).

---

## 3. Load/Weight

Percentage of the user's working capacity for that movement.

| Intensity | Effort % | Description |
|-----------|----------|-------------|
| 1-2 | 0-40% | Bodyweight or very light. "Barely working." |
| 3-4 | 40-60% | Light. "Warming up." |
| 5-6 | 60-70% | Moderate. "Working but comfortable." |
| 7-8 | 70-80% | Challenging. "Last reps are hard." |
| 9-10 | 80-90%+ | Heavy to near max. "Grinding." |

**AI guidance:** Weight suggestions should reference user history with context (see Structure Types Spec → Weight Recommendation Logic). At intensity 1-3, default to bodyweight or lightest available option regardless of history.

---

## 4. Time Caps

For Time (FT) sections use time caps. The aggressiveness of the cap scales with intensity.

| Intensity | Time Cap Approach | User Experience |
|-----------|------------------|-----------------|
| 1-2 | Generous or no cap | Not a race — move at your own pace |
| 3-4 | Comfortable | Should finish with time to spare |
| 5-7 | Moderate | Should complete, might need to push |
| 8-10 | Aggressive | Need to push hard, may not finish under cap |

**AI guidance:** At intensity 8+, it's acceptable for the user to hit the cap without finishing. That's the challenge.

---

## 5. Section Scaling

Every section appears at every intensity. The vibe and volume within each section scales.

| Section | Intensity 1-2 | Intensity 3-4 | Intensity 5-7 | Intensity 8-10 |
|---------|---------------|---------------|---------------|----------------|
| **Warm-up** | Gentle, stretch-focused | Light movement | Blood flowing, moderate HR elevation | Elevate HR, dynamic movements |
| **Primary Lift** | Light, skill/form focus | Moderate load, technique | Working weight, build strength | Heavy, push limits |
| **Accessory** | Minimal volume (1-2 exercises) | Light volume (2-3 exercises) | Standard volume (2-4 exercises) | Higher volume (3-4 exercises) |
| **Core** | Gentle stability work | Light effort | Moderate challenge | Demanding |
| **Conditioning** | Easy pace, movement focus | Light effort, keep moving | Steady effort | Push/race |
| **Cooldown** | Standard | Standard | Standard | Standard |

**Cooldown note:** Cooldown duration stays consistent regardless of intensity. It's important for recovery, and users can skip if they choose.

---

## Primary Lift at Low Intensity

At intensity 1-2, the primary lift section still exists, but the goal shifts from load to movement quality.

**Example — Intensity 2, Squat anchor:**

```
Primary Lift: Goblet Squat
3×8 @ light weight
Section note: "Focus on depth and control. This isn't about load today."
```

**Example — Intensity 9, Squat anchor:**

```
Primary Lift: Back Squat
5×3 @ 85%
Section note: "Heavy singles. Full rest between sets. Focus and brace."
```

---

## Intensity Descriptions

Use these descriptions in the workout `intensity_description` field:

| Intensity | Description |
|-----------|-------------|
| 1 | Recovery session — gentle movement, minimal effort |
| 2 | Recovery session — easy movement, focus on mobility |
| 3 | Light session — low effort, movement quality focus |
| 4 | Light session — moderate movement, building warmth |
| 5 | Standard session — working effort, sustainable pace |
| 6 | Standard session — solid effort, moderate challenge |
| 7 | Challenging session — pushing effort, feeling the work |
| 8 | Push session — demanding effort, testing limits |
| 9 | Push session — high effort, heavy and fast |
| 10 | Max effort session — leave nothing in the tank |

---

## Combining Intensity with Structures

Intensity modifies content **within** any structure. The structure itself is chosen based on section type and workout goals, not intensity.

**EMOM at Intensity 2:**
> 8 min EMOM: 5 inchworms per minute
> "Easy pace. Rest fills the minute. Focus on the stretch."

**EMOM at Intensity 9:**
> 8 min EMOM: 10 burpees per minute
> "This should be hard to sustain. Push through."

**Tabata (EMOM variant):**
Tabata is a specific EMOM format: 20s work / 10s rest for 8 rounds (4 minutes total). It does not require a separate structure type or schema flag — prescribe it as an EMOM with the interval pattern noted in `section_notes`:
> 4 min EMOM (Tabata): 20s max effort KB swings, 10s rest
> "All-out effort each round. The rest is short — embrace the burn."

**Circuit at Intensity 3:**
> 3 rounds: 8 goblet squats, 8 push-ups, 8 ring rows
> "Keep moving, stay loose. Light effort."

**Circuit at Intensity 8:**
> 4 rounds: 15 KB swings, 12 burpees, 10 box jumps
> "Minimal rest. Push the pace."

---

## Rep Scheme Interaction

Rep schemes (ladder, pyramid, n+1) can appear at any intensity. Intensity affects the rep numbers within the scheme.

**Ladder at Intensity 4:**
> 10-8-6-4-2 goblet squats + push-ups

**Ladder at Intensity 9:**
> 21-15-9 KB swings + burpees + box jumps

**N+1 at Intensity 5:**
> Death by push-ups (1, 2, 3, 4... until failure)
> "See how far you get. No pressure."

**N+1 at Intensity 10:**
> Death by burpees (1, 2, 3, 4... until failure)
> "How long can you hold on?"

---

## AI Prompt Integration

When generating workouts, the AI should consider:

1. **Intensity number** — The primary scaling factor
2. **User notes** — May override intensity implications (e.g., "feeling tired" at intensity 7 → soften movement selection)
3. **Recent history** — Avoid repeating movements, but also consider fatigue from recent high-intensity sessions
4. **User experience level** — Beginners at intensity 8 should not get the same complexity as advanced users at intensity 8

**Priority order:** User safety > User notes > Intensity scaling > Variety

---

## Open Items (Future Sessions)

1. **Goal preset interaction** — How does intensity interact with strength vs conditioning vs balanced presets? *Initial note: For strength goal, intensity primarily scales load/weight, not speed. Strength isn't about racing — it's about moving heavy things with control.*
2. **Anchor interaction** — Does intensity affect warm-up selection differently per anchor?
3. **Duration interaction** — Does a 20-min intensity-9 workout differ from a 60-min intensity-9 workout beyond just fewer sections?

---

## Related Documents

- `Clear_-_Structure_Types_Spec.md` — Structure definitions and tracking
- `Clear_-_Workout_Generation_Prompt.md` — System prompt (to be updated)
- `Clear_-_Exercise_Library.md` — Canonical exercise definitions
