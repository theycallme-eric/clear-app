# Session Plan: Glass-Card → Chamfered Card Migration (Part 2: Workout Components)

## Session Goal
Replace `glass-card` in ActiveExerciseCard and WorkoutSectionCard — the two workout-experience components that need careful handling of collapse/expand states and accent styling.

## Context
- Reference: `src/components/ui/Card.tsx` — Card component API (padding, accentColor, showLeftColumn, className props)
- Reference: `src/components/workout/ActiveExerciseCard.tsx` — collapsible exercise card with left accent border
- Reference: `src/components/WorkoutSectionCard.tsx` — accordion container for workout sections
- Figma: Check ActiveExerciseCard and WorkoutSectionCard frames for completed/active states
- Current state: Phase 1+2 complete (ErrorState, EmptyState, modals migrated). These components are higher risk — they affect the active workout experience.

---

## Tasks

### 1. Migrate ActiveExerciseCard.tsx (Special Case)

**Skill:** `component.md`

**Do:**
- Open `src/components/workout/ActiveExerciseCard.tsx`
- Import `Card` from `../ui/Card`
- This card has a left accent border when NOT completed, and reduced opacity when completed. The chamfered Card already has a left accent column — use it:

```tsx
<Card
  padding="none"
  className={cn("transition-all duration-300", isCompleted && "opacity-60")}
  accentColor={isCompleted ? "var(--color-neutral-alpha-300)" : "var(--surface-card-accent)"}
>
```

- Remove the old `glass-card` class and the manual `border-l-4 border-l-clear-orange` styling
- Keep `overflow-hidden` if the Card doesn't already handle it — pass via `className` if needed
- Preserve all collapse/expand logic inside the card (only changing the wrapper)

**Acceptance:**
- [ ] No `glass-card` string in ActiveExerciseCard.tsx
- [ ] No manual `border-l-4` styling — accent comes from Card's left column
- [ ] Active exercise: shows orange accent column
- [ ] Completed exercise: shows muted accent + 60% opacity
- [ ] Expand/collapse animation still works
- [ ] Set logging, rep counting, notes — all interactive elements still functional
- [ ] `npm run build` passes

---

### 2. Migrate WorkoutSectionCard.tsx

**Skill:** `component.md`

**Do:**
- Open `src/components/WorkoutSectionCard.tsx`
- Import `Card` (check relative path)
- Replace `glass-card` wrapper with Card using Pattern C (Accordion):

```tsx
<Card padding="none">
  <button onClick={toggle} className="w-full p-4">Header</button>
  {expanded && <div className="px-4 pb-4">Content</div>}
</Card>
```

- Adjust padding classes on inner elements to work with `padding="none"` on the outer Card
- Keep `overflow-hidden` via className if needed for expand/collapse animation

**Acceptance:**
- [ ] No `glass-card` string in WorkoutSectionCard.tsx
- [ ] Section header is tappable, toggles expand/collapse
- [ ] Expanded content shows exercises correctly
- [ ] Collapse animation doesn't clip or glitch
- [ ] `npm run build` passes

---

### 3. Integration Test — Active Workout Flow

**Skill:** `debug.md`

**Do:**
- Run `npm run build`
- Test the full active workout flow:
  1. Generate or start a workout
  2. Verify section cards render with chamfered styling
  3. Expand/collapse a section
  4. Log a set on an exercise
  5. Complete an exercise — verify it goes to muted/60% opacity state
  6. Open note modal (already migrated in Part 1 — confirm still works)
  7. Check that workout with multiple sections all render correctly
- Test on both themes if available

**Acceptance:**
- [ ] Full workout flow works end to end
- [ ] No visual regressions in exercise cards or section cards
- [ ] Completed vs active exercise states are visually distinct
- [ ] Build passes

**Update:** SESSION_LOG.md

---

## Design System Compliance
- Accent colors must use CSS variables (`--surface-card-accent`, `--color-neutral-alpha-300`), not hardcoded hex
- Match Figma specs via MCP for active/completed exercise states
- Follow Card component API — don't add new props without discussing

## After Session (REQUIRED — not done until complete)

- [ ] Update SESSION_LOG.md with: Date, Tasks Completed, Files Touched
- [ ] Update BACKLOG.md if migration progress is tracked there
- [ ] Confirm: "Session complete. Phase 3 glass-card migration done (ActiveExerciseCard, WorkoutSectionCard). Ready for Part 3: Screen Pages + Cleanup."
