# Skill: Create Component

> **Trigger:** When creating or refactoring a UI component.

## Context

All UI components must follow the design system and project conventions. This ensures consistency and maintainability.

## Steps

1. **Structure the Component**
   - Use functional components with `interface Props`
   - Import `cn` from `@/lib/utils` for class merging
   - Keep components "visual only" (dumb)
   - Move logic to hooks or parent pages

2. **Apply Design System**
   - **NO** hardcoded hex values (e.g., `#F00`)
   - **ALWAYS** use `tailwind.config.js` tokens
   - Use CSS variables from `src/index.css`
   - Use `cn()` or `clsx` for conditional classes

3. **File Placement**
   - New components → `src/components/`
   - Page-specific components → `src/components/[PageName]/`
   - Shared UI primitives → `src/components/ui/`

4. **After Creation**
   - Run `token_check.md` skill to verify tokens
   - Run `gallery_add.md` skill to add visual test

## Component Template

```tsx
import { cn } from '@/lib/utils';

interface ComponentNameProps {
  className?: string;
  // other props
}

export function ComponentName({ className, ...props }: ComponentNameProps) {
  return (
    <div className={cn('base-classes', className)}>
      {/* content */}
    </div>
  );
}
```

## Reference Files

- `src/index.css` — CSS variables / design tokens
- `tailwind.config.js` — Tailwind theme config
- `docs/frontend/figma-design-tokens.json` — Figma export
- `src/lib/utils.ts` — `cn()` helper

## Checklist

- [ ] Props interface defined
- [ ] No hardcoded colors
- [ ] Using design tokens
- [ ] Component is "dumb" (no business logic)
- [ ] Added to gallery (if new component)
