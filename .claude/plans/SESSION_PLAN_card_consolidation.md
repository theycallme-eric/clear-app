# Card Styling Consolidation Plan

## Goal
Consolidate all card patterns to use `ChamferedFrame` + `LeftColumn` as the universal card container. All cards get the accent bar pattern.

---

## Phase 1: Create Universal Card Component

**New file:** `src/components/Card.tsx`

Create a `Card` component modeled after `ActionCard` but without hardcoded content structure:

```typescript
interface CardProps {
  children: ReactNode;
  className?: string;
  cornerSize?: "sm" | "md" | "lg";  // Chamfer: 8/12/24px
  padding?: "none" | "sm" | "md" | "lg";
  onClick?: () => void;
  showLeftColumn?: boolean;  // Default true, false for nested cards
}
```

**Key details:**
- Uses `LeftColumn` + `ChamferedFrame` composition
- `-ml-[2px]` overlap technique from ActionCard
- `hasLeftBorder={false}` on ChamferedFrame for seamless join
- CSS variables for colors (future Figma integration)

---

## Phase 2: Add Card CSS Variables

**File:** `src/index.css`

Add semantic card variables (placeholders for Figma values):

```css
:root {
  --surface-card-default: var(--surface-cta-primary);
  --surface-card-accent: var(--surface-cta-accent);
  --border-card-default: var(--border-cta-primary);
}
```

---

## Phase 3: Migration (by complexity)

### Group A: Simple Containers (~15 usages)
Low risk, straightforward replacement.

| File | Lines |
|------|-------|
| `IntensitySlider.tsx` | 8, 31 |
| `AnchorGrid.tsx` | 23 |
| `LocationAccordion.tsx` | 19 |
| `WorkoutOverview.tsx` | 23, 28, 33 |
| `WorkoutHeader.tsx` | 25 |
| `SectionTimer.tsx` | 66 |

### Group B: State Components (~3 usages)
Isolated, easy to test.

| File | Lines |
|------|-------|
| `EmptyState.tsx` | 26 |
| `ErrorState.tsx` | 20 |
| `LoadingSkeleton.tsx` | 13 |

### Group C: Interactive Cards (~20 usages)
Add `onClick` prop, use `as="button"` for semantics.

| File | Lines |
|------|-------|
| `HomeScreen.tsx` | 93, 106, 201 |
| `HistoryScreen.tsx` | 238 |
| `SettingsScreen.tsx` | 298, 319, 343, 364, 389, 423, 487, 526, 632, 679 |
| `OnboardingScreen.tsx` | 159 |

### Group D: Exercise Cards (~4 usages)
Uses `.exercise-card` class.

| File | Lines |
|------|-------|
| `ExerciseCard.tsx` | 10 |
| `WorkoutSectionCard.tsx` | 35 |
| `WorkoutExerciseItem.tsx` | 38 |

### Group E: Complex Section Cards (~5 usages)
Careful migration - accordion/expand behavior.

| File | Notes |
|------|-------|
| `WorkoutSectionCard.tsx` | Collapsible sections |
| `ActiveExerciseCard.tsx` | Conditional left border for completion state |

### Group F: Modal Cards (~2 usages)

| File | Lines |
|------|-------|
| `AbandonmentModal.tsx` | 16 |
| `NoteModal.tsx` | 42 |

---

## Phase 4: Cleanup

1. Remove `.glass-card` from `src/index.css`
2. Remove `.exercise-card` and `.exercise-card-title` from `src/index.css`
3. Delete `src/components/ui/card.tsx` (unused Shadcn component)
4. Update `ComponentGallery.tsx` to showcase new Card

---

## Critical Files

**Building blocks (no changes needed):**
- `src/components/ChamferedFrame.tsx`
- `src/components/LeftColumn.tsx`

**Pattern reference:**
- `src/components/ActionCard.tsx` - follow this composition pattern

**New file:**
- `src/components/Card.tsx`

**CSS updates:**
- `src/index.css`

---

## Verification

1. Run `npm run dev` and navigate to `/component-gallery` (or `/#gallery`)
2. Verify new Card renders with chamfered frame + left accent bar
3. Test all migrated components visually
4. Check interactive cards have hover states
5. Verify nested cards work with `showLeftColumn={false}`
6. Run `npm run build` to catch TypeScript errors
