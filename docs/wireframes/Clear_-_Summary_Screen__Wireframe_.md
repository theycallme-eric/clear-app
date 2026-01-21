# Clear - Summary Screen (Wireframe)
**Created:** December 22, 2025  
**Status:** Locked for MVP  
**Phase:** 2F Complete

---

## Purpose

Post-workout completion screen. Captures mood, optional notes, shows streak update, and returns user to Home.

**Context:** User just finished their last section (Cooldown), tapped "Finish" in Workout Mode — now they land here.

---

## ASCII Wireframe

```
┌─────────────────────────────────────┐
│  WORKOUT COMPLETE                   │
├─────────────────────────────────────┤
│                                     │
│              🎉                     │
│                                     │
│         NICE WORK!                  │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ SQUAT • INTENSITY 8           │ │
│  │ 51 min • 6 sections           │ │
│  └───────────────────────────────┘ │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  HOW DO YOU FEEL?                   │
│                                     │
│    😫    😕    😐    🙂    😀      │  ← Tap one
│                                     │
├─────────────────────────────────────┤
│                                     │
│  SESSION NOTES (OPTIONAL)           │
│                                     │
│  ┌───────────────────────────────┐ │
│  │                               │ │
│  │ Add any notes about this      │ │  ← Placeholder text
│  │ workout...                    │ │
│  │                               │ │
│  └───────────────────────────────┘ │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  STREAK                             │
│                                     │
│        12 → 13 days 🔥              │  ← Streak increment
│                                     │
│  ┌───┐┌───┐┌───┐┌───┐┌───┐┌───┐┌───┐│
│  │ ● ││ ● ││ ● ││ ● ││ ● ││ ● ││ ○ ││  ← Today filled
│  └───┘└───┘└───┘└───┘└───┘└───┘└───┘│
│   M    T    W    T    F    S    S   │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  ┌───────────────────────────────┐ │
│  │          FINISH               │ │  ← Auto-saves, returns Home
│  └───────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

---

## Elements

### Header
- "WORKOUT COMPLETE" — celebratory title

### Summary Block
- Celebration emoji (🎉)
- "NICE WORK!" message
- Workout details: Anchor type, Intensity level
- Duration + section count

### Mood Tracker
- 5 emoji options: 😫 😕 😐 🙂 😀
- Tap one to select (single select)
- Optional but encouraged
- Saves with workout data for future analysis

### Session Notes
- Optional free text textarea
- Placeholder: "Add any notes about this workout..."
- For overall reflections (vs. per-exercise notes captured during Workout Mode)

### Streak Update
- Shows increment animation: "12 → 13 days 🔥"
- Week view with today's box now filled
- Positive reinforcement moment

### Finish Button
- Primary CTA
- **Auto-saves** workout data (mood, notes, all exercise data from session)
- Returns to Home/Dashboard

---

## Interactions

| Action | Result |
|--------|--------|
| Tap mood emoji | Selects it (single select, can change before Finish) |
| Type in notes field | Text saved with workout |
| Tap "FINISH" | Auto-saves everything, returns to Home |

---

## Data Saved on Finish

- Date/time
- Anchor type
- Intensity level
- Duration
- Sections completed
- All exercises with sets/reps
- Per-exercise notes (from Workout Mode)
- Session notes (from this screen)
- Mood selection

---

## Navigation

| Action | Destination |
|--------|-------------|
| Tap "FINISH" | Home / Dashboard |

**Note:** No back button — user has completed the workout. Only path is forward to Finish.

---

## Edge Cases

**No mood selected:** Allow finish — mood is optional

**No notes entered:** Allow finish — notes are optional

**App closed before Finish:** Workout data held in memory is lost. Consider auto-save during Workout Mode for future enhancement.

---

*Summary wireframe locked: December 22, 2025*
