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

5. **Design System Drift Check** (if session touched UI)
   - If any files in `src/components/`, `src/index.css`, or `src/pages/` were modified:
     a. **Component registry**: Run `npm run registry-check` — verify `component.md` registry matches actual components in `src/components/`
     b. **Token lint**: Run `npm run token-lint` — catch any new violations introduced this session
     c. **Doc drift**: If new components were added, check they're listed in `component.md` registry. If new tokens were added, check `token-decision-tree.md` covers them.
     d. **Taste feedback**: If the user gave aesthetic corrections during this session (spacing adjustments, atmosphere changes, visual weight feedback), append entries to `memory/feedback_aesthetic.md`. Then review the file:
        - **Graduate**: Any pattern with 3+ entries → refine the matching rule in `ui-rules.md` or `anti-patterns.md`, then remove from the feedback file
        - **Consolidate**: Merge similar entries
        - **Prune**: Remove one-offs older than ~5 sessions that haven't repeated
        - **Cap**: Keep the file under ~30 entries
   - If no UI files were touched, skip silently

6. **Archive Plan** (if session was driven by a plan)
   - Move the executed plan to the done folder: `mv .claude/plans/SESSION_PLAN_*.md .claude/plans/done/`
   - Only archive if all tasks in the plan were completed or explicitly skipped

7. **Create & Merge PR** (if on a feature branch with commits)
   - Ask user: "Ready to create and merge a PR for this branch? (y/n)"
   - If yes:
     a. Run `/pr` (full review + create workflow)
     b. After PR is created, **merge it**: `gh pr merge [N] --squash --delete-branch`
     c. Do NOT stop at PR creation — the session isn't closed until the PR is merged
   - If no: skip — user may want to continue work next session

8. **Branch Cleanup**
   - Switch to main and pull latest: `git checkout main && git pull origin main`
   - Delete local branches already merged to main: `git branch --merged main | grep -v 'main' | xargs -r git branch -d`
   - Prune stale remote tracking refs: `git remote prune origin`
   - Verify only `main` remains: `git branch -a`

9. **Final Message**
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
- [ ] Design system drift check (if UI work): registry, token-lint, doc drift, taste feedback saved
- [ ] Executed plan archived to `.claude/plans/done/` (if applicable)
- [ ] PR created AND merged (if on feature branch with commits)
- [ ] Local branches cleaned up, remotes pruned
- [ ] User notified session is complete
