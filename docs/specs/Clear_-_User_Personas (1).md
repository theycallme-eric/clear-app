# Clear - User Personas
**Created:** December 20, 2025  
**Status:** Locked for MVP  
**Phase:** 1A Complete

---

## Overview

Three personas covering the core user spectrum for Clear. All share one thing: **they want to train, not plan.**

| Persona | Core Need | Trust Level | Edits Workouts? | Time Sensitivity |
|---------|-----------|-------------|-----------------|------------------|
| **Alex** (Lazy Planner) | Remove planning friction | High (has knowledge) | Sometimes (vibe check) | Medium (30 sec to generate) |
| **Jordan** (Uncertain Beginner) | Guidance and structure | Trusts AI over self | Rarely | Low (will prep in advance) |
| **Sam** (Time-Crunched Parent) | Maximize limited time | High (has knowledge) | Only for equipment swaps | Very High (every minute matters) |

**Primary Persona (MVP):** Alex  
**Secondary Personas (Keep in Mind):** Jordan, Sam

---

## Persona 1: The Lazy Planner

**Name:** Alex  
**Age:** 32 (range: 28-36)  
**Archetype:** "I want to train, not plan"

### Background
Former group fitness devotee (Alchemy 365, 4-6x/week with partner). Loved that the only decision was "when do I leave?" — show up, execute, done. Has solid gym knowledge built up over years, can look at a workout and know how it'll feel, like reading a cocktail recipe and knowing the taste.

Life changed (schedule, location, whatever), and now has access to a building gym instead of classes. The equipment is modest but functional: dumbbells to 50lbs, a squat rack with ~270lbs of plates. Enough to train seriously.

### The Problem
**Planning is the enemy.** Not the workout itself — the *deciding*. 

Has tried:
- Looking up workouts online → tedious, gets boring
- Following programs → too rigid, doesn't adapt to how body feels today
- Using an LLM with custom prompts → works, but clunky; sparked this whole project

The friction isn't motivation. It's the cognitive load *before* the gym.

### Goals
- Train 4-5 days/week consistently
- Zero planning required — just set intensity/anchor and go
- Variety that prevents boredom without requiring thought
- Enough structure to track progress over time (anchor workouts for comparison)

### Key Behaviors
- **Generates workout at the gym**, not the night before
- **Trusts the output** if it passes the "vibe check" — can scan a workout and know if it's aligned
- **Will edit** if something's off, but too many edits = failure
- **Repeating workouts is fine** week-over-week for same anchor, but not consecutive days
- **Notes during workout** are minimal — maybe weight used, maybe nothing

### What Makes Alex Stop Using Clear
1. **Clunkiness** — if it's inconvenient, gone immediately
2. **Misaligned workouts** — needing too many edits to get to "this feels right"
3. **Repetitive outputs** — if AI keeps suggesting same exercises, trust erodes

### Quote
> "I know what a good workout looks like. I just don't want to be the one designing it every day."

### Design Implications
- Speed is everything — 30 seconds from open to workout ready
- Minimal required inputs (intensity + anchor + generate)
- Edit capability exists but shouldn't be necessary often
- Historical data helps rotation feel intelligent
- Trust is earned through variety and alignment

---

## Persona 2: The Uncertain Beginner

**Name:** Jordan  
**Age:** 26  
**Archetype:** "I don't know what I'm doing, but I want to"

### Background
Wants to start lifting but feels intimidated. Has done cardio, maybe some machine circuits, but free weights feel like a foreign language. Watches fitness content online but it's overwhelming — too many programs, too many opinions, paralysis by analysis.

Has gym access (apartment building or cheap membership) but walks in, does some random exercises, leaves feeling like it wasn't "right."

### The Problem
**Doesn't know what a good workout looks like.**

The blank page is terrifying. What exercises? How many sets? What weight? Is this working? Am I doing it wrong? The uncertainty creates anxiety, which creates avoidance.

### Goals
- Learn movements gradually through exposure (not studying)
- Feel like workouts are "legitimate" — not just random
- Build confidence over time
- Eventually develop intuition (become more like Alex)

