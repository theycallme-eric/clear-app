# Skill: Create Component
**Trigger:** When creating or refactoring a UI component.

1.  **Structure:**
    * Use functional components with `interface Props`.
    * Import `cn` from `@/lib/utils` (or equivalent) for class merging.
    * Keep components "visual only" (dumb). Move logic to hooks or parent pages.
2.  **Design System Enforcement:**
    * **NO** hardcoded hex values (e.g., `#F00`).
    * **ALWAYS** use `tailwind.config.js` tokens (e.g., `bg-surface-card`, `text-brand-primary`).
    * Use `clsx` or `cn()` for conditional classes.
