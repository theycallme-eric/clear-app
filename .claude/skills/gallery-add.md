---
name: gallery-add
description: Add new components to the visual component gallery
trigger: After creating a new component
category: ui
---

# Skill: Add to Gallery

## Context

The component gallery provides visual test cases for all UI components. This enables quick visual review and catches styling issues early.

## Steps

1. **Open Gallery File**
   - Location: `src/pages/ComponentGallery.tsx`
   - Create if missing

2. **Import Component**
   - Add import statement at top of file

3. **Add Gallery Section**
   - Create new section with component name as heading
   - Show component in multiple states:
     - Default state
     - Loading state (if applicable)
     - Error state (if applicable)
     - Different sizes/variants

4. **Verify Visually**
   - Ask user to visit `/#gallery` or `/gallery`
   - Confirm design matches expectations

## Gallery Section Template

Use typography classes from `ui-rules.md` and spacing tokens — not hardcoded values.

```tsx
{/* ComponentName */}
<section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-400)' }}>
  <h2 className="text-heading-h4" style={{ fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-header)' }}>
    ComponentName
  </h2>

  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-200)' }}>
    <p className="text-paragraph-sm" style={{ color: 'var(--text-muted)' }}>Default</p>
    <ComponentName />
  </div>

  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-200)' }}>
    <p className="text-paragraph-sm" style={{ color: 'var(--text-muted)' }}>With Props</p>
    <ComponentName variant="secondary" size="lg" />
  </div>
</section>
```

## Reference Files

- `src/pages/ComponentGallery.tsx` — Gallery page
- `ui-rules.md` — Typography classes and spacing tokens for gallery sections

## Related Skills

- [component](component.md) — Component creation guidelines
- [ui-rules](ui-rules.md) — Spacing, typography, visual hierarchy
- [token-decision-tree](token-decision-tree.md) — Which token to use for gallery state demos
- [token-check](token-check.md) — Verify design tokens

## Checklist

- [ ] Component imported
- [ ] Default state shown
- [ ] Variant states shown (if applicable)
- [ ] User asked to verify visually
