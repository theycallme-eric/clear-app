# Skill: Close Session

> **Trigger:** When all tasks in the session are complete.

## Context

Track completed work for project history and continuity between agents. This ensures the next session has full context of what was done.

## Steps

1. **Log Work**
   - Open `docs/SESSION_LOG.md`
   - Append entry using format below

2. **Update Backlog**
   - Open `docs/BACKLOG.md`
   - Mark completed items as `[x]`
   - Add any new items discovered during work

3. **Update Handoff** (if applicable)
   - Clear or update `docs/antigravity-handoff.md` with current status

4. **Architecture Check** (if applicable)
   - If you added a new Page, Service, or major component
   - Update `docs/wireframes/PROJECT_MAP.md`

5. **Final Message**
   - Tell user: "Session complete. Log and backlog updated. Ready for next plan."

## Session Log Entry Format

```markdown
## [Date] - [Brief Title]

**Agent:** [Antigravity / Claude Code / etc.]

**Work Completed:**
- [What was built/changed]
- [What was built/changed]

**Files Modified:**
- `path/to/file.tsx` — [brief description]

**Files Created:**
- `path/to/new-file.tsx` — [what it does]

**Notes:**
- [Context for future sessions]
- [Blockers encountered]
- [Decisions made and why]

---
```

## Reference Files

- `docs/SESSION_LOG.md` — Work history
- `docs/BACKLOG.md` — Task tracking
- `docs/antigravity-handoff.md` — Handoff state
- `docs/wireframes/PROJECT_MAP.md` — Architecture docs

## Checklist

- [ ] Session entry added to SESSION_LOG.md
- [ ] Completed items marked in BACKLOG.md
- [ ] New items added to BACKLOG.md (if any)
- [ ] Handoff doc updated (if applicable)
- [ ] PROJECT_MAP.md updated (if major changes)
- [ ] User notified session is complete
