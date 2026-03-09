---
name: component
description: Mandatory workflow for any UI work — pre-flight checks, component creation, and token usage
trigger: Before creating, modifying, or adding ANY UI element
category: ui
---

# Skill: UI Work — Pre-flight + Component Creation

## Why This Exists

Every UI task must pass through this skill. The pre-flight catches the most common mistakes:
- Building something that already exists
- Using inline styles instead of tokens
- Creating one-offs that should be reusable
- Missing states that similar components already handle

**Do not skip the pre-flight.** The 2 minutes it takes prevents 30 minutes of rework.

---

## Phase 1: Pre-flight (MANDATORY — before writing any code)

### Step 1: Inventory what exists

Before building anything, scan these sources:

```
1. Read src/pages/ComponentGallery.tsx — visual inventory of every reusable component
2. Scan src/components/*.tsx — file names tell you what's available
3. Check src/components/ui/*.tsx — low-level primitives (Input, Textarea, etc.)
4. Read src/index.css — all available semantic tokens
```

**Ask yourself:** Does a component already exist that does this (or nearly does this)?

- **Yes, exact match** → Use it. Do not recreate.
- **Yes, close match** → Extend the existing component with a new variant/prop. Do not fork.
- **No match** → Proceed to Step 2.

### Step 2: Check for token coverage

Look at the visual properties your UI needs (colors, surfaces, borders, text colors).

```
1. Read src/index.css — search for semantic tokens that match the role
2. Check both :root (orange theme) and [data-theme="blue"] sections
```

**Ask yourself:** Do semantic tokens exist for every color/surface/border I need?

- **Yes** → Use them. Never use primitive tokens (--color-orange-500) directly.
- **No, but a similar role exists** → Use the closest semantic token.
- **No, this is a genuinely new role** → Create new semantic tokens (see Token Creation Rules below).

### Step 3: Reusability decision

**Ask yourself:** Will this pattern appear in more than one place, or is it a clearly generic UI concept (tabs, dropdowns, modals, list items)?

- **Yes** → Build it as a reusable component from the start. Do not wait for the second instance.
- **No, truly one-off** → Build inline, but still use tokens and existing components as building blocks.

**Patterns that are ALWAYS reusable** (never build inline):
- Tabs / tab bars
- Modals / confirmation dialogs
- Dropdowns / filter selectors
- List items (workout items, favorites items, etc.)
- Loading states
- Error states

### Step 4: State audit

Check how similar components handle states. Open 1-2 existing components that are close to what you're building.

**Every interactive component needs:**
- Default state
- Hover state (if clickable)
- Active/selected state (if selectable)
- Disabled state (if it can be disabled)

**Use the same token patterns** as existing components for consistency. E.g., if buttons use `--surface-cta-primary-hover` for hover, your new interactive element should follow the same convention.

---

## Phase 2: Build the Component

### Structure

- Functional component with `interface Props`
- Import `cn` from `@/lib/utils` for class merging
- Accept `className?: string` for composition
- Keep components "visual only" — move logic to hooks or parent pages

### Use existing building blocks

| Need | Reach for |
|------|-----------|
| Chamfered container | `Card` (with accent bar) or `ChamferedFrame` (without) |
| Left accent bar | `LeftColumn` (usually via `Card`) |
| Primary/secondary actions | `CTAButton` |
| Text input | `Input` from `src/components/ui/` |
| Text area | `Textarea` from `src/components/ui/` |
| Selectable pill | `Chip` |
| Empty content placeholder | `EmptyState` |
| Loading placeholder | `LoadingSkeleton` |
| Error display | `ErrorState` |
| Page title bar | `PageHeader` |
| Icons | `src/components/icons.tsx` (never Lucide directly) |

### File Placement

- Shared reusable components → `src/components/`
- Page-specific sub-components → `src/components/[feature]/` (e.g., `src/components/workout/`)
- Low-level UI primitives → `src/components/ui/`

### Component Template

```tsx
import { cn } from '@/lib/utils';

interface ComponentNameProps {
  className?: string;
  // other props
}

export function ComponentName({ className, ...props }: ComponentNameProps) {
  return (
    <div className={cn('base-classes', className)}>
      {/* content */}
    </div>
  );
}
```

---

## Phase 3: After Creation

1. **Run token-check** — verify no hardcoded colors slipped in
2. **Add to gallery** — every new reusable component gets a section in ComponentGallery.tsx showing all variants/states
3. **Build check** — `npm run build` must pass
4. **Visual check** — visit `/#gallery` to verify

---

## Token Creation Rules

### When to create a new semantic token

Create a new token when:
- A visual role doesn't have a semantic token (e.g., you need a tab surface color and `--surface-tab-active` doesn't exist)
- The same primitive value is used in 2+ places for the same purpose
- The role is distinct from existing tokens (not just a synonym)

### When NOT to create a new token

- The role already has a token — use it
- It's a one-off decorative value with no semantic meaning
- You're tempted to create a token per-component instead of per-role (e.g., `--surface-history-card` when `--surface-card` already covers it)

### How to create tokens

1. Choose a clear name following existing conventions: `--{category}-{role}[-{state}]`
   - Categories: `surface`, `border`, `text`, `icon`
   - Roles: descriptive of function, not component (e.g., `tab-active` not `home-screen-tab`)
   - States: `hover`, `selected`, `disabled`, `active`
