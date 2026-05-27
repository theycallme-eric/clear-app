---
name: execute-plan
description: Execute a session plan systematically with progress tracking and acceptance validation
trigger: When given a session plan file or `/execute [plan-name]`
category: workflow
---

# Skill: Execute Plan

## Context

This skill takes a session plan and executes it task-by-task, loading relevant skills, validating acceptance criteria, and tracking progress. It bridges planning and implementation.

**Entry points:**
- `/execute [plan-name]` command
- After `/process-inbox` files a session plan
- After exiting plan mode with a saved plan

---

## Steps

### 1. Load the Plan

- Locate plan file in `.claude/plans/SESSION_PLAN_*.md`
- If plan name not specified, list available plans and ask which to execute:
  ```
  Available plans:
  1. SESSION_PLAN_auth_refactor.md
  2. SESSION_PLAN_todo_setup.md

  Which plan should I execute?
  ```
- Parse the plan structure:
  - `## Session Goal` — What this session accomplishes
  - `## Context` — Files to read before starting
  - `## Tasks` — Work items with Do/Acceptance sections

### 2. Create Working Branch

Before loading context, ensure work happens on an isolated feature branch.

1. **Derive branch name from plan filename:**
   - `SESSION_PLAN_auth_refactor.md` → `feature/auth-refactor`
   - Rule: drop `SESSION_PLAN_` prefix, replace underscores with hyphens, prepend `feature/`

2. **Check current branch:**
   - **On `main`:** Create and checkout the new branch from main
     ```
     git checkout -b feature/[derived-name]
     ```
   - **Already on the target branch:** Continue (resuming a prior session)
   - **On a different feature branch:** Ask the user:
     ```
     You're currently on [current-branch]. Options:
     1. Stay on this branch (work here instead)
     2. Stash changes and switch to feature/[derived-name]
     3. Abort — sort out branches manually
     ```

3. **Check working tree:** If there are uncommitted changes, warn the user and ask whether to stash, commit, or continue anyway.

### 3. Load Context Files

- Read every file listed in the plan's `## Context` section
- Look for patterns like:
  - `Reference: path/to/file.md`
  - `- Reference: path/to/file.ts`
  - Any file paths mentioned
- Build understanding before starting any work

### 4. Map Tasks to Skills

For each task, detect type keywords and load relevant skills:

| Keywords in Task | Load Skill |
|-----------------|------------|
| component, UI, button, modal, form | `component.md` |
| Supabase, database, API, auth, query | `supabase-workflow.md` |
| error, debug, fix, failing | `debug.md` |
| token, color, design system | `token-check.md` |
| backlog, completed, task | `backlog.md` |

Also check:
- If task explicitly names a skill via `**Skill:**` field, load that
- Consult `.claude/README.md` trigger table for additional mappings

### 5. Initialize Progress Tracking

Use TaskCreate to create items for each task:

```
TaskCreate({ title: "Task 1: [name from plan]", description: "[active description]" })
TaskCreate({ title: "Task 2: [name from plan]", description: "[active description]" })
```

All tasks start as pending. Use TaskList to review progress.

### 6. Execute Tasks Sequentially

For each task:

1. **Mark in_progress** — TaskUpdate({ id: "...", status: "in_progress" })
2. **Read the task's `**Do:**` section** — Understand what to do
3. **Follow loaded skill steps** — If task type maps to a skill, follow it
4. **Execute the work** — Make the changes, create files, etc.
5. **Check `**Acceptance:**` criteria** — Validate each criterion

### 7. Validate Acceptance Criteria

For each criterion in the task's `**Acceptance:**` section:

**Automatable checks:**
- `File exists at [path]` → Use Glob or Read to verify
- `grep -r "[pattern]" returns [result]` → Use Grep tool
- `npm run build` passes → Run Bash command
- `TypeScript compiles` → Run `npx tsc --noEmit`
- `No console errors` → Note for manual check

**Manual checks:**
- `UI looks correct` → Ask user to verify
- `Behavior matches spec` → Ask user to verify

**On failure:**
```
Acceptance criterion failed: [criterion]

Options:
1. Retry — Attempt to fix and re-validate
2. Skip — Continue with note (criterion will be flagged)
3. Pause — Stop execution, resume later
4. Abort — Stop execution entirely
```

- If skip: Note the skip, continue to next criterion/task
- If pause: Save state, user can run `/execute` again to resume

### 8. Complete Task

- Only mark `completed` via TaskUpdate when:
  - ALL acceptance criteria pass, OR
  - User explicitly skipped failing criteria

- Move to next task

### 9. Close Session

After all tasks complete:

1. Run `close-session.md` skill
2. Log work to `docs/SESSION_LOG.md`
3. Update `docs/BACKLOG.md` with completed items
4. Report: "Session complete. [N] tasks completed, [M] skipped."

---

## Failure Handling

| Situation | Action |
|-----------|--------|
| Acceptance criterion fails | Warn, offer: retry/skip/pause/abort |
| Build error during task | Load `debug.md`, attempt fix, re-validate |
| Missing context file | Warn, ask user if critical or can proceed |
| Task blocked by prior task | Note dependency, ask user |
| User chooses abort | Log partial progress, exit cleanly |

---

## Progress Tracking Format

TaskList output should look like:

```
[in_progress] Task 1: Create AuthContext
[pending] Task 2: Wire AuthProvider into App
[pending] Task 3: Simplify useHomeData
```

After completion:
```
[completed] Task 1: Create AuthContext
[completed] Task 2: Wire AuthProvider into App
[completed] Task 3: Simplify useHomeData (1 criterion skipped)
```

---

## Related Skills

- `handoff.md` — Manual plan processing (legacy approach)
- `close-session.md` — Session logging and cleanup
- `debug.md` — Error resolution
- `component.md` — UI component creation
- `supabase-workflow.md` — Backend/database work
- `token-check.md` — Design system compliance

---

## Checklist

- [ ] Plan file located and loaded
- [ ] Session Goal understood
- [ ] Working branch created or confirmed
- [ ] Context files read
- [ ] Tasks parsed with Do/Acceptance sections
- [ ] Relevant skills pre-loaded based on task types
- [ ] TaskCreate used for all tasks
- [ ] Each task executed with acceptance validation
- [ ] Failures warned, user acknowledged skip/retry
- [ ] Session logged via close-session skill
- [ ] User notified of completion
