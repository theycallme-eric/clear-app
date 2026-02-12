# Claude Code Planning Guide

**Purpose:** Reference for creating and executing implementation plans in the Clear project.

---

## Overview

This project uses a structured **skill and agent system** for Claude Code. Before doing any work:

1. **Read `CLAUDE.md`** at project root (entry point)
2. **Read `.claude/README.md`** for the skill/agent registry
3. **Match your task** to the appropriate skill
4. **Follow the skill steps** for consistent execution

---

## How the System Works

```
┌─────────────────────────────────────────────────────────────────┐
│  CLAUDE.md (Entry Point)                                         │
│  - Quick start guide                                             │
│  - Decision tree for skill selection                             │
│  - Critical rules (git safety, design tokens)                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  .claude/README.md (Registry)                                    │
│  - All skills listed with triggers                               │
│  - All agents listed with use cases                              │
│  - Commands reference                                            │
│  - Skill chains and workflows                                    │
└─────────────────────────────────────────────────────────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         ▼                    ▼                    ▼
    ┌─────────┐         ┌─────────┐          ┌─────────┐
    │ Skills  │         │ Agents  │          │Commands │
    │  (SOPs) │         │(Experts)│          │(/slash) │
    └─────────┘         └─────────┘          └─────────┘
```

**Skills** = Step-by-step procedures (like `component.md`, `pr-workflow.md`)
**Agents** = Specialized personas (like `figma-ui-implementer`, `code-reviewer`)
**Commands** = Shortcuts (like `/pr`, `/execute`)

---

## Creating Session Plans

Session plans live in `.claude/plans/SESSION_PLAN_*.md`. Use this template:

```markdown
# Session Plan: [Brief Title]

## Session Goal

[One sentence describing what this session accomplishes]

## Context

- Reference: `path/to/file.tsx` — [why it's relevant]
- Reference: `path/to/file.tsx` — [why it's relevant]

## Tasks

### Task 1: [Title]

**Do:**
- [Specific action]
- [Specific action]

**Acceptance:**
- [ ] [How to verify it's done]
- [ ] [How to verify it's done]

---

### Task 2: [Title]

**Do:**
- [Specific action]

**Acceptance:**
- [ ] [Verification criteria]

---

## Notes

- [Constraints or decisions]
- [Gotchas to watch for]
```

### Plan Guidelines

**Always include:**
- **Specific file paths** — Not "the component", but `src/components/WorkoutCard.tsx`
- **Acceptance criteria** — Clear definition of done
- **Design decisions** — Don't leave ambiguity

**Avoid:**
- **Vague instructions** — "Make it better" vs "Add loading state with spinner"
- **Multiple options** — Decide before creating the plan
- **Missing context** — Include relevant background

---

## Executing Plans

### Automated Execution

```
/execute [plan-name]
```

This runs the `execute-plan.md` skill which:
1. Loads the plan file
2. Reads all context files
3. Maps tasks to relevant skills
4. Initializes TodoWrite progress tracking
5. Executes tasks sequentially
6. Validates acceptance criteria
7. Runs `close-session.md` at the end

### Manual Execution

For plans received via chat (not files):
1. Load `handoff.md` skill
2. Parse the plan structure
3. Load context files
4. Execute tasks
5. Run `close-session.md`

---

## Skill Categories

| Category | Skills | When to Use |
|----------|--------|-------------|
| **Workflow** | `execute-plan`, `handoff`, `close-session`, `pr-workflow` | Session management, merging code |
| **UI** | `component`, `chamfered-component`, `gallery-add`, `token-check` | Creating/modifying components |
| **Backend** | `supabase-workflow`, `debug` | Database, auth, API, error fixing |
| **Documentation** | `backlog`, `todo-board`, `project-map` | Project docs |

---

## Agents Available

| Agent | When to Use | Model |
|-------|-------------|-------|
| `figma-ui-implementer` | Implementing pixel-perfect UI from Figma | opus |
| `code-reviewer` | Reviewing code before PR | haiku |

