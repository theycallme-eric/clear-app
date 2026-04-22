# Todo Board Skill

Manage the informal todo board — a folder of small notes tracking tasks, thoughts, and in-progress work.

## Location

```
docs/todo/
```

This is a low-friction capture system. Each file is a short note. Think sticky notes on a monitor, not Jira tickets.

---

## Note Format

Notes are small `.md` files. No rigid template — but use this loose convention:

```markdown
---
status: inbox | in-progress | waiting | done
---

The actual note. Can be one line or a few paragraphs.
Keep it casual — this isn't a spec.
```

### Status Values

| Status | Meaning |
|--------|---------|
| `inbox` | Just captured. Hasn't been thought through yet. |
| `in-progress` | Actively being worked on. |
| `waiting` | Blocked or paused — note why in the body. |
| `done` | Finished. Keep for a bit, then archive or delete. |

If a note has no frontmatter, treat it as `inbox`.

### Filename Convention

Use short kebab-case names that describe the thing: `fix-card-border.md`, `streak-logic-question.md`, `try-framer-motion.md`

Don't overthink it. The name just needs to be scannable in a directory listing.

---

## Processing the Board

When asked to check the todo board (via `/todo` or direct request):

### 1. Scan the folder

```bash
ls docs/todo/
```

### 2. Read each file and categorize by status

### 3. Present a summary

```
## Todo Board

### In Progress (2)
- **fix-card-border** — Updating card borders to use design tokens
- **auth-refactor** — On task 3 of 7, paused for the day

### Inbox (3)
- **streak-logic-question** — "Does the streak reset if they skip marking a rest day?"
- **try-framer-motion** — One line, no detail
- **onboarding-copy** — Wants to revisit step 3 wording

### Waiting (1)
- **figma-export** — Waiting on updated Figma frames from designer

### Done (1)
- **setup-inbox-skill** — Can archive or delete

---
Any items to discuss, promote to BACKLOG, or update?
```

### 4. Offer actions

For each item, Claude Code can:

- **Expand:** Ask clarifying questions to flesh out a vague note
- **Promote:** Create a GitHub Issue via `create-ticket.md` skill
- **Update status:** Change frontmatter when work starts/finishes
- **Archive:** Move done items to `docs/todo/archive/` (or delete if the user prefers)
- **Create session plan:** If an item is scoped enough, offer to draft a session plan

### 5. Flag stale items

If a note has been `inbox` for more than a few sessions (use your judgment — look at SESSION_LOG dates), mention it:

```
⚠️ **streak-logic-question** has been in inbox for a while. Want to resolve it now or move it to BACKLOG?
```

---

## Adding Notes

### From Claude Code
When the user says "add a todo" or "remind me to...":

1. Create a new file in `docs/todo/`
2. Use the note format above
3. Default status to `inbox`
4. Confirm: `Added docs/todo/[filename].md to the board.`

### From Claude.ai
Claude.ai will sometimes produce notes or action items as files. These get dropped into `docs/todo/` via the inbox system or manually.

### Manually
The user can create files directly in `docs/todo/` from their editor. No special process needed.

---

## Promoting to GitHub Issues

When a todo item has enough detail to be a real task:

1. Run the [create-ticket](/.claude/skills/create-ticket.md) skill to create a GitHub Issue with a full PRD
2. Either delete the todo file or update its status to `done`
3. Confirm: `Promoted to GitHub Issue #N and removed from todo board.`

---

## Relationship to Other Docs

| Doc | Role | Formality |
|-----|------|-----------|
| `docs/todo/` | Sticky notes. Quick capture. | Very low |
| GitHub Issues | Prioritized tickets with PRDs. Official queue. | High |
| `docs/SESSION_LOG.md` | What got done, when. History. | Medium |
| `.claude/plans/` | Detailed execution plans for sessions. | High |

Flow: **Todo → GitHub Issue → Branch + PR → SESSION_LOG**

Not everything follows this path. Some todos get resolved immediately. Some go straight to a ticket. Some just get deleted when they stop mattering.

---

## Setup

If the folder doesn't exist:

```bash
mkdir -p docs/todo
```

No `.gitignore` needed — these should be tracked in the repo so they persist.
