# Clear - Screen 1: Generation Input

**Purpose:** User configures today's workout parameters  
**Context:** Walking out of locker room, one-handed, needs to be fast (30 seconds max)  
**Layout:** Long scroll, sticky CTA at bottom  
**Updated:** January 20, 2026 (ROTATION → POWER anchor change)

---

## ASCII Wireframe

```
┌─────────────────────────────────────┐
│  CLEAR                         ☰    │  ← Header (minimal)
├─────────────────────────────────────┤
│                                     │
│  INTENSITY                          │
│  ┌───────────────●─────────┐  8    │  ← Slider + big value
│  └───────────────────────────┘      │
│                                     │
│  ANCHOR MOVEMENT                    │
│  ┌─────────┬─────────┬─────────┐   │
│  │ SQUAT   │ HINGE   │ PRESS   │   │  ← 3x2 grid
│  │         │█████████│         │   │     (HINGE filled/active)
│  ├─────────┼─────────┼─────────┤   │
│  │ PULL    │ POWER   │SURPRISE │   │
│  │         │         │         │   │
│  └─────────┴─────────┴─────────┘   │
│                                     │
│  LOCATION                           │
│  ┌─────────────────────────────┐   │
│  │ Home Gym              ▼     │   │  ← Collapsed accordion
│  └─────────────────────────────┘   │
│                                     │
│  TIME (OPTIONAL)                    │
│  ┌─────────────────────────────┐   │
│  │ 45 min                      │   │  ← Small input
│  └─────────────────────────────┘   │
│                                     │
│  NOTES (OPTIONAL)                   │
│  ┌─────────────────────────────┐   │
│  │ Shoulder feels tight today  │   │  ← Textarea
│  └─────────────────────────────┘   │
│                                     │
│                [scroll space]       │
│                                     │
├─────────────────────────────────────┤
│  ┌───────────────────────────┐     │
│  │  GENERATE WORKOUT ━━━━━▶  │     │  ← Sticky CTA
│  └───────────────────────────┘     │
└─────────────────────────────────────┘
```

---

## Detailed Specifications

### 1. Intensity Slider
**Style:** Cyberpunk angular track with glowing accent  
**Interaction:** Large touch target, thumb-friendly  
**Display:** Big value shown next to slider (e.g., "8" or "8/10")  
**Color:** Does NOT change as you slide (consistent track color)  
**Reference:** Similar to Cyberpunk 2077 slider UI

### 2. Anchor Movement Selection
**Layout:** 3 columns × 2 rows grid  
**Options:** SQUAT, HINGE, PRESS, PULL, POWER, SURPRISE  
**Style:**
- **Active state:** Filled background (solid color like orange/gold)
- **Inactive state:** Outline only (glowing border, transparent fill)
**Typography:** All caps, bold, Rajdhani font  
**Touch target:** Large buttons, easy to tap  
**Reference:** Cyberpunk 2077 menu navigation (filled vs outline states)

**POWER Anchor:** Includes explosive/Olympic movements — cleans, snatches, thrusters, jerks.

### 3. Location Preset (Accordion)
**Default state:** Collapsed, shows current location + chevron  
**Expanded state:** List of saved locations + "Add New" link  
**Priority:** Low visual weight, not heavily used  
**Style:** Minimal card with subtle border

### 4. Optional Fields
**Time Input:**
- Small text input
- Placeholder: "45 min"
- Optional, always visible but de-emphasized

**Notes Textarea:**
- Small multi-line input
- Placeholder: "Any notes or modifications..."
- Optional, always visible but de-emphasized

**Placement:** After location, before CTA

### 5. Generate Workout Button
**Position:** Sticky at bottom (always visible)  
**Style:** Primary CTA button
- Orange gradient background
- Glowing border/shadow
- Large text: "GENERATE WORKOUT" with arrow icon
**Interaction:** Single tap to generate

---

## User Flow
1. User opens app (already on this screen by default)
2. Adjusts intensity slider (1-10)
3. Taps anchor button (e.g., HINGE)
4. (Optional) Expands location if needed
5. (Optional) Adds time/notes
6. Taps GENERATE WORKOUT
7. → Transitions to Screen 2 (Review & Edit)

---

## Mobile-First Considerations
- **One-handed use:** All inputs within thumb reach
- **Minimal typing:** Slider + buttons preferred over text entry
- **Fast path:** Can generate with just 3 taps (intensity, anchor, generate)
- **Forgiving targets:** Large touch areas for sweaty/distracted hands
- **Scroll:** Vertical scroll if needed, but most elements fit above fold on mobile

---

## Design System References
- **Colors:** Purple/indigo primary, orange accent, lime/rose for intensity states
- **Typography:** Rajdhani (headers), Inter (body), JetBrains Mono (labels)
- **Effects:** Glassmorphic cards, soft glows, grain texture on background
- **Aesthetic:** Cyberpunk utilitarian, functional HUD elements