Invoke agents via the Task tool with `subagent_type` matching the agent name.

---

## Code Review & Merging

**Critical:** All code changes must go through pull request review.

### What's Blocked (Automated)

The `git-safety-check.sh` hook blocks:
- `git push origin main` — Direct push to main
- `git merge main` — Local merge to main
- `git push --force` — Force push

### Correct Workflow

```bash
# 1. Create feature branch
git checkout -b feature/my-feature

# 2. Make changes and commit
git add -A && git commit -m "Add feature"

# 3. Push feature branch
git push -u origin feature/my-feature

# 4. Create PR (with code review)
/pr
# Or: gh pr create

# 5. After approval, merge via PR
gh pr merge --squash --delete-branch
```

### The /pr Command

| Command | What It Does |
|---------|--------------|
| `/pr` | Review code + create PR (recommended) |
| `/pr create` | Create PR immediately (skip review) |
| `/pr review` | Review only (no PR created) |

---

## Key Project Constraints

| Constraint | Details |
|------------|---------|
| **Index.tsx Monolith** | Extract components OUT of `src/pages/Index.tsx`, don't add to it |
| **Design Tokens** | No hardcoded colors/spacing; use CSS variables from `src/index.css` |
| **Type Safety** | Regenerate types after DB changes: `npx supabase gen types...` |
| **SPA Architecture** | No server components; data fetching in useEffect/handlers |
| **PR Workflow** | All changes through PRs; direct merges blocked |

---

## Example Plans

### Example 1: UI Component

```markdown
# Session Plan: Workout Card Redesign

## Session Goal

Update WorkoutCard to show equipment-specific exercise names.

## Context

- Reference: `src/components/WorkoutCard.tsx` — Current implementation
- Reference: `src/types/database.ts` — ExerciseDefinition type

## Tasks

### Task 1: Update Exercise Name Display

**Do:**
- Add helper function to resolve display name from equipment_display_names
- Update exercise name rendering to use resolved name

**Acceptance:**
- [ ] "Dumbbell Bench Press" shows when equipment is dumbbells
- [ ] Falls back to base name if equipment_display_names is null
- [ ] No TypeScript errors
```

### Example 2: Backend Change

```markdown
# Session Plan: Add Weight Recommendation

## Session Goal

Add weight_recommendation field to exercise output.

## Context

- Reference: `supabase/functions/generate-workout/index.ts`
- Reference: `src/types/workout.ts`

## Tasks

### Task 1: Update Edge Function

**Do:**
- Add weight_recommendation to GeneratedExercise interface
- Update SYSTEM_PROMPT to include weight recommendations

**Acceptance:**
- [ ] AI returns weight_recommendation in response
- [ ] Field is optional
- [ ] Build passes

### Task 2: Update Frontend Types

**Do:**
- Add weight_recommendation to Exercise type

**Acceptance:**
- [ ] Type matches Edge Function output
- [ ] No TypeScript errors
```

---

## Quick Reference

| What | Where |
|------|-------|
| Entry point | `CLAUDE.md` |
| Skill/agent registry | `.claude/README.md` |
| All skills | `.claude/skills/*.md` |
| All agents | `.claude/agents/*.md` |
| Session plans | `.claude/plans/SESSION_PLAN_*.md` |
| Commands | `.claude/commands/*.md` |
| Backlog | `docs/BACKLOG.md` |
| Session log | `docs/SESSION_LOG.md` |
| Design tokens | `src/index.css` |

---

## Workflow Summary

```
1. Read CLAUDE.md          → Understand the system
2. Read .claude/README.md  → Find relevant skills
3. Load skill files        → Follow the steps
4. Execute tasks           → Track with TodoWrite
5. Validate acceptance     → Verify each criterion
6. Run /pr                 → Create PR with review
7. Run close-session.md    → Log completed work
```

---

*Last updated: February 2026*
