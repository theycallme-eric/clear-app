# Session End Skill

**Context:** Track completed work in `docs/SESSION_LOG.md` for project history and continuity between agents.

## When to Use

Run this skill at the end of any work session where code was written or significant changes were made.

## Session Log Entry Format

Add entries to `docs/SESSION_LOG.md` using this format:

```markdown
## [Date] - [Brief Title]

**Agent:** [Antigravity / Claude Code / etc.]

**Work Completed:**
- [What was built/changed]
- [What was built/changed]

**Files Modified:**
- `path/to/file.tsx` - [brief description of change]
- `path/to/file.tsx` - [brief description of change]

**Files Created:**
- `path/to/new-file.tsx` - [what it does]

**Notes:**
- [Any context for future sessions]
- [Blockers encountered]
- [Decisions made and why]

---
```

## Checklist Before Ending Session

1. All work committed to git (if applicable)
2. `docs/BACKLOG.md` updated (items completed or added)
3. `docs/antigravity-handoff.md` cleared or updated with status
4. Session entry added to `docs/SESSION_LOG.md`
