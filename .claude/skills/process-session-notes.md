---
name: process-session-notes
description: Synthesize session scratchpad notes into GitHub Issues — new tickets or updates to existing ones
trigger: At session close, or via /ticket sync
category: workflow
---

# Skill: Process Session Notes

## Context

During working sessions, quick notes accumulate in `docs/todo/` as inbox items. This skill synthesizes them into formal GitHub Issues — either creating new tickets or updating existing ones. It cross-references notes against open issues to avoid duplicates and connect related work.

## Steps

1. **Gather inbox notes**
   - Scan `docs/todo/` for files with `status: inbox` (or no frontmatter)
   - If no inbox items, report "No notes to process" and exit

2. **Fetch open issues for cross-referencing**
   ```bash
   gh issue list -s open --json number,title,body,labels --limit 100
   ```

3. **For each note, classify:**

   **a) Match against existing issues**
   - Compare note content against issue titles and bodies
   - Use keyword overlap and semantic similarity
   - If confident match: classify as **update**
   - If partial match: flag and ask user

   **b) Classify as one of:**
   | Classification | Action |
   |---|---|
   | **New issue** | Run `create-ticket.md` skill |
   | **Update to existing issue** | Add comment via `gh issue comment [N]` |
   | **Discard** | Too vague, already done, or not worth tracking |

4. **Process each classification**

   **New issues:**
   - Run `create-ticket.md` for each (lightweight mode for low-priority items)

   **Updates:**
   - Add a comment to the existing issue:
     ```bash
     gh issue comment [N] --body "Additional context from session (YYYY-MM-DD): [content]"
     ```
   - If the note adds substantial detail (acceptance criteria, technical notes), offer to update the issue body

   **Discards:**
   - Present to user: "These notes seem too vague or already covered. Discard?"
   - Only delete after user confirms

5. **Clean up processed notes**
   - Delete todo files that became tickets or updates
   - Mark discards as `done` (or delete if user confirms)

6. **Report summary**
   ```
   Processed N notes:
   - X new tickets created (#12, #13, #14)
   - Y updates added to existing tickets (#8, #11)
   - Z discarded (user confirmed)
   ```

## When to Run

- **At session close:** Called by `close-session.md` if inbox items exist
- **On demand:** Via `/ticket sync`
- **Best practice:** Run at end of every working session so notes don't pile up

## Related Skills

- [create-ticket](./create-ticket.md) — Creates individual tickets (called by this skill)
- [todo-board](./todo-board.md) — The capture layer that feeds this skill
- [close-session](./close-session.md) — Calls this skill as part of session close

## Checklist

- [ ] All inbox notes read
- [ ] Open issues fetched for cross-reference
- [ ] Each note classified (new / update / discard)
- [ ] New tickets created with appropriate labels
- [ ] Existing issues updated with comments
- [ ] Discards confirmed with user
- [ ] Processed todo files cleaned up
- [ ] Summary reported
