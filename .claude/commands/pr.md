Guided pull request workflow with optional code review.

## Instructions

### Parse Arguments

| Argument | Action |
|----------|--------|
| (none) | Full PR workflow: review → create |
| `create` | Skip review, just create PR |
| `review` | Only run code review, don't create PR |

---

### /pr (default) — Full Workflow

1. **Check branch status**
   ```bash
   git branch --show-current
   git status
   ```

   If on `main` or `master`:
   > "You're on the main branch. Create a feature branch first:
   > `git checkout -b feature/your-feature-name`"

2. **Check for changes**
   ```bash
   git diff --stat HEAD~1
   git diff --cached --stat
   ```

   If no changes:
   > "No changes to review. Make some commits first."

3. **Run code review agent**
   - Load agent: `.claude/agents/code-reviewer.md`
   - Review all changes since branching from main
   - Report issues found

4. **Ask user to proceed**
   If critical issues found:
   > "Found X critical issues. Fix these before creating PR? (y/n)"

   If no critical issues:
   > "Review complete. Ready to create PR? (y/n)"

5. **Create PR**
   - Generate PR title from branch name or commits
   - Generate PR body with summary of changes
   - Create PR via `gh pr create`

6. **Report PR URL**
   > "PR created: [URL]"

---

### /pr create — Quick Create

Skip review and create PR immediately:

1. **Verify not on main**
2. **Verify changes exist**
3. **Generate PR metadata**
4. **Create PR**

```bash
gh pr create --title "[Generated title]" --body "[Generated body]"
```

---

### /pr review — Review Only

Run code review without creating PR:

1. **Load code-reviewer agent**
2. **Review all changes**
3. **Report findings**

Use this to check code before you're ready to create a PR.

---

## PR Title Generation

Generate title from:
1. Branch name: `feature/add-user-auth` → "Add user auth"
2. Recent commits: Use first commit message if descriptive
3. Fallback: Ask user for title

## PR Body Template

```markdown
## Summary
[Auto-generated from commits]

## Changes
[List of changed files with brief descriptions]

## Test Plan
- [ ] [Auto-generated based on changes]

---
🤖 Generated with Claude Code
```

---

## Quick Reference

```
/pr           — Review changes, then create PR
/pr create    — Create PR immediately (skip review)
/pr review    — Review changes only (no PR)
```

---

## Related Skills

- [pr-workflow](/.claude/skills/pr-workflow.md) — Full PR workflow documentation
- [code-reviewer agent](/.claude/agents/code-reviewer.md) — Code review agent

## Related Hooks

- `git-safety-check.sh` — Blocks direct pushes to main
