# Clear - Home / Dashboard (Wireframe)
**Created:** December 22, 2025  
**Status:** Locked for MVP  
**Phase:** 2C Complete

---

## Purpose

Landing screen for returning users. Provides quick access to workout generation and surfaces habit-reinforcing data (streaks, recent workouts).

**Context:** User opens app, wants to either start a workout or check their progress.

---

## ASCII Wireframe

```
┌─────────────────────────────────────┐
│  CLEAR                         ☰   │  ← Hamburger for settings
├─────────────────────────────────────┤
│                                     │
│  ┌───────────────────────────────┐ │
│  │                               │ │
│  │      GENERATE WORKOUT         │ │  ← Hero CTA
│  │                               │ │
│  │      Set intensity, anchor,   │ │
│  │      and build your session   │ │
│  │                               │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │  ⚡ QUICK START               │ │  ← Secondary CTA
│  │                               │ │
│  │  Intensity: 6  •  Anchor: PULL│ │  ← Auto-suggested
│  └───────────────────────────────┘ │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  STREAK                             │
│                                     │
│           12 days 🔥                │  ← Big number
│                                     │
│  ┌───┐┌───┐┌───┐┌───┐┌───┐┌───┐┌───┐│
│  │ ● ││ ● ││ ● ││ ● ││ ● ││ ○ ││ ○ ││  ← Week view
│  └───┘└───┘└───┘└───┘└───┘└───┘└───┘│
│   M    T    W    T    F    S    S   │
│                                     │
│        [ Mark Rest Day ]            │  ← Ghost button
│                                     │
├─────────────────────────────────────┤
│                                     │
│  RECENT                             │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ Yesterday • HINGE • Int. 7    │ │  ← Last workout
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
│         [ View All History ]        │  ← Link to History
│                                     │
└─────────────────────────────────────┘
```

---

## Elements

### Header
- **CLEAR** logo (left)
- **Hamburger menu** (right) → Opens settings

### Generate Workout (Hero CTA)
- **Style:** Primary CTA, large, prominent
- **Action:** Tap → Screen 1 (Generation Input)
- **Copy:** "Set intensity, anchor, and build your session"

### Quick Start (Secondary CTA)
- **Style:** Secondary button, smaller than Hero
- **Display:** Shows auto-suggested intensity + anchor based on workout history
- **Action:** Tap → Skips Screen 1 & 2, goes directly to Screen 3 (Workout Mode)
- **Logic:**
  - Intensity: Based on previous day's workout (recovery logic)
  - Anchor: Auto-rotates to avoid recent repeats (e.g., if yesterday was SQUAT and before was HINGE, suggest PRESS)
- **Empty state:** If no history, shows "Start your first workout" instead

### Streak Tracker
- **Display:**
  - Large day count with fire emoji (e.g., "12 days 🔥")
  - Week view showing 7 boxes (Mon–Sun)
  - Filled (●) = workout completed
  - Empty (○) = no workout yet
- **Mark Rest Day button:**
  - Ghost/outline style
  - Action: Confirms with prompt → Marks today as rest (different icon, streak preserved)
- **Rest day abuse prevention:**
  - 3+ consecutive rest days → Prompt: "Everything okay? Taking a break, or dealing with something?"
  - Options: "Just resting" / "Injury or sick"
  - "Injury or sick" → Pauses streak (doesn't break), resumes when back

### Recent Workouts
- **Display:** Last 3 completed workouts
- **Card content:**
  - Date (or "Yesterday" / "Today")
  - Anchor type (HINGE, SQUAT, PRESS, etc.)
  - Intensity level
  - Duration
- **Action:** Tap card → Session Detail screen
- **"View All History" link:** Goes to full History screen

---

## Navigation

| Action | Destination |
|--------|-------------|
| Tap "Generate Workout" | Screen 1: Generation Input |
| Tap "Quick Start" | Screen 3: Workout Mode (skips 1 & 2) |
| Tap hamburger menu | Settings |
| Tap recent workout card | Session Detail |
| Tap "View All History" | History screen |

---

## Mood Tracker Note

Mood tracker was considered for this screen but moved to **Summary screen** (post-workout). Capturing mood after a workout is more meaningful than before.

---

## Mobile Considerations

- Hero CTA should be thumb-reachable (middle of screen)
- Quick Start should be immediately visible without scrolling
- Streak + Recent may require scroll on smaller screens — that's acceptable
- Week view boxes need adequate touch targets if they become interactive later

---

*Dashboard wireframe locked: December 22, 2025*
