# Claude Code Instructions

This project uses a structured skill and agent system. **Read this file first**, then follow the workflows below.

---

## Quick Start

1. **Before any work:** Read `.claude/README.md` for the full skills/agents registry
2. **Match your task** to a skill using the decision tree below
3. **Load the skill** and follow its steps
4. **Before merging:** Always use `/pr` - direct pushes to main are blocked

---

## Decision Tree: Which Skill Do I Need?

```
START
  │
  ├─► ANY UI work? (creating, modifying, or adding UI elements)
  │     └─► MANDATORY: Run component.md pre-flight FIRST
  │           └─► Inventory existing components (gallery + src/components/)
  │           └─► Check token coverage (src/index.css)
  │           └─► Decide: reusable component or inline?
  │           └─► Audit states (hover, selected, disabled)
  │           └─► THEN build, using existing components as building blocks
  │           └─► Has chamfered corners? → chamfered-component.md
  │           └─► After creating → gallery-add.md → token-check.md
  │
  ├─► Touching database, auth, or API?
  │     └─► Read: supabase-workflow.md
  │
  ├─► Build failing or runtime error?
  │     └─► Read: debug.md
  │
  ├─► Ready to merge code?
  │     └─► Read: pr-workflow.md
  │     └─► Run: /pr
  │
  ├─► Implementing a Figma design?
  │     └─► Use agent: figma-ui-implementer
  │
  ├─► Reviewing code quality?
  │     └─► Use agent: code-reviewer
  │
  ├─► Given a session plan?
  │     └─► Run: /execute [plan-name]
  │     └─► Or manual: handoff.md
  │
  └─► Finished all tasks?
        └─► Read: close-session.md
```

---

## Critical Rules (Always Enforced)

### Git Safety
- **Never push directly to main** - Use PRs via `/pr`
- **Never force push** - History is sacred
- **Never merge locally to main** - Use `gh pr merge`

These are enforced by hooks. Violations will be blocked with instructions.

### Design System
- **Pre-flight is mandatory** - Run `component.md` pre-flight before ANY UI work. No exceptions.
- **Build on what exists** - Check `ComponentGallery.tsx` and `src/components/` FIRST. Use existing components as building blocks. Extend with new props/variants before creating new components.
- **No hardcoded colors** - Use semantic tokens `var(--surface-*)`, `var(--text-*)`, etc. Never primitive tokens (`var(--color-orange-500)`) in components.
- **Create tokens when needed** - If a visual role doesn't have a semantic token, create one. Add to both themes in `src/index.css`. Name by role, not by component.
- **No hardcoded spacing** - Use the spacing scale from `ui-rules.md`
- **Reusable by default** - If a pattern is generic (tabs, modals, dropdowns, list items), make it a reusable component on first creation. Don't wait for duplication.
- **Consistent states** - Every interactive element needs: default, hover, selected (if applicable), disabled. Match existing patterns.
- **Read `docs/design-philosophy.md` before UI judgment calls** - Covers vibe, voice, color logic, motion principles
- **No Lucide icons** - Use `src/components/icons.tsx` for all icons. If an icon doesn't exist yet, follow `icon-transform.md` to create it
- **Museum is read-only history** - Components in the Museum section of `ComponentGallery.tsx` are legacy. NEVER use them as reference, inspiration, or basis for new UI. Use only the active gallery components.

### Code Quality
- **Run code review before PR** - `/pr review` or `/pr` (includes review)
- **TypeScript must compile** - `npx tsc --noEmit`
- **Build must pass** - `npm run build`

---

## Engineering Philosophy: No Bandaids

> If a fix takes 5 minutes but the proper solution takes 30 minutes, take the 30 minutes.

**DO:** Investigate root causes before fixing. Refactor the underlying issue, not just the symptom. Add safeguards so the same problem can't recur.

**DON'T:** `try/catch` to silence errors, `as any` / `@ts-ignore` to bypass types, `!important` to override CSS, `setTimeout` to fix race conditions, copy-paste instead of refactoring, flags/conditionals to work around broken logic.

---

## Available Commands

| Command | What It Does |
|---------|--------------|
| `/execute [plan]` | Execute a session plan from `.claude/plans/` |
| `/pr` | Review code + create PR (full workflow) |
| `/pr create` | Create PR immediately (skip review) |
| `/pr review` | Review code only (no PR) |
| `/todo` | Check the todo board |
| `/process-inbox` | Process files in `.claude/inbox/` |
| `/process-plans` | Import plans from `~/.claude/plans/` to project |
| `/close-session` | Log session work and update backlog |

---

## Workflow Patterns

### Starting a Session

**If given a session plan:**
```
/execute [plan-name]
```
This automatically: loads context → maps skills → tracks progress → validates acceptance

**If starting fresh:**
1. Understand the task
2. Use decision tree above to find relevant skills
3. Load and follow those skills
4. Use TodoWrite to track progress

### During Work

- **UI changes:** Always run `token-check.md` after
- **Database changes:** Regenerate types with `npx supabase gen types typescript --local > src/types/database.ts`
- **Errors:** Load `debug.md` for systematic resolution

### Ending a Session

1. Verify all acceptance criteria pass
2. Run `/pr` to create PR (code review included)
3. Run `/close-session` to log work and update backlog

---

## Agents Available

| Agent | When to Use | Model |
|-------|-------------|-------|
| `figma-ui-implementer` | Implementing Figma designs pixel-perfect | opus |
| `code-reviewer` | Reviewing code before PR | haiku |

Invoke via Task tool with `subagent_type` matching the agent name.

---

## Project Constraints

| Constraint | Details |
|------------|---------|
| **Design Tokens** | No hardcoded hex colors; use CSS variables |
| **Type Safety** | Regenerate types after DB changes |
| **SPA Architecture** | No server components; data fetching via React Query or useEffect/handlers |
| **PR-Based Workflow** | All changes go through pull requests |

---

*For detailed skill/agent documentation, see `.claude/README.md`.*
