# Session Plan: Code Review Workflow

## Session Goal

Create an automated code review workflow that enforces best practices:
- Block risky git operations (direct merges to main, force pushes)
- Require PR-based workflow for all changes
- Provide code review assistance via agent

## Context

- Reference: `.claude/README.md` — Skill and agent registry
- Reference: `.claude/settings.local.json` — Current settings
- Reference: `.claude/skills/close-session.md` — Workflow pattern example
- Reference: `.claude/agents/figma-ui-implementer.md` — Agent pattern example

## Tasks

### Task 1: Create Git Safety Hook Script

**Do:**
- Create `.claude/hooks/git-safety-check.sh`
- Block commands that merge directly to main without PR
- Block force pushes
- Block pushes to main/master branch directly
- Output clear warning messages explaining why blocked

**Acceptance:**
- File exists at `.claude/hooks/git-safety-check.sh`
- Script is executable
- Script handles: `git push origin main`, `git merge main`, `git push --force`

---

### Task 2: Configure PreToolUse Hook

**Do:**
- Create `.claude/settings.json` with PreToolUse hook for Bash commands
- Hook should invoke the git safety check script
- Configure appropriate timeout

**Acceptance:**
- File exists at `.claude/settings.json`
- Hook configured for `PreToolUse` event
- Matcher targets `Bash` tool

---

### Task 3: Create PR Workflow Skill

**Do:**
- Create `.claude/skills/pr-workflow.md`
- Document the proper PR-based workflow:
  1. Create feature branch
  2. Make changes with commits
  3. Push branch to remote
  4. Create PR via `gh pr create`
  5. Request review
  6. Merge via PR (never direct merge)
- Include checklist for PR readiness

**Acceptance:**
- File exists at `.claude/skills/pr-workflow.md`
- YAML frontmatter with name, description, trigger, category
- Clear step-by-step workflow documented

---

### Task 4: Create Code Review Agent

**Do:**
- Create `.claude/agents/code-reviewer.md`
- Agent should:
  - Review staged changes or PR diff
  - Check for common issues (security, performance, style)
  - Verify design system compliance
  - Suggest improvements
- Use haiku model for speed

**Acceptance:**
- File exists at `.claude/agents/code-reviewer.md`
- YAML frontmatter with name, description, model
- Clear review checklist and workflow

---

### Task 5: Create /pr Command

**Do:**
- Create `.claude/commands/pr.md`
- Command should:
  - Check current branch status
  - Guide user through PR creation
  - Invoke code-reviewer agent before PR
- Support arguments: `/pr create`, `/pr review`

**Acceptance:**
- File exists at `.claude/commands/pr.md`
- Clear instructions for different subcommands

---

### Task 6: Update Registry

**Do:**
- Update `.claude/README.md` to include:
  - New `code-reviewer` agent in Agents table
  - New `pr-workflow` skill in Workflow Skills table
  - New `/pr` command reference

**Acceptance:**
- README.md updated with new entries
- Table formatting preserved

---

## Notes

- The git safety hook will block the exact scenario that triggered this request
- The PR workflow provides the "right way" to merge changes
- The code reviewer adds proactive quality checks before PR submission
