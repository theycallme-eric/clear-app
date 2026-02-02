# Clear - Claude Code Prompt: UI Audit & Refinement

## Context

I'm working on Clear, a workout generation app built with React + Vite + Tailwind + Supabase. The MVP is functional (auth → onboarding → generate workout → history), but the UI needs refinement before V1 launch.

The app was initially scaffolded with Lovable, which created some component bloat and inconsistencies. I'm now using Claude Code exclusively and want to clean things up.

## Goals for This Session

### 1. Component Audit
- Inventory all components in `src/components/`
- Identify what's actually used vs orphaned/unused (Lovable leftovers)
- Flag duplicate or inconsistent patterns (especially cards, buttons, inputs)
- Note any accordion usage and where

### 2. Card System Redesign

The card styling is inconsistent across the app. I need a unified card system, especially for **exercise cards** during workout review and execution.

**Exercise Card Requirements:**

**Fields to display:**
- Exercise name
- Rep scheme (e.g., "3×8-10" or "4×6")
- Weight guidance — I want TWO layers:
  1. **Qualitative cue**: "Light / Medium / Heavy" as loose guidance
  2. **Historical reference**: "Last time: 135 lbs" (if available)
- Notes area (user can add notes during or after)
- Equipment used (if relevant)

**States needed:**
- **Default/Upcoming**: Not yet started in workout
- **Active/Current**: The exercise user is currently on
- **Completed**: Done, possibly with logged weight
- **Skipped**: User chose to skip this one

**Nice to have:**
- Expandable for more details (coaching cues for beginners)
- Subtle visual progression as user moves through workout

### 3. Accordion Evaluation

Audit where accordions are currently used. For each:
- What content is inside?
- Is accordion the right pattern, or would something else work better?
- Recommendation: keep, replace with cards, replace with inline expansion, or remove

### 4. Other UI Refinements (from backlog)

While auditing, also note opportunities for:
- **Transitions/animations**: Where would subtle animations help? (page transitions, card state changes, button interactions)
- **Color refinement**: Any colors that feel off or inconsistent?
- **Spacing inconsistencies**: Padding/margin patterns that vary

## Deliverables

1. **Component Inventory**: List of all components with status (used/unused/duplicate)
2. **Card System Proposal**: Unified card pattern with exercise card spec
3. **Accordion Recommendations**: Keep/replace decisions with rationale
4. **UI Refinement Notes**: Animation, color, spacing observations
5. **Implementation Plan**: Prioritized list of changes to make

## Reference Files

These are in the project knowledge / project files:
- `design-tokens-colors.js` — Current color system
- `Clear_-_Screen_2__Review___Edit__Wireframe_.md` — Review screen spec
- `Clear_-_Screen_3__Workout_Mode__Wireframe_.md` — Execution screen spec
- `V1_REFINEMENT_ROADMAP.md` — Overall V1 plan
- `BACKLOG.md` — Known issues and improvements

## How to Approach

1. **First**: Explore the codebase structure — `src/components/`, `src/pages/`, understand what exists
2. **Then**: Audit components, noting inconsistencies as you go
3. **Then**: Propose the unified card system (especially exercise cards)
4. **Then**: Make recommendations on accordions and other patterns
5. **Finally**: Summarize findings and propose implementation order

Start by showing me the current component structure, then we'll work through the audit together.

---

## Notes

- I'm a designer, not a developer — explain technical decisions clearly
- Don't delete anything yet without confirmation
- Preserve functionality while improving consistency
- Mobile-first (80% of use is on phone)
- The aesthetic is "cyberpunk utilitarian" — dark backgrounds, orange primary, clean but with personality