2. Add to BOTH `:root` and `[data-theme="blue"]` in `src/index.css`
3. Map to primitive color variables (e.g., `var(--color-orange-500)`) — never hardcoded hex
4. If Tailwind classes are needed, update `tailwind.config.ts`

### Naming examples

```css
/* Good — describes the role */
--surface-tab-active: var(--color-brown-800);
--surface-tab-inactive: transparent;
--border-tab-active: var(--color-orange-500);
--text-tab-active: var(--color-cream-100);
--text-tab-inactive: var(--color-brown-400);

/* Bad — describes the component or is too specific */
--surface-history-tab: ...;        /* component-specific, not role-based */
--home-screen-active-bg: ...;      /* page-specific */
--orange-tab-color: ...;           /* describes the value, not the role */
```

---

## Component Registry — Quick Reference

> What already exists. Check here FIRST.

### Layout & Containment
| Component | Purpose | Key Props |
|-----------|---------|-----------|
| `Card` | Universal container with chamfered corner + accent bar | `padding`, `cornerSize`, `onClick`, `surfaceColor` |
| `ChamferedFrame` | Raw chamfered container (use Card unless you need bare frame) | `cornerSize`, `surfaceColor`, `borderColor`, `hasLeftBorder` |
| `LeftColumn` | Left accent bar (usually via Card) | `size`, `surfaceColor`, `borderColor` |
| `PageHeader` | Page title with optional back button | `title`, `onBack` |

### Actions & Inputs
| Component | Purpose | Key Props |
|-----------|---------|-----------|
| `CTAButton` | Primary/secondary action buttons | `variant`, `size`, `fullWidth`, `loading`, `disabled` |
| `ActionButton` | Icon-based action button | `icon`, `onClick` |
| `Chip` | Selectable pill / label tag | `variant`, `selected`, `onClick`, `disabled` |
| `RadioButton` | Radio selection | `selected`, `onChange`, `label` |
| `Checkbox` | Checkbox toggle | `checked`, `onChange`, `label` |
| `Input` | Text input (in `ui/`) | `label`, `value`, `onChange` |
| `Textarea` | Multi-line input (in `ui/`) | `label`, `value`, `onChange` |
| `IntensitySlider` | 1-10 intensity picker | `value`, `onChange` |

### Navigation & Filtering
| Component | Purpose | Key Props |
|-----------|---------|-----------|
| `TabBar` | Chamfered file-folder tabs (SVG-based, N tabs) | `tabs`, `activeTab`, `onChange` |
| `FilterDropdown` | Chamfered dropdown filter with flyout menu | `label`, `options`, `value`, `onChange` |
| `FilterToggle` | Chamfered "All" reset button (no dropdown) | `active`, `onClick`, `label` |

### Feedback & States
| Component | Purpose | Key Props |
|-----------|---------|-----------|
| `EmptyState` | Empty content placeholder | `title`, `description`, `icon` |
| `ErrorState` | Error display | `title`, `description`, `onRetry` |
| `LoadingSkeleton` | Loading placeholder | `variant` |
| `LoadingSpinner` | Inline spinner | `size` |
| `ChamferedToast` | Toast notifications | via toast system |
| `WeekStreakDisplay` | 7-day streak grid with chamfered cells | `weekView`, `highlightToday` |

### Modals
| Component | Purpose | Key Props |
|-----------|---------|-----------|
| `ConfirmationModal` | Generic confirmation dialog | `title`, `description`, `confirmLabel`, `onConfirm`, `onCancel` |

### List Items
| Component | Purpose | Key Props |
|-----------|---------|-----------|
| `WorkoutListItem` | Workout history card (date, anchor, intensity, duration) | `workout`, `onClick` |
| `FavoriteListItem` | Saved workout card (title, stats, last completed) | `favorite`, `onClick` |

### Specialized
| Component | Purpose |
|-----------|---------|
| `TimerDisplay` | Formatted time display |
| `MoodIcon` | Mood indicator icons |
| `AnchorGrid` | Anchor muscle group selector |
| `GoalSelector` | Workout goal picker |
| `WorkoutOverview` | Workout summary display |
| `AnimatedBackground` | Ambient background effect |
| `icons.tsx` | All custom icons (never use Lucide directly) |

---

## Checklist

- [ ] **Pre-flight completed** (inventory, tokens, reusability, states)
- [ ] No component recreated that already exists
- [ ] All colors use semantic tokens (no primitives, no hex)
- [ ] New tokens added to both themes (if created)
- [ ] Interactive states defined (hover, selected, disabled)
- [ ] Component is "dumb" (no business logic)
- [ ] Added to ComponentGallery.tsx (if new reusable component)
- [ ] Build passes: `npm run build`

---

## Reference Files

- `src/index.css` — CSS variables / design tokens
- `src/pages/ComponentGallery.tsx` — Visual component inventory
- `tailwind.config.ts` — Tailwind theme config
- `src/lib/utils.ts` — `cn()` helper
- `docs/design-philosophy.md` — Design language and feel

## Related Skills

- [chamfered-component](.claude/skills/chamfered-component.md) — ChamferedFrame + LeftColumn patterns
- [token-check](.claude/skills/token-check.md) — Verify design token usage
- [gallery-add](.claude/skills/gallery-add.md) — Add to component gallery
- [icon-transform](.claude/skills/icon-transform.md) — Create new icons

## Related Agents

- [figma-ui-implementer](.claude/agents/figma-ui-implementer.md) — For Figma-to-code implementation
