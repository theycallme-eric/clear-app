End-of-session workflow: log work to `docs/SESSION_LOG.md`, update `docs/BACKLOG.md`, and summarize.

## Instructions

1. **Gather session context:**
   - Review recent git commits on the current branch (`git log --oneline -10`)
   - Review git diff to understand what changed (`git diff main...HEAD --stat`)
   - Check the task list for completed/in-progress items
   - Note the current branch name

2. **Update SESSION_LOG.md:**
   - Read `docs/SESSION_LOG.md` to understand existing format
   - Update the `Quick Status` section at the top
   - Update `Last Session` date to today
   - Append a new session entry at the top of `## Session Entries` using this format:

   ```markdown
   ### Session: [YYYY-MM-DD] - [Brief Title]

   **Duration:** [estimate]
   **Mode:** Claude Code
   **Branch:** `[branch-name]`

   #### What Got Done
   - [Bullet points of completed work]

   #### What Came Up (Unexpected)
   - [Surprises, issues, or learnings — omit section if nothing notable]

   #### Decisions Made
   | Decision | Rationale |
   |----------|-----------|
   | [Decision] | [Why] |

   #### Files Changed
   | File | Action |
   |------|--------|
   | `path/to/file` | Created/Modified — [brief description] |

   #### Status
   - [Build status, what's committed, what's pending]

   ---
   ```

3. **Update BACKLOG.md:**
   - Read `docs/BACKLOG.md`
   - Mark any completed items as `[x]`
   - Add any new items discovered during the session
   - If nothing changed, skip this step

4. **Show summary to user:**
   ```
   Session logged:
   - SESSION_LOG.md updated with [title]
   - BACKLOG.md [updated with N changes / no changes needed]
   - Branch: [branch-name]
   - Commits: [N] commits on this branch
   ```

## Quick Reference

```
/close-session              - Log session work and update backlog
```
