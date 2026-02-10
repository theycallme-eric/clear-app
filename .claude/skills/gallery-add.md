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

```tsx
{/* ComponentName */}
<section className="space-y-4">
  <h2 className="text-xl font-bold">ComponentName</h2>

  <div className="space-y-2">
    <p className="text-sm text-muted">Default</p>
    <ComponentName />
  </div>

  <div className="space-y-2">
    <p className="text-sm text-muted">With Props</p>
    <ComponentName variant="secondary" size="lg" />
  </div>
</section>
```

## Reference Files

- `src/pages/ComponentGallery.tsx` — Gallery page

## Related Skills

- [component](.claude/skills/component.md) — Component creation guidelines
- [token-check](.claude/skills/token-check.md) — Verify design tokens

## Checklist

- [ ] Component imported
- [ ] Default state shown
- [ ] Variant states shown (if applicable)
- [ ] User asked to verify visually
