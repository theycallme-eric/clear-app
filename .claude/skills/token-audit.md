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

### 5. Additional Checks

Also verify (see `anti-patterns.md` for full list):

- [ ] No `border-radius` — use `ChamferedFrame` or `corner-cut` class
- [ ] No `lucide-react` imports — use `src/components/icons.tsx`
- [ ] Typography uses classes (`text-heading-*`, `text-label-*`, `text-paragraph-*`, `text-cta-*`), not inline styles
- [ ] Spacing uses `--spacing-*` tokens, not raw pixel values
- [ ] Hover states on ChamferedFrame components use CSS variable technique (see `chamfered-component.md`)

---

## Semantic Token Reference

For the complete token lookup table (100+ tokens across surfaces, borders, text, and icons), see **`token-decision-tree.md`**.

For common token mistakes and how to fix them, see **`anti-patterns.md`**.

For spacing, typography classes, and visual hierarchy rules, see **`ui-rules.md`**.

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
- **Token lookup:** `token-decision-tree.md`
- **Anti-patterns:** `anti-patterns.md`
- **UI rules:** `ui-rules.md`

## Related Skills

- [token-decision-tree](token-decision-tree.md) — Which token to use for any role
- [anti-patterns](anti-patterns.md) — Common mistakes to avoid
- [ui-rules](ui-rules.md) — Spacing, typography, visual hierarchy
- [chamfered-component](chamfered-component.md) — ChamferedFrame + LeftColumn patterns
- [token-check](token-check.md) — Quick verification

## Related Agents

- [figma-ui-implementer](../agents/figma-ui-implementer.md) — Figma-to-code implementation
