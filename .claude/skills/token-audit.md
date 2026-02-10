# Token Audit Skill

Audit components for design token compliance. Run this checklist before committing any UI changes.

## When to Use

- After creating or modifying any component
- Before PR/commit that touches UI
- When theme toggle looks broken
- When asked to "audit" or "check tokens"

---

## Quick Audit Checklist

Run through these checks in order. Stop and fix issues before proceeding.

### 1. No Hardcoded Colors

**Check for:** Hex values (`#F87823`), rgb/rgba with literal values, color names (`white`, `orange`)

**Allowed:**
- `var(--token-name)` references only
- Exception: Tailwind utilities that map to tokens (e.g., `bg-background`)

**Search pattern:**
```bash
grep -E "(#[0-9A-Fa-f]{3,8}|rgb\(|rgba\()" src/components/YourComponent.tsx
```

**Fix:** Replace with semantic token from the table below.

---

### 2. No Legacy Tokens

These tokens exist for backwards compatibility but should NOT be used in new code:

| ❌ Legacy Token | ✅ Use Instead |
|-----------------|----------------|
| `--primary` | `--color-orange-500` or semantic like `--border-cta` |
| `--secondary` | `--color-blue-500` or semantic like `--border-cta` (blue theme) |
| `--background` | `--color-neutral-900` |
| `--foreground` | `--color-neutral-50` |
| `--accent` | `--surface-cta-accent` |
| `--muted` | `--color-neutral-alpha-200` |
| `--muted-foreground` | `--color-neutral-400` |
| `--destructive` | `--color-red-500` or `--border-error` |
| `--card` | `--surface-card` |
| `--card-foreground` | `--text-paragraph` |
| `--clear-orange` | `--color-orange-500` |
| `--clear-purple` | `--color-blue-500` |
| `--clear-lime` | `--color-green-500` |
| `--clear-rose` | `--color-red-500` |
| `--clear-indigo` | `--color-purple-500` |
| `--clear-dark` | `--color-neutral-900` |
| `--clear-offwhite` | `--color-neutral-50` |
| `--ring` | `--border-cta` |
| `--input` | `--color-neutral-alpha-100` |
| `--border` | `--color-neutral-alpha-200` or semantic `--border-card` |

**Search pattern:**
```bash
grep -E "\-\-(primary|secondary|background|foreground|accent|muted|destructive|card|clear-|ring|input)[^-]" src/components/YourComponent.tsx
```

---

### 3. Semantic Tokens Over Primitives

Prefer semantic tokens (describe purpose) over primitives (describe value):

| Context | ❌ Primitive | ✅ Semantic |
|---------|-------------|-------------|
| Button background | `--color-orange-alpha-400` | `--surface-cta-primary` |
| Button border | `--color-orange-500` | `--border-cta-primary` |
| Button text | `--color-blue-100` | `--text-cta` |
| Card background | `--color-orange-alpha-150` | `--surface-card` |
| Card border | `--color-orange-500` | `--border-card` |
| Success state | `--color-green-500` | `--border-success` |
| Error state | `--color-red-500` | `--border-error` |
| Disabled | `--color-neutral-400` | `--text-disabled` or `--border-disabled` |

**Why:** Semantic tokens automatically adapt to theme. Primitives don't.

---

### 4. Theme Parity Check

If you add a token to `:root`, you MUST add the equivalent to `[data-theme="blue"]`.

**Check in `src/index.css`:**
1. Find your token in `:root` section (lines ~240-360)
2. Confirm matching token exists in `[data-theme="blue"]` section (lines ~367-430)

**Common miss:** Adding a new `--surface-*` or `--border-*` token to orange theme but forgetting blue.

---

### 5. Tailwind Class Compliance

When using Tailwind utilities for colors, use only these patterns:

| ✅ Allowed | ❌ Avoid |
|-----------|----------|
| `bg-background` | `bg-neutral-900` |
| `text-foreground` | `text-white` |
| `border-border` | `border-gray-700` |
| `bg-[var(--surface-card)]` | `bg-orange-500/20` |
| `text-[var(--text-cta)]` | `text-blue-300` |

**Pattern:** If Tailwind doesn't have a semantic class, use arbitrary value syntax: `bg-[var(--token-name)]`

---

## Semantic Token Reference

### Surfaces (backgrounds)

| Token | Purpose |
|-------|---------|
| `--surface-card` | Card/container backgrounds |
| `--surface-card-accent` | Emphasized card areas |
| `--surface-cta-primary` | Primary button background |
| `--surface-cta-primary-hover` | Primary button hover |
| `--surface-cta-primary-disabled` | Disabled button |
| `--surface-cta-secondary` | Secondary/ghost button background |
| `--surface-cta-secondary-hover` | Secondary button hover |
| `--surface-cta-accent` | Left accent bar on buttons |
| `--surface-success` | Success state background |
| `--surface-error` | Error state background |
| `--surface-info` | Info state background |
| `--surface-disabled` | Generic disabled background |

### Borders

| Token | Purpose |
|-------|---------|
| `--border-card` | Card/container borders |
| `--border-cta-primary` | Primary button border |
| `--border-cta-primary-hover` | Primary button hover border |
| `--border-cta-secondary` | Secondary button border |
| `--border-disabled` | Disabled state border |
| `--border-success` | Success state border |
| `--border-error` | Error state border |
| `--border-info` | Info state border |

### Text

| Token | Purpose |
|-------|---------|
| `--text-header` | Headings (H1-H6) |
| `--text-paragraph` | Body text |
| `--text-cta` | Button/link text |
| `--text-cta-hover` | Button/link hover text |
| `--text-disabled` | Disabled text |
| `--text-success` | Success message text |
| `--text-error` | Error message text |
| `--text-info` | Info message text |

### Icons

| Token | Purpose |
|-------|---------|
| `--icon-cta` | Interactive icons |
| `--icon-cta-hover` | Icon hover state |
| `--icon-disabled` | Disabled icons |
| `--icon-success` | Success icons |
| `--icon-error` | Error icons |

---

## Audit Report Template

After auditing a component, produce this report:

```markdown
## Token Audit: [ComponentName]

**File:** `src/components/[ComponentName].tsx`
**Date:** [YYYY-MM-DD]
**Status:** ✅ PASS | ⚠️ ISSUES FOUND

### Findings

| Check | Status | Notes |
|-------|--------|-------|
| No hardcoded colors | ✅ / ❌ | [details] |
| No legacy tokens | ✅ / ❌ | [details] |
| Semantic over primitive | ✅ / ❌ | [details] |
| Theme parity | ✅ / ❌ | [details] |
| Tailwind compliance | ✅ / ❌ | [details] |

### Required Fixes
1. [Line X: Replace `#FFFFFF` with `var(--color-neutral-50)`]
2. [Line Y: Replace `--primary` with `--border-cta-primary`]

### Tokens Added to index.css
- [ ] Added `--token-name` to `:root`
- [ ] Added `--token-name` to `[data-theme="blue"]`
```

---

## Integration with figma-ui-implementer

When the `figma-ui-implementer` agent creates or modifies components:

1. **Before implementation:** Map Figma variables to semantic tokens using the reference tables above
2. **After implementation:** Run this audit checklist
3. **If audit fails:** Fix issues before marking task complete

---

## Files

- **Token definitions:** `src/index.css`
- **Token JSON reference:** `design-tokens.json`
- **Related skills:** `.claude/skills/chamfered-component.md`
- **Related agents:** `.claude/agents/figma-ui-implementer.md`
