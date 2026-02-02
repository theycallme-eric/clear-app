# Project Kickoff Kit
**Version:** 1.0  
**Based on:** Clear Project Retro (Jan 2026)  
**Purpose:** Reusable framework for AI-assisted development projects

---

## How to Use This Kit

This kit is designed for **designers and non-developers** working with Claude as a development partner. It optimizes for:

- Fast project starts with clear direction
- Efficient context handoffs between sessions
- Nothing getting lost in the flow
- Easy pickup after weeks away

### Core Workflow
```
Claude.ai (Planning) → Claude Code (Building)
     ↓                        ↓
  Documents               Execution
  Decisions               Checkpoints
  Prompts                 Backlog capture
```

---

## Document Structure

### Required (Start Every Project)
| Doc | Purpose | When to Create |
|-----|---------|----------------|
| `01_PROJECT_BRIEF.md` | What, why, success criteria | Day 1 |
| `02_DESIGN_FOUNDATIONS.md` | Locked visual decisions | Before any UI work |
| `03_TECH_STACK.md` | Tools, structure, patterns | Before building |

### Build as Needed
| Doc | Purpose | When to Create |
|-----|---------|----------------|
| `04_COMPONENT_LIBRARY.md` | Pre-defined UI patterns with code | Before custom UI work |
| `05_CORE_FLOWS.md` | User paths, wireframes | When planning screens |
| `06_DATA_MODEL.md` | Database schema, API design | When backend needed |
| `07_IMPLEMENTATION_ROADMAP.md` | Phases, tasks, checkpoints | Before building |

### Living Documents (Always Active)
| Doc | Purpose | When to Update |
|-----|---------|----------------|
| `SESSION_LOG.md` | Decisions, progress, learnings | Every session |
| `BACKLOG.md` | Future work, ideas, debt | Continuously |

### Optional Reference
| Doc | Purpose | When Useful |
|-----|---------|-------------|
| `PERSONAS.md` | User context | Complex user needs |
| `ARCHIVE/` | Old decisions, deprecated docs | As needed |

---

## Checkpoint System

### Why Checkpoints Matter
Ideas, issues, and improvements surface naturally during work. Without a system to capture them, they get lost. Checkpoints create structured moments to:

1. **Capture** — What came up that we didn't expect?
2. **Decide** — Handle now, backlog for later, or discard?
3. **Document** — Update the right files so nothing disappears

### Checkpoint Types

#### 🔵 Session Checkpoint (Every Session)
At the **end of every Claude.ai or Claude Code session**, answer:
```
## Session Checkpoint - [Date]

### What got done:
- 

### What came up (unexpected):
- 

### Decisions made:
- 

### Backlog additions:
- 

### Next session starts with:
- 
```

#### 🟡 Phase Checkpoint (At Milestones)
At the **end of each implementation phase**, answer:
```
## Phase Checkpoint - [Phase Name]

### Phase goal: 
### Achieved: Yes / Partial / No

### What worked well:
- 

### What didn't work:
- 

### Scope changes from original plan:
- 

### Technical debt created:
- 

### Ready for next phase: Yes / No
### Blockers if no:
- 
```

#### 🔴 Pivot Checkpoint (When Direction Changes)
When making a **significant change to scope or approach**:
```
## Pivot Checkpoint - [Date]

### Original plan:


### New direction:


### Why the change:


### What this affects:
- Documents to update:
- Code to refactor:
- Timeline impact:

### Validated with: (user confirmation)
```

---

## AI Tool Decision Matrix

| Task | Use This | Why |
|------|----------|-----|
| Planning, strategy, decisions | Claude.ai | Conversation, exploration |
| Writing documentation | Claude.ai | Iteration, refinement |
| Crafting prompts for Claude Code | Claude.ai | Precision before execution |
| Building features | Claude Code | File access, execution |
| Debugging code | Claude Code | Can see/run the code |
| Custom/bespoke UI design | Figma first | AI struggles with truly unique aesthetics |
| Standard UI components | Claude Code | Handles generic patterns well |
| Quick prototypes | Claude Code | Fast iteration |
| Kickstarting a codebase | Lovable (cautiously) | Good for scaffold, creates refactor debt |

### When NOT to Use Each Tool
- **Claude.ai:** Don't use for actual code execution or file creation
- **Claude Code:** Don't use for open-ended exploration or major pivots
- **Lovable:** Don't use for custom/bespoke UI (refactor debt)
- **Figma:** Don't skip it for truly custom visual design

---

## Quick Start Checklist

### Day 1 - Project Setup
- [ ] Create `01_PROJECT_BRIEF.md` — Define what and why
- [ ] Create `SESSION_LOG.md` — Start the paper trail
- [ ] Create `BACKLOG.md` — Empty but ready
- [ ] Decide: What other docs does this project need?

### Before Any UI Work
- [ ] Create `02_DESIGN_FOUNDATIONS.md` — Lock colors, fonts, patterns
- [ ] Create `04_COMPONENT_LIBRARY.md` if custom UI needed
- [ ] Define major UI patterns OUTSIDE Claude first (even rough sketches)

### Before Building
- [ ] Create `03_TECH_STACK.md` — Tools and file structure
- [ ] Create `07_IMPLEMENTATION_ROADMAP.md` — Phases and tasks
- [ ] First phase clearly defined with success criteria

### Ongoing
- [ ] Session checkpoint after every work session
- [ ] Phase checkpoint at each milestone
- [ ] Pivot checkpoint when direction changes
- [ ] Backlog updated continuously

---

## Key Principles

1. **Pre-define before AI generates** — Lock design decisions before asking Claude to build UI
2. **Segment by purpose** — Each doc has one job, easy to find and update
3. **Checkpoint religiously** — Capture what surfaces, or lose it forever
4. **Paper trail is valuable** — Future you will thank present you
5. **Claude.ai plans, Claude Code builds** — Respect the separation
6. **Flexible structure** — Add docs as needed, don't force a template
7. **Markdown for AI ingestion** — Clean, parseable, token-efficient

---

## Template Files

The following templates are included in this kit:
- `01_PROJECT_BRIEF.md`
- `02_DESIGN_FOUNDATIONS.md`
- `03_TECH_STACK.md`
- `04_COMPONENT_LIBRARY.md`
- `05_CORE_FLOWS.md`
- `06_DATA_MODEL.md`
- `07_IMPLEMENTATION_ROADMAP.md`
- `SESSION_LOG.md`
- `BACKLOG.md`

Each template includes:
- Section structure
- Guiding questions
- Examples where helpful
- Checkpoint prompts

---

*Kit created: January 27, 2026*  
*Based on learnings from Clear fitness app project*
