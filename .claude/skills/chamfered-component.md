---
name: chamfered-component
description: Create components using the ChamferedFrame + LeftColumn pattern
trigger: Building components with chamfered corners or left accent bars
category: ui
---

# Skill: Chamfered Component

Create components using the ChamferedFrame + LeftColumn pattern from the CLEAR design system.

## When to Use

Use this skill when building components that need:
- Chamfered (angled) corner at bottom-right
- Optional left accent bar
- Surface/border/accent color tokens
- Optional hover/disabled states

Examples: CTAButton, ActionCard, Cards, Fields, Toasts, Radio Labels, Timers, Labels

---

## Required Inputs

1. **Component name** - e.g., `InfoCard`, `FormField`
2. **Figma node selection** - Select the component/variant set in Figma desktop app
3. **Has accent bar?** - Yes/No (LeftColumn on left side)
4. **Has hover states?** - Yes/No

---

## Build Process

### Step 1: Extract Figma Variables (if needed)

If CSS tokens are unclear, fetch from Figma:

```
mcp__figma-desktop__get_variable_defs
mcp__figma-desktop__get_screenshot
```

Map Figma variables to existing CSS tokens in `src/index.css`:

| Figma Variable | CSS Token |
|----------------|-----------|
| `surface/cta-primary` | `--surface-cta-primary` |
| `surface/cta-accent` | `--surface-cta-accent` |
| `border/color/cta-primary` | `--border-cta-primary` |
| `text-color/cta` | `--text-cta` |

If a variable is missing from index.css, add it to both `:root` (orange theme) and `[data-theme="blue"]` sections.

---

### Step 2: Component Structure

#### With Accent Bar (e.g., buttons, action cards)

```tsx
import { ChamferedFrame } from "./ChamferedFrame";
import { LeftColumn } from "./LeftColumn";

<div className="flex items-stretch">
  {/* Left accent column */}
  <LeftColumn
    size="sm"  // sm=8px, md=12px
    surfaceColor="var(--surface-cta-accent)"
    borderColor="var(--border-cta-primary)"
    className="relative z-10"
  />

  {/* Main body with chamfered corner */}
  <ChamferedFrame
    cornerSize="sm"  // sm=8px, md=12px, lg=24px
    surfaceColor="var(--surface-cta-primary)"
    borderColor="var(--border-cta-primary)"
    hasLeftBorder={false}  // IMPORTANT: false to merge with LeftColumn
    className="flex-1 -ml-[2px]"  // IMPORTANT: -ml-[2px] overlaps border
  >
    {/* Content here */}
  </ChamferedFrame>
</div>
```

#### Without Accent Bar (e.g., cards, containers)

```tsx
import { ChamferedFrame } from "./ChamferedFrame";

<ChamferedFrame
  cornerSize="md"
  surfaceColor="var(--surface-card)"
  borderColor="var(--border-card)"
  hasLeftBorder={true}  // true for standalone frames
>
  {/* Content here */}
</ChamferedFrame>
```

#### Grouping Elements (Container Pattern)

When grouping form fields or related UI elements, wrap them in a **Card** container.
Do NOT wrap each individual element in its own ChamferedFrame.

**DO: Use Card as a container**
```tsx
import { Card } from "./Card";

<Card cornerSize="md" padding="md">
  <Input label="Email" ... />
  <Input label="Password" ... />
  <Textarea ... />
</Card>
```

**DON'T: Wrap each element individually**
```tsx
// WRONG - Don't do this
<ChamferedFrame><Input ... /></ChamferedFrame>
<ChamferedFrame><Input ... /></ChamferedFrame>
```

Use this pattern for:
- Sign in / Sign up forms
- Settings sections with multiple inputs
- Any group of related form fields

The Card component provides the chamfered frame with left accent bar.
The elements inside keep their own styling.

---

### Step 3: Hover States (if needed)

Use CSS custom properties that change on hover. This allows LeftColumn and ChamferedFrame to respond without prop changes.

