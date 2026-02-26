# Glass-Card to Chamfered Card Migration Plan

## Overview
Replace all `glass-card` CSS class usages with the chamfered `Card` component across the entire app, while ensuring workout structure displays (superset, circuit, EMOM, AMRAP, etc.) remain properly functional.

## Context from Inbox Screenshots
The inbox screenshots document:
- **Component/Screen mapping** - exact files to modify
- **Exercise structure types** - 7 different workout structures needing distinct UI
- **Design work needed** - specialized displays for each structure type

## Files to Migrate

### Phase 1: Core Components (Low Risk)
These are standalone components, easy to test in isolation.

| File | Instances | Usage Pattern | Card Config |
|------|-----------|---------------|-------------|
| `src/components/ErrorState.tsx` | 1 | State container | `padding="lg"` + centered |
| `src/components/EmptyState.tsx` | 1 | State container | `padding="lg"` + centered |
| `src/components/LoadingSkeleton.tsx` | 1 | Skeleton card | Already done |

### Phase 2: Modals (Medium Risk)
Need to preserve animations and internal structure.

| File | Instances | Usage Pattern | Notes |
|------|-----------|---------------|-------|
| `src/components/AbandonmentModal.tsx` | 1 | Modal dialog | Keep `animate-in`, internal padding structure |
| `src/components/workout/NoteModal.tsx` | 1 | Modal with form | Has header/content/footer sections with borders |

### Phase 3: Workout Components (Higher Risk)
These affect the active workout experience - test thoroughly.

| File | Instances | Usage Pattern | Notes |
|------|-----------|---------------|-------|
| `src/components/workout/ActiveExerciseCard.tsx` | 1 | Collapsible card | Has left accent border when not completed |
| `src/components/WorkoutSectionCard.tsx` | 1 | Accordion container | Expand/collapse with header |

### Phase 4: Screen Pages (Highest Volume)
Many instances, but mostly similar patterns.

| File | Instances | Primary Pattern |
|------|-----------|-----------------|
| `src/pages/SettingsScreen.tsx` | 15 | Interactive menu items, accordions, equipment lists |
| `src/pages/HomeScreen.tsx` | 4 | Dashboard cards, workout list items |
| `src/pages/HistoryScreen.tsx` | 3 | Filter dropdowns, session list items |
| `src/pages/SessionDetailScreen.tsx` | 3 | Section cards, notes display |
| `src/pages/SummaryScreen.tsx` | 3 | Stats display, notes textarea |
| `src/pages/OnboardingScreen.tsx` | 3 | Form containers |
| `src/pages/ComponentGallery.tsx` | 2 | Demo containers (move to Museum) |

## Migration Patterns

### Pattern A: Static Display Card
**Before:**
```tsx
<div className="glass-card p-4">
  <Content />
</div>
```
**After:**
```tsx
<Card padding="md">
  <Content />
</Card>
```

### Pattern B: Interactive Button Card
**Before:**
```tsx
<button className="w-full glass-card p-4 text-left hover:border-clear-orange/60 transition-all">
  <Content />
</button>
```
**After:**
```tsx
<Card padding="md" onClick={handler}>
  <Content />
</Card>
```
Note: Card component already handles button semantics when `onClick` provided.

### Pattern C: Accordion/Collapsible
**Before:**
```tsx
<div className="glass-card overflow-hidden">
  <button onClick={toggle} className="w-full p-4">Header</button>
  {expanded && <div className="px-4 pb-4">Content</div>}
</div>
```
**After:**
```tsx
<Card padding="none">
  <button onClick={toggle} className="w-full p-4">Header</button>
  {expanded && <div className="px-4 pb-4">Content</div>}
</Card>
```

### Pattern D: Modal Container
**Before:**
```tsx
<div className="glass-card p-6 animate-in slide-in-from-bottom">
```
**After:**
```tsx
<Card padding="lg" className="animate-in slide-in-from-bottom">
```

### Pattern E: Dropdown Menu
**Before:**
```tsx
<div className="absolute top-full left-0 z-10 glass-card p-2">
```
**After:**
```tsx
<Card className="absolute top-full left-0 z-10" padding="sm" showLeftColumn={false}>
```
Note: Dropdowns may look better without left accent column.

### Pattern F: ActiveExerciseCard (Special Case)
**Before:**
```tsx
<div className={cn(
  "glass-card overflow-hidden transition-all duration-300",
  isCompleted ? "opacity-60 bg-secondary/30" : "border-l-4 border-l-clear-orange",
)}>
```
**After:**
The chamfered Card already has a left accent column. For completed state:
- Use `accentColor` prop to change column color (e.g., muted for completed)
- Or use `showLeftColumn={!isCompleted}` to hide when completed
- Keep `opacity-60` on wrapper for completed state

```tsx
<Card
  padding="none"
  className={cn("transition-all duration-300", isCompleted && "opacity-60")}
  accentColor={isCompleted ? "var(--color-neutral-alpha-300)" : "var(--surface-card-accent)"}
>
```

## Special Considerations

### Workout Structure Types
Per the inbox documentation, these structures need distinct UI (some are already implemented, some need work):

1. **Standard** - Current baseline, straightforward Card
2. **Superset** - Visual connection between paired exercises (may need custom component)
3. **Circuit** - Round counter, exercise flow, "next round" state
4. **EMOM** - Per-minute interval, "GO!" prompt, round tracker
5. **AMRAP** - Running timer, round counter input
6. **For Time** - Count-up timer, time cap warning, completion celebration
7. **Timed/Ladder** - Not fully implemented yet

For this migration, we focus on replacing glass-card while preserving existing structure logic. Enhancing the structure-specific displays is a separate task.

### Hover States
The Card component doesn't currently have built-in hover states. For interactive cards, we need to either:
1. Add hover prop to Card component
2. Apply hover classes via className

### Glass Backdrop Effect
The glass-card has `backdrop-filter: blur(20px)`. The chamfered Card uses solid `--surface-card` color. This is an intentional design change - the new cards are more opaque/solid.

## Implementation Order

1. **Phase 1: Core Components** - ErrorState, EmptyState
2. **Phase 2: Modals** - AbandonmentModal, NoteModal
3. **Phase 3: Workout Components** - ActiveExerciseCard, WorkoutSectionCard
4. **Phase 4a: Lower-traffic pages** - OnboardingScreen, SessionDetailScreen, SummaryScreen
5. **Phase 4b: Higher-traffic pages** - HistoryScreen, HomeScreen
6. **Phase 4c: Settings** - SettingsScreen (highest instance count)
7. **Cleanup** - Remove glass-card CSS, update ComponentGallery Museum

## Verification

After each phase:
1. Run `npm run build` to catch TypeScript errors
2. Visual inspection of affected screens
3. Test interactive elements (clicks, hovers, accordions)
4. Test on both themes (orange and blue) if applicable

### Key Screens to Test
- Home dashboard with recent workouts
- History list with filters
- Settings navigation and accordions
- Active workout with exercise cards
- Summary screen with notes
- Session detail view
- Onboarding flow

## Files to Delete/Update After Migration

1. Remove from `src/index.css`:
   - `.glass-card` class definition (lines 585-594)
   - `[data-theme="blue"] .glass-card` variant (lines 592-594)

2. Update `src/pages/ComponentGallery.tsx`:
   - Remove glass-card demo from active section
   - Optionally add to Museum section for historical reference
