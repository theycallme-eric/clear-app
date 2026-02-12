# Claude Skills & Agents Registry

This directory contains all skills and agents for the Clear project.

---

## Agents

Agents are specialized AI personas with specific expertise and workflows.

| Agent | Description | Model |
|-------|-------------|-------|
| [`figma-ui-implementer`](agents/figma-ui-implementer.md) | Translates Figma designs into pixel-perfect UI | opus |

---

## Skills

Skills are Standard Operating Procedures (SOPs) that guide specific tasks.

**Rule:** When a task matches a trigger below, READ and FOLLOW the corresponding skill file.

### Workflow Skills

| Skill | Trigger | Description |
|-------|---------|-------------|
| [`execute-plan`](skills/execute-plan.md) | `/execute` or after plan approval | **AUTOMATED.** Parse plan, execute tasks, track progress, validate acceptance |
| [`handoff`](skills/handoff.md) | Receiving a session plan | **MANUAL.** Parse tasks, load context, check for relevant skills |
| [`close-session`](skills/close-session.md) | All tasks complete | **END HERE.** Log work, update backlog, notify user |

### UI Skills

| Skill | Trigger | Description |
|-------|---------|-------------|
| [`component`](skills/component.md) | Creating/refactoring UI | Enforces design system, component structure |
| [`chamfered-component`](skills/chamfered-component.md) | Building chamfered frame components | ChamferedFrame + LeftColumn pattern |
| [`gallery-add`](skills/gallery-add.md) | After creating a component | Add visual test case to gallery |
| [`token-check`](skills/token-check.md) | Reviewing component styles | Verify design tokens, no hardcoded values |

### Backend Skills

| Skill | Trigger | Description |
|-------|---------|-------------|
| [`supabase-workflow`](skills/supabase-workflow.md) | Touching DB, Auth, or API | Type safety, env vars, SPA patterns |
| [`debug`](skills/debug.md) | Build fails or runtime error | Systematic error resolution |

### Documentation Skills

| Skill | Trigger | Description |
|-------|---------|-------------|
| [`backlog`](skills/backlog.md) | Adding/completing tasks | Manage `docs/BACKLOG.md` |
| [`todo-board`](skills/todo-board.md) | Checking or updating todo board | Process informal notes in `docs/todo/` |
| [`project-map`](skills/project-map.md) | Major architecture change | Update `docs/wireframes/PROJECT_MAP.md` |

---

## Quick Reference

```
Session Start:  execute-plan (automated) OR handoff (manual)
UI Work:        component → chamfered-component (if needed) → gallery-add → token-check
Backend Work:   supabase-workflow
Errors:         debug
Session End:    close-session → backlog → project-map (if needed)
```

---

## Guard Rails

### Before Building New Components

**STOP and CHECK before creating any new UI component:**

1. **Check ComponentGallery.tsx** — Does a similar component already exist?
2. **Check src/components/ui/** — Are there shadcn components already styled for this?
3. **Check src/components/** — Is there a custom component that does this?

**If a component looks similar to a Figma reference, ASK:**
> "Should I use the existing [X] component, or do you need something new?"

**Only build new when:**
- No existing component serves the purpose
- User explicitly confirms a new component is needed

### Figma References

When user shares a Figma screenshot:
1. Identify what UI element is shown
2. Check if it matches an existing component in the gallery
3. If unsure, ask before building

---

## File Structure

```
.claude/
├── README.md              ← You are here (central registry)
├── agents/
│   └── figma-ui-implementer.md
├── commands/
│   ├── execute.md         ← /execute [plan-name]
│   ├── process-inbox.md
│   └── todo.md
├── plans/
│   └── SESSION_PLAN_*.md  ← Session plans to execute
└── skills/
    ├── execute-plan.md    ← Automated plan execution
    ├── handoff.md
    ├── close-session.md
    ├── component.md
    ├── chamfered-component.md
    ├── gallery-add.md
    ├── token-check.md
    ├── supabase-workflow.md
    ├── debug.md
    ├── backlog.md
    ├── todo-board.md
    └── project-map.md
```

---

## Conventions

### Naming
- **Files:** kebab-case (e.g., `close-session.md`, `token-check.md`)
- **YAML name field:** matches filename without extension

### Skill Format
All skills use YAML frontmatter:
```yaml
---
name: skill-name
description: Brief description of what this skill does
trigger: When to use this skill
category: workflow | ui | backend | documentation
---
```

### Agent Format
Agents use extended YAML frontmatter:
```yaml
---
name: agent-name
description: When and how to use this agent
model: opus | sonnet | haiku
color: purple | blue | green | etc.
---
```

### Cross-References
- Skills reference other skills by path: `.claude/skills/token-check.md`
- Skills reference agents by path: `.claude/agents/figma-ui-implementer.md`

---

*Last updated: February 2026*
