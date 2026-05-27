# CATCHUP.md — Context Transfer for Claude.ai Planning Assistant

> Generated: 2026-05-21
> Last context the planning assistant has: ~Feb 27, 2026 (Workout Generation Prompt v3 draft)
> Covers: Feb 27 → May 21, 2026 (Sessions 15–24)

---

## 1. Timeline Since Feb 27, 2026

| Date | Session | Summary | Key Files | Architectural? |
|------|---------|---------|-----------|----------------|
| 2026-03-06 | 15 | Workout persistence (atomic RPC), favorites system, history/favorites tabs, scanline texture, custom icon system, ChamferedFrame fixes | `favorites-api.ts`, `workout-api.ts`, migrations 00023-00025, `icons.tsx` | **Yes** — `saved_workouts` + `saved_workout_completions` tables, atomic `save_generated_workout` RPC |
| 2026-03-09 | 16 | Component consolidation — TabbedPanel compound component, 7 reusable extractions (EmptyState, ErrorState, LoadingSkeleton, WorkoutListItem, FavoriteListItem, WeekStreakDisplay, ConfirmationModal), shared tab geometry | `TabbedPanel.tsx`, `tab-geometry.ts`, `FilterDropdown.tsx`, `date-utils.ts` | No |
| 2026-04-22 | 17 | Design token audit — eliminated all primitive token refs in components, 13 new semantic tokens, 17 unused tokens deleted, fabricated brown/cream tokens removed, `token-lint.ts` + `registry-check.ts` scripts | `index.css`, `token-lint.ts`, `registry-check.ts`, ~20 component files | No |
| 2026-04-22 | 18 | Tailwind removal (92 files) + forgot/reset password flow | All components/pages, `ForgotPasswordScreen.tsx`, `ResetPasswordScreen.tsx` | No |
| 2026-04-22 | 19 | **Generation overhaul** — exercise muscle groups (488 rows), goal moved to profile, prompt v3.1 rewrite (arc, thematic coherence, muscle intelligence), weekly coverage context, balanced goal upgrade, headless test harness | `00026_exercise_muscle_groups.sql`, `prompt.ts`, `index.ts`, `test-generation.ts` | **Yes** — `exercise_muscle_groups` table, prompt v3.1, coverage context in generation |
| 2026-04-22 | — | Fabricated token fixes, @layer/@apply removal, CTAButton Tailwind conversion | `index.css`, `CTAButton.tsx` | No |
| 2026-04-23 | 20 | LLM-reproducible design system — `ui-rules.md`, `token-decision-tree.md`, `anti-patterns.md`, enriched component/chamfered skills, @tokens JSDoc on 5 components | Skills files, `CLAUDE.md` | No |
| 2026-04-23 | 21 | **Generation screen overhaul** — coverage-based `suggest_anchor()` RPC, auto-anchor with reason, removed interactive AnchorGrid, simplified GenerationScreen | `00027_suggest_anchor_rpc.sql`, `useSuggestedAnchor.ts`, `GenerationScreen.tsx` | **Yes** — `suggest_anchor` RPC, anchor auto-selection |
| 2026-04-23 | 22 | Smart Training System PRD ticket suite — 8 GitHub Issues (#34–#41), closed superseded issues | No code — planning only | No |
| 2026-04-24 | 23 | **Set-by-set logging** — `exercise_set_logs` table, `get_last_set_data` RPC, per-set inputs in ActiveExerciseCard, pre-fill from last session, 22 unit tests | `00028_exercise_set_logs.sql`, `00029_get_last_set_data_rpc.sql`, `ActiveExerciseCard.tsx`, `workout-api.ts` | **Yes** — `exercise_set_logs` table, per-set tracking |
| 2026-04-24 | — | Deployed 7 pending migrations to production, linked Supabase CLI | No code — infra | No |
| 2026-04-24 | — | Fixed sign-out hanging on Vercel, SPA rewrite rule, password reset email URLs | `AuthContext.tsx`, `vercel.json` | No |
| 2026-04-25 | 24 | Integration gap audit — `withTimeout` utility, silent failure fixes in favorites-api, cross-tab sign-out, mount safety guards, dev route gating | `async-utils.ts`, `workout-api.ts`, `favorites-api.ts`, `AuthContext.tsx` | No |
| 2026-05-21 | — | Claude Code hooks infrastructure — design-system-lint, branch-guard, UI preflight nudge, shared hook-utils | `.claude/hooks/*.sh`, `.claude/settings.json` | No |

---

## 2. Workout Generation: Current State

### Prompt Version
**v3.1.0** — live in `supabase/functions/generate-workout/prompt.ts`

### System Prompt
Full prompt is in `supabase/functions/generate-workout/prompt.ts` (437 lines). Too long to paste — read that file directly. Key sections:

1. **THE ARC** — workout as one continuous intensity curve (ramp → peak → descend)
2. **THEMATIC COHERENCE** — every exercise serves one central movement idea
3. **MUSCLE GROUP INTELLIGENCE** — uses muscle tags for warmup/accessory/cooldown selection
4. **TRAINING GOALS** — strength, hypertrophy, conditioning, balanced, active_recovery with time allocations and section rules
5. **INTENSITY MODEL** — movement difficulty, rep counts, set counts, rest periods, load percentages all scale by 1-10
6. **STRUCTURE TYPES** — standard, superset, circuit, emom, amrap, for_time with group_id rules
7. **REP SCHEMES** — fixed, ladder_down/up, pyramid, inverse, n_plus_one, ladder_fixed_interval
8. **SECTION SCALING** — warmup (3-phase: general → pattern prep → ramp), primary lift, accessory, core, conditioning, cooldown
9. **WEEKLY COVERAGE** — uses 7-day muscle group aggregation to balance programming
10. **HISTORY-AWARE BALANCING** — avoids repeating anchors, exercises, structures

### Inputs to Generation

The handler (`supabase/functions/generate-workout/index.ts`) builds a user prompt from:

| Input | Source | Notes |
|-------|--------|-------|
| `intensity` (1-10) | Per-request | Required |
| `anchor` (string) | Per-request (auto-suggested by `suggest_anchor()` RPC) | Required |
| `duration_mins` | Per-request | Required |
| `goal` | Profile `goal_preset` or request override | Defaults to `balanced` |
| `experience_level` | Profile or request override | Defaults to `some` |
| `limitations` | Profile or request override | Freeform text |
| `enabled_sections` | Profile or request override | Array of section types |
| `equipment` | Location table (via `location_id`) or direct array | Fetched from `locations` table |
| `notes` | Per-request | Optional freeform |
| Recent 5 sessions | `workout_sessions` query | Anchors + exercise IDs for variety |
| Weekly coverage | `buildCoverageContext()` | 7-day muscle group aggregation (primary/synergist counts + recency) |
| Exercise library | `exercise_definitions_with_anchors` view | Filtered by available equipment + enabled sections. Includes `id`, `name`, `equipment_options`, `sections`, `anchors`, `primary_anchor`, `muscle_groups`, `regression` |

### Deviations from v3 Spec

The v3 spec (`docs/specs/workout-generation-prompt-v3.md`) was a draft. The shipped prompt (v3.1.0) differs:

1. **Coaching cues removed from exercise listing** — cues bloated the prompt. Muscle group data replaced them (net neutral tokens). Decision: session 19.
2. **Goal moved from per-workout to profile** — v3 spec assumed per-workout goal selection. Shipped version reads from `profiles.goal_preset` set during onboarding. Decision: session 19.
3. **Anchor auto-selected by RPC** — v3 spec assumed manual anchor selection. Shipped version uses `suggest_anchor()` RPC based on weekly muscle coverage. User can override via notes field. Decision: session 21.
4. **`balanced` goal upgraded** — v3 treated balanced as "a bit of everything." Shipped version has specific time allocations, weekly coverage adaptation, and explicit structure variety rules. Decision: session 19.
5. **Warmup rewritten as 3-phase flow** — v3 had generic warmup. Shipped version has: general movement → pattern prep (using muscle tags from primary lift) → ramp to working intensity. Decision: session 19.

### Output Schema

`GeneratedExercise` and `GeneratedSection` types in `index.ts` (lines 48-68):

```typescript
interface GeneratedExercise {
  exercise_id: string;
  name: string;
  equipment: string;
  sets: number | null;
  reps: string;
  effort_percent: number | null;
  tempo: string | null;
  rest_seconds: number | null;
  coaching_cues: string[];
  regression: string | null;
  structure: ExerciseStructure;
}

interface GeneratedSection {
  section_type: string;
  section_title: string;
  section_notes: string | null;
  estimated_duration_mins: number;
  exercises: GeneratedExercise[];
}
```

Note: `coaching_cues` is still in the output type but the prompt no longer includes cues in the exercise library listing (Claude generates them from scratch).

---

## 3. Database Schema Changes

### New Tables (since Feb 27)

| Migration | Table | Purpose |
|-----------|-------|---------|
| `00024_create_saved_workouts.sql` | `saved_workouts`, `saved_workout_completions` | Favorites system — snapshot workout JSON + completion tracking |
| `00025_add_exercise_structure.sql` | (column additions) | `structure` JSONB on exercises table for superset/circuit/emom/amrap/for_time |
| `00026_exercise_muscle_groups.sql` | `exercise_muscle_groups` | Junction table: 488 rows mapping ~140 exercises → 18 muscle groups with primary/synergist/stabilizer roles. Updated `exercise_definitions_with_anchors` view to include muscle data. |
| `00027_suggest_anchor_rpc.sql` | (RPC) | `suggest_anchor()` — queries 7-day coverage, scores body regions by staleness, returns suggested anchor + reason |
| `00028_exercise_set_logs.sql` | `exercise_set_logs` | Per-set tracking: `exercise_row_id`, `set_number`, `weight` (NUMERIC), `reps`, `rpe`, `is_warmup_set`. RLS via FK chain. |
| `00029_get_last_set_data_rpc.sql` | (RPC) | `get_last_set_data()` — returns per-exercise set history from most recent completed session, with legacy `weight_logged` fallback |

### Column Changes

- `exercises` table gained `structure` JSONB column (migration 00025)
- `workout_sessions` gained `status` enum used by coverage queries

### RLS Policy Changes

- `exercise_set_logs` has RLS policies via FK chain through `exercises` → `workout_sections` → `workout_sessions` (user_id)
- `suggest_anchor()` and `get_last_set_data()` RPCs use `SECURITY DEFINER` to query across tables

### No Data Model Spec Doc Found

There is no `Clear_-_Data_Model_UPDATED.md` in the repo. Spec docs are in `docs/specs/` but none cover the full schema. The actual schema is defined by the migration files in `supabase/migrations/`.

---

## 4. Frontend Architecture

### Routing Structure (`src/App.tsx`)

```
Public:
  /welcome          → WelcomeScreen
  /sign-in          → SignInScreen
  /create-account   → CreateAccountScreen
  /forgot-password  → ForgotPasswordScreen

Unguarded:
  /reset-password   → ResetPasswordScreen (user arrives authenticated via recovery link)

Onboarding:
  /onboarding       → OnboardingScreen

Protected:
  /                 → HomeScreen
  /generate         → GenerationScreen
  /review           → ReviewScreen
  /workout          → WorkoutScreen
  /summary          → SummaryScreen
  /history          → HistoryScreen
  /history/:id      → SessionDetailScreen
  /settings         → SettingsScreen

Dev-only (import.meta.env.DEV):
  /dev/gallery      → ComponentGallery
  /dev/test-workout → TestWorkoutScreen
```

### New Components (since Feb 27)

| Component | Purpose |
|-----------|---------|
| `TabbedPanel` | Compound tabs + content in single chamfered SVG frame |
| `FilterDropdown` | Chamfered dropdown for history/favorites filtering |
| `WorkoutListItem` | Reusable workout history row |
| `FavoriteListItem` | Reusable favorite workout row |
| `WeekStreakDisplay` | Week-view streak visualization |
| `ConfirmationModal` | Generic confirm/cancel modal (replaced AbandonmentModal) |
| `EmptyState` | Reusable empty state with icon + message |
| `icons.tsx` | Custom icon system replacing Lucide |

### Major Refactors

1. **Tailwind fully removed** (session 18) — all 92 files converted to inline styles with CSS custom properties. `tailwind.config.ts` deleted, `@tailwind` directives removed, `cn()` utility removed, 11 shadcn/ui primitives deleted.
2. **All primitive tokens eliminated** (session 17) — every component now uses semantic tokens only. `token-lint.ts` script enforces this.
3. **Goal selection removed from GenerationScreen** (session 19) — goal reads from profile, set during onboarding/settings.
4. **Anchor auto-selection** (session 21) — `useSuggestedAnchor` hook calls `suggest_anchor()` RPC, replaces interactive AnchorGrid.

### State Management

- `AuthContext` — auth state, profile, locations, sign-in/out
- `HomeDataContext` — workout history, streak data, incomplete session detection
- `WorkoutFlowContext` — generation → review → workout → summary flow state
- React Query for server state (favorites, history)

### Design System Status

- **37 token-lint violations remaining** — all 37 are in `ComponentGallery.tsx` (museum/demo page, intentionally uses primitive tokens for color swatches). Zero violations in production code.
- All production components use semantic tokens exclusively.

---

## 5. Active Issues & In-Flight Work

### Open PRs
None. All branches merged.

### Unmerged Branches
Only `main` exists locally. All feature branches have been cleaned up.

### Uncommitted Files
- `docs/guide-training-llm-on-design-system.md` — untracked doc file

### Known Generation Quality Issues
These were identified during a test generation on 2026-05-21 (intensity 7, 60min, balanced, hinge):

1. **Primary lift too weak** — generated Single-Leg RDL as primary on a hinge day with barbell available. Should have been barbell RDL or conventional deadlift.
2. **Conditioning disconnected from theme** — push-ups and mountain climbers on a hinge day. Should be KB swings, deadlift variations, or rowing.
3. **Core is generic** — plank + side plank regardless of session theme. Should complement the primary (dead bugs, Pallof press for hinge).
4. **No timed/clock element in main work** — balanced goal at intensity 7 should have at least one timed structure. Generated all standard sets.
5. **Warmup generic** — cat-cow appears regardless of session type. Warmup exercises should relate to the actual workout movements.

### In-Flight Feature Work (current session)

Two new ticket groups created 2026-05-21:
- **#50** — Single-page workout view mode (status: ready)
- **#51** — Adaptive workout generation — per-user learning (status: needs-detail, broken into #52-#56)
  - #52: Capture workout-level feedback (ready)
  - #53: Track exercise swap signals (ready)
  - #54: Build user model aggregation (blocked on #52+#53)
  - #55: Inject user model into generation prompt (blocked on #54)
  - #56: Calibration screen / preference UI (blocked on #54+#55)

**Current priority: Fix base generation quality BEFORE layering adaptive learning.**

---

## 6. Specs That Are Stale

| Spec | Location | Discrepancy |
|------|----------|-------------|
| `workout-generation-prompt-v3.md` | `docs/specs/` | Draft spec. Shipped prompt is v3.1.0 with significant changes: no coaching cues in library, goal from profile not per-workout, anchor auto-selected, balanced goal rewritten, warmup as 3-phase flow. **Read `supabase/functions/generate-workout/prompt.ts` instead.** |
| `Clear_-_Workout_Generation_Prompt_v2.md` | `docs/specs/` | Fully superseded by v3.1.0. |
| `Clear_-_Favorites_Spec.md` / `v2` | `docs/specs/` | Implementation shipped (session 15). May have diverged on details — code is source of truth. |
| `Clear_-_Exercise_Swap_Spec.md` | `docs/specs/` | Implementation shipped. `generate-section` edge function exists. Code is source of truth. |
| `Clear_-_Intensity_Model_Spec.md` | `docs/specs/` | Superseded by intensity model in prompt v3.1.0. |
| `Clear_-_Structure_Types_Spec.md` | `docs/specs/` | Superseded by structure types in prompt v3.1.0. |
| `CLAUDE_AI_PLANNING_GUIDE.md` | `docs/` | Written for Claude.ai planning sessions. May reference outdated file paths or workflows. |

---

## 7. Open Questions for the Designer

1. **Generation quality vs. adaptive learning priority** — Eric wants to fix base generation quality first (workouts feel generic, not thematic), then layer per-user learning. The Alchemy Coach Training Manual has been ingested as reference material (`docs/alchemy-manual-digest.md`). Key principles to carry forward: thematic coherence, warmup as movement prep (not generic stretches), compressed timed intensity for main work, conditioning that complements the primary. **NOT** a 1:1 Alchemy clone — Eric explicitly doesn't want longer warmups or yoga flows (no coach to guide them on a phone).

2. **"Balanced" goal identity** — balanced is the default goal but the generation still feels generic. Should balanced have sub-modes or weekly personality? The prompt tries to use weekly coverage to vary emphasis, but the output is still flat.

3. **Goal simplification** — Eric questioned whether the 5 goals (strength/hypertrophy/conditioning/balanced/active_recovery) are over-engineered. From generation philosophy: "goals should influence CHARACTER, not dictate WHICH SECTIONS appear." The current prompt still uses goals to determine section templates.

4. **Monthly focus/challenge** (#29) — open ticket, no spec yet. How should this interact with goal and the adaptive system?

5. **Alchemy-like workout mode** — Eric mentioned wanting the ability to generate Alchemy-style workouts (timed main work, flow warmup, compressed intensity). Probably a separate goal preset or generation "style" — needs design.

---

## 8. Backlog Snapshot

Backlog has been migrated to GitHub Issues. Top items by current priority:

| # | Title | Status | Blocked? |
|---|-------|--------|----------|
| — | **Fix base generation quality** | Active (not ticketed — current focus) | No |
| #50 | Single-page workout view mode | Ready | No |
| #52 | Adaptive gen Phase 1: Capture workout-level feedback | Ready | No |
| #53 | Adaptive gen Phase 2: Track exercise swap signals | Ready | No |
| #35 | Rest timer between sets | Ready | No |
| #37 | Coaching cues from database | Ready | No |
| #36 | Progressive overload engine | Ready | No |
| #38 | Smart intensity defaults | Ready | No |
| #39 | Workout insights & analytics | Ready | No |
| #29 | Monthly focus/challenge system | Needs detail | No |

Blocked items: #54 (on #52+#53), #55 (on #54), #56 (on #54+#55).

Not listed above but relevant: #18 (circuit auto-progress), #34 (set-by-set logging — shipped), #21 (dev-only gate — shipped).

---

## Key Files to Read First (5-minute version)

1. **`supabase/functions/generate-workout/prompt.ts`** — The full system prompt (v3.1.0). This IS the generation logic. 437 lines, everything from goal templates to intensity scaling to warmup structure.

2. **`docs/alchemy-manual-digest.md`** — Distilled principles from the Alchemy Coach Training Manual. This is the reference material for generation quality tuning. Key sections: shimming (warmup philosophy), bell curve, class structure, movement hierarchy.

3. **`docs/SESSION_LOG.md` sessions 19 + 21** — The two architectural sessions: generation overhaul (muscle groups, prompt v3.1, coverage context) and generation screen simplification (auto-anchor, goal from profile). These are the biggest changes since Feb 27.
