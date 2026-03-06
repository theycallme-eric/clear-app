# Plan: Create Plan Execution Skill

## Goal
Create the **execution engine** that takes session plans and runs them systematically — loading appropriate skills, tracking progress via TodoWrite, validating acceptance criteria, and handling failures gracefully.

## Two Entry Points

1. **Inbox pathway:** Create plan externally → drop in `.claude/inbox/` → `/process-inbox` files it → offer to execute
2. **Direct planning mode:** Enter plan mode in Claude Code → write plan to `.claude/plans/` → ask to execute → run

Both converge on the same execution engine (`execute-plan.md` skill).

---

## Design Decisions (Confirmed)

| Decision | Choice |
|----------|--------|
| **Progress tracking** | TodoWrite tool (Claude Code UI), NOT docs/todo/ |
| **After plan approval** | Ask before executing |
| **Acceptance criteria** | Warn but continue — flag failures, allow proceeding with acknowledgment |
| **Plan file location** | Directly to `.claude/plans/`, skip inbox |
| **Command availability** | Both `/execute [plan]` command AND auto-prompt after plan approval |

---

## Files to Create/Modify

### 1. CREATE: `.claude/skills/execute-plan.md`

The core execution skill:

```markdown
---
name: execute-plan
description: Execute a session plan systematically with progress tracking and acceptance validation
trigger: When given a session plan file or `/execute [plan-name]`
category: workflow
---

# Skill: Execute Plan

## Context
This skill takes a session plan and executes it task-by-task, loading relevant skills,
validating acceptance criteria, and tracking progress. It bridges planning and implementation.

## Steps

### 1. Load the Plan
- Locate plan file in `.claude/plans/SESSION_PLAN_*.md`
- If plan name not specified, list available plans and ask which to execute
- Parse: Session Goal, Context section, Tasks

### 2. Load Context Files
- Read every file listed in the plan's `## Context` section
- Build understanding before starting any work

### 3. Map Tasks to Skills
- For each task, detect type keywords:
  - "component", "UI", "button", "modal" → load `component.md`
  - "Supabase", "database", "API", "auth" → load `supabase-workflow.md`
  - "error", "debug", "fix" → load `debug.md`
- Consult `.claude/README.md` trigger table for additional mappings
- Pre-load skills that will be needed

### 4. Initialize Progress Tracking
- Use TodoWrite to create items for each task
- Format: Task name from plan
- All start as `pending`

### 5. Execute Tasks Sequentially
For each task:
1. Mark `in_progress` in TodoWrite
2. Read the task's `**Do:**` section
3. Follow the loaded skill's steps
4. Execute the work
5. Check `**Acceptance:**` criteria

### 6. Validate Acceptance Criteria
For each criterion:
- **Automatable:** File exists, grep returns expected, `npm run build` passes, TypeScript compiles
- **Manual:** Prompt user "Please verify: [criterion]. Pass? (y/n)"

**On failure:**
- Warn: "Acceptance criterion failed: [criterion]"
- Ask: "Retry / Skip with note / Pause / Abort?"
- If skip: Note the skip in TodoWrite, continue
- If pause: Stop execution, user can resume later

### 7. Complete Task
- Only mark `completed` when all acceptance criteria pass (or user explicitly skips)
- Move to next task

### 8. Close Session
- After all tasks: Run `close-session.md` skill
- Log to SESSION_LOG.md
- Update BACKLOG.md

## Failure Handling

| Situation | Action |
|-----------|--------|
| Acceptance criterion fails | Warn, offer: retry/skip/pause/abort |
| Build error | Load `debug.md`, attempt fix, re-validate |
| Blocked by missing context | Ask user for clarification |
| User chooses abort | Log partial progress, exit cleanly |

## Related Skills
- `handoff.md` — Manual plan processing (legacy)
- `close-session.md` — Session logging
- `debug.md` — Error resolution
- `component.md`, `supabase-workflow.md` — Task-type skills

