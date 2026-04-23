---
name: ui-rules
description: Concrete implementation rules for CLEAR UI — spacing, typography, hierarchy, cards, states, atmosphere
trigger: Before any UI work, after component.md pre-flight
category: ui
---

# UI Rules

Concrete implementation rules for building CLEAR components. Not philosophy — code-level guidance.

For the "why" behind these rules, see `docs/design-philosophy.md`.

---

## 1. Spacing Scale

All spacing uses `--spacing-*` tokens from `src/index.css`. Never use raw pixel values.

| Token | Value | Use for |
|-------|-------|---------|
| `--spacing-0` | 0px | Reset |
| `--spacing-25` | 1px | Hairline borders |
| `--spacing-50` | 2px | Border widths, LeftColumn/ChamferedFrame overlap |
| `--spacing-100` | 4px | Icon gaps, tight inline spacing, checkbox/radio gaps |
| `--spacing-200` | 8px | Tight grouping, small padding, icon-to-label gaps |
| `--spacing-300` | 12px | Card padding (sm), section gaps, chip padding |
| `--spacing-400` | 16px | Card padding (md), form field gaps, standard content padding |
| `--spacing-500` | 20px | Medium section spacing |
| `--spacing-600` | 24px | Card padding (lg), section margins |
| `--spacing-700` | 32px | Large section spacing |
| `--spacing-800` | 40px | Page-level vertical margins |
| `--spacing-1000` | 48px | Major page sections |
| `--spacing-1100` | 56px | Large CTAs height |
| `--spacing-1200` | 64px | Page top/bottom padding |
| `--spacing-1300` | 96px | Hero spacing |
| `--spacing-1400` | 128px | Major page gaps |
| `--spacing-1500` | 256px | Maximum spacing |

### Card padding presets (from `Card.tsx`)

| Preset | Padding | When to use |
|--------|---------|-------------|
| `none` | 0 | Custom internal layout |
| `sm` | `8px 12px` (`--spacing-200` / `--spacing-300`) | Compact cards, chips |
| `md` | `12px 16px` (`--spacing-300` / `--spacing-400`) | Standard cards (default) |
| `lg` | `16px 24px` (`--spacing-400` / `--spacing-600`) | Prominent cards, panels |

### Visual balance rule

Equal pixel values don't look equal. Larger text eats into perceived whitespace. Bottom padding needs to be numerically larger than top padding to look balanced. Judge by eye, not arithmetic. Small increments when adjusting — don't jump to extremes.

---

## 2. Typography Classes

Always use these CSS classes. Never set `font-family`, `font-size`, or `font-weight` inline.

### Headings — Rajdhani bold uppercase

| Class | Size (mobile) | Use for |
|-------|---------------|---------|
| `text-heading-h1` | 32px | Page titles |
| `text-heading-h2` | 28px | Major section titles |
| `text-heading-h3` | 24px | Section titles |
| `text-heading-h4` | 22px | Sub-section titles |
| `text-heading-h5` | 20px | Card group titles |
| `text-heading-h6` | 20px | Minor headings |

Headings are responsive — sizes increase at 834px (tablet) and 1440px (desktop) breakpoints via CSS variables. No extra work needed.

**Treatment:** Bold, uppercase, wide tracking. Add `font-weight: bold` and `text-transform: uppercase` when using heading classes.

### Labels — Oxanium bold

| Class | Size | Use for |
|-------|------|---------|
| `text-label-xs` | 12px | Chip text, small metadata |
| `text-label-sm` | 14px | Form labels, data readouts |
| `text-label-md` | 16px | Prominent labels |
| `text-label-lg` | 20px | Large data values |
| `text-label-xl` | 24px | Key metrics |

**Treatment:** Bold (700), uppercase, letter-spaced. The "circuit board" voice.

### Paragraphs — Space Grotesk medium

| Class | Size | Use for |
|-------|------|---------|
| `text-paragraph-xs` | 12px | Fine print, coaching cues |
| `text-paragraph-sm` | 14px | Body text, descriptions |
| `text-paragraph-md` | 16px | Standard body text |
| `text-paragraph-lg` | 20px | Prominent body text |
| `text-paragraph-xl` | 24px | Large body text |

**Treatment:** Medium weight (500), normal case. The "instrument panel readout" voice.

