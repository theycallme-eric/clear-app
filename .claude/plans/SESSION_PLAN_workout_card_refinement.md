# Workout Card Refinement Plan

## Goal
Refine all workout card components to match design direction. Focus on information hierarchy (glanceable vs detailed) and visual consistency.

## Backlog Items
- [ ] **Data persistence gap** - Exercise weight/reps/completion not saved to DB (address after UI work)
- [ ] **Circuit auto-progress** - Currently manual checkbox completion. Needs auto-advance to next exercise + round tracking
- [ ] **Timed Intervals gap** - `timed` type (work_seconds/rest_seconds) exists in generation.ts but missing from workout.ts ExerciseStructure. Not rendered in SectionRenderer
- [ ] **EMOM per-minute intervals** - EMOM should show per-minute interval display + "GO!" prompt
- [ ] **AMRAP round counter** - AMRAP should have round counter input
- [ ] **For Time completion** - For Time should have time cap warning + completion celebration
- [ ] **Personal times in history** - SessionDetailScreen doesn't show section/workout times

---

## Phase Summary

| Phase | Item | Status | Notes |
|-------|------|--------|-------|
| 1a | GlobalTimer | DONE | Green chamfered pill matching Figma design |
| 1b | SectionTimer | DONE | All design tokens, state-aware colors (low time/complete/active) |
| 2 | Standard Cards | DONE | Notes field added, info hierarchy improved, all legacy colors removed |
| 3 | Superset | DONE | Exercises grouped in shared Card container with label |
| 4 | Circuit | DONE (styling) | Visual grouping done. Auto-progress is a functional gap → backlog |
| 5 | Timed Sections | VERIFIED | EMOM/AMRAP/ForTime render with correct labels + timer modes. Deeper per-type UX → backlog |
| 6 | Timed Intervals | VERIFIED | NOT implemented. Type missing from workout.ts → backlog |
| 7 | History Display | DONE | Legacy colors replaced with design tokens |

---

## Changes Made

### GlobalTimer.tsx
- Green chamfered pill with `--surface-radio-selected` bg, `--border-radio-select` border
- Dark text (`--text-radio-text-select`) on green background
- Two-layer clip-path for border simulation around chamfered corner
- Rajdhani bold h4 heading font

### SectionTimer.tsx
- Replaced all legacy colors (`stroke-clear-orange`, `bg-clear-orange`, `bg-secondary`)
- State-aware ring color: normal → `--border-card`, low time → red, complete → green
- Angular buttons (removed `rounded-full`)
- Added "Done" label on completion

### ActiveExerciseCard.tsx
- Replaced `rounded-full` checkbox with angular design
- Green success colors for completed state (`--surface-success`, `--border-success`)
- Uses `cyber-input` class for weight/reps inputs
- Added notes toggle + input field (data flows through existing `onLog` callback)
- Coaching cues + regression/progression in expanded area
- Info hierarchy: name + rep scheme always visible, inputs below
- Completed state: dimmed surface, hidden left accent column

### StructureCards.tsx
- **SupersetCard**: Exercises grouped inside a shared Card with "SUPERSET" label
- **CircuitCard**: Exercises grouped inside a shared Card with "CIRCUIT · X ROUNDS" label
- Removed old gradient line/connecting line approach
- All legacy colors replaced with design tokens

### SessionDetailScreen.tsx
- Replaced `text-clear-orange` → `var(--border-card)` for section headers
- Replaced `text-clear-lime` → `var(--color-green-400)` for note text
- Replaced `text-sm` → `text-paragraph-sm` for design system typography

---

## Verification
- [x] TypeScript compiles (`npx tsc --noEmit`)
- [x] Build passes (`npm run build`)
- [ ] Visual check in app (requires auth)
