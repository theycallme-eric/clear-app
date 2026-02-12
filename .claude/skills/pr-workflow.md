---
name: pr-workflow
description: Enforces PR-based code review workflow for all changes
trigger: When merging code, pushing to remote, or completing a feature
category: workflow
---

# Skill: PR Workflow

## Context

All code changes must go through pull request review before merging to main. This ensures code quality, catches bugs early, and maintains a clear history of changes. Direct pushes and merges to main are blocked by git safety hooks.

## The Golden Rule

> **Never merge directly to main. Always use a PR.**

---

## Standard PR Workflow

### 1. Create Feature Branch

```bash
# From main, create a descriptive branch
git checkout main
git pull origin main
git checkout -b feature/descriptive-name

# Branch naming conventions:
# feature/add-user-auth
# fix/login-button-crash
# refactor/cleanup-api-calls
# docs/update-readme
```

### 2. Make Changes with Atomic Commits

```bash
# Stage and commit with clear messages
git add -A
git commit -m "Add user authentication flow

- Create AuthContext for session management
- Add login/logout API endpoints
- Wire up LoginForm component

Co-Authored-By: Claude <noreply@anthropic.com>"
```

**Commit message guidelines:**
- First line: imperative mood, <50 chars (e.g., "Add", "Fix", "Update")
- Blank line
- Body: explain *why*, not just *what*
- Reference issues: `Fixes #123`

### 3. Push Feature Branch

```bash
# Push and set upstream
git push -u origin feature/descriptive-name
```

### 4. Create Pull Request

```bash
# Using GitHub CLI
gh pr create --title "Add user authentication" --body "## Summary
- Adds complete auth flow with session management
- Implements login/logout functionality

## Test Plan
- [ ] Login with valid credentials
- [ ] Login with invalid credentials shows error
- [ ] Logout clears session

## Screenshots
[If UI changes, add before/after screenshots]"
```

### 5. Request Review

```bash
# Add reviewers
gh pr edit --add-reviewer username

# Or request review from team
gh pr edit --add-reviewer @org/team-name
```

### 6. Address Review Feedback

```bash
# Make changes based on feedback
git add -A
git commit -m "Address PR feedback: improve error handling"
git push
```

### 7. Merge via PR (Never Direct Merge)

```bash
# After approval, merge via GitHub
gh pr merge --squash --delete-branch

# Options:
# --merge    : Create merge commit
# --squash   : Squash into single commit (preferred)
# --rebase   : Rebase and merge
```

---

## Pre-PR Checklist

Before creating a PR, verify:

- [ ] **Branch is up to date** — `git pull origin main && git rebase main`
- [ ] **Build passes** — `npm run build`
- [ ] **Tests pass** — `npm test`
- [ ] **Types check** — `npx tsc --noEmit`
- [ ] **Lint passes** — `npm run lint`
- [ ] **No console.logs** left in code
- [ ] **No hardcoded secrets** or API keys
- [ ] **Changes are documented** if needed
- [ ] **Commit messages are clear**

---

## PR Description Template

```markdown
## Summary
[1-3 bullet points describing what this PR does]

## Changes
- [Specific change 1]
- [Specific change 2]

## Test Plan
- [ ] [How to test change 1]
- [ ] [How to test change 2]

## Screenshots
[Before/after if UI changes]

## Related Issues
Closes #[issue-number]
```

---

## Emergency Hotfix Process

For critical production fixes:

1. **Still use a PR** — but mark as urgent
2. **Create hotfix branch** from main
   ```bash
   git checkout main
   git checkout -b hotfix/critical-bug-description
   ```
3. **Make minimal fix** — only fix the issue, no refactoring
4. **Create PR with `[HOTFIX]` prefix**
   ```bash
   gh pr create --title "[HOTFIX] Fix critical payment bug"
   ```
5. **Get expedited review** — ping team directly
6. **Merge immediately after approval**

---

## What Gets Blocked

The git safety hook will block:

| Command | Reason |
|---------|--------|
| `git push origin main` | Direct push to main |
| `git merge main` | Merging into main locally |
| `git push --force` | Force push (dangerous) |
| `git checkout main && git merge feature` | Local merge workflow |

All these should use `gh pr create` and `gh pr merge` instead.

---

## Quick Reference

```bash
# Full workflow in one go
git checkout -b feature/my-feature
# ... make changes ...
git add -A && git commit -m "Add my feature"
git push -u origin feature/my-feature
gh pr create --fill
# ... get review ...
gh pr merge --squash --delete-branch
```

---

## Related Skills

- [code-reviewer agent](/.claude/agents/code-reviewer.md) — Automated code review
- [close-session](/.claude/skills/close-session.md) — End of session workflow

## Related Commands

- `/pr` — Guided PR creation workflow
- `/pr review` — Run code review agent on current changes