### CTA — Oxanium uppercase letter-spaced

| Class | Size | Use for |
|-------|------|---------|
| `text-cta-xs` | 12px | Small button labels |
| `text-cta-sm` | 14px | Standard button labels |
| `text-cta-md` | 16px | Prominent button labels |
| `text-cta-lg` | 20px | Large CTA buttons |

**Treatment:** Uppercase, `letter-spacing: 0.05em`. Already included in the class.

### Time — Oxanium

| Class | Size | Use for |
|-------|------|---------|
| `text-time-lg` | 20px | Timer displays |
| `text-time-xl` | 24px | Large timer displays |

### Tab — Oxanium

| Class | Size | Use for |
|-------|------|---------|
| `text-tab-xs` | 12px | Small tab labels |
| `text-tab-sm` | 14px | Standard tab labels |
| `text-tab-md` | 16px | Prominent tab labels |
| `text-tab-lg` | 20px | Large tab labels |
| `text-tab-xl` | 24px | Hero tab labels |

### Weight modifiers

| Class | Weight | Use for |
|-------|--------|---------|
| `font-regular` | 400 | De-emphasized text |
| `font-medium` | 500 | Standard body (already in paragraph classes) |
| `font-bold` | 700 | Emphasis, headings (already in label/heading classes) |

---

## 3. Visual Hierarchy — Color Layering

Every surface is alpha-transparent. Nothing is opaque. This creates the emissive, glassy look.

### Surface depth stack

```
Page background (--background, solid dark neutral)
  └─ Card surface (--surface-card, theme color @ 10% alpha)
       └─ Accent bar (--surface-card-accent, theme color @ 40% alpha)
            └─ CTA surface (--surface-cta-primary, complement color @ 40% alpha)
```

### Text hierarchy

| Token | Role | When to use |
|-------|------|-------------|
| `--text-header` | Page titles, primary headings | Top-level page headings |
| `--text-card-header` | Card titles | Headings inside cards |
| `--text-paragraph` | Body text, descriptions | Standard content text |
| `--text-card-label` | Metadata labels | "Sets", "Reps", section labels in cards |
| `--text-muted` | Secondary text | Dimmer than paragraph, brighter than disabled |
| `--text-disabled` | Unavailable items | Greyed out, non-interactive |

### Color logic

- **Theme color** (orange default) = **structure**: frames, borders, accent bars, surfaces, labels
- **Complement color** (blue in orange mode, orange in blue mode) = **interaction**: CTAs, buttons, tappable icons
- **Green** = **selection/confirmation**: selected chips, radio buttons, checkmarks. Theme-independent.
- **Red** = **urgency**: low timer warnings. NOT for destructive button styling.
- **Theme swap** flips structure ↔ interaction roles entirely

---

## 4. Card Anatomy & Container Decision Tree

### Composition

```
Card = LeftColumn + ChamferedFrame (with -2px marginLeft overlap)
```

```tsx
import { Card } from "@/components/Card";

<Card
  cornerSize="md"      // sm (8px), md (12px), lg (24px)
  padding="md"         // none, sm, md, lg
  showLeftColumn={true} // accent bar on left
  surfaceColor="var(--surface-card)"
  borderColor="var(--border-card)"
  accentColor="var(--surface-card-accent)"
>
  {children}
</Card>
```

### Key implementation details

- `hasLeftBorder={false}` on ChamferedFrame when paired with LeftColumn (Card does this automatically)
- `marginLeft: -2` on ChamferedFrame overlaps LeftColumn border (Card does this automatically)
- `LeftColumn` has `zIndex: 10` to sit above the overlap
- If building manually (not using Card), you must set these yourself

### Container decision tree

