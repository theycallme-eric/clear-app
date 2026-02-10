# Screenshot Workflow Skill

Use screenshots for visual reference when implementing or auditing UI. Screenshots are temporary working files — delete them when the task is complete.

## Folder

```
.claude/screenshots/
```

This folder is gitignored. Screenshots are local development references only — never committed.

---

## Requesting a Screenshot

When you need visual reference, ask the user clearly:

```
I need a screenshot to verify [specific thing]. Please:
1. [Take a screenshot of X / Capture the Y screen / Show me the current state of Z]
2. Save to `.claude/screenshots/[name].png`

Suggested filename: `[task]-[descriptor].png`
```

**Examples:**

```
I need a screenshot to verify the button styling. Please:
1. Capture the CTA button in its current state (both default and hover if possible)
2. Save to `.claude/screenshots/cta-button-current.png`
```

```
I need a screenshot to compare against Figma. Please:
1. Take a screenshot of the dashboard header as it appears now
2. Save to `.claude/screenshots/dashboard-header-current.png`
```

```
I see you mentioned a bug. Please:
1. Screenshot showing the issue
2. Save to `.claude/screenshots/toast-bug.png`
```

---

## Naming Convention

`[task]-[descriptor].png`

| Part | Description | Examples |
|------|-------------|----------|
| task | Component or feature being worked on | `cta-button`, `dashboard`, `toast`, `exercise-card` |
| descriptor | What the screenshot shows | `current`, `fixed`, `bug`, `hover-state`, `mobile`, `figma-reference` |

**Examples:**
- `cta-button-current.png`
- `cta-button-fixed.png`
- `dashboard-header-bug.png`
- `exercise-card-figma-reference.png`
- `toast-mobile-current.png`

---

## Using Screenshots

Reference screenshots by path when discussing changes:

```
Looking at `.claude/screenshots/cta-button-current.png`, I can see:
- The border color appears to be using a hardcoded value
- The hover state isn't visible
- The left accent bar looks correct

Comparing to the Figma spec, I need to fix...
```

---

## Cleanup (Required)

**When the task is complete, delete all screenshots:**

```bash
rm -rf .claude/screenshots/*
```

Do this:
- After task is marked complete
- Before moving to the next task
- As part of the "After Session" checklist

**Do not** leave screenshots accumulating between tasks.

---

## Setup

If the folder or gitignore entry doesn't exist:

```bash
# Create folder
mkdir -p .claude/screenshots

# Add placeholder to keep folder in git (but not contents)
echo "*\n!.gitkeep" > .claude/screenshots/.gitignore
```

---

## Quick Reference

| Action | How |
|--------|-----|
| Request screenshot | Ask user with specific subject + suggested filename |
| Screenshot location | `.claude/screenshots/` |
| Naming | `[task]-[descriptor].png` |
| Reference in chat | Use full path: `.claude/screenshots/filename.png` |
| Cleanup | `rm -rf .claude/screenshots/*` when task complete |
