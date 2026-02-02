# Clear - Screen 3: Workout Mode (Execution)

**Purpose:** User executes workout step-by-step, one section at a time  
**Context:** Actively working out, between sets, quick glances, sweaty hands  
**Layout:** Paginated (one section per screen), swipeable, sticky navigation

---

## ASCII Wireframe

```
┌─────────────────────────────────────┐
│  ← PRIMARY LIFT (2/6)          ☰    │  ← Header with back + progress
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐   │  ← Timer toggle
│  │  ⏱ SECTION: 08:34  ⇄       │   │     (tap to switch)
│  └─────────────────────────────┘   │     Overall: 15:22
│                                     │
├─────────────────────────────────────┤
│                                     │
│  Barbell Bent-Over Row              │  ← Exercise 1
│  4 × 8 @ 65%                       │     (collapsed)
│                            [ + ]    │  ← Add note icon
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  Single-Arm DB Row                  │  ← Exercise 2
│  3 × 10                            │     (collapsed)
│                            [📝]     │  ← Has note indicator
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  DB Reverse Fly                     │  ← Exercise 3
│  3 × 12                            │     (expanded)
│                                     │
│  ┌───────────────────────────────┐ │
│  │ Tempo: 2-1-2                  │ │  ← Details visible
│  │ Rest: 60s                     │ │
│  │                               │ │
│  │ Neutral spine, control        │ │  ← Coaching cues
│  │ descent                       │ │
│  │                               │ │
│  │ NOTES                    [ + ]│ │  ← Note field
│  └───────────────────────────────┘ │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  SECTION NOTES              [ + ]   │  ← Section-level notes
│                                     │
│                [scroll space]       │
│                                     │
├─────────────────────────────────────┤
│  ← Back    [●●○○○○]    Next →      │  ← Sticky nav
└─────────────────────────────────────┘
```

---

## Detailed Specifications

### 1. Header
**Elements:**
- Back button (returns to Review screen or exits workout)
- Section name: "PRIMARY LIFT"
- Progress indicator: "(2/6)" showing current section of total
- Menu icon (optional: pause workout, settings, etc.)

**Style:**
- Minimal, doesn't compete with content
- Typography: Rajdhani, uppercase

---

### 2. Timer Toggle

**Display:**
- Shows ONE timer at a time
- Large, readable time display
- Small toggle icon (⇄) to switch between timers

**Two Timer Modes:**
- **Section Timer:** "⏱ SECTION: 08:34" (counts up from section start)
- **Overall Timer:** "⏱ OVERALL: 15:22" (total workout time)

**Interaction:**
- Tap anywhere on timer area to toggle between modes
- Timer continues counting regardless of which is displayed

**Position:** Top of content area, below header

**Style:**
- Glassmorphic card
- JetBrains Mono font (technical/data display)
- Lime color for active timer text

---

### 3. Exercise List (Section View)

**Default State (Collapsed):**
- Exercise name (large, bold)
- Sets × Reps @ Effort% (clear, readable)
- Note indicator icon:
  - **[ + ]** if no note yet (tap to add)
  - **[📝]** if note exists (tap to view/edit)

**Expanded State:**
- Exercise name + sets/reps at top
- Details section shows:
  - Tempo notation
  - Rest time
  - Coaching cues (if any)
- Note field with [ + ] icon

**Interaction:**
- **Tap exercise** → expands/collapses details
- **Tap [ + ] icon** → opens note modal
- **Tap [📝] icon** → opens modal showing existing note (editable)

**Style:**
- Clean separation between exercises (divider lines)
- Expanded exercise has subtle background change
- Large touch targets (entire exercise row is tappable)

---

### 4. Note Taking

**Per-Exercise Notes:**
- Purpose: Track load used, modifications, how it felt
- Examples: "185lbs", "felt heavy", "shoulder pain, went lighter"

**Section Notes:**
- Purpose: Overall observations for that section
- Examples: "Rushed through this, gym was crowded", "Felt strong today"

