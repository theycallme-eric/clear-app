# Clear - Screen 2: Review & Edit

**Purpose:** User reviews generated workout and can edit before starting  
**Context:** Standing in gym, scanning plan, deciding if it works  
**Layout:** Long scroll, sections collapsible, editable exercises

---

## ASCII Wireframe

```
┌─────────────────────────────────────┐
│  ← CLEAR                       ☰    │  ← Header with back
├─────────────────────────────────────┤
│                                     │
│  HIGH INTENSITY PULL FOCUS          │  ← Workout title
│                                     │
│  Strengthen posterior chain and     │  ← Coach overview
│  scapular control. Big compound     │    (2-3 sentences)
│  pulls into stability drills.       │
│                                     │
│  ┌────┐ ┌────┐ ┌────┐             │  ← Metadata badges
│  │45m │ │ 8  │ │PULL│             │
│  └────┘ └────┘ └────┘             │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  ┌───────────────────────────────┐ │  ← Section card
│  │ WARM-UP                    ▼  │ │    (collapsed)
│  │                               │ │
│  │ Cat-cow (5 breaths)          │ │
│  │ Scap wall slides (8 reps)    │ │
│  │ Band pull-aparts (12 reps)   │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │  ← Section card
│  │ PRIMARY LIFT               ▲  │ │    (expanded)
│  │                               │ │
│  │ ┌─────────────────────────┐  │ │
│  │ │ Barbell Bent-Over Row   │  │ │  ← Exercise card
│  │ │ 4 × 8 @ 65%            │  │ │
│  │ │ Tempo: 2-1-2           │  │ │
│  │ │ Rest: 90s              │  │ │
│  │ │                         │  │ │
│  │ │ Last: 115-135lbs       │  │ │  ← Historical range
│  │ │                         │  │ │
│  │ │ [Neutral spine, bar    │  │ │  ← Coaching cues
│  │ │  to ribcage]           │  │ │
│  │ └─────────────────────────┘  │ │
│  │                               │ │
│  │ Regression: Seated Cable Row │ │  ← Alt options
│  │                               │ │
│  │  [ ↻ Randomize Section ]     │ │  ← Section randomize
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │  ← Section card
│  │ ACCESSORY BLOCK            ▼  │ │    (collapsed)
│  │                               │ │
│  │ Chest-Supported DB Row (3×10)│ │
│  │ DB Reverse Fly (3×12)        │ │
│  │ Face Pulls (3×10)            │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ ROTATIONAL / STANCE        ▼  │ │
│  │                               │ │
│  │ Cable Chop (8/side)          │ │
│  │ Side Plank + Reach (6/side)  │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ CONDITIONING               ▼  │ │
│  │                               │ │
│  │ KB Complex (3 rounds)        │ │
│  │ Row intervals (6 rounds)     │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ COOLDOWN                   ▼  │ │
│  │                               │ │
│  │ Cross-body stretch (30s/side)│ │
│  │ Child's pose (30s/side)      │ │
│  │ Box breathing (3 rounds)     │ │
│  └───────────────────────────────┘ │
│                                     │
│                [scroll space]       │
│                                     │
├─────────────────────────────────────┤
│  ┌───────────────────────────┐     │  ← Sticky CTA
│  │  START WORKOUT ━━━━━▶     │     │
│  └───────────────────────────┘     │
└─────────────────────────────────────┘
```

---

## Detailed Specifications

### 1. Workout Header
**Elements:**
- **Title:** Large, bold, uppercase (e.g., "HIGH INTENSITY PULL FOCUS")
- **Coach Overview:** 2-3 sentence description, regular weight
- **Metadata Badges:** Pill-shaped badges showing:
  - Estimated time (45m)
  - Intensity level (8)
  - Anchor type (PULL)

**Style:**
- Typography: Rajdhani (title), Inter (overview)
- Badges: Glassmorphic with subtle glow

---

### 2. Section Cards (Collapsed State)

**Display:**
- Section name (uppercase, bold)
- List of exercises with rep schemes
- Chevron icon (▼) indicating expandable

