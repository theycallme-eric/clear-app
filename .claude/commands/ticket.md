Manage GitHub Issue tickets for the CLEAR project.

## Instructions

### Parse Arguments

| Argument | Action |
|----------|--------|
| (none) | List ready tickets, sorted by priority |
| `create [description]` | Create new ticket via `create-ticket.md` skill |
| `pull [N]` | Pull ticket #N (or pick from ready list) via `pull-ticket.md` |
| `view [N]` | Show full PRD for ticket #N |
| `close [N]` | Close ticket with comment |
| `board` | Show kanban board summary |
| `sync` | Process all inbox todos into tickets |

### /ticket (default) — List Ready

1. Run `gh issue list --label "status:ready" --json number,title,labels`
2. Sort by priority (P0 first)
3. Present as numbered list with priority and type labels
4. Ask: "Pull a ticket to start work? (enter number or 'n')"

### /ticket create [description]

1. Read `.claude/skills/create-ticket.md`
2. Follow skill steps with provided description
3. If no description provided, ask: "What's the ticket about?"

### /ticket pull [N]

1. Read `.claude/skills/pull-ticket.md`
2. Follow skill steps with provided issue number
3. If no number provided, list ready tickets and ask which to pull

### /ticket view [N]

1. Run `gh issue view [N]`
2. Present the PRD in readable format
3. If no number provided, ask which ticket to view

### /ticket close [N]

1. Run `gh issue close [N] --comment "Completed. [brief context]"`
2. If no number provided, list in-progress tickets and ask which to close

### /ticket board

1. Run `gh issue list -s all --json number,title,labels,state --limit 100`
2. Categorize by status labels and state
3. Present summary:
   ```
   Backlog: N | Ready: N | In Progress: N | Review: N | Done (closed): N
   ```
4. List items in each active column (skip Done unless asked)

### /ticket sync

1. Read `.claude/skills/process-session-notes.md`
2. Follow skill steps to process all `docs/todo/` inbox items into tickets

## Quick Reference

```
/ticket              — List ready tickets
/ticket create       — Create new ticket with PRD
/ticket pull 42      — Start work on ticket #42
/ticket view 42      — View ticket #42 PRD
/ticket close 42     — Close ticket #42
/ticket board        — Kanban summary
/ticket sync         — Process todos into tickets
```

## Related Skills

- [create-ticket](/.claude/skills/create-ticket.md) — Full ticket creation workflow
- [pull-ticket](/.claude/skills/pull-ticket.md) — Pull and execute a ticket
- [process-session-notes](/.claude/skills/process-session-notes.md) — Batch promote todos
