---
name: create-ticket
description: Create a GitHub Issue with full PRD from a description, todo item, or scratchpad note
trigger: When promoting an idea to a formal ticket, or during feature planning sessions
category: workflow
---

# Skill: Create Ticket

## Context

Creates a GitHub Issue with a PRD (Product Requirements Document) that serves both human reviewers and LLM executors. Every ticket should be self-contained enough that an LLM can pull it, understand the full scope, and execute without additional context.

## Steps

1. **Accept input**
   - Raw description from user conversation
   - `docs/todo/*.md` file path (if promoting from todo board)
   - Inline idea from a planning session

2. **Check for duplicates**
   - Run `gh issue list -s open --search "[key terms]" --json number,title`
   - If potential matches found, present them and ask: "Related to an existing ticket, or new?"
   - If match: offer to update existing issue instead of creating a duplicate

3. **Generate PRD**
   Fill the `.github/ISSUE_TEMPLATE/prd.md` structure:
   - **Problem Statement:** Derive from input. One paragraph, focused on the "why."
   - **Acceptance Criteria:** Concrete, testable checkboxes. Think "how would I verify this is done?"
   - **Technical Notes:**
     - Search codebase (`Glob` / `Grep`) to identify affected files
     - Check `.claude/README.md` skill matrix for relevant skills to load
     - Note design token needs if UI-related
     - Flag DB changes if applicable
   - **Design Considerations:** Reference `docs/design-philosophy.md` if UI work. Note component reuse opportunities.
   - **Out of Scope:** Explicitly state what this ticket does NOT cover. Prevents scope creep.
   - **Context:** Link related issues, reference prior art, include screenshots if available.

4. **Determine labels**
   - **Type:** `type:bug`, `type:feature`, `type:enhancement`, `type:tech-debt`, or `type:idea`
   - **Priority:** `P0:critical`, `P1:high`, `P2:medium`, or `P3:low`
   - **Area:** `area:ui`, `area:backend`, `area:design-system`, or `area:workflow`
   - **Status:** `status:needs-detail` by default. Only apply `status:ready` if ALL of:
     - Problem statement is clear
     - Acceptance criteria are specific and testable
     - Technical notes include affected files
     - Out of scope is defined

5. **Create issue**
   ```bash
   gh issue create --title "[title]" --body "$(cat <<'EOF'
   [PRD body]
   EOF
   )" --label "type:..." --label "P2:medium" --label "area:..." --label "status:..."
   ```

6. **Add to project board**
   ```bash
   gh project item-add 1 --owner theycallme-eric --url [ISSUE_URL]
   ```

7. **Clean up source** (if promoted from todo)
   - Delete the todo file or mark its status as `done`

8. **Report**
   - "Created #N: [title]. Labels: [labels]. Board: Backlog."

## Lightweight Mode

For low-priority items or bulk migration, skip the full codebase search (step 3 technical notes). Create with:
- Title + problem statement + labels + `status:needs-detail`
- Flesh out the full PRD later when the ticket moves toward Ready

## Related Skills

- [todo-board](./todo-board.md) — Quick capture layer that feeds into tickets
- [pull-ticket](./pull-ticket.md) — Pull a created ticket to start work
- [process-session-notes](./process-session-notes.md) — Batch-promote todos into tickets

## Checklist

- [ ] Duplicate check performed
- [ ] PRD fills all template sections (or lightweight mode chosen)
- [ ] Labels applied (type + priority + area + status)
- [ ] Issue added to CLEAR project board
- [ ] Source todo cleaned up (if applicable)
