# Plan: GitHub Issues + Projects Ticket Management System

## Context

CLEAR currently tracks work in `docs/BACKLOG.md` (markdown checkboxes) and `docs/todo/` (sticky-note files). This works but doesn't scale toward formal development practices. The goal is to move to GitHub Issues with PRDs as the source of truth, with a GitHub Projects kanban board for visibility, while keeping `docs/todo/` as a lightweight capture layer during sessions.

Key driver: LLM-first workflow. Tickets should be structured so an LLM can pull one, execute the full implementation, and move it to review — with the human director monitoring the board.

---

## Phase 1: GitHub Infrastructure

### 1.1 Auth
- Run `gh auth refresh -s project` (interactive — requires user)

### 1.2 Labels
Delete unused GitHub defaults, create purpose-built labels:

**Type labels:**
| Label | Color |
|-------|-------|
| `type:bug` | `#d73a4a` |
| `type:feature` | `#1D76DB` |
| `type:enhancement` | `#a2eeef` |
| `type:tech-debt` | `#D4C5F9` |
| `type:idea` | `#FEF2C0` |

**Priority labels:**
| Label | Color |
|-------|-------|
| `P0:critical` | `#B60205` |
| `P1:high` | `#D93F0B` |
| `P2:medium` | `#FBCA04` |
| `P3:low` | `#0E8A16` |

**Area labels:**
| Label | Color |
|-------|-------|
| `area:ui` | `#C5DEF5` |
| `area:backend` | `#BFD4F2` |
| `area:design-system` | `#D4C5F9` |
| `area:workflow` | `#E6E6E6` |

**Status labels (for CLI filtering without board queries):**
| Label | Color |
|-------|-------|
| `status:ready` | `#0E8A16` |
| `status:needs-detail` | `#FBCA04` |

### 1.3 Project Board
- Create GitHub Projects (v2) board: "CLEAR"
- Status columns: **Backlog → Ready → In Progress → Review → Done**
- Custom fields: Priority (single select P0-P3), Effort (single select XS/S/M/L/XL)

### 1.4 Issue Template
Create `.github/ISSUE_TEMPLATE/prd.md`:

```markdown
---
name: PRD
about: Product requirement for a feature, enhancement, or fix
title: "[TYPE] Brief title"
labels: status:needs-detail
---

## Problem Statement
<!-- What problem does this solve? Why does it matter? -->

## Acceptance Criteria
- [ ]
- [ ]

## Technical Notes
- Affected files:
- Skills to load:
- Design tokens needed:
- DB changes: none | describe

## Design Considerations
<!-- UI/UX notes. Reference design-philosophy.md if relevant. -->

## Out of Scope
<!-- What this ticket does NOT cover. -->

## Context
<!-- Related issues, screenshots, discussion. -->
```

---

## Phase 2: New Skills

### 2.1 `.claude/skills/create-ticket.md`
Creates a GitHub Issue with full PRD from a description or todo item.

Steps:
1. Accept input (raw description, todo file path, or inline)
2. Check for duplicates via `gh issue list -s open --search "[terms]"`
3. Generate PRD — fill template, identify affected files via codebase search, identify relevant skills
4. Apply labels (type + priority). Default `status:needs-detail` unless PRD is fully complete → `status:ready`
5. Create issue via `gh issue create`
6. Add to project board via `gh project item-add`
7. Clean up source (mark todo done / delete)
8. Report: "Created #N: [title]. Labels: [labels]."

### 2.2 `.claude/skills/pull-ticket.md`
Pull a ticket from Ready, set up branch and context, start work.

Steps:
1. List ready tickets: `gh issue list --label "status:ready"` sorted by priority
2. Present options (or accept issue number as argument)
3. Load full ticket: `gh issue view [N]`
4. Parse PRD — extract acceptance criteria, affected files, skills to load
5. Create branch: `git checkout -b feature/issue-[N]-[slug]`
6. Move to In Progress on board, assign
7. Read affected files, load skills
8. Begin execution using acceptance criteria as task checklist

### 2.3 `.claude/skills/process-session-notes.md`
Synthesize session scratchpad notes into GitHub Issues.

Steps:
1. Gather all `docs/todo/` files with `status: inbox`
2. Fetch open issues: `gh issue list -s open --json number,title,body,labels`
3. For each note, cross-reference against open issues (keyword + semantic matching)
4. Classify each as: **new issue**, **update to existing issue**, or **discard**
5. New → run `create-ticket.md`; Update → `gh issue comment`; Discard → confirm with user
6. Clean up processed todo files
7. Report summary

---

