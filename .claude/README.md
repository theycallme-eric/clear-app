# Claude Skills & Agents Registry

This is the **authoritative registry** for all skills and agents in the Clear project.

**First time here?** Read `CLAUDE.md` at the project root for the quick-start guide.

---

## How This System Works

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLAUDE.md                                 │
│                    (Entry Point - Read First)                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    .claude/README.md                             │
│                (This File - Skill/Agent Registry)                │
└─────────────────────────────────────────────────────────────────┘
                              │
            ┌─────────────────┼─────────────────┐
            ▼                 ▼                 ▼
       ┌─────────┐      ┌─────────┐      ┌─────────┐
       │ Skills  │      │ Agents  │      │Commands │
       │  (SOPs) │      │(Personas)│     │(/slash) │
       └─────────┘      └─────────┘      └─────────┘
```

**Skills** = Step-by-step procedures for specific tasks
**Agents** = Specialized personas with domain expertise
**Commands** = User-invocable shortcuts (e.g., `/pr`, `/execute`)

---

## Decision Flowchart: Which Skill?

```
What are you doing?
│
├─► UI WORK
│   │
│   ├─► Creating new component?
│   │   └─► component.md → gallery-add.md → token-check.md
│   │
│   ├─► Component has chamfered/angled corners?
│   │   └─► chamfered-component.md (use ChamferedFrame)
│   │
│   ├─► Implementing from Figma?
│   │   └─► Use AGENT: figma-ui-implementer
│   │
│   ├─► Using a new icon?
│   │   └─► icon-transform.md (add to src/components/icons.tsx)
│   │
│   └─► Checking design tokens?
│       └─► token-check.md
│
├─► BACKEND WORK
│   │
│   ├─► Database, Auth, or API?
│   │   └─► supabase-workflow.md
│   │
│   └─► Build error or runtime bug?
│       └─► debug.md
│
├─► GIT / MERGING
│   │
│   ├─► Ready to merge code?
│   │   └─► pr-workflow.md → /pr command
│   │
│   └─► Creating a PR?
│       └─► /pr (runs code-reviewer agent)
│
├─► SESSION MANAGEMENT
│   │
│   ├─► Given a session plan?
│   │   └─► /execute [plan-name] OR handoff.md
│   │
│   ├─► All tasks complete?
│   │   └─► close-session.md → backlog.md
│   │
│   └─► Major architecture change?
│       └─► project-map.md
│
└─► DOCUMENTATION
    │
    ├─► Updating task list?
    │   └─► backlog.md
    │
    └─► Processing informal notes?
        └─► todo-board.md
