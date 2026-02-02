# Token Check Skill

**Context:** Verify components use correct design tokens from the Figma design system, not hardcoded values.

## Token Reference Files

- **CSS Variables:** `src/index.css`
- **Figma Export:** `docs/frontend/figma-design-tokens.json`

## What to Check

### Colors
No hardcoded hex values. Use CSS variables:
```tsx
// Bad
style={{ backgroundColor: "#1a1a1a" }}
className="bg-gray-900"

// Good
style={{ backgroundColor: "var(--surface-cta-primary)" }}
```

### Spacing
Use Tailwind spacing or CSS variables, not arbitrary values:
```tsx
// Acceptable
className="px-4 py-3"
className="gap-2"

// Avoid
style={{ padding: "13px" }}
```

### Typography
Use defined font classes:
```tsx
// Good
className="font-display text-xl font-bold"

// Check if custom values match design tokens
```

## Token Categories

| Category | Prefix | Example |
|----------|--------|---------|
| Surfaces | `--surface-` | `--surface-cta-primary` |
| Borders | `--border-` | `--border-cta-primary` |
| Text | `--text-` | `--text-cta` |
| Icons | `--icon-` | `--icon-cta` |

## Running a Check

1. Open the component file
2. Search for:
   - Hex colors (`#`)
   - RGB/RGBA values
   - Hardcoded pixel values for colors
3. Cross-reference with `figma-design-tokens.json`
4. Replace any hardcoded values with appropriate CSS variables

## Figma MCP

If connected to Figma via MCP, you can pull current token values directly:
- Use `get_variable_defs` to fetch variable definitions for a node
- Compare against what's in the component
