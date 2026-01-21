# Clear - Workout History (Wireframe)
**Created:** December 22, 2025  
**Status:** Locked for MVP  
**Phase:** 2D Complete

---

## Purpose

View all past workouts with filtering, tap to see full session details.

**Context:** User wants to review past workouts, check what weight they used, or see patterns over time.

---

## History List Screen

```
┌─────────────────────────────────────┐
│  ← HISTORY                     ☰   │
├─────────────────────────────────────┤
│                                     │
│  ┌───────────────────────────────┐ │
│  │ 🔍 Search workouts...         │ │  ← Future: natural language
│  └───────────────────────────────┘ │     (disabled or hidden MVP)
│                                     │
│  FILTER BY                          │
│                                     │
│  ┌──────┐ ┌──────┐ ┌──────┐       │
│  │ All  │ │Anchor│ │Intens│       │  ← Filter chips
│  │  ●   │ │  ▼   │ │  ▼   │       │     (dropdowns)
│  └──────┘ └──────┘ └──────┘       │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  DECEMBER 2025                      │  ← Month group
│                                     │
│  ┌───────────────────────────────┐ │
│  │ Dec 22 • PULL • Int. 6        │ │
│  │ 45 min                        │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ Dec 21 • HINGE • Int. 7       │ │
│  │ 42 min                        │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ Dec 20 • SQUAT • Int. 8       │ │
│  │ 51 min                        │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ Dec 18 • PRESS • Int. 6       │ │
│  │ 38 min                        │ │
│  └───────────────────────────────┘ │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  NOVEMBER 2025                      │  ← Previous month
│                                     │
│  ┌───────────────────────────────┐ │
│  │ Nov 30 • PULL • Int. 7        │ │
│  │ 44 min                        │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ Nov 28 • ROTATION • Int. 5    │ │
│  │ 35 min                        │ │
│  └───────────────────────────────┘ │
│                                     │
│           [ Load More ]             │  ← Pagination
│                                     │
└─────────────────────────────────────┘
```

---

## Filter Behavior

**"All" chip:** Active by default, shows everything

**"Anchor" dropdown:**
```
┌─────────────┐
│ All Anchors │
│ ─────────── │
│ SQUAT       │
│ HINGE       │
│ PRESS       │
│ PULL        │
│ ROTATION    │
│ SURPRISE    │
│ ─────────── │
│ UPPER BODY  │  ← For non-primary lift days
│ LOWER BODY  │
│ FULL BODY   │
└─────────────┘
```

**"Intensity" dropdown:**
```
┌─────────────┐
│ All Levels  │
│ ─────────── │
│ 1-2 (Light) │
│ 3-4 (Easy)  │
│ 5-6 (Mod)   │
│ 7-8 (Hard)  │
│ 9-10 (Max)  │
└─────────────┘
```

---

## Workout Card Content

Each card displays:
- Date (or "Yesterday" / "Today" for recent)
- Anchor type
- Intensity level
- Duration

**Action:** Tap card → Opens Session Detail screen

---

## Session Detail Screen

```
┌─────────────────────────────────────┐
│  ← BACK                        ☰   │
├─────────────────────────────────────┤
│                                     │
│  DECEMBER 20, 2025                  │
│                                     │
│  SQUAT • INTENSITY 8                │  ← Anchor + Intensity
│  51 min • Balanced                  │  ← Duration + Goal preset
│                                     │
│  😀                                 │  ← Mood (if logged)
│                                     │
├─────────────────────────────────────┤
│                                     │
│  WARM-UP                            │
│                                     │
│  Cat-cow                    5 brths │
│  Leg swings                 10 each │
│  Goblet squat hold          30 sec  │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  PRIMARY LIFT                       │
│                                     │
│  Barbell Back Squat                 │
│  4 × 6 @ 185lbs                     │  ← Logged weight
│  📝 "Felt heavy but moved well"     │  ← User note
│                                     │
├─────────────────────────────────────┤
│                                     │
│  ACCESSORY                          │
│                                     │
│  Bulgarian Split Squat              │
│  3 × 10 each @ 35lbs                │
│                                     │
│  Leg Press                          │
│  3 × 12 @ 180lbs                    │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  CORE                               │
│                                     │
│  Pallof Press              3 × 10ea │
│  Dead Bug                  3 × 8ea  │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  CONDITIONING                       │
│                                     │
│  Bike Intervals                     │
│  6 rounds: 30s on / 30s off         │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  COOLDOWN                           │
│                                     │
│  Couch stretch             90s each │
│  Pigeon pose               60s each │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  SESSION NOTES                      │
│                                     │
│  "Good session overall. Squats      │
│   felt heavier than usual but       │
│   pushed through. Need to foam      │
│   roll later."                      │
│                                     │
└─────────────────────────────────────┘
```

---

## Session Detail Elements

**Header:**
- Back arrow → Returns to History
- Date as title

**Summary block:**
- Anchor + Intensity
- Duration + Goal preset used
- Mood emoji (if captured post-workout)

**Sections:**
- Each section from that workout displayed
- Exercises with sets/reps/weight logged
- User notes (📝) shown inline where added

**Session Notes:**
- Overall notes for the workout (if any)
- Displayed at bottom

---

## Navigation

| Action | Destination |
|--------|-------------|
| Tap ← (from History) | Home / Dashboard |
| Tap workout card | Session Detail |
| Tap ← BACK (from Detail) | History list |
| Tap "Load More" | Loads older workouts |

---

## Future Enhancements

1. **Natural language search** — "When did I last do deadlifts?"
2. **Export** — Download workout history as CSV/PDF
3. **Trends** — Visual charts of workout frequency, intensity over time
4. **Compare** — Side-by-side view of two sessions with same anchor

---

*History wireframe locked: December 22, 2025*
