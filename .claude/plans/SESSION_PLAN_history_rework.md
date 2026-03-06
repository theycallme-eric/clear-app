## Session Goal
Rework the history detail view to use the Review card's visual hierarchy with collapsed/expandable sections, showing what the user actually did (logged data). Add placeholder star + repeat actions. Create the Star icon.

## Context
- Reference: `Clear_-_Favorites_Spec_v2.md` → "History Detail View" under UI Elements
- Reference: `Clear_-_UI_Component_Spec.md` — card and section patterns
- Reference: `design-tokens.json` — colors, spacing, typography tokens
- Figma: Review card section headers for visual reference
- Prerequisite: Session 1 (persistence gap) must be complete — this view reads the data that session wires up
- Current state:
  - History detail view (`SessionDetailScreen.tsx`) renders sections with Card components, exercises as flat name + sets/reps within each card
  - Review card has rich hierarchy via `WorkoutSectionCard.tsx`: section headers with `text-label-xs font-bold uppercase tracking-widest` + `--text-card-label` color, detailed exercise cards
  - Section headers are inline in `WorkoutSectionCard.tsx` (not extracted as a component yet) — consider extracting a shared `SectionHeader` component or matching the styling
  - History list cards (the list view) are fine — minimal changes needed there

### × Encoding Clarification
The spec mentions a `\u00D7` encoding bug. Investigation found this is a **Unicode escape sequence in source code** (`\u00D7` in JSX), not a rendering bug — it displays correctly as × in the browser. The Review card uses a literal `×` character. For consistency, replace the escape sequence with a literal `×` in SessionDetailScreen. This is a one-line source cleanup, not a data or rendering issue.

### Icon Constraint
CLAUDE.md requires: **No Lucide icons** — use `src/components/icons.tsx` for all icons. A Star icon does NOT exist yet and must be created following `icon-transform.md`. The existing icons use solid fills, angular/geometric construction, chunky proportions (3-5px thick at 24px), minimum 2px padding from viewBox edge. Add the Star icon creation as the first task.

## Tasks

### 1. Create Star icon in icons.tsx
**Do:** Add a solid, geometric 5-point star icon to `src/components/icons.tsx` in the "Semantic / Content" section (near Flame, Zap, Dumbbell). Follow the existing pattern:

```tsx
export const Star = (props: IconProps) => (
  <Svg {...props}>
    <path d="..." />
  </Svg>
);
```

Design requirements:
- Solid fill (no strokes), inherits `currentColor`
- Angular/geometric construction matching the CLEAR aesthetic (stamped HUD glyphs)
- Chunky proportions (3-5px arm thickness at 24px scale)
- Minimum 2px padding from viewBox edge (usable area roughly 4-20px)
- Hard angles, no rounded tips
- `fillRule="evenodd"` if the star has a hollow center, single `<path>` if solid

Also add it to the Iconography section of `ComponentGallery.tsx`.

**Acceptance:**
- [ ] `Star` exported from `icons.tsx`
- [ ] Follows existing icon pattern (Svg wrapper, IconProps, solid fill)
- [ ] Visually matches CLEAR's angular, chunky aesthetic
- [ ] Added to ComponentGallery iconography section
- [ ] No Lucide imports added

**Update:** None

---

### 2. Fix × source encoding + clean up prescription display
**Do:** In `SessionDetailScreen.tsx`, replace the `\u00D7` Unicode escape with a literal `×` character for consistency with the rest of the codebase (ExerciseCard uses literal `×`).

Find: `\u00D7`
Replace with: `×`

**Acceptance:**
- [ ] Source code uses literal `×` not `\u00D7`
- [ ] Prescription display unchanged (was already rendering correctly)

**Update:** None

---

### 3. Build collapsible section headers for history detail
**Do:** Replace the current flat Card-per-section layout with collapsible sections. Reference `WorkoutSectionCard.tsx` for visual treatment — specifically the section label styling: `text-label-xs font-bold uppercase tracking-widest` with `color: var(--text-card-label)`.

Each section header shows:
- Section name (e.g., "PRIMARY LIFT", "ACCESSORY", "CORE", "WARM-UP", "COOLDOWN")
- Structure type if applicable (e.g., "SUPERSET", "FOR TIME", "AMRAP")
- Collapse/expand indicator (chevron — check `icons.tsx` for ChevronDown/ChevronRight or similar)

**Default state: all sections collapsed.** User taps to expand.