## Checklist
- [ ] Plan loaded and parsed
- [ ] Context files read
- [ ] Relevant skills pre-loaded
- [ ] TodoWrite initialized with all tasks
- [ ] Each task executed with acceptance validation
- [ ] Failures warned, user acknowledged
- [ ] Session logged via close-session
```

---

### 2. CREATE: `.claude/commands/execute.md`

```markdown
Execute a session plan from `.claude/plans/`.

## Instructions

1. If argument provided: Load `.claude/plans/SESSION_PLAN_[argument].md`
2. If no argument: List available plans, ask which to execute
3. Read `.claude/skills/execute-plan.md` for full workflow
4. Follow the skill steps to execute the plan
5. Track progress with TodoWrite
6. Validate acceptance criteria for each task
7. On completion, run close-session skill
```

---

### 3. UPDATE: `.claude/skills/inbox-workflow.md`

Add to "Processing Steps" section after step 4:

```markdown
5. **If session plan found and user says yes to execute:**
   - Read `.claude/skills/execute-plan.md`
   - Follow the skill to execute the plan
```

---

### 4. UPDATE: `.claude/README.md`

Add to Workflow Skills table:

```markdown
| [`execute-plan`](skills/execute-plan.md) | `/execute` or after plan approval | Parse and execute session plans with progress tracking |
```

Update Quick Reference:
```
Session Start:  handoff (manual) OR execute-plan (automated)
```

---

## Execution Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│  ENTRY POINTS                                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Path A: Inbox                    Path B: Direct                │
│  ─────────────────                ─────────────────             │
│  1. Drop plan in inbox            1. Enter plan mode            │
│  2. /process-inbox                2. Write plan to .claude/plans/│
│  3. Files to .claude/plans/       3. Exit plan mode             │
│  4. "Execute now? (y/n)"          4. "Execute now? (y/n)"       │
│           │                                │                    │
│           └───────────┬────────────────────┘                    │
│                       ▼                                         │
│              ┌─────────────────┐                                │
│              │ execute-plan.md │                                │
│              └────────┬────────┘                                │
│                       ▼                                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  1. Load plan + context files                             │  │
│  │  2. Map tasks → skills                                    │  │
│  │  3. TodoWrite: create task items                          │  │
│  │  4. For each task:                                        │  │
│  │     - Mark in_progress                                    │  │
│  │     - Execute following relevant skill                    │  │
│  │     - Validate acceptance criteria                        │  │
│  │     - Warn on failure, ask: retry/skip/pause/abort        │  │
│  │     - Mark completed (or skipped)                         │  │
│  │  5. Run close-session.md                                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                       ▼                                         │
│              Session complete                                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Verification

All tests use a **lightweight test plan** — not real work plans.

### Test Plan: `SESSION_PLAN_skill_test.md`
```markdown
# Session Plan: Execute Skill Test

## Session Goal
Verify the execute-plan skill works correctly.

## Context
- Reference: `.claude/README.md` (just to test context loading)

## Tasks

### 1. Create a test file
**Do:** Create `docs/test-execute-skill.md` with content "Test successful"
**Acceptance:**
- [ ] File exists at `docs/test-execute-skill.md`
- [ ] File contains "Test successful"

### 2. Delete the test file
**Do:** Remove `docs/test-execute-skill.md`
**Acceptance:**
- [ ] File no longer exists

## After Session
- [ ] Confirm both tasks completed
```

### Test 1: `/execute` command
```
1. Create SESSION_PLAN_skill_test.md in .claude/plans/
2. Run `/execute skill_test`
3. Verify: Plan loads, TodoWrite shows 2 tasks, context file read
4. Verify: Tasks execute and complete
5. Verify: Test file created then deleted
```

### Test 2: Inbox pathway
```
1. Drop SESSION_PLAN_skill_test.md in .claude/inbox/
2. Run /process-inbox
3. Verify: Files to .claude/plans/
4. Say "yes" to execute prompt
5. Verify: Execution runs correctly
```

### Test 3: Acceptance failure handling
```
1. Modify test plan to have impossible criterion (e.g., "file contains XYZ" when it won't)
2. Execute
3. Verify: Warning appears
4. Choose "skip"
5. Verify: Task marked skipped, execution continues to next task
```

### Cleanup
- Delete `SESSION_PLAN_skill_test.md` after testing
- No real project files affected