```
What are you building?
│
├─ A LIST ITEM or DATA CONTAINER? (workout item, form group, feedback state)
│  └─ Use Card
│     ├─ Has onClick? → Card auto-converts to <button>
│     ├─ No accent bar needed? → showLeftColumn={false}
│     └─ Tokens: --surface-card, --border-card, --surface-card-accent
│
├─ A BUTTON or SELECTION CONTROL?
│  └─ Use CTAButton, Chip, or RadioButton (they wrap ChamferedFrame internally)
│
├─ A FORM INPUT or SMALL DISPLAY? (text input, timer, streak)
│  └─ Use ChamferedFrame directly (Input, TimerDisplay wrap it)
│     └─ Tokens vary by context: --surface-input, --surface-timer, etc.
│
├─ A LAYOUT WRAPPER or GROUPING?
│  └─ Use plain <div>
│     ├─ Flex/grid container for multiple framed children
│     ├─ Collapsible section with internal state (like ExerciseCard)
│     └─ Never double-frame: if children are already framed, don't add another frame
│
└─ A HEADER or NAVIGATION BAR?
   └─ Use ChamferedFrame with bottomBorderOnly={true} (like PageHeader)
```

### Rules

- **Never wrap a Card inside another Card**
- **Never wrap a ChamferedFrame inside a Card** — use plain div between them
- **LeftColumn is never used standalone** — only as accent bar inside Card, CTAButton, TabbedPanel
- **If it's interactive and contains data, use Card** with `onClick`
- **If it's a control (button/chip/radio), use the dedicated component** — they handle ChamferedFrame internally

---

## 5. Interactive State Patterns

Every interactive element needs all applicable states.

### State progression

| State | Surface | Border | Text |
|-------|---------|--------|------|
| Default | Component token | Component token | Component token |
| Hover | `*-hover` variant | `*-hover` variant | `*-hover` variant |
| Selected | `--surface-selected` | `--border-selected` | `--text-selected` |
| Disabled | `--surface-disabled` | `--border-disabled` | `--text-disabled` |

### Hover technique

Hover on ChamferedFrame-based components uses **CSS custom properties**, not React state. This is critical because ChamferedFrame uses inline SVG `style={{ fill }}` — CSS `:hover` from a parent can't reach inline styles.

See `chamfered-component.md` Section A for the full pattern.

**Quick summary:**
1. Parent sets CSS custom properties: `--btn-surface: var(--surface-cta-primary)`
2. CSS class overrides on hover: `.cta-btn-primary:hover { --btn-surface: var(--surface-cta-primary-hover) }`
3. Children read the variable: `surfaceColor="var(--btn-surface)"`

### Disabled state

Always listed after default state so it takes precedence. Uses neutral tokens:
- `--surface-disabled` / `--surface-cta-primary-disabled`
- `--border-disabled`
- `--text-disabled`
- `--icon-disabled`
- `cursor-not-allowed`

### Selected state (green, theme-independent)

- `--surface-selected` (green @ 60% alpha)
- `--border-selected` (solid green)
- `--text-selected` (dark green)
- `--icon-selected` (dark green)

---

## 6. Atmosphere Utility Classes

Applied as **seasoning, not the main course**. Subtle enough that you'd only notice if removed.

| Class | What it does | Apply to |
|-------|-------------|----------|
| `scanlines` | Faint horizontal lines via `::after` pseudo-element | Blurred/frosted surfaces, CTA buttons, modal overlays |
| `grain-overlay` | Grain texture + global scan lines via `::before` and `::after` | Page-level wrapper only (one instance) |
| `pulse-micro` | Barely perceptible brightness oscillation (4s stepped) | Structural elements only: accent bars, LeftColumn, decorative borders |
| `glow-emissive` | Subtle `text-shadow` glow using `currentColor` | Key data readouts: timers, streak numbers, logo text |
| `text-shadow-glow` | Stronger `text-shadow` glow (10px spread) | Hero numbers, emphasized data |
| `stagger-reveal` | Children materialize in sequence (200ms stepped, 60ms stagger) | List containers, card groups, sequential data. Up to 8 children auto-indexed. |
| `animate-tab-enter` | Stepped opacity fade-in (150ms) | Tab content panels on tab switch |

### Rules

- `scanlines` requires `position: relative` on the parent (it uses `position: absolute` on `::after`)
- `stagger-reveal` children get `--stagger-index` automatically for the first 8 children
- All atmosphere animations respect `prefers-reduced-motion: reduce`
- Never use `scanlines` on everything — only on surfaces that should feel like frosted glass
- Never use `pulse-micro` on content — only on structural/decorative elements

---

## 7. General Principles

### No rounded corners
Use `ChamferedFrame` or `corner-cut` CSS class. Never `border-radius`. The only exception is `border-radius: 50%` for background gradient blobs (not UI elements).

