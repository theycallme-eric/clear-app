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
  ├─► Creating/modifying UI?
  │     └─► Read: component.md
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
- **No hardcoded colors** - Use `var(--color-*)` from `src/index.css`
- **No hardcoded spacing** - Use the spacing scale
- **Check existing components first** - Don't duplicate

### Code Quality
- **Run code review before PR** - `/pr review` or `/pr` (includes review)
- **TypeScript must compile** - `npx tsc --noEmit`
- **Build must pass** - `npm run build`

---

## Engineering Philosophy: No Bandaids

**When something breaks, fix it properly.** Don't apply quick patches that mask the problem.

### The Rule

> If a fix takes 5 minutes but the proper solution takes 30 minutes, take the 30 minutes.

### What This Means

**DO:**
- Investigate the root cause before writing any fix
- Refactor the underlying issue, not just the symptom
- Add safeguards so the same problem can't recur
- Document why something broke if it wasn't obvious

**DON'T:**
- Add `try/catch` to silence errors without understanding them
- Use `// @ts-ignore` or `any` to bypass type errors
- Add `!important` to override CSS instead of fixing specificity
- Copy-paste code to "just make it work"
- Add flags/conditionals to work around broken logic
- Skip tests because "it works on my machine"

### Examples

| Bandaid (Bad) | Proper Fix (Good) |
|---------------|-------------------|
| `catch (e) { /* ignore */ }` | Understand why it throws, handle the case properly |
| `as any` to fix type error | Fix the actual type mismatch |
| `setTimeout` to fix race condition | Use proper async/await or state management |
| Duplicate code because refactoring is "risky" | Refactor with tests to ensure correctness |
| `!important` on CSS | Fix the cascade/specificity issue |
| Hardcode a value that should be dynamic | Make it dynamic from the start |

### When You're Tempted to Bandaid

1. **Stop** - Recognize you're about to take a shortcut
2. **Ask** - "Will this fix the problem or hide it?"
3. **Investigate** - Find the actual root cause
4. **Fix properly** - Even if it takes longer
5. **Document** - If the root cause was non-obvious, add a comment

### Long-Term Thinking

Every bandaid becomes tech debt. Tech debt compounds. A 5-minute bandaid today becomes a 2-hour debugging session next month when the underlying issue resurfaces in a different form.

**The goal is a codebase that gets easier to work with over time, not harder.**

---

## Key File Locations

| What | Where |
|------|-------|
| **Skills & Agents Registry** | `.claude/README.md` |
| **All Skills** | `.claude/skills/*.md` |
| **All Agents** | `.claude/agents/*.md` |
| **Session Plans** | `.claude/plans/SESSION_PLAN_*.md` |
| **Hook Scripts** | `.claude/hooks/*.sh` |
| **Design Tokens** | `src/index.css` |
| **Database Types** | `src/types/database.ts` |
| **Backlog** | `docs/BACKLOG.md` |
| **Session Log** | `docs/SESSION_LOG.md` |

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
3. Run `close-session.md` to log work
4. Update `docs/BACKLOG.md` with completed items

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
| **Index.tsx Monolith** | Extract components OUT of `src/pages/Index.tsx`, don't add to it |
| **Design Tokens** | No hardcoded hex colors; use CSS variables |
| **Type Safety** | Regenerate types after DB changes |
| **SPA Architecture** | No server components; data fetching in useEffect/handlers |
| **PR-Based Workflow** | All changes go through pull requests |

---

## When In Doubt

1. **Check `.claude/README.md`** - It's the authoritative registry
2. **Ask the user** - Clarify before making assumptions
3. **Use `/pr review`** - Get feedback before committing

---

*This file is the entry point. For detailed skill/agent documentation, see `.claude/README.md`.*