### Key Behaviors
- **Wants guidance**, not just generation — coaching cues matter more
- **Will read the details** (tempo, rest times, form notes)
- **Unlikely to edit** — trusts the AI more than themselves initially
- **Needs positive reinforcement** — completing a session should feel like progress
- **Might generate workout in advance** — wants to mentally prepare

### What Makes Jordan Stop Using Clear
1. **Exercises they don't recognize** — if they can't picture it, they won't do it
2. **No explanation** — "why am I doing this?" unanswered
3. **Feeling stupid** — if the app assumes knowledge they don't have
4. **Injury or discomfort** — if a movement hurts and they didn't know to modify

### Quote
> "I just want someone to tell me what to do so I can stop overthinking and start moving."

### Design Implications
- Coaching cues are essential, not optional
- Exercise names should be recognizable (or have "learn more" option — future)
- Regressions should be prominent (not buried)
- Intensity defaults should be conservative for beginners (5-6, not 8)
- Onboarding should capture experience level
- Consider "beginner-friendly" exercise pool

---

## Persona 3: The Time-Crunched Parent

**Name:** Sam  
**Age:** 38  
**Archetype:** "I have 30 minutes, make them count"

### Background
Used to be very active — maybe played sports, did CrossFit, had a real routine. Then: kids. Now every minute is accounted for, and the gym is a luxury squeezed into early mornings or lunch breaks.

Has the knowledge (like Alex), but the constraint is **time**, not motivation or planning. Needs workouts that are efficient, complete, and respect the clock.

### The Problem
**Time is the non-negotiable constraint.**

Can't spend 10 minutes deciding what to do. Can't do a 90-minute session. Can't wait for equipment. Needs to walk in, execute, walk out — every minute optimized.

### Goals
- Get effective workout in 25-40 minutes
- Hit full body or targeted work depending on available time
- No wasted movements — everything should count
- Maintain fitness (not necessarily build — just don't lose it)

### Key Behaviors
- **Time input is critical** — always specifies duration
- **Prefers supersets/circuits** — maximize work in minimum time
- **Will skip warmup/cooldown** if pressed (needs to be short anyway)
- **Equipment flexibility matters** — if rack is taken, needs instant alternative
- **Generates workout before arriving** — plans during commute

### What Makes Sam Stop Using Clear
1. **Workouts that run long** — if 30 minutes becomes 45, trust is broken
2. **Too much rest time** — "90 seconds between sets" feels wasteful
3. **Equipment conflicts** — needs easy swap, not "start over"
4. **Complexity** — no time for learning new movements mid-session

### Quote
> "I don't need the perfect workout. I need a good workout that fits in my window."

### Design Implications
- Time input should be prominent and respected
- Estimated duration should be accurate (or conservative)
- Quick swap for equipment conflicts is high priority
- Supersets/circuits as conditioning option
- Consider "Express" workout mode (future feature)
- Rest times should be configurable or smart-defaulted

---

## Anti-Personas (Who This Is NOT For)

### The Optimizer
Wants to track every metric, progressive overload spreadsheets, periodization plans, RPE logging. Clear is too simple — they need a dedicated training log app.

### The Social Exerciser
Primarily motivated by community, accountability partners, sharing workouts. Clear is solo-focused. They need a fitness social network.

### The Program Follower
Wants a specific 12-week program (Starting Strength, nSuns, PPL). Clear's daily generation conflicts with rigid programming. They need a program tracker.

### The Cardio-Only
Exclusively runs, cycles, or does cardio machines. Clear is strength/resistance focused. They need Strava or a running app.

---

## How to Use These Personas

When making any design decision, ask:

1. **Does this work for Alex?** (Primary — must pass this test)
2. **Does this exclude Jordan?** (Don't alienate beginners)
3. **Does this respect Sam's time?** (Efficiency matters)

If a feature serves one persona but hurts another, document the tradeoff and decide intentionally.

---

## Next Steps

**Phase 1, Session 1B:** User Journey Mapping
- Map Alex's journey (primary)
- Identify Jordan/Sam divergence points
- Document friction and opportunities

---

*Personas validated: December 20, 2025 (beer-validated ✓)*
