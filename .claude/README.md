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
| [`handoff`](skills/handoff.md) | Receiving a session plan | **START HERE.** Parse tasks, load context, check for relevant skills |
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
| [`project-map`](skills/project-map.md) | Major architecture change | Update `docs/wireframes/PROJECT_MAP.md` |

---

## Quick Reference

```
Session Start:  handoff
UI Work:        component → chamfered-component (if needed) → gallery-add → token-check
Backend Work:   supabase-workflow
Errors:         debug
Session End:    close-session → backlog → project-map (if needed)
```

---

## File Structure

```
.claude/
├── README.md              ← You are here (central registry)
├── agents/
│   └── figma-ui-implementer.md
└── skills/
    ├── handoff.md
    ├── close-session.md
    ├── component.md
    ├── chamfered-component.md
    ├── gallery-add.md
    ├── token-check.md
    ├── supabase-workflow.md
    ├── debug.md
    ├── backlog.md
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

*Last updated: February 2025*