```

---

## Skill Selection Matrix

| If you're... | Load this skill | Then also... |
|--------------|-----------------|--------------|
| Creating UI component | `component.md` | → `gallery-add.md` → `token-check.md` |
| Building chamfered UI | `chamfered-component.md` | → `token-check.md` |
| Touching Supabase/DB | `supabase-workflow.md` | Regenerate types after |
| Fixing errors | `debug.md` | |
| Merging code | `pr-workflow.md` | Run `/pr` command |
| Starting session | `execute-plan.md` or `handoff.md` | |
| Ending session | `close-session.md` | → `backlog.md` |

---

## Agents

Agents are specialized AI personas. Invoke via Task tool with matching `subagent_type`.

| Agent | When to Use | Model | Speed |
|-------|-------------|-------|-------|
| [`figma-ui-implementer`](agents/figma-ui-implementer.md) | Implementing Figma designs pixel-perfect | opus | Slower, thorough |
| [`code-reviewer`](agents/code-reviewer.md) | Reviewing code before PR | haiku | Fast |

### When to Use an Agent vs Skill

- **Use an Agent** when you need deep expertise and autonomous work
- **Use a Skill** when you need step-by-step guidance for a procedure

---

## Skills Reference

### Workflow Skills

| Skill | Trigger | What It Does |
|-------|---------|--------------|
| [`execute-plan`](skills/execute-plan.md) | `/execute` or plan approval | **AUTOMATED.** Parse plan, execute tasks, track progress, validate acceptance |
| [`handoff`](skills/handoff.md) | Receiving a session plan | **MANUAL.** Parse tasks, load context, check for relevant skills |
| [`close-session`](skills/close-session.md) | All tasks complete | **END HERE.** Log work, update backlog, notify user |
| [`pr-workflow`](skills/pr-workflow.md) | Merging code or creating PR | **ENFORCED.** PR-based workflow, blocks direct merges to main |

### UI Skills

| Skill | Trigger | What It Does |
|-------|---------|--------------|
| [`component`](skills/component.md) | Creating/refactoring UI | Enforces design system, component structure |
| [`chamfered-component`](skills/chamfered-component.md) | Building chamfered frame components | ChamferedFrame + LeftColumn pattern |
| [`gallery-add`](skills/gallery-add.md) | After creating a component | Add visual test case to gallery |
| [`token-check`](skills/token-check.md) | Reviewing component styles | Verify design tokens, no hardcoded values |
| [`token-audit`](skills/token-audit.md) | Comprehensive token review | Full audit of design token usage |
| [`icon-transform`](skills/icon-transform.md) | New Lucide icon introduced | Convert to CLEAR-style solid geometric icon |

### Backend Skills

| Skill | Trigger | What It Does |
|-------|---------|--------------|
| [`supabase-workflow`](skills/supabase-workflow.md) | Touching DB, Auth, or API | Type safety, env vars, SPA patterns |
| [`debug`](skills/debug.md) | Build fails or runtime error | Systematic error resolution |

### Documentation Skills

| Skill | Trigger | What It Does |
|-------|---------|--------------|
| [`backlog`](skills/backlog.md) | Adding/completing tasks | Manage `docs/BACKLOG.md` |
| [`todo-board`](skills/todo-board.md) | Checking or updating todo board | Process informal notes in `docs/todo/` |
| [`project-map`](skills/project-map.md) | Major architecture change | Update `docs/wireframes/PROJECT_MAP.md` |

### Utility Skills

| Skill | Trigger | What It Does |
|-------|---------|--------------|
| [`inbox-workflow`](skills/inbox-workflow.md) | Processing inbox files | Handle files dropped in `.claude/inbox/` |
| [`screenshot-workflow`](skills/screenshot-workflow.md) | Working with screenshots | Process and reference screenshots |

---

## Commands

User-invocable shortcuts. Files in `.claude/commands/`.

| Command | Arguments | What It Does |
|---------|-----------|--------------|
| `/execute` | `[plan-name]` | Execute a session plan |
| `/pr` | `[create\|review]` | PR workflow (default: review + create) |
| `/todo` | | Check the todo board |
| `/process-inbox` | | Process files in inbox folder |
| `/process-plans` | | Move plans from ~/.claude/plans/ to project |
| `/close-session` | | Log session work and update backlog |

---

## Hooks (Automated Enforcement)

Hooks run automatically before/after tool calls. Configured in `.claude/settings.json`.

| Hook | Event | What It Does |
|------|-------|--------------|
| `session-start-check.sh` | SessionStart | Warns about in-progress work (dirty files, unpushed branches, stashes) |
| `git-safety-check.sh` | PreToolUse (Bash) | Blocks direct pushes/merges to main |

### What Gets Blocked

```
git push origin main          ← BLOCKED (use PR)
git merge main                ← BLOCKED (use PR)
git push --force              ← BLOCKED (dangerous)
git checkout main && merge    ← BLOCKED (use PR)
```

**Correct workflow:** `git push origin feature-branch` → `gh pr create` → `gh pr merge`

---

## Skill Chains (Common Workflows)

### UI Component Creation
```
component.md → chamfered-component.md (if needed) → gallery-add.md → token-check.md
```

### Session Execution
```
execute-plan.md → [task skills] → close-session.md → backlog.md
```

### Code Merging
```
pr-workflow.md → /pr → code-reviewer agent → gh pr create → gh pr merge
```

### Error Resolution
```
debug.md → [fix] → token-check.md (if UI) → pr-workflow.md
```

---

## Guard Rails

### Before Building New Components

**STOP and CHECK:**

1. **Check ComponentGallery.tsx** — Does a similar component exist?
2. **Check src/components/ui/** — Are there shadcn components already styled?
3. **Check src/components/** — Is there a custom component that does this?

**If unsure, ASK:**
> "Should I use the existing [X] component, or do you need something new?"

### Before Merging Code

**ALWAYS:**
1. Run `/pr review` to check code quality
2. Ensure TypeScript compiles: `npx tsc --noEmit`
3. Ensure build passes: `npm run build`
4. Create PR via `gh pr create` (never direct merge)

---

## File Structure

```
.claude/
├── README.md              ← You are here (skill/agent registry)
├── settings.json          ← Hook configuration
├── settings.local.json    ← Local overrides (gitignored)
│
├── agents/
│   ├── figma-ui-implementer.md
│   └── code-reviewer.md
│
├── commands/
│   ├── execute.md         ← /execute [plan-name]
│   ├── pr.md              ← /pr [create|review]
│   ├── process-inbox.md
│   ├── process-plans.md   ← /process-plans (import from ~/.claude/plans/)
│   ├── close-session.md   ← /close-session (log work, update backlog)
│   └── todo.md
│
├── hooks/
│   ├── session-start-check.sh  ← Session start awareness
│   └── git-safety-check.sh
│
├── plans/
│   └── SESSION_PLAN_*.md  ← Session plans
│
├── skills/
│   ├── execute-plan.md    ← Session execution
│   ├── handoff.md         ← Manual session start
│   ├── close-session.md   ← Session end
│   ├── pr-workflow.md     ← PR workflow (enforced)
│   ├── component.md       ← UI components
│   ├── chamfered-component.md
│   ├── gallery-add.md
│   ├── token-check.md
│   ├── token-audit.md
│   ├── icon-transform.md
│   ├── supabase-workflow.md
│   ├── debug.md
│   ├── backlog.md
│   ├── todo-board.md
│   ├── project-map.md
│   ├── inbox-workflow.md
│   └── screenshot-workflow.md
│
├── inbox/                 ← Drop files here for processing
└── screenshots/           ← Screenshot storage
```

---

## Conventions

### File Naming
- **Skill/Agent files:** kebab-case (e.g., `close-session.md`)
- **Session plans:** `SESSION_PLAN_[name].md`
- **YAML name field:** matches filename without extension

### Skill Format
```yaml
---
name: skill-name
description: Brief description
trigger: When to use this
category: workflow | ui | backend | documentation
---
```

### Agent Format
```yaml
---
name: agent-name
description: When and how to use (with examples)
model: opus | sonnet | haiku
color: purple | blue | green
---
```

---

## Adding New Skills/Agents

1. Create file in appropriate directory
2. Add YAML frontmatter
3. Document steps clearly
4. Add to this README in the correct table
5. Update `CLAUDE.md` if it's a commonly-used skill

---

*Last updated: February 2026*
