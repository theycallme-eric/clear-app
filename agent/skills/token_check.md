# Skill: Token Check

> **Trigger:** When reviewing component styles.

## Context

All components must use design tokens from the Figma design system. Hardcoded values break consistency and make theming impossible.

## Steps

1. **Open Component File**
   - Identify all style-related code

2. **Search for Violations**
   - Hex colors (`#`)
   - RGB/RGBA values
   - Hardcoded pixel values for colors

3. **Cross-Reference Tokens**
   - Check `src/index.css` for CSS variables
   - Check `docs/frontend/figma-design-tokens.json`

4. **Replace Violations**
   - Use appropriate CSS variables
   - Use Tailwind classes that map to tokens

## Token Categories

| Category | Prefix | Example |
|----------|--------|---------|
| Surfaces | `--surface-` | `--surface-cta-primary` |
| Borders | `--border-` | `--border-cta-primary` |
| Text | `--text-` | `--text-cta` |
| Icons | `--icon-` | `--icon-cta` |

## Common Violations & Fixes

```tsx
// BAD: Hardcoded hex
style={{ backgroundColor: "#1a1a1a" }}
className="bg-gray-900"

// GOOD: CSS variable
style={{ backgroundColor: "var(--surface-cta-primary)" }}
className="bg-surface-primary"

// BAD: Arbitrary spacing for colors
style={{ padding: "13px", color: "#ff0000" }}

// GOOD: Tailwind spacing, CSS variable color
className="p-3"
style={{ color: "var(--text-error)" }}
```

## Figma MCP Integration

If connected to Figma via MCP:
- Use `get_variable_defs` to fetch variable definitions
- Compare against component implementation

## Reference Files

- `src/index.css` — CSS variables
- `docs/frontend/figma-design-tokens.json` — Figma export
- `tailwind.config.js` — Tailwind theme

## Checklist

- [ ] No hex colors found
- [ ] No RGB/RGBA values found
- [ ] All colors use CSS variables
- [ ] Spacing uses Tailwind classes
- [ ] Typography uses defined classes