```tsx
<button
  className={cn(
    "group",
    // Default state - define CSS custom properties
    "[--cmp-surface:var(--surface-cta-primary)]",
    "[--cmp-border:var(--border-cta-primary)]",
    "[--cmp-accent:var(--surface-cta-accent)]",
    // Hover state - change properties on hover
    "hover:[--cmp-surface:var(--surface-cta-primary-hover)]",
    "hover:[--cmp-border:var(--border-cta-primary-hover)]",
  )}
>
  <LeftColumn
    surfaceColor="var(--cmp-accent)"
    borderColor="var(--cmp-border)"
  />
  <ChamferedFrame
    surfaceColor="var(--cmp-surface)"
    borderColor="var(--cmp-border)"
    hasLeftBorder={false}
    className="flex-1 -ml-[2px]"
  >
    {/* Content */}
  </ChamferedFrame>
</button>
```

#### Disabled State Override

```tsx
disabled && [
  "[--cmp-surface:var(--surface-cta-primary-disabled)]",
  "[--cmp-border:var(--border-disabled)]",
  "[--cmp-accent:var(--surface-cta-primary-disabled)]",
]
```

---

### Step 4: Size Variants (if needed)

```tsx
const sizeConfig = {
  sm: { height: "h-10", cornerSize: "sm", leftColSize: "sm" },
  md: { height: "h-12", cornerSize: "sm", leftColSize: "sm" },
  lg: { height: "h-14", cornerSize: "md", leftColSize: "sm" },
};
```

---

## CSS Token Reference

### Surfaces (backgrounds)
- `--surface-cta-primary` / `--surface-cta-primary-hover` / `--surface-cta-primary-disabled`
- `--surface-cta-secondary` / `--surface-cta-secondary-hover` / `--surface-cta-secondary-disabled`
- `--surface-cta-accent` (left accent bar)
- `--surface-card` / `--surface-card-accent`
- `--surface-success` / `--surface-error` / `--surface-info`

### Borders
- `--border-cta-primary` / `--border-cta-primary-hover`
- `--border-cta-secondary` / `--border-cta-secondary-hover`
- `--border-card`
- `--border-disabled`
- `--border-success` / `--border-error` / `--border-info`

### Text
- `--text-cta` / `--text-cta-hover` / `--text-disabled`
- `--text-header` / `--text-paragraph`

### Icons
- `--icon-cta` / `--icon-cta-hover` / `--icon-disabled`

---

## Section A: CSS Variable Hover Technique

**This is the pattern LLMs miss most.** ChamferedFrame uses inline SVG `style={{ fill }}` — CSS `:hover` from a parent can't reach inline styles. CSS custom properties bridge this gap.

### How it works (using CTAButton as reference)

**Step 1: Define CSS custom properties on the wrapper**

```tsx
// In CTAButton.tsx — the button element sets CSS vars as inline styles
const btnVars = {
  '--btn-surface': 'var(--surface-cta-primary)',
  '--btn-border': 'var(--border-cta-primary)',
  '--btn-accent': 'var(--surface-cta-primary-accent)',
};

<button
  className={cn("group", "cta-btn-primary")}
  style={{ ...btnVars } as React.CSSProperties}
>
```

**Step 2: CSS class overrides on hover (in `index.css`)**

```css
/* These classes change the CSS custom properties on :hover */
.cta-btn-primary:hover {
  --btn-surface: var(--surface-cta-primary-hover);
  --btn-border: var(--border-cta-primary-hover);
}
.cta-btn-secondary:hover {
  --btn-surface: var(--surface-cta-secondary-hover);
  --btn-border: var(--border-cta-secondary-hover);
}
```

**Step 3: Children read the CSS variable**

```tsx
<LeftColumn
  surfaceColor="var(--btn-accent)"
  borderColor="var(--btn-border)"
/>
<ChamferedFrame
  surfaceColor="var(--btn-surface)"   // ← reads the CSS variable
  borderColor="var(--btn-border)"     // ← reads the CSS variable
  hasLeftBorder={false}
/>
```

**Step 4: Disabled state overrides (listed after default, takes precedence)**

```tsx
const btnVars = disabled
  ? {
      '--btn-surface': 'var(--surface-cta-primary-disabled)',
      '--btn-border': 'var(--border-disabled)',
      '--btn-accent': 'var(--surface-cta-primary-disabled)',
    }
  : { /* default vars */ };
```

