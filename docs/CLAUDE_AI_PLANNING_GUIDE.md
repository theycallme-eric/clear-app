# Claude.ai Planning Guide

**Purpose:** Reference for Claude.ai when creating implementation plans for Antigravity.

---

## How Antigravity Works

Antigravity is a code implementation agent that follows structured "skills" (SOPs) located in `.claude/skills/`. When you hand off a plan, Antigravity will:

1. Read `.claude/README.md` to find relevant skills
2. Load skills that match the task type
3. Follow the steps in each skill
4. Use checklists to verify work

**Your job:** Create clear implementation plans that Antigravity can execute without ambiguity.

---

## Skill Categories

| Category | Skills | When Antigravity Uses Them |
|----------|--------|---------------------------|
| **Workflow** | `handoff`, `close-session` | Start/end of every session |
| **UI** | `component`, `chamfered-component`, `gallery-add`, `token-check` | Creating/modifying components |
| **Backend** | `supabase-workflow`, `debug` | Database, auth, API work |
| **Documentation** | `backlog`, `project-map` | Updating project docs |

---

## Implementation Plan Template

When handing off to Antigravity, use this structure:

```markdown
# Session Plan: [Brief Title]

## Goal
[One sentence describing what this session accomplishes]

## Context Files
Read these before starting:
- `path/to/file.tsx` — [why it's relevant]
- `path/to/file.tsx` — [why it's relevant]

## Tasks

### Task 1: [Title]
**Skill:** [component.md / supabase_workflow.md / etc.]

**What to do:**
- [Specific action]
- [Specific action]

**Acceptance Criteria:**
- [ ] [How to know it's done]
- [ ] [How to know it's done]

### Task 2: [Title]
...

## Notes
- [Any constraints or gotchas]
- [Design decisions already made]

## After Completion
- Update backlog
- [Any other follow-up]
```

---

## What Antigravity Needs to Know

### Always Include

1. **Specific file paths** — Not "the main component", but `src/components/WorkoutCard.tsx`
2. **Which skill applies** — Speeds up Antigravity's context loading
3. **Acceptance criteria** — Clear definition of done
4. **Design decisions** — Don't make Antigravity guess; tell it what you decided

### Avoid

1. **Vague instructions** — "Make it better" vs "Add loading state with spinner"
2. **Multiple options** — Decide before handoff, or explicitly ask Antigravity to decide
3. **Missing context** — If it references a Figma design, include the relevant details
4. **Assuming knowledge** — Each session starts fresh; include necessary background

---

## Key Project Constraints

Remind Antigravity of these when relevant:

| Constraint | Details |
|------------|---------|
| **Index.tsx Monolith** | Extract components OUT of `src/pages/Index.tsx`, don't add to it |
| **Design Tokens** | No hardcoded hex colors; use CSS variables from `src/index.css` |
| **Type Safety** | Regenerate types after DB changes: `npx supabase gen types...` |
| **SPA Architecture** | No server components; data fetching in useEffect/handlers |
| **Equipment Display Names** | Use `equipment_display_names` field for exercise names |

---

## Example Handoffs

### Example 1: UI Component

```markdown
# Session Plan: Workout Card Redesign

## Goal
Update WorkoutCard to show equipment-specific exercise names.

## Context Files
- `src/components/WorkoutCard.tsx` — Current implementation
- `src/types/database.ts` — ExerciseDefinition type with equipment_display_names
- `docs/architecture/Clear_-_Exercise_Library.md` — Equipment display names section

## Tasks

### Task 1: Update Exercise Name Display
**Skill:** component.md

**What to do:**
- Import ExerciseDefinition type
- Add helper function to resolve display name from equipment_display_names
- Update exercise name rendering to use resolved name

**Acceptance Criteria:**
- [ ] "Dumbbell Bench Press" shows instead of "Bench Press" when equipment is dumbbells
- [ ] Falls back to base name if equipment_display_names is null
- [ ] No TypeScript errors

## Notes
- equipment_display_names is a Record<string, string> | null
- Lookup key is the equipment_used field from the exercise
```

### Example 2: Backend Change

```markdown
# Session Plan: Add Weight Recommendation Field

## Goal
Add weight_recommendation field to exercise output from AI.

## Context Files
- `supabase/functions/generate-workout/index.ts` — Edge function
- `src/types/workout.ts` — Frontend types

## Tasks

### Task 1: Update Edge Function Response
**Skill:** supabase_workflow.md

**What to do:**
- Add weight_recommendation to GeneratedExercise interface
- Update SYSTEM_PROMPT to instruct AI to include weight recommendations
- Add to OUTPUT FORMAT section in prompt

**Acceptance Criteria:**
- [ ] AI returns weight_recommendation in response
- [ ] Field is optional (some exercises may not have it)
- [ ] Build passes

### Task 2: Update Frontend Types
**Skill:** supabase_workflow.md

**What to do:**
- Add weight_recommendation to Exercise type in workout.ts

**Acceptance Criteria:**
- [ ] Type matches Edge Function output
- [ ] No TypeScript errors
```

---

## Workflow Summary

```
Claude.ai                          Antigravity
─────────────────────────────────────────────────────
1. Research & plan          →
2. Make design decisions    →
3. Create implementation    →      4. Read handoff.md skill
   plan using template      →      5. Load context files
                            →      6. Load relevant skills
                            →      7. Execute tasks
                            →      8. Run close_session.md skill
                            ←      9. Report completion
10. Review & plan next      ←
```

---

## Quick Reference: File Locations

| What | Where |
|------|-------|
| Skills & agents registry | `.claude/README.md` |
| All skills | `.claude/skills/*.md` |
| All agents | `.claude/agents/*.md` |
| Backlog | `docs/BACKLOG.md` |
| Session log | `docs/SESSION_LOG.md` |
| Project map | `docs/wireframes/PROJECT_MAP.md` |
| Design tokens | `src/index.css`, `docs/frontend/figma-design-tokens.json` |
| Database types | `src/types/database.ts` |
| Exercise library | `docs/architecture/Clear_-_Exercise_Library.md` |

---

*Last updated: February 2026*
