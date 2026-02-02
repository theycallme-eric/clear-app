# Clear - V1 Refinement Roadmap
**Created:** January 27, 2026  
**Goal:** Polish MVP into a V1 worth sharing  
**Approach:** Refine UI, consolidate components, add polish—don't reinvent

---

## V1 Definition

**MVP (Done):** Auth → Onboarding → Generate → History works end-to-end

**V1 (This Roadmap):** 
- Consistent, polished UI
- Unified component patterns
- Smooth transitions/animations
- Refined color application
- Something you'd comfortably share

**V2 (Later):** New features built on solid V1 foundation

---

## Phase Overview

| Phase | Focus | Status |
|-------|-------|--------|
| Phase 1 | UI Component Audit | ⚪ Not Started |
| Phase 2 | Component Consolidation | ⚪ Not Started |
| Phase 3 | Color & Typography Refinement | ⚪ Not Started |
| Phase 4 | Transitions & Animations | ⚪ Not Started |
| Phase 5 | Final Polish & QA | ⚪ Not Started |

---

## Phase 1: UI Component Audit ⭐ START HERE

**Goal:** Understand what exists before changing anything  
**Tool:** Claude Code  
**Output:** Component inventory with inconsistencies flagged

### Task 1.1: Inventory Existing Components
**Status:** ⚪

**What to document:**
- [ ] List all component files in `src/components/`
- [ ] Note which components are actually used vs orphaned (Lovable bloat)
- [ ] Identify duplicate/similar components

### Task 1.2: Card Audit
**Status:** ⚪

**What to document:**
- [ ] How many card variants exist?
- [ ] What are the styling differences? (borders, shadows, padding, radius)
- [ ] Where is each variant used?
- [ ] Which should be the canonical pattern?

### Task 1.3: Accordion Evaluation
**Status:** ⚪

**What to document:**
- [ ] Where are accordions used?
- [ ] What's inside them?
- [ ] Would a different pattern work better? (cards, inline expansion, tabs)

### Task 1.4: Other Pattern Inconsistencies
**Status:** ⚪

**What to document:**
- [ ] Button variants and usage
- [ ] Input field styling
- [ ] Spacing patterns
- [ ] Header/navigation patterns

### Phase 1 Checkpoint
- [ ] Full component inventory documented
- [ ] Inconsistencies clearly identified
- [ ] Recommendations for consolidation
- [ ] Ready to make decisions on what to unify

---

## Phase 2: Component Consolidation

**Goal:** Unify components into consistent patterns  
**Dependencies:** Phase 1 complete

### Task 2.1: Define Canonical Card
**Status:** ⚪

Based on audit, define THE card pattern:
- [ ] Border style
- [ ] Shadow/elevation
- [ ] Padding (internal spacing)
- [ ] Border radius
- [ ] Background treatment
- [ ] Hover/interactive states (if applicable)

### Task 2.2: Apply Card Pattern
**Status:** ⚪

- [ ] Update all card usages to canonical pattern
- [ ] Remove duplicate card components
- [ ] Document card usage in component library

### Task 2.3: Resolve Accordion Question
**Status:** ⚪

Based on audit decision:
- [ ] Keep accordions (if they work) — standardize styling
- [ ] Replace accordions — implement alternative pattern
- [ ] Document the pattern

### Task 2.4: Clean Up Unused Components
**Status:** ⚪

- [ ] Delete orphaned Lovable components
- [ ] Remove unused imports
- [ ] Verify app still works

### Phase 2 Checkpoint
- [ ] Single canonical card component
- [ ] Accordion decision implemented
- [ ] Unused code removed
- [ ] No visual regressions

---

## Phase 3: Color & Typography Refinement

**Goal:** Refine color application across UI  
**Dependencies:** Phase 2 complete (components stable)

### Task 3.1: Color Audit
**Status:** ⚪

Review current color usage:
- [ ] Primary color (orange) — where and how used
- [ ] Background colors — consistency
- [ ] Text colors — hierarchy clear?
- [ ] Semantic colors (success, error, etc.)
- [ ] Any colors that feel "off"

### Task 3.2: Color Updates
**Status:** ⚪

Based on audit:
- [ ] Define specific changes needed
- [ ] Update color tokens if needed
- [ ] Apply across components
- [ ] Test in context (not just isolation)

### Task 3.3: Typography Check
**Status:** ⚪

- [ ] Is type hierarchy clear?
- [ ] Font weights being used correctly?
- [ ] Any readability issues?

### Phase 3 Checkpoint
- [ ] Colors feel intentional and cohesive
- [ ] Type hierarchy clear
- [ ] No muddy or unclear visual areas

---

## Phase 4: Transitions & Animations

**Goal:** Make UI feel responsive and polished  
**Dependencies:** Phase 3 complete (visuals stable)

### Task 4.1: Define Animation System
**Status:** ⚪

- [ ] Timing tokens (fast, normal, slow)
- [ ] Easing curves
- [ ] What should animate vs. what shouldn't

### Task 4.2: Page Transitions
**Status:** ⚪

- [ ] Route transitions (fade, slide?)
- [ ] Loading state transitions
- [ ] Modal enter/exit

### Task 4.3: Micro-interactions
**Status:** ⚪

- [ ] Button hover/press states
- [ ] Card hover states (if interactive)
- [ ] Input focus states
- [ ] Checkbox/toggle animations

### Task 4.4: Workout-Specific Animations
**Status:** ⚪

- [ ] Timer animations
- [ ] Progress indicators
- [ ] Completion celebrations (subtle)
- [ ] Intensity visual feedback (optional)

### Phase 4 Checkpoint
- [ ] UI feels responsive
- [ ] Animations enhance, don't distract
- [ ] Performance acceptable (especially mobile)
- [ ] Reduced motion preference respected

---

## Phase 5: Final Polish & QA

**Goal:** Ready to share  
**Dependencies:** Phase 4 complete

### Task 5.1: Full Flow Walkthrough
**Status:** ⚪

Test complete user journey:
- [ ] Sign up → Onboarding → Home
- [ ] Generate workout → Review → Execute → Finish
- [ ] View history
- [ ] Settings changes persist

### Task 5.2: Mobile Testing
**Status:** ⚪

- [ ] All screens work on mobile viewport
- [ ] Touch targets adequate
- [ ] No horizontal scroll issues
- [ ] Text readable

### Task 5.3: Edge Cases
**Status:** ⚪

- [ ] Empty states look good
- [ ] Loading states work
- [ ] Error states handled gracefully

### Task 5.4: Final Cleanup
**Status:** ⚪

- [ ] Console errors cleared
- [ ] No TypeScript warnings
- [ ] Code comments cleaned up

### Phase 5 Checkpoint
- [ ] Would share this with real users
- [ ] No embarrassing issues
- [ ] Performance acceptable
- [ ] Ready for V2 feature work

---

## Success Criteria

**V1 Complete When:**
- [ ] UI is visually consistent across all screens
- [ ] Components follow defined patterns
- [ ] Colors feel intentional
- [ ] Animations make it feel polished
- [ ] No major bugs or visual issues
- [ ] Comfortable sharing the link

---

## Claude Code Prompt Template

```
I'm working on Clear V1 refinement. I need to [TASK] from Phase [X].

Context:
- Clear is a workout generation app (React + Tailwind + Supabase)
- MVP is functional, now doing UI polish
- Goal: consistent components, refined colors, smooth animations

Reference:
- design-tokens-colors.js (color system)
- [relevant wireframe if applicable]

Please [specific request].
```

---

*Roadmap created: January 27, 2026*
