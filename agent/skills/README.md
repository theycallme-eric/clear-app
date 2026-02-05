# Agent Skills Directory

This folder contains Standard Operating Procedures (SOPs) for the Clear project.

**Rule:** When a task matches a trigger below, READ and FOLLOW the corresponding skill file.

---

## Workflow Skills

| Skill | Trigger | Description |
|-------|---------|-------------|
| [`handoff.md`](handoff.md) | Receiving a session plan | **START HERE.** Parse tasks, load context, check for relevant skills |
| [`close_session.md`](close_session.md) | All tasks complete | **END HERE.** Log work, update backlog, notify user |

## UI Skills

| Skill | Trigger | Description |
|-------|---------|-------------|
| [`component.md`](component.md) | Creating/refactoring UI | Enforces design system, component structure |
| [`gallery_add.md`](gallery_add.md) | After creating a component | Add visual test case to gallery |
| [`token_check.md`](token_check.md) | Reviewing component styles | Verify design tokens, no hardcoded values |

## Backend Skills

| Skill | Trigger | Description |
|-------|---------|-------------|
| [`supabase_workflow.md`](supabase_workflow.md) | Touching DB, Auth, or API | Type safety, env vars, SPA patterns |
| [`debug.md`](debug.md) | Build fails or runtime error | Systematic error resolution |

## Documentation Skills

| Skill | Trigger | Description |
|-------|---------|-------------|
| [`backlog.md`](backlog.md) | Adding/completing tasks | Manage `docs/BACKLOG.md` |
| [`project_map.md`](project_map.md) | Major architecture change | Update `docs/wireframes/PROJECT_MAP.md` |

---

## Quick Reference

```
Session Start:  handoff.md
UI Work:        component.md → gallery_add.md → token_check.md
Backend Work:   supabase_workflow.md
Errors:         debug.md
Session End:    close_session.md → backlog.md → project_map.md (if needed)
```

---

*Last updated: February 2026*