When disabled, the inline style values override the CSS class hover — the hover class only applies when `cta-btn-primary` is present, and disabled buttons don't get that class.

### Why this exists

1. ChamferedFrame renders SVG with `style={{ fill: surfaceColor }}` — inline styles
2. CSS `:hover` selectors on a parent can't change a child's inline `fill`
3. CSS custom properties CAN be inherited — parent sets `--btn-surface`, child reads it via `var(--btn-surface)`
4. When the CSS class changes `--btn-surface` on hover, the SVG fill updates automatically — no React re-render needed

### Template for new components

```tsx
// 1. Define your CSS vars (pick unique names to avoid collisions)
const vars = disabled
  ? { '--my-surface': 'var(--surface-disabled)', '--my-border': 'var(--border-disabled)' }
  : { '--my-surface': 'var(--surface-card)', '--my-border': 'var(--border-card)' };

// 2. Add a hover class to index.css
// .my-component:hover { --my-surface: var(--surface-card-hover); }

// 3. Apply class conditionally (not when disabled)
<button
  className={cn(!disabled && "my-component")}
  style={vars as React.CSSProperties}
>
  <ChamferedFrame surfaceColor="var(--my-surface)" borderColor="var(--my-border)" ... />
</button>
```

---

## Section B: SVG Double-Width Stroke + Clip

ChamferedFrame draws its border using an SVG trick that produces perfectly uniform borders with clean corners. Understanding this is essential if you need to modify or extend the component.

### The shape

Pentagon: rectangle with a 45-degree chamfer on the bottom-right corner.

```
(0,0) ────────────── (w,0)
  │                     │
  │                     │
  │                  (w, h-s)
  │                   ╱
(0,h) ──── (w-s, h)
```

Where `s` = corner size (sm=8, md=12, lg=24).

### The technique

1. **Shape path** defines the outer edge of the pentagon
2. **Fill layer**: `<path d={shapePath} style={{ fill: surfaceColor }}` — background color
3. **Stroke layer**: `<path d={strokePath} strokeWidth={borderWidth * 2}` — border at 2x desired width
4. **ClipPath**: `<clipPath><path d={shapePath} /></clipPath>` clips the stroke to the shape

**Why 2x width?** SVG strokes are centered on the path — half inside, half outside. Clipping to the shape removes the outer half. Result: perfectly uniform inner border of the desired width.

### Border path variations

- **Full border** (`hasLeftBorder={true}`): `strokePath = shapePath` (closed loop)
- **No left border** (`hasLeftBorder={false}`): open path from `(0,0)` → around → `(0,h)`, no line closing back to start. This leaves the left edge unstroked for LeftColumn junction.
- **Bottom border only** (`bottomBorderOnly={true}`): path only traces `(0,h)` → `(w-s,h)` → `(w,h-s)`

### The 1-second transition

```tsx
style={{ fill: surfaceColor, transition: 'fill 1s ease' }}
style={{ stroke: borderColor, transition: 'stroke 1s ease' }}
```

This is the **only slow animation** in the system. When a card's surface shifts (timer green-to-red, selection state change), it *breathes* rather than snaps. This is the system's heartbeat — preserve it.

### CSS clip-path for backdrop-filter

In addition to SVG clipping, ChamferedFrame applies a CSS `clip-path: polygon(...)` to the container div. This ensures `backdrop-filter: blur()` (used by parent components) is clipped to the chamfered shape.

---

## Section C: ResizeObserver Pattern

Both ChamferedFrame and TabbedPanel need to know their own pixel dimensions to draw SVG paths. They use the same pattern:

### The pattern

```tsx
const containerRef = useRef<HTMLDivElement>(null);
const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

useEffect(() => {
  if (!containerRef.current) return;

  const observer = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const el = entry.target as HTMLElement;
      setDimensions({ width: el.offsetWidth, height: el.offsetHeight });
    }
  });

  observer.observe(containerRef.current);

  // Initial measure (outside observer callback)
  setDimensions({
    width: containerRef.current.offsetWidth,
    height: containerRef.current.offsetHeight,
  });

  return () => observer.disconnect();
}, []);
```

### Key details