**Modal/Half-Sheet UI:**
```
┌─────────────────────────────────────┐
│  BARBELL BENT-OVER ROW              │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 185lbs x 8,8,8,7            │   │  ← Text input
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│     [Cancel]         [Save]         │
│                                     │
└─────────────────────────────────────┘
```

**Style:**
- Slides up from bottom (iOS-style half sheet)
- Glassmorphic background
- Large text input (easy to type while tired)
- Primary CTA for "Save"

---

### 5. Navigation (Sticky Bottom Bar)

**Elements:**
- **← Back** button (left side, subtle/ghost style)
- **Progress dots** (center): [●●○○○○] showing section position
- **Next →** button (right side, primary style)

**Interaction:**
- **Tap Next** → advances to next section
- **Tap Back** → returns to previous section
- **Swipe left** → next section (gesture alternative)
- **Swipe right** → previous section (gesture alternative)

**Final Section Behavior:**
- "Next →" changes to "Finish →" on last section (Cooldown)
- Tapping "Finish" → transitions to Summary/Save screen

**Style:**
- Sticky at bottom (always visible)
- Back button: ghost/outline (de-emphasized)
- Next button: primary CTA (orange gradient, glow)
- Progress dots: small, subtle, lime for current section

---

### 6. Section-Level Notes

**Placement:** After all exercises, before navigation

**Display:**
- "SECTION NOTES" label
- [ + ] icon to add notes (or [📝] if notes exist)

**Interaction:**
- Same modal pattern as exercise notes
- Captures overall section observations

---

## User Flow

1. User taps "START WORKOUT" on Review screen
2. Lands on Section 1 (Warm-Up)
3. Section timer starts automatically
4. User sees all exercises in section (collapsed by default)
5. Between sets, taps exercise to expand and see details
6. Adds notes as they go (load used, modifications)
7. When section complete, taps "Next →" (or swipes left)
8. Section 2 loads, section timer resets, overall timer continues
9. Repeats through all 6 sections
10. On final section, "Next" becomes "Finish"
11. Tapping "Finish" → Summary/Save screen

---

## Summary/Save Screen (After Workout)

**Display:**
- Workout title + completion time
- All 6 sections with notes captured
- "SAVE SESSION" primary CTA button
- Option to discard without saving?

**Action:**
- Saves workout data locally (IndexedDB)
- Returns to home/input screen
- Workout data used for historical tracking + rotation logic

---

## Mobile-First Considerations

### During Workout (High Priority)
- **One section at a time:** Reduces cognitive load
- **Large text:** Exercise names and rep schemes highly visible
- **Forgiving touch targets:** Entire exercise row is tappable
- **Minimal scrolling:** Only within current section
- **Sticky navigation:** Always accessible, no need to scroll

### Between Sets (Quick Glances)
- **Timer always visible:** Quick check without taps
- **Collapsed view sufficient:** "What's next?" answered instantly
- **Notes optional:** Don't block flow, add when convenient

### Sweaty Hands / Distracted Environment
- **Large buttons:** Next/Back are big, easy to hit
- **Swipe gestures:** Alternative to button taps
- **Simple interactions:** Expand/collapse, add note, advance

---

## Design System References

- **Colors:** Lime for active timers/progress, orange for CTAs
- **Typography:** Rajdhani (headers), Inter (body), JetBrains Mono (timers)
- **Cards:** Minimal, focus on content clarity over decoration
- **Buttons:** Primary CTA (Next), ghost (Back)
- **Aesthetic:** Functional, high-contrast, workout-optimized

---

## Technical Notes

### State Management
- Track current section index (1-6)
- Track notes per exercise (key: exercise name or ID)
- Track section notes per section
- Track timers (overall start time, section start time)
- All data held in memory until "Save Session"

### Gestures
- Swipe left/right to navigate sections
- Tap to expand/collapse exercises
- Tap icons to add/view notes

### Accessibility
- Large touch targets (48px minimum)
- High contrast text (white on dark)
- Clear visual hierarchy (exercise name > reps > details)