### No bounce/spring animations
Motion is `linear` or `steps()`, ≤200ms. The single exception: ChamferedFrame fill/stroke transition uses `1s ease` — the system's "heartbeat."

### No Lucide icons in new code
Use `src/components/icons.tsx`. If an icon doesn't exist, follow `icon-transform.md` to add it.

### No hardcoded colors
Every color reference must be a semantic token (`--surface-*`, `--border-*`, `--text-*`, `--icon-*`). Never hex values, `rgb()`, or primitive tokens (`--color-orange-500`) in component files.

### No inline typography
Always use typography classes (`text-heading-*`, `text-label-*`, `text-paragraph-*`, `text-cta-*`). Never set `font-family`, `font-size`, or `font-weight` inline except when composing with an existing class.

### Voice
Terse, imperative, gym-literate. "Initiate Workout" not "Let's get started!" See `docs/design-philosophy.md` Voice section.

### Atmosphere: reference existing work first, then extend
When applying atmosphere (scanlines, glow, pulse, stagger-reveal), **check existing pages first** to see how similar surfaces are treated. Use those as your baseline. You can extend or create new treatments when the situation genuinely calls for it — but start from what's already there rather than inventing from scratch. When in doubt, lighter touch is safer than heavier.

---

## 8. Page Layout Patterns

All pages follow a consistent structure. Don't invent new layout patterns.

### Shared layout: AppLayout

Most pages use `AppLayout`, which provides:
- Fixed `PageHeader` at top (48px height)
- Content constrained to `max-width: 28rem` (448px), centered
- Horizontal padding: `var(--spacing-400)` (16px) on each side
- `grain-overlay` class on the root wrapper

### Canonical page structure

```tsx
// Inside AppLayout, your page content follows this pattern:
<div style={{
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--spacing-600)',          // 24px between major sections
  paddingTop: 'var(--spacing-600)',   // 24px below header
}}>
  {/* Major sections: cards, tabbed panels, form groups */}
</div>
```

### Spacing hierarchy at page level

| Context | Token | Value | Example |
|---------|-------|-------|---------|
| Between major sections | `--spacing-600` | 24px | Between cards on HomeScreen |
| Between items in a tight group | `--spacing-200` | 8px | List items, filter chips |
| Between sub-sections | `--spacing-400` | 16px | Within a settings group |
| Page top (below header) | `--spacing-600` | 24px | First content after PageHeader |
| Page bottom (no footer) | `--spacing-700` | 32px | Scroll padding at bottom |
| Page bottom (with footer) | `--spacing-1300` | 96px | Clearance for fixed footer |

### Layouts available

| Layout | Use for | Max width |
|--------|---------|-----------|
| `AppLayout` | Standard pages (Home, Generate, Review, History, Settings) | 28rem |
| `WorkoutLayout` | Active workout screen | 28rem |
| `AuthLayout` | Sign in, create account, forgot password | Full width (centered) |
| `OnboardingLayout` | Onboarding flow | 28rem |

### Key rules

- **Always use an existing layout** — don't create page structure from scratch
- **28rem max-width is non-negotiable** — the app is mobile-first
- **`stagger-reveal` on main content wrapper** — most pages use this for progressive reveal
- **Fixed footers get extra bottom padding** — `--spacing-1300` (96px) to clear the footer
- **Card padding is uniform** — use `padding="md"` (the default) unless there's a specific reason

---

## Source Files

| File | What it contains |
|------|-----------------|
| `src/index.css` | All tokens, typography classes, atmosphere utilities |
| `src/components/Card.tsx` | Card padding config, LeftColumn + ChamferedFrame composition |
| `src/components/CTAButton.tsx` | CSS variable hover technique reference implementation |
| `src/components/ChamferedFrame.tsx` | SVG double-width stroke + clip technique |
| `docs/design-philosophy.md` | Abstract design vision (color logic, motion, voice) |

---

## Related Skills

- [component](component.md) — Pre-flight checklist before any UI work
- [chamfered-component](chamfered-component.md) — ChamferedFrame + LeftColumn patterns, CSS variable hover technique
- [token-decision-tree](token-decision-tree.md) — Which token to use for what
- [anti-patterns](anti-patterns.md) — Common mistakes to avoid
- [token-check](token-check.md) — Post-build token verification
