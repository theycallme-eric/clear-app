---
name: pull-ticket
description: Pull a ticket from Ready, move to In Progress, set up branch and context for execution
trigger: When starting work from the ticket board
category: workflow
---

# Skill: Pull Ticket

## Context

This is the LLM-first entry point for starting work. Pull a ticket from the Ready column, set up the branch, load all context, and begin execution. The ticket's PRD is the source of truth for what to build.

## Steps

1. **List ready tickets**
   ```bash
   gh issue list --label "status:ready" --json number,title,labels --limit 20
   ```
   Sort by priority (P0 first). Present as a numbered list.

2. **Select ticket**
   - If issue number provided as argument, use it directly
   - Otherwise, present the list and ask which to pull

3. **Load full ticket**
   ```bash
   gh issue view [N] --json body,title,labels,number,assignees
   ```

4. **Parse PRD and load context**
   - Extract **Acceptance Criteria** → these become the task checklist
   - Extract **Affected files** → read each one for context
   - Extract **Skills to load** → load each skill
   - Extract **Technical Notes** → understand constraints
   - Extract **Out of Scope** → know what NOT to build

5. **Create branch**
   ```bash
   git checkout main && git pull origin main
   git checkout -b feature/issue-[N]-[slug]
   ```
   Where `[slug]` is a short kebab-case of the title (e.g., `feature/issue-42-circuit-auto-progress`)

6. **Update ticket status**
   - Remove `status:ready` label:
     ```bash
     gh issue edit [N] --remove-label "status:ready"
     ```
   - Add assignee:
     ```bash
     gh issue edit [N] --add-assignee @me
     ```

7. **Begin execution**
   - Use acceptance criteria as the task list
   - Follow the decision tree in CLAUDE.md for which skills to apply (UI pre-flight, supabase-workflow, etc.)
   - Work through each acceptance criterion

8. **On completion**
   - Create PR via `/pr` — include `Closes #[N]` in the PR body
   - The issue auto-closes when the PR merges

## Linking PRs to Tickets

When creating a PR for ticket work, always include in the PR body:
```
Closes #[N]
```
This auto-closes the issue and moves it to Done on the project board.

## Related Skills

- [create-ticket](./create-ticket.md) — Create tickets to pull later
- [pr-workflow](./pr-workflow.md) — Create PR when work is done
- [execute-plan](./execute-plan.md) — Alternative entry point via session plans
- [component](./component.md) — UI pre-flight (if ticket is UI work)

## Checklist

- [ ] Ticket loaded and PRD parsed
- [ ] Affected files read for context
- [ ] Relevant skills loaded
- [ ] Branch created from latest main
- [ ] Ticket status updated (label removed, assigned)
- [ ] All acceptance criteria addressed
- [ ] PR created with `Closes #N`