Consider extracting a reusable `SectionHeader` component if one doesn't already exist, since Favorites detail will reuse this same pattern.

**Acceptance:**
- [ ] History detail shows collapsible section headers matching WorkoutSectionCard visual style
- [ ] All sections collapsed by default
- [ ] Tap toggles expand/collapse
- [ ] Section names and structure types display correctly
- [ ] Uses design tokens for colors, typography, spacing — no hardcoded values

**Update:** None

---

### 4. Build expanded exercise display
**Do:** When a section is expanded, show each exercise with:
- **Exercise name** — bold, same visual weight as WorkoutSectionCard exercise names
- **Sets × reps** — e.g., "4×6"
- **Equipment type** — e.g., "barbell", "dumbbells"
- **Logged weight** — what the user actually lifted (from `exercises.weight_logged`). If null/empty, don't show a placeholder — just omit.
- **Exercise notes** — what the user wrote (from `exercises.exercise_notes`). If null/empty, omit.

**Explicitly NOT shown:**
- Tempo
- Rest periods
- Effort % (@75% etc.)
- Easier alternatives
- Swap actions

The logged data (weight, notes) should be visually distinct from the prescription data (sets×reps, equipment). Consider a subtle label or different text treatment so the user can tell "what was prescribed" from "what I did."

Note: `fetchWorkoutDetail()` in `home-data.ts` already returns `weight` and `note` per exercise from the DB. The data is there — just display it.

**Acceptance:**
- [ ] Expanded section shows exercise name, sets×reps, equipment, logged weight, exercise notes
- [ ] Logged weight and notes only appear if data exists
- [ ] Tempo, rest, effort%, alternatives, swap are NOT shown
- [ ] Visual distinction between prescribed data and logged data
- [ ] Works for all section types: standard, superset, circuit, AMRAP, For Time, EMOM, Ladder
- [ ] Uses design tokens — no hardcoded values

**Update:** None

---

### 5. Add Favorite toggle and Repeat button to history detail
**Do:** Add two actions to the history detail view:

**Favorite toggle (Star icon from Task 1):**
- Positioned in the header area of the history detail view (near the title/date)
- Tapping stars/unstars the workout
- For now: just toggle local visual state. The actual `saved_workouts` write happens in Session 3. Wire it to a no-op handler with a TODO comment.

**Repeat button:**
- Positioned at the bottom of the history detail view (similar to "START WORKOUT" on the Review card)
- Label: "REPEAT"
- Styled consistently with CTAButton (the existing CTA pattern used for "START WORKOUT")
- For now: no-op with TODO comment. The actual flow (load into Review screen) happens in Session 3.

**Acceptance:**
- [ ] Star icon (from `icons.tsx`, NOT Lucide) visible on history detail view
- [ ] Repeat button visible at bottom of history detail view, styled consistently with CTAButton
- [ ] Both have TODO handlers — they render but don't do anything yet
- [ ] Star icon uses design token colors (e.g., `--icon-badge` or `--text-card-label` when active, `--text-disabled` when inactive)

**Update:** None

---

### 6. Verify against real data
**Do:** Open the history detail for a workout that was completed AFTER Session 1 shipped (so it has logged weights and structure results). Verify:
- Sections collapse and expand correctly
- Logged weights display where entered
- Exercise notes display where entered
- Structure results for timed sections show (if applicable)
- Star and Repeat button render correctly

Also check a workout from BEFORE Session 1 (no logged data). Confirm it renders cleanly with no empty states or errors — just the prescription data without logged fields.

**Acceptance:**
- [ ] Post-Session-1 workout: logged data displays correctly
- [ ] Pre-Session-1 workout: renders cleanly without logged data, no errors
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Mobile layout works (test at 375px width)

**Update:** SESSION_LOG.md, BACKLOG.md

## Design System Compliance
- Use tokens from `src/index.css` for all colors, spacing, typography
- Match WorkoutSectionCard section header styling
- Follow existing component patterns in the codebase
- Use Star icon from `icons.tsx` — no Lucide imports
- Mobile-first — test at 375px width minimum

## After Session (REQUIRED — you are not done until this is complete)
- [ ] Update SESSION_LOG.md with: Date, Tasks Completed, Files Touched
- [ ] Update BACKLOG.md — mark history detail rework as complete
- [ ] Confirm: "Session complete. Log and Backlog updated. Ready for next plan."
