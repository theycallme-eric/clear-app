---
name: token-check
description: Quick verification that components use design tokens instead of hardcoded values
trigger: After modifying component styles, before PR
category: ui
---

# Skill: Token Check

Quick post-build verification. For detailed token selection guidance, see **`token-decision-tree.md`**.

---

## Steps

### 1. Scan for Violations

Check the modified component files for:

- **Hex colors** (`#xxx`, `#xxxxxx`) in style props or CSS
- **Primitive tokens** (`var(--color-orange-*)`, `var(--color-blue-*)`) — these belong in `index.css` only, not in components
- **`border-radius`** — CLEAR uses chamfered corners (`ChamferedFrame` or `corner-cut` class)
- **`lucide-react` imports** — use `src/components/icons.tsx` instead
- **Inline font styles** — use typography classes (`text-heading-*`, `text-label-*`, `text-paragraph-*`, `text-cta-*`)
- **Raw pixel spacing** — use `--spacing-*` tokens

You can run the automated scanner: `npx tsx scripts/token-lint.ts`

### 2. Replace Violations

```tsx
// BAD → GOOD

// Hardcoded color
style={{ color: "#00A9F4" }}
style={{ color: "var(--text-cta)" }}

// Primitive token in component
style={{ background: "var(--color-orange-alpha-100)" }}
style={{ background: "var(--surface-card)" }}

// Rounded corners
style={{ borderRadius: 8 }}
// Use ChamferedFrame or corner-cut class instead

// Inline typography
style={{ fontFamily: 'Oxanium', fontSize: 14, fontWeight: 700 }}
className="text-label-sm"
```

### 3. Verify Theme Parity

If you added new tokens to `src/index.css`:
- Check `:root` section — token exists
- Check `[data-theme="blue"]` section — matching token exists
- Both map to the correct primitive for their theme

### 4. Run Build

```bash
npm run build
```

---

## Reference

- **Which token to use:** `token-decision-tree.md`
- **Common mistakes:** `anti-patterns.md`
- **Full audit:** `token-audit.md`
- **Token source of truth:** `src/index.css`

## Related Skills

- [token-decision-tree](token-decision-tree.md) — Systematic token lookup
- [anti-patterns](anti-patterns.md) — Common violations with fixes
- [token-audit](token-audit.md) — Comprehensive audit for major changes
- [component](component.md) — Component creation guidelines
- [chamfered-component](chamfered-component.md) — Chamfered frame tokens

## Checklist

- [ ] No hex colors in component files
- [ ] No primitive tokens (`--color-*`) in component files
- [ ] No `border-radius` usage
- [ ] No `lucide-react` imports
- [ ] Typography uses classes, not inline styles
- [ ] Spacing uses `--spacing-*` tokens
- [ ] New tokens exist in both themes
- [ ] Build passes
