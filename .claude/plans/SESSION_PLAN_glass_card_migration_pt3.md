# Session Plan: Glass-Card → Chamfered Card Migration (Part 3: Pages + Cleanup)

## Session Goal
Replace all remaining `glass-card` usages across page-level files, remove the `.glass-card` CSS class, and update ComponentGallery.

## Context
- Reference: `src/components/ui/Card.tsx` — Card component API
- Reference: Migration patterns from Part 1 session plan (Patterns A–E)
- Reference: `src/index.css` lines ~585-594 — `.glass-card` class to remove
- Current state: Parts 1+2 complete. Components and workout cards migrated. Only page files and CSS cleanup remain.

---

## Tasks

### 1. Migrate OnboardingScreen.tsx (3 instances)

**Skill:** `component.md`

**Do:**
- Open `src/pages/OnboardingScreen.tsx`
- Find all 3 `glass-card` usages
- Replace with Card component — likely Pattern A (form containers with `padding="md"` or `padding="lg"`)
- Keep form layout and input spacing intact

**Acceptance:**
- [ ] `grep "glass-card" src/pages/OnboardingScreen.tsx` returns nothing
- [ ] Onboarding flow renders correctly through all steps
- [ ] `npm run build` passes

---

### 2. Migrate SessionDetailScreen.tsx (3 instances)

**Skill:** `component.md`

**Do:**
- Open `src/pages/SessionDetailScreen.tsx`
- Find all 3 `glass-card` usages
- Replace with Card — likely Pattern A for section cards and notes display

**Acceptance:**
- [ ] `grep "glass-card" src/pages/SessionDetailScreen.tsx` returns nothing
- [ ] Session detail view renders all sections correctly
- [ ] `npm run build` passes

---

### 3. Migrate SummaryScreen.tsx (3 instances)

**Skill:** `component.md`

**Do:**
- Open `src/pages/SummaryScreen.tsx`
- Find all 3 `glass-card` usages
- Replace with Card — Pattern A for stats display, notes textarea container

**Acceptance:**
- [ ] `grep "glass-card" src/pages/SummaryScreen.tsx` returns nothing
- [ ] Summary stats and notes textarea render correctly
- [ ] `npm run build` passes

---

### 4. Migrate HistoryScreen.tsx (3 instances)

**Skill:** `component.md`

**Do:**
- Open `src/pages/HistoryScreen.tsx`
- Find all 3 `glass-card` usages
- Filter dropdowns → Pattern E (dropdown, possibly `showLeftColumn={false}`)
- Session list items → Pattern A or Pattern B if clickable

**Acceptance:**
- [ ] `grep "glass-card" src/pages/HistoryScreen.tsx` returns nothing
- [ ] Filter dropdowns open/close correctly
- [ ] Session list items render and are tappable
- [ ] `npm run build` passes

---

### 5. Migrate HomeScreen.tsx (4 instances)

**Skill:** `component.md`

**Do:**
- Open `src/pages/HomeScreen.tsx`
- Find all 4 `glass-card` usages
- Dashboard cards → Pattern A
- Workout list items → Pattern B if clickable

**Acceptance:**
- [ ] `grep "glass-card" src/pages/HomeScreen.tsx` returns nothing
- [ ] Dashboard renders correctly
- [ ] Recent workout list items render and are tappable
- [ ] `npm run build` passes

---

### 6. Migrate SettingsScreen.tsx (15 instances)

**Skill:** `component.md`

**Do:**
- Open `src/pages/SettingsScreen.tsx`
- Find all 15 `glass-card` usages — this is the highest volume file
- Map each instance to the correct pattern:
  - Interactive menu items → Pattern B
  - Accordion sections → Pattern C
  - Equipment lists / static containers → Pattern A
  - Dropdown menus → Pattern E
- Work methodically — replace one at a time, checking the pattern fits

**Acceptance:**
- [ ] `grep "glass-card" src/pages/SettingsScreen.tsx` returns nothing
- [ ] All settings sections expand/collapse correctly
- [ ] Menu items are tappable
- [ ] Equipment selection works
- [ ] `npm run build` passes

---

### 7. Update ComponentGallery.tsx

**Skill:** `component.md`

**Do:**
- Open `src/pages/ComponentGallery.tsx`
- Remove any `glass-card` demo from the active gallery section
- Optionally add a glass-card entry to the Museum section with a note: "Replaced by chamfered Card component"

**Acceptance:**
- [ ] No active `glass-card` demo in gallery
- [ ] Card component demo exists in gallery (should already be there)
- [ ] `npm run build` passes

---

### 8. Remove glass-card CSS + Final Verification

**Skill:** `token_check.md`

**Do:**
- Run `grep -r "glass-card" src/` to confirm ZERO remaining usages across the entire `src/` directory
- If any remain, migrate them before proceeding
- Once clean, remove from `src/index.css`:
  - The `.glass-card` class definition (~lines 585-594)
  - The `[data-theme="blue"] .glass-card` variant
- Run `npm run build` to confirm nothing breaks
- Do a final visual spot-check: Home → History → Settings → start a workout → Summary

**Acceptance:**
- [ ] `grep -r "glass-card" src/` returns ZERO results
- [ ] `.glass-card` CSS class removed from index.css
- [ ] `[data-theme="blue"] .glass-card` variant removed
- [ ] `npm run build` passes with no errors
- [ ] No visual regressions on key screens

**Update:** SESSION_LOG.md, PROJECT_MAP.md (note Card component is now the sole card pattern), BACKLOG.md

---

## Design System Compliance
- All new Card usages must use component props (padding, accentColor, showLeftColumn), not hardcoded overrides
- Use CSS variables for any color values
- Dropdown cards: consider `showLeftColumn={false}` — check Figma for guidance
- Test both themes after CSS removal

## After Session (REQUIRED — not done until complete)

- [ ] Update SESSION_LOG.md with: Date, Tasks Completed, Files Touched
- [ ] Update PROJECT_MAP.md: Note that glass-card is fully removed, Card is the sole card component
- [ ] Mark glass-card migration as `[x]` complete in BACKLOG.md
- [ ] Confirm: "Session complete. Glass-card fully migrated and CSS removed. Card component is now the sole card pattern across the app."
