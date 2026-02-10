# Chamfered Component Skill

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

## Key Files

- `src/components/ChamferedFrame.tsx` - SVG-based chamfered container
- `src/components/LeftColumn.tsx` - Left accent bar
- `src/index.css` - All CSS tokens (check `:root` and `[data-theme="blue"]`)
- `src/components/CTAButton.tsx` - Reference implementation with hover states
- `src/components/ActionCard.tsx` - Reference implementation without hover states

---

## Checklist

- [ ] Figma variables mapped to CSS tokens
- [ ] Missing tokens added to index.css (both themes)
- [ ] Correct structure: LeftColumn + ChamferedFrame OR ChamferedFrame alone
- [ ] `hasLeftBorder={false}` and `-ml-[2px]` when using LeftColumn
- [ ] Hover states use CSS custom properties (not inline style changes)
- [ ] Build passes: `npm run build`
- [ ] Visual check at `http://localhost:5173/#gallery`
