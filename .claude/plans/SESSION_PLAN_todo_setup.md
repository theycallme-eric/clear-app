# Session Plan: Set Up Todo Board

## Session Goal
Install the todo board system — a folder for informal notes, a skill for processing them, and a slash command to check the board.

## Context
- New skill file: `todo-board-skill.md` (provided in project files or inbox)
- New command file: `todo.md` (provided in project files or inbox)
- Related: `.claude/skills/inbox-workflow.md` (existing file routing — this is separate)

---

## Tasks

### 1. Create the Todo Folder

**Do:**
```bash
mkdir -p docs/todo
```

**Acceptance:**
- `docs/todo/` directory exists

---

### 2. Install the Skill File

**Do:**
1. Copy `todo-board-skill.md` to `.claude/skills/todo-board.md`
2. If `.claude/skills/` doesn't exist, create it

**Acceptance:**
- File exists at `.claude/skills/todo-board.md`
- Content includes all sections: Note Format, Processing the Board, Promoting to BACKLOG, Relationship to Other Docs

---

### 3. Install the Slash Command

**Do:**
1. Copy `todo.md` to `.claude/commands/todo.md`
2. If `.claude/commands/` doesn't exist, create it

**Acceptance:**
- File exists at `.claude/commands/todo.md`
- Running `/todo` in Claude Code triggers the board check

---

### 4. Seed with a Few Starter Notes

**Do:** Create 2-3 example notes to verify the system works:

**File: `docs/todo/example-auth-refactor.md`**
```markdown
---
status: inbox
---

Auth refactor session plan is ready. Need to run it.
See: .claude/plans/SESSION_PLAN_auth_refactor.md
```

**File: `docs/todo/example-card-borders.md`**
```markdown
---
status: inbox
---

Card borders are inconsistent — some use tokens, some hardcoded. Flag during next UI audit.
```

**Acceptance:**
- Both files exist in `docs/todo/`
- Running `/todo` shows them in the Inbox section

---

### 5. Update Skills README

**Do:** If `agent/skills/README.md` (or `.claude/skills/README.md`) exists, add the todo-board skill to the index.

Add this row to the skill table:
```
| todo-board | Process the informal todo board in docs/todo/ | When checking or updating the todo board |
```

**Acceptance:**
- Skill is listed in the README
- Description matches

---

## After Session

- [ ] Run `/todo` and confirm it displays the summary correctly
- [ ] Confirm: "Todo board set up. Folder at docs/todo/, skill and command installed. Ready to use."
