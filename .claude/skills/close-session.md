---
name: close-session
description: End of session workflow - log work, update backlog, notify user
trigger: When all tasks in the session are complete
category: workflow
---

# Skill: Close Session

## Context

Track completed work for project history and continuity between agents. This ensures the next session has full context of what was done.

## Steps

1. **Log Work**
   - Open `docs/SESSION_LOG.md`
   - Append entry using format below

2. **Update Tickets**
   - For any work completed this session, close the relevant GitHub Issues:
     `gh issue close [N] --comment "Completed in session [date]. PR: #[PR]"`
   - If no issues were tracked this session, skip

3. **Process Session Notes** (if `docs/todo/` has inbox items)
   - Run [process-session-notes](./process-session-notes.md) skill
   - This handles: todo promotion, duplicate detection, issue creation/update
   - If no inbox items, skip silently

4. **Architecture Check** (if applicable)
   - If you added a new Page, Service, or major component
   - Run [project-map](.claude/skills/project-map.md) skill

5. **Archive Plan** (if session was driven by a plan)
   - Move the executed plan to the done folder: `mv .claude/plans/SESSION_PLAN_*.md .claude/plans/done/`
   - Only archive if all tasks in the plan were completed or explicitly skipped

6. **Branch Cleanup**
   - Switch to main and pull latest: `git checkout main && git pull origin main`
   - Delete local branches already merged to main: `git branch --merged main | grep -v 'main' | xargs -r git branch -d`
   - Delete their remote counterparts via GitHub API: `gh api repos/{owner}/{repo}/git/refs/heads/{branch} -X DELETE`
   - Prune stale remote tracking refs: `git remote prune origin`
   - Verify only `main` remains: `git branch -a`

7. **Final Message**
   - Tell user: "Session complete. Log and backlog updated. Branches cleaned up. Ready for next plan."

## Session Log Entry Format

```markdown
## [Date] - [Brief Title]

**Agent:** [Claude Code / other]

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
- `docs/wireframes/PROJECT_MAP.md` — Architecture docs

## Related Skills

- [handoff](.claude/skills/handoff.md) — Start of session workflow
- [process-session-notes](./process-session-notes.md) — Synthesize notes into tickets
- [project-map](.claude/skills/project-map.md) — Architecture documentation

## Checklist

- [ ] Session entry added to SESSION_LOG.md
- [ ] Relevant GitHub Issues closed (if work was ticket-driven)
- [ ] Session notes processed into tickets (if inbox items exist)
- [ ] PROJECT_MAP.md updated (if major changes)
- [ ] Executed plan archived to `.claude/plans/done/` (if applicable)
- [ ] Merged branches deleted (local + remote)
- [ ] User notified session is complete