- **Initial measure outside observer**: The ResizeObserver callback fires asynchronously. Measuring immediately prevents a flash of zero-dimension SVG.
- **Cleanup**: `observer.disconnect()` in the effect cleanup prevents memory leaks.
- **Unique clip IDs**: Each instance generates a random ID (`chamfer-clip-${Math.random()...}`) to avoid SVG `clipPath` ID collisions when multiple instances are on screen.
- **Conditional rendering**: SVG only renders when `width > 0 && height > 0` to avoid broken paths.

---

## Section D: Creating New Angular Shapes

If you need a shape beyond the standard ChamferedFrame pentagon, follow these principles.

### Standard chamfer sizes

Always use one of the three standard sizes. Don't invent new ones.

| Size | Pixels | Used by |
|------|--------|---------|
| `sm` | 8px | Buttons, chips, small controls |
| `md` | 12px | Cards, panels, frames (default) |
| `lg` | 24px | Hero elements, TabbedPanel diagonals |

### Computing a chamfer cut

For a **bottom-right cut** on a rectangle `(w, h)` with chamfer `s`:
```
Original corner: (w, h)
Replacement path: (w, h-s) → (w-s, h)

Full path:
M 0 0 → L w 0 → L w (h-s) → L (w-s) h → L 0 h → Z
```

For a **top-right cut** (like TabbedPanel outer frame):
```
Original corner: (w, 0)
Replacement path: (w-s, 0) → (w, s)
```

### Choosing rendering method

| Method | When to use | Examples |
|--------|-------------|---------|
| SVG path + ResizeObserver | Dynamic shapes that need borders and respond to container size | ChamferedFrame, TabbedPanel, TabBar |
| CSS `clip-path: polygon()` | Static shapes or backgrounds without borders | CornerAngle, RightColumn, corner-cut class |
| Plain CSS (borders, flexbox) | Simple bars with no angular geometry | LeftColumn |

### Diagonal boundaries between regions

Used by TabBar for tab separators. The active tab determines which direction the diagonal cuts:

- Active tab is LEFT of boundary: diagonal runs `(bx, 0)` → `(bx + chamfer, height)` (leans right)
- Active tab is RIGHT of boundary: diagonal runs `(bx + chamfer, 0)` → `(bx, height)` (leans left)

See `src/lib/tab-geometry.ts` for the calculation functions.

### Border technique for any shape

Always use the **double-width stroke + clip** pattern:
```tsx
<path d={shapePath} strokeWidth={borderWidth * 2} clipPath={`url(#${clipId})`} />
```
This produces uniform inner borders with clean corners on any arbitrary polygon.

### Key rule: match existing patterns

Before creating a new angular shape, check if an existing component can be composed or extended. Most UI should use Card, ChamferedFrame, or CTAButton. Only create new geometry for genuinely novel layouts (like TabbedPanel's tab system).

---

## Key Files

- `src/components/ChamferedFrame.tsx` — SVG-based chamfered container
- `src/components/LeftColumn.tsx` — Left accent bar
- `src/index.css` — All CSS tokens (check `:root` and `[data-theme="blue"]`)
- `src/components/CTAButton.tsx` — Reference implementation with hover states
- `src/components/ActionCard.tsx` — Reference implementation without hover states

## Related Skills

- [component](component.md) — General component guidelines
- [ui-rules](ui-rules.md) — Spacing, typography, visual hierarchy
- [token-decision-tree](token-decision-tree.md) — Which token to use
- [anti-patterns](anti-patterns.md) — Common mistakes to avoid
- [token-check](token-check.md) — Verify design tokens

## Related Agents

- [figma-ui-implementer](.claude/agents/figma-ui-implementer.md) — Figma-to-code workflow

---

## Checklist

- [ ] Figma variables mapped to CSS tokens
- [ ] Missing tokens added to index.css (both themes)
- [ ] Correct structure: LeftColumn + ChamferedFrame OR ChamferedFrame alone
- [ ] `hasLeftBorder={false}` and `marginLeft: -2` when using LeftColumn
- [ ] Hover states use CSS custom properties (not inline style changes)
- [ ] Build passes: `npm run build`
- [ ] Visual check at `http://localhost:5173/#gallery`
