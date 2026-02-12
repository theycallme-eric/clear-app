# Session Plan: Update Planning Guide

## Session Goal
Replace CLAUDE_AI_PLANNING_GUIDE.md with a refined version that documents the planning and execution workflow using Claude Code.

## Context
- Reference: `CLAUDE_AI_PLANNING_GUIDE.md` (current version — being replaced)
- Reference: `.claude/skills/README.md` (skill index for reference)
- Current state: Existing guide covers plan template and skill categories but lacks the full workflow definition, design system sources, and document hierarchy

---

## Tasks

### 1. Replace CLAUDE_AI_PLANNING_GUIDE.md

**Skill:** `project_map.md`

**Do:**
Replace the entire contents of `CLAUDE_AI_PLANNING_GUIDE.md` with the content below.

**Acceptance:**
- [ ] File is updated with new content
- [ ] No references to removed sections are broken
- [ ] `npm run build` still passes (file is docs-only, but verify no imports)

**Update:** SESSION_LOG.md

---

**New file content:**

```markdown
# Planning Guide

**Purpose:** Defines how to plan and execute work sessions for the Clear project.

---

## Planning & Execution Workflow

```
Planning Phase                          Execution Phase
────────────────────────────────────────────────────────────────
1. Explore idea with user         →
2. Make design decisions          →
3. Draft spec or documentation    →
4. Generate SESSION_PLAN          →      5. Load execute-plan.md skill
                                  →      6. Load context files + skills
                                  →      7. Execute tasks in order
                                  →      8. Run close-session.md
                                  ←      9. Report completion
10. Review output with user       ←
11. Plan next session             →
```

### Handoff via Inbox

Create plan files and drop them in `.claude/inbox/`. Run `/process-inbox` to file everything, then execute when prompted.

### File Naming for Inbox

| File Type | Naming Pattern | Destination |
|-----------|----------------|-------------|
| Session Plan | `SESSION_PLAN_[name].md` | `.claude/plans/` |
| Skill | `[name]-skill.md` | `.claude/skills/` |
| Agent | `[name]-agent.md` | `.claude/agents/` |
| Spec | `[name]-spec.md` | `docs/specs/` |
| Wireframe | `[name]-wireframe.md` | `docs/wireframes/` |

---

## Document System

These are the core project documents.

| Document | Purpose | When Updated |
|----------|---------|--------------|
| **PROJECT_MAP.md** | Architecture, tech stack, file structure, data flow. The foundation everything references. | After architecture changes |
| **BACKLOG.md** | Prioritized work items. Pull from this when planning. | After completing or adding tasks |
| **SESSION_LOG.md** | History of completed work sessions. | After each session |
| **SESSION_PLAN.md** | Active workplan. One at a time. | When planning new work |

Feature specs, wireframes, and roadmaps build on top of PROJECT_MAP. They live in `docs/` subfolders.

---

## Design System Sources

Always check these before making UI decisions:

| Source | Location | Purpose |
|--------|----------|---------|
| **Figma** (via MCP) | Connected via Figma MCP | Visual source of truth — reference directly for specs |
| **Design tokens** | `src/index.css` (`:root` and `[data-theme="blue"]`) | CSS custom properties |
| **Token reference** | `docs/frontend/figma-design-tokens.json` | Token documentation |
| **Color tokens** | `design-tokens-colors.js` | Color definitions |
| **Wireframes** | `docs/wireframes/Clear_-_Screen_*.md` | Screen-level specs |
| **Data model** | `docs/architecture/Clear_-_Data_Model*.md` | Database schema |

**Design system rules:**
- No hardcoded hex colors — use CSS variables from `src/index.css`
- Match Figma specs via MCP before improvising
- Follow existing component patterns (ChamferedFrame + LeftColumn for cards)
- Mobile-first responsive approach
- Test on both themes (orange and blue)

---

## Session Plan Format

```
# Session Plan: [Brief Title]

## Session Goal
[One sentence — what this session accomplishes]

