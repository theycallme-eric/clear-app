# Session Plan: Glass-Card → Chamfered Card Migration (Part 1: Core + Modals)

## Session Goal
Replace all `glass-card` CSS class usages with the chamfered `Card` component in core components and modals (6 files), establishing the migration patterns for subsequent phases.

## Context
- Reference: `src/components/ui/Card.tsx` — the chamfered Card component being migrated TO
- Reference: `src/index.css` — contains `.glass-card` class definition (lines ~585-594) to eventually remove
- Figma: Check Card component frame for padding/accent specs
- Current state: App uses `glass-card` CSS class extensively. Card component exists and is already used in LoadingSkeleton. This session migrates the simplest files first.

---

## Migration Patterns Reference

Antigravity should use these patterns throughout. Each maps a `glass-card` usage to a Card component configuration.

**Pattern A — Static Display Card:**
```
Before: <div className="glass-card p-4"><Content /></div>
After:  <Card padding="md"><Content /></Card>
```

**Pattern B — Interactive Button Card:**
```
Before: <button className="w-full glass-card p-4 text-left hover:border-clear-orange/60 transition-all"><Content /></button>
After:  <Card padding="md" onClick={handler}><Content /></Card>
```
Card handles button semantics when `onClick` is provided.

**Pattern C — Accordion/Collapsible:**
```
Before: <div className="glass-card overflow-hidden">
          <button onClick={toggle} className="w-full p-4">Header</button>
          {expanded && <div className="px-4 pb-4">Content</div>}
        </div>
After:  <Card padding="none">
          <button onClick={toggle} className="w-full p-4">Header</button>
          {expanded && <div className="px-4 pb-4">Content</div>}
        </Card>
```

**Pattern D — Modal Container:**
```
Before: <div className="glass-card p-6 animate-in slide-in-from-bottom">
After:  <Card padding="lg" className="animate-in slide-in-from-bottom">
```

**Design change note:** `glass-card` uses `backdrop-filter: blur(20px)`. The chamfered Card uses solid `--surface-card` color. This is intentional — new cards are more opaque/solid. Do not add blur back.

---

## Tasks

### 1. Migrate ErrorState.tsx

**Skill:** `component.md`

**Do:**
- Open `src/components/ErrorState.tsx`
- Import `Card` from `./ui/Card`
- Replace the `glass-card` div with `<Card padding="lg">` (Pattern A)
- Ensure content is centered (keep any existing centering classes)
- Remove `glass-card` from className

**Acceptance:**
- [ ] No `glass-card` string in ErrorState.tsx
- [ ] Card component is imported and rendered
- [ ] Visual: error state renders with chamfered card styling
- [ ] `npm run build` passes

---

### 2. Migrate EmptyState.tsx

**Skill:** `component.md`

**Do:**
- Open `src/components/EmptyState.tsx`
- Import `Card` from `./ui/Card`
- Replace the `glass-card` div with `<Card padding="lg">` (Pattern A)
- Keep centered content layout

**Acceptance:**
- [ ] No `glass-card` string in EmptyState.tsx
- [ ] Card component is imported and rendered
- [ ] Visual: empty state renders with chamfered card styling
- [ ] `npm run build` passes

---

### 3. Migrate AbandonmentModal.tsx

**Skill:** `component.md`

**Do:**
- Open `src/components/AbandonmentModal.tsx`
- Import `Card` from `../ui/Card` (check relative path)
- Replace the `glass-card` div with Card (Pattern D)
- Preserve any `animate-in` / `slide-in-from-bottom` classes — pass via `className`
- Preserve internal padding structure (header/content/footer sections)

**Acceptance:**
- [ ] No `glass-card` string in AbandonmentModal.tsx
- [ ] Modal still animates in correctly
- [ ] Button layout and spacing preserved
- [ ] Visual: modal renders with chamfered card styling
- [ ] `npm run build` passes

---

### 4. Migrate NoteModal.tsx

**Skill:** `component.md`

**Do:**
- Open `src/components/workout/NoteModal.tsx`
- Import `Card` (check relative path from workout subfolder)
- Replace the `glass-card` div with Card (Pattern D)
- Preserve animation classes via `className`
- NoteModal has header/content/footer sections with borders — keep those internal structures intact, only replace the outer wrapper

**Acceptance:**
- [ ] No `glass-card` string in NoteModal.tsx
- [ ] Modal still animates in correctly
- [ ] Form elements (textarea, buttons) still work
- [ ] Header/content/footer border separators preserved
- [ ] Visual: modal renders with chamfered card styling
- [ ] `npm run build` passes

---

### 5. Verify All Phase 1+2 Changes

**Skill:** `debug.md`

**Do:**
- Run `npm run build`
- Run `grep -r "glass-card" src/components/ErrorState.tsx src/components/EmptyState.tsx src/components/AbandonmentModal.tsx src/components/workout/NoteModal.tsx` — should return nothing
- Visually check each component:
  - Trigger an error state
  - View an empty state (e.g., empty workout history)
  - Trigger abandonment modal (leave mid-workout)
  - Open note modal during workout
- Test on both themes if theme toggle exists

**Acceptance:**
- [ ] grep returns no results for glass-card in these 4 files
- [ ] Build passes with no errors
- [ ] All 4 components render correctly with chamfered styling

**Update:** SESSION_LOG.md

---

## Design System Compliance
- Use tokens from design-tokens.json, not hardcoded values
- Match Figma specs via MCP for Card component
- Follow existing Card component API (padding, className, etc.)
- Mobile-first — verify modals render correctly on small viewports

## After Session (REQUIRED — not done until complete)

- [ ] Update SESSION_LOG.md with: Date, Tasks Completed, Files Touched
- [ ] Mark relevant items as `[x]` in BACKLOG.md if glass-card migration is tracked there
- [ ] Confirm: "Session complete. Phase 1+2 glass-card migration done (ErrorState, EmptyState, AbandonmentModal, NoteModal). Ready for Part 2: Workout Components."