**Example:**
```
PRIMARY LIFT                           ▼
Barbell Bent-Over Row (4×8)
Regression: Seated Cable Row
```

**Interaction:**
- Tap anywhere on card → expands to show details

**Style:**
- Glassmorphic card with blur
- Subtle border glow
- Adequate spacing between cards

---

### 3. Section Cards (Expanded State)

**Display:**
- Section name at top
- Individual exercise cards with full details
- "Randomize Section" button at bottom

**Exercise Card Shows:**
- Exercise name
- Sets × Reps @ Effort%
- Tempo notation (e.g., "2-1-2")
- Rest time (e.g., "90s")
- Historical data range (e.g., "Last: 115-135lbs")
- Coaching cues (collapsed by default? or always visible?)
- Regression/Progression options

**Randomize Section Button:**
- Ghost/outline style
- Text: "↻ RANDOMIZE SECTION"
- At bottom of expanded section card

**Interaction:**
- Tap exercise name → edit modal/overlay
- Tap "Randomize Section" → regenerates just that section

**Style:**
- Exercise cards: Nested cards within section card
- Slightly different background/border to show hierarchy

---

### 4. Historical Data Display

**Format:** "Last: [LOW]-[HIGH]lbs"

**Logic:**
- Shows range from your history for that movement
- Covers different rep schemes (5×5 vs 3×12)
- Helps you quickly gauge appropriate weight

**Placement:**
- Under sets/reps, before coaching cues
- Subtle text color (not primary emphasis)

**Style:**
- JetBrains Mono font (technical data)
- Lime or neutral color

---

### 5. Edit Functionality

**Trigger:** Tap exercise name

**Action:** Opens edit modal/overlay with:
- Text input to change exercise name
- (Future: list of similar movement alternatives)
- Ability to edit sets/reps/tempo (optional for MVP)
- Save/Cancel buttons

**Style:**
- Modal slides up from bottom
- Glassmorphic background
- Primary CTA for "Save"

---

### 6. Coaching Cues

**Content:** Brief technical notes (e.g., "Neutral spine, bar to ribcage")

**Display Options:**
- **Option A:** Always visible in exercise card
- **Option B:** "Show Cues" link to expand (saves space)

**Recommendation:** Always visible if under 1 line, collapsible if longer

**Style:**
- Smaller text, muted color
- Italic or different font weight
- Bracketed or indented

---

### 7. Action Buttons

**Start Workout:**
- Position: Sticky at bottom (always visible)
- Style: Primary CTA (orange gradient, glow)
- Text: "START WORKOUT" with arrow
- Large touch target

**Randomize Section:**
- Position: Bottom of each expanded section card
- Style: Ghost/outline button
- Text: "↻ RANDOMIZE SECTION"
- Medium size, not competing with main CTA

---

## User Flow

1. User lands on Review screen after generation
2. Sees workout title, overview, metadata at top
3. Scrolls through collapsed sections to get overview
4. Taps section to expand and see full details
5. Reviews exercises, checks historical data for weight guidance
6. (Optional) Taps exercise name to edit/swap movement
7. (Optional) Taps "Randomize Section" to regenerate a section
8. When satisfied, taps "START WORKOUT" at bottom
9. → Transitions to Screen 3 (Workout Mode)

---

## Mobile-First Considerations

- **Collapsible sections:** Reduces scroll length, faster scanning
- **Large touch targets:** Section headers, exercise cards, buttons
- **Historical data prominent:** Quick reference without extra taps
- **Edit modal:** Full-screen overlay for easy text input
- **Sticky CTA:** Always accessible, no need to scroll to bottom
- **Section randomize:** Per-section control without regenerating entire workout

---

## Design System References

- **Colors:** Purple/indigo primary, orange accent, lime for data
- **Typography:** Rajdhani (headers), Inter (body), JetBrains Mono (data)
- **Cards:** Glassmorphic with backdrop blur, nested hierarchy
- **Buttons:** Primary CTA (orange glow), ghost (outline only)
- **Aesthetic:** Cyberpunk utilitarian, functional HUD elements