## Context
- Reference: [relevant files to read first]
- Figma: [relevant frames to check via MCP]
- New files: [files added from inbox, if any]
- Current state: [what exists now]

---

## Tasks

### 1. [Task Name]

**Skill:** [component.md / supabase-workflow.md / etc.]

**Do:**
[Specific instructions — file paths, commands, content]

**Acceptance:**
[How to verify it's done — concrete, not vague]

**Update:** [Which docs to update — e.g., BACKLOG.md, PROJECT_MAP.md]

---

### 2. [Next Task]
...

---

## Design System Compliance
- Use tokens from design-tokens.json, not hardcoded values
- Match Figma specs via MCP
- Follow existing component patterns
- Mobile-first

## After Session (REQUIRED — not done until complete)

- [ ] Update SESSION_LOG.md with: Date, Tasks Completed, Files Touched
- [ ] Update PROJECT_MAP.md if architecture changed
- [ ] Mark completed items as `[x]` in BACKLOG.md
- [ ] Confirm: "Session complete. Log and backlog updated. Ready for next plan."
```

### Key Principles

1. **Specific file paths** — Not "the main component", but `src/components/WorkoutCard.tsx`
2. **Skill per task** — Indicates which SOP to load for each task
3. **Acceptance is verifiable** — Not "it should look good" but "button renders with orange border on hover"
4. **Decisions are made** — Don't provide options; decide before creating the plan
5. **Figma references included** — If the task involves UI, point to the frame
6. **Doc updates per task** — Make doc updates part of the task scope, not an afterthought

### What NOT to Include

- Long explanations of *why* (put that in conversation, not the plan)
- Multiple options (decide before creating the plan)
- Vague acceptance criteria ("it should look good")
- Tasks that require user input mid-session (front-load decisions)

---

## Skill Categories

Skills are loaded from `.claude/skills/`. Reference the right one per task.

| Category | Skills | When to Use |
|----------|--------|-------------|
| **Workflow** | `execute-plan.md`, `handoff.md`, `close-session.md` | Start/end of every session |
| **UI** | `component.md`, `gallery-add.md`, `token-check.md` | Creating/modifying components |
| **Backend** | `supabase-workflow.md`, `debug.md` | Database, auth, API work |
| **Documentation** | `backlog.md`, `project-map.md` | Updating project docs |

---

## Project Constraints

Keep these in mind when relevant:

| Constraint | Details |
|------------|---------|
| **Index.tsx Monolith** | Extract components OUT of `src/pages/Index.tsx`, don't add to it |
| **Design Tokens** | No hardcoded hex colors; use CSS variables from `src/index.css` |
| **Type Safety** | Regenerate types after DB changes: `npx supabase gen types...` |
| **SPA Architecture** | No server components; data fetching in useEffect/handlers |
| **Equipment Display Names** | Use `equipment_display_names` field for exercise names |

---

## Quick Reference: File Locations

| What | Where |
|------|-------|
| Skills index | `.claude/README.md` |
| All skills | `.claude/skills/*.md` |
| Backlog | `docs/BACKLOG.md` |
| Session log | `docs/SESSION_LOG.md` |
| Project map | `docs/wireframes/PROJECT_MAP.md` |
| Design tokens | `src/index.css`, `docs/frontend/figma-design-tokens.json` |
| Database types | `src/types/database.ts` |
| Exercise library | `docs/architecture/Clear_-_Exercise_Library.md` |
| Inbox drop zone | `.claude/inbox/` (gitignored) |
| Skills folder | `.claude/skills/` |
| Plans folder | `.claude/plans/` |
| Slash commands | `.claude/commands/` |

---

*Last updated: February 2026*
```

---

## After Session

- [ ] Confirm: `CLAUDE_AI_PLANNING_GUIDE.md` has been replaced with new content
- [ ] Update SESSION_LOG.md with: Date, task completed, files touched
- [ ] Say: "Planning guide updated. Workflow, document system, and session plan format are now codified."
