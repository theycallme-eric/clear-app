# Claude Code Instructions

This project uses a structured skill and agent system. **Read this file first**, then follow the workflows below.

1. **Before any work:** Read `.claude/README.md` for the full skills/agents registry
2. **Match your task** to a skill using the decision tree below
3. **Load the skill** and follow its steps
4. **Before merging:** Always use `/pr` - direct pushes to main are blocked

---

## Project Overview

CLEAR is a workout tracking app with a distinctive low-tech sci-fi terminal aesthetic.
Users create, log, and review workouts. Optimizes for speed, visual clarity, and a
distinctive feel inspired by Star Wars / Alien / Blade Runner interfaces.

See @docs/design-philosophy.md for the full design vision.

## Tech Stack

- React 19 + TypeScript + Vite (SPA, no SSR, no server components)
- CSS custom properties for theming — no CSS framework
- Supabase (auth + Postgres)
- React Router (client-side routing)
- Vitest for testing
- Custom design system — no component library
- Data fetching via React Query or useEffect/handlers (no server components)

Do not introduce: Tailwind, styled-components, MUI, Chakra, or any CSS/component framework.

## Architecture

```
src/
  components/   # Reusable UI components
  pages/        # Screen-level components (route targets)
  contexts/     # React contexts (auth, theme, etc.)
  hooks/        # Custom hooks
  lib/          # Utilities, API helpers, shared config
  layouts/      # Page layout wrappers
  routes/       # Route definitions
  types/        # Shared TypeScript types
  index.css     # Design tokens (both themes)
```

Where new code goes:
- Reusable UI → `src/components/`
- Page-level screens → `src/pages/`
- Shared logic → `src/hooks/` or `src/lib/`
- New tokens → `src/index.css` (add to both themes)

## Commands

```
npm run dev          # Start dev server
npm run build        # Production build
npx tsc --noEmit     # Typecheck
npm run lint         # ESLint
npm run test         # Vitest (watch mode)
npm run test:run     # Vitest (single run)
npx supabase gen types typescript --local > src/types/database.ts  # Regen DB types
```

---

## Decision Tree: Which Skill Do I Need?

```
START
  │
  ├─► ANY UI work?
  │     └─► MANDATORY: Run component.md pre-flight FIRST
  │           └─► Inventory existing components (gallery + src/components/)
  │           └─► Check token coverage (src/index.css)
  │           └─► Decide: reusable component or inline?
  │           └─► Audit states (hover, selected, disabled)
  │           └─► THEN build, using existing components as building blocks
  │           └─► Has chamfered corners? → chamfered-component.md
  │           └─► After creating → gallery-add.md → token-check.md
  │
  ├─► Managing tickets or planning work? → /ticket
  │     └─► Creating a ticket? → /ticket create
  │     └─► Starting work from board? → /ticket pull
  │     └─► Processing todos into tickets? → /ticket sync
  │
  ├─► Touching database, auth, or API? → supabase-workflow.md
  ├─► Build failing or runtime error? → debug.md
  ├─► Ready to merge code? → /pr
  ├─► Implementing a Figma design? → agent: figma-ui-implementer
  ├─► Reviewing code quality? → agent: code-reviewer
  ├─► Testing workout generation? → /test-generation
  ├─► Given a session plan? → /execute [plan-name]
  └─► Finished all tasks? → /close-session
```

---

## Critical Rules

### Git Safety
- **Never push directly to main** — use PRs via `/pr`
- **Never force push** — history is sacred
- **Never merge locally to main** — use `gh pr merge`

Enforced by hooks. Violations will be blocked.

### Design System
- **Pre-flight is mandatory** — run `component.md` pre-flight before ANY UI work
- **Build on what exists** — check `ComponentGallery.tsx` and `src/components/` FIRST. Extend with new props/variants before creating new components.
- **No hardcoded colors** — use semantic tokens `var(--surface-*)`, `var(--text-*)`, etc. Never primitive tokens (`var(--color-orange-500)`) in components. No exceptions — even error fallbacks and brand logos use semantics.
- **Never invent primitives** — only reference color primitives that already exist in `src/index.css`. If a color doesn't exist in the palette, it's wrong. Check the file before adding new primitive tokens.
- **Create tokens when needed** — add to both themes in `src/index.css`. Name by role, not by component. Primitives are only referenced by semantic tokens, never by components directly.
- **No hardcoded spacing** — use the spacing scale from `ui-rules.md`
- **Reusable by default** — if a pattern is generic (tabs, modals, dropdowns, list items), make it a reusable component on first creation
- **Consistent states** — every interactive element needs: default, hover, selected (if applicable), disabled
- **No Lucide icons** — use `src/components/icons.tsx`. If an icon doesn't exist, follow `icon-transform.md`
- **Museum is read-only** — components in the Museum section of `ComponentGallery.tsx` are legacy. NEVER use them as reference or basis for new UI.

### Safe-change Rules
- Do not modify auth flows (`AuthContext.tsx`) unless explicitly requested
- Do not change Supabase schema without flagging it
- Do not restructure routing without approval
- Preserve backward compatibility of reusable components

### During Work
- **After UI changes:** run `token-check.md`
- **After DB changes:** regenerate types with `npx supabase gen types typescript --local > src/types/database.ts`
- **On errors:** load `debug.md` for systematic resolution

### Quality Bar
Before considering work complete:
- `npm run build` must pass
- `npx tsc --noEmit` must pass
- Run code review before PR — `/pr review` or `/pr` (includes review)

---

## Engineering Philosophy: No Bandaids

> If a fix takes 5 minutes but the proper solution takes 30 minutes, take the 30 minutes.

**DO:** Investigate root causes. Refactor the underlying issue. Add safeguards so the same problem can't recur.

**DON'T:** `try/catch` to silence errors, `as any` / `@ts-ignore` to bypass types, `!important` to override CSS, `setTimeout` to fix race conditions, copy-paste instead of refactoring, flags/conditionals to work around broken logic.

---

## Slash Commands

| Command | What It Does |
|---------|--------------|
| `/ticket` | List ready tickets from the board |
| `/ticket create` | Create a GitHub Issue with full PRD |
| `/ticket pull [N]` | Pull ticket, create branch, load context |
| `/ticket board` | Kanban board summary |
| `/ticket sync` | Process todos into tickets |
| `/execute [plan]` | Execute a session plan from `.claude/plans/` |
| `/pr` | Review code + create PR (full workflow) |
| `/pr create` | Create PR immediately (skip review) |
| `/pr review` | Review code only (no PR) |
| `/todo` | Check the todo board |
| `/process-inbox` | Process files in `.claude/inbox/` |
| `/process-plans` | Import plans from `~/.claude/plans/` to project |
| `/test-generation` | Headless workout generation testing |
| `/close-session` | Log session work and update backlog |

---

*For detailed skill/agent documentation, see `.claude/README.md`.*
