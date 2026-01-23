# Component Audit Notes

**Date:** January 23, 2026
**Context:** Audit of all UI components to identify unused, redundant, or consolidation opportunities

---

## Summary

- **Total shadcn/ui components:** 47
- **Actually used in the app:** 12
- **Unused (safe to delete):** 30
- **Custom components:** All used except NavLink

---

## shadcn/ui — Keep (Used in App)

| Component | Where Used |
|-----------|-----------|
| `button` | App.tsx (sidebar reference) |
| `toaster` | App.tsx (toast provider) |
| `sonner` | App.tsx (toast provider) |
| `tooltip` | App.tsx (TooltipProvider wrapper) |

## shadcn/ui — Keep (Component Gallery Only)

These are only imported in the Component Gallery but useful to have for the design system reference:

| Component | Notes |
|-----------|-------|
| `badge` | 4 variants (default, secondary, destructive, outline) |
| `input` | Standard text input |
| `textarea` | Multi-line input |
| `slider` | Range slider (Radix-based) |
| `switch` | Toggle switch |
| `progress` | Progress bar |
| `card` | Card with Header/Title/Description/Content/Footer |

## shadcn/ui — Unused (Safe to Delete)

These 30 components are never imported anywhere in the app:

- `accordion`
- `alert-dialog`
- `alert`
- `aspect-ratio`
- `avatar`
- `breadcrumb`
- `calendar`
- `carousel`
- `chart`
- `checkbox`
- `collapsible`
- `command`
- `context-menu`
- `dropdown-menu`
- `drawer`
- `hover-card`
- `input-otp`
- `menubar`
- `navigation-menu`
- `pagination`
- `popover`
- `radio-group`
- `resizable`
- `scroll-area`
- `select`
- `sidebar`
- `table`
- `tabs`
- `toggle`
- `toggle-group`

---

## Duplicate/Redundant Systems

### Two Toast Systems
- **Sonner** (`sonner.tsx`) — the one actually used throughout the app via `toast()` from `sonner`
- **Radix Toast** (`toast.tsx`, `toaster.tsx`, `use-toast.ts`) — installed but never used
- **Recommendation:** Remove the Radix toast files

### Two Button Systems
- **shadcn Button** (`button.tsx`) — has 6 variants + sizes + proper a11y (focus rings, disabled states)
- **Custom CSS classes** (`glow-button`, `ghost-button`, `selection-active/inactive`) — what the app actually uses
- **Recommendation:** Either extend shadcn Button with custom variants OR formalize the CSS classes with proper a11y

### Two Card Systems
- **shadcn Card** (`card.tsx`) — standard Card/CardHeader/CardContent pattern
- **`glass-card`** (CSS class) — what the app actually uses everywhere
- **Recommendation:** Pick one. Either restyle shadcn Card to match glass-card, or drop it

### Two Input Patterns
- **shadcn Input/Textarea** — standard bordered inputs with ring focus styles
- **Glass-card wrapped inputs** — raw `<input>` inside `glass-card p-4` with `bg-transparent`
- **Recommendation:** Create one input component matching the app aesthetic

---

## Sidebar Dependency Chain

The `sidebar.tsx` component pulls in `sheet`, `skeleton`, `separator`, `tooltip`, `input`, and `button` as dependencies. If sidebar isn't being used, this whole chain is dead weight.

---

## Custom Components — All Used

| Component | Used In |
|-----------|---------|
| `AbandonmentModal` | Index.tsx |
| `AnchorGrid` | GenerationScreen, ComponentGallery |
| `EmptyState` | HomeScreen, HistoryScreen, ComponentGallery |
| `ErrorState` | HomeScreen, ComponentGallery |
| `ExerciseCard` | WorkoutSectionCard |
| `GenerateButton` | GenerationScreen, ComponentGallery |
| `Header` | HomeScreen, GenerationScreen |
| `IntensitySlider` | GenerationScreen, ComponentGallery |
| `LoadingScreen` | Index.tsx, ComponentGallery |
| `LoadingSkeleton` | HomeScreen, SessionDetailScreen, ComponentGallery |
| `LoadingSpinner` | ComponentGallery only |
| `LocationAccordion` | GenerationScreen, ComponentGallery |
| `OptionalFields` | GenerationScreen |
| `ReviewHeader` | ReviewScreen |
| `StartWorkoutButton` | ReviewScreen |
| `WorkoutOverview` | ReviewScreen |
| `WorkoutSectionCard` | ReviewScreen |

### Custom Components — Unused
| Component | Notes |
|-----------|-------|
| `NavLink` | Exists but never imported anywhere |

### Custom Components — Gallery-Only Usage
| Component | Notes |
|-----------|-------|
| `LoadingSpinner` | Only used in ComponentGallery — consider if needed elsewhere |

---

## Consolidation Opportunities

1. **Remove 30 unused shadcn components** — zero impact, cleaner repo
2. **Remove Radix toast system** — using Sonner instead
3. **Remove NavLink** — never imported
4. **Decide on Button system** — shadcn vs custom CSS classes
5. **Decide on Card system** — shadcn Card vs glass-card
6. **Decide on Input pattern** — shadcn Input vs glass-card wrapped
7. **Remove sidebar + its dependency chain** — if not planning to use it
