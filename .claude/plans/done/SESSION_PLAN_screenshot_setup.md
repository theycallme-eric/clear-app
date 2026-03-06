# Session Plan: Setup Screenshot Workflow

## Session Goal
Add the screenshot workflow skill and create the gitignored screenshots folder.

## Context
- New skill file: `screenshot-workflow-skill.md` (in project files)
- New folder: `.claude/screenshots/` (gitignored)

---

## Tasks

### 1. Create Screenshots Folder

**Do:**
```bash
mkdir -p .claude/screenshots
```

**Acceptance:**
- Folder exists at `.claude/screenshots/`

---

### 2. Gitignore the Screenshots Folder

**Do:**
Create `.claude/screenshots/.gitignore` with:
```
*
!.gitignore
```

This keeps the folder in git but ignores all contents.

**Acceptance:**
- `.claude/screenshots/.gitignore` exists
- Running `git status` in `.claude/screenshots/` shows no untracked files (except .gitignore itself on first commit)

---

### 3. Create the Screenshot Workflow Skill

**Do:**
1. Copy contents of `screenshot-workflow-skill.md` from project files
2. Save as `.claude/skills/screenshot-workflow.md`

**Acceptance:**
- File exists at `.claude/skills/screenshot-workflow.md`

---

## After Session

- [ ] Confirm: `.claude/screenshots/` folder exists
- [ ] Confirm: `.claude/screenshots/.gitignore` is set up correctly
- [ ] Confirm: `.claude/skills/screenshot-workflow.md` exists
- [ ] Say: "Done. Screenshot workflow ready. I'll request screenshots when I need visual reference and clean them up after each task."
