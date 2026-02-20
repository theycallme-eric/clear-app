# Workout Card Fine-Tuning Plan

## Context
Previous session did a first pass on all workout card components (GlobalTimer, SectionTimer, ActiveExerciseCard, StructureCards, SessionDetailScreen). The direction is right but needs fine-tuning. This session should work through each screen/component one at a time with the user, then cascade approved patterns to similar components.

## Approach: One-at-a-time, Cascade Pattern
1. Pick a component
2. Show it to the user (dev server or gallery)
3. Iterate until the user approves
4. Cascade the approved patterns to all similar components
5. Move to the next component

## What Was Done (First Pass)

### GlobalTimer.tsx
- **New**: Green chamfered pill using two-layer clip-path (outer = border color, inner = fill)
- Uses `--surface-radio-selected`, `--border-radio-select`, `--text-radio-text-select`
- Font: `text-heading-h4 font-bold` (Rajdhani)
- Figma ref: node `26328:1249`
- **Review**: Is the clip-path pill shape right? Sizing? Should it match an existing component pattern instead of custom clip-path?

### SectionTimer.tsx
- **Modified**: Replaced legacy colors with design tokens
- **New**: State-aware colors (red for low-time, green for complete), "Done" label, angular buttons
- Still uses circular SVG progress ring
- **Review**: Do angular square buttons feel right inside a circular timer? Should the ring stay circular or go angular? Does the "Done" label work?

### ActiveExerciseCard.tsx
- **Modified**: Checkbox from round/orange → angular/green-success, inputs use `cyber-input`, coaching cues restyled
- **New**: Notes toggle + input field (`MessageSquare` icon → "Add note" button → text input)
- **New**: Regression/Progression display ("Easier:"/"Harder:" in expanded area)
- **New**: Completed state uses dimmed surface colors instead of opacity-60
- **Review**: Does the notes UX feel right? Is the info hierarchy correct (what's always-visible vs collapsed)? Are the completed-state colors too subtle or just right?

### StructureCards.tsx (SupersetCard + CircuitCard)
- **Changed**: Both now wrap exercises in a `<Card>` container with label header
- SupersetCard: was gradient connecting line + vertical rotated text → now Card with "SUPERSET" label
- CircuitCard: was connecting dots between separate cards → now Card with "CIRCUIT · X ROUNDS" label
- **Review**: Card-in-card nesting — does this look/feel right? Is the label placement good? Should the inner cards have reduced styling to avoid visual noise?

### SessionDetailScreen.tsx
- **Modified only**: Replaced 3x `text-clear-orange` → `var(--border-card)`, `text-clear-lime` → `var(--color-green-400)`, `text-sm` → `text-paragraph-sm`
- No structural changes
- **Review**: Minimal changes here, probably fine

## Cascade Checklist
When a pattern is approved, cascade it to:
- [ ] All exercise cards use the same input styling
- [ ] All labels use the same color tokens
- [ ] All checkboxes use the same angular style
- [ ] All section headers use the same pattern
- [ ] All timers use consistent token usage
- [ ] StructureCards inner cards match standalone cards

## Files Involved
```
src/components/workout/GlobalTimer.tsx
src/components/workout/SectionTimer.tsx
src/components/workout/ActiveExerciseCard.tsx
src/components/workout/StructureCards.tsx
src/pages/SessionDetailScreen.tsx
src/pages/WorkoutScreen.tsx (parent layout — not changed yet)
src/components/workout/SectionRenderer.tsx (orchestrator — not changed)
src/components/workout/WorkoutExerciseItem.tsx (dead code — unused in active app)
```

## Gaps Noted (Not This Session)
- Circuit auto-progress (functional, not styling)
- Timed intervals type missing from workout.ts
- EMOM/AMRAP/ForTime distinct UX
- Data persistence for exercise logging
- Personal times in history display