## Phase 3: New Command

### `.claude/commands/ticket.md` → `/ticket`

| Subcommand | Action |
|------------|--------|
| (none) | List ready tickets sorted by priority |
| `create [desc]` | Create ticket via `create-ticket.md` |
| `pull [N]` | Pull ticket via `pull-ticket.md` |
| `view [N]` | Show full PRD |
| `close [N]` | Close with comment |
| `board` | Kanban summary (count per column) |
| `sync` | Process all inbox todos into tickets |

---

## Phase 4: Modified Skills

### `close-session.md`
- Replace "Update Backlog" step with: close relevant GitHub Issues (`gh issue close [N] --comment "..."`)
- Add new step: "Process Session Notes" — run `process-session-notes.md` if `docs/todo/` has inbox items
- Remove all `BACKLOG.md` references

### `todo-board.md`
- Change "Promote" destination from BACKLOG.md to GitHub Issues via `create-ticket.md`
- Update relationship table: BACKLOG.md row replaced with GitHub Issues

### `handoff.md`
- Replace BACKLOG.md references with `gh issue list` / project board

### `execute-plan.md`
- If plan references an issue number (`Issue: #N`), read it for context, move to In Progress, link PR via `Closes #N`

---

## Phase 5: Migration

### Migrate 11 open BACKLOG.md items to GitHub Issues

**Full PRDs (medium priority — immediately actionable):**
| Item | Labels |
|------|--------|
| Circuit auto-progress | `type:enhancement`, `P2:medium`, `area:ui` |
| Restore TestWorkoutScreen | `type:bug`, `P2:medium`, `area:ui` |

**Lightweight (low priority — title + problem statement + labels, flesh out when moving to Ready):**
| Item | Labels |
|------|--------|
| Re-enable coaching cues | `type:enhancement`, `P3:low`, `area:backend` |
| Dev-only gate for devtools | `type:tech-debt`, `P3:low`, `area:workflow` |
| Dropdown click-outside dismiss | `type:enhancement`, `P3:low`, `area:ui` |
| Superset connector spacing | `type:enhancement`, `P3:low`, `area:design-system` |
| Section Notes | `type:feature`, `P3:low`, `area:ui` |
| Inline exercise edit | `type:feature`, `P3:low`, `area:ui` |
| 1 Rep Max testing mode | `type:feature`, `P3:low`, `area:ui` |
| Progressive loading | `type:feature`, `P3:low`, `area:ui` |
| Parallel branch previewing | `type:idea`, `P3:low`, `area:workflow` |

All lightweight items get `status:needs-detail`. Completed items stay in BACKLOG.md for history.

### Deprecate BACKLOG.md
Add notice at top pointing to GitHub Issues. Stop writing to it.

---

## Phase 6: Documentation Updates

### CLAUDE.md
- Add `/ticket` to decision tree and command table
- Update flow: **Todo → GitHub Issue → Branch + PR → SESSION_LOG**
- Remove BACKLOG.md references

### `.claude/README.md`
- Add new skills and command to registry

---

## Session Scratchpad (Passive Comments)

**No new mechanism.** Reuse `docs/todo/` — when user makes a passing comment during work, create a quick `docs/todo/[slug].md` with `status: inbox`. At session close, `process-session-notes.md` synthesizes all inbox items, cross-references against existing issues, and creates/updates tickets.

This keeps capture zero-friction and processing non-interruptive.

---

## Key Design Decisions

1. **Labels over board fields for automation** — `gh issue list --label` is fast and simple. Board is the human's visual tool; labels are the machine's query interface.
2. **`status:ready` as the gate** — LLM only pulls tickets with this label. Prevents grabbing half-baked tickets.
3. **Session plans coexist with tickets** — Tickets replace the backlog, not session plans. A plan can reference tickets, or `/ticket pull` can drive a session directly.
4. **Include area labels** — `area:ui`, `area:backend`, `area:design-system`, `area:workflow` for finer-grained filtering from the start.
5. **Mix migration by priority** — Full PRDs for 2 medium-priority items (immediately actionable). Lightweight for 9 low-priority items (flesh out when moving to Ready).
6. **One-question capture** — When user makes a passing comment, log it to todo, then ask one quick clarifying question (e.g., "Related to an existing ticket?") before moving on.

---

## Verification

After each phase:
- `gh issue list` shows created issues with correct labels
- `gh project view` shows items in correct columns
- `/ticket` command works end-to-end
- `/ticket pull N` creates branch, loads context
- `/close-session` processes todos into tickets
- Existing workflows (UI pre-flight, /pr, etc.) unaffected
