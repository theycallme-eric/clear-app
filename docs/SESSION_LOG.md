# Session Log
**Project:** [Name]  
**Started:** [Date]  
**Last Session:** 2026-04-24 (20th session)

---

## Purpose
Living document to capture progress, decisions, and learnings across sessions. This is your paper trail—the thing that lets you pick up weeks later without losing context.

**Update this:** At the end of EVERY session (Claude.ai or Claude Code)

---

## Quick Status
**Current Phase:** Smart Training System — Phase 1 implementation
**Current Task:** Set-by-set logging (#34) — implementation complete and committed
**Last Completed:** Full set-by-set logging implementation (DB migrations, types, API, UI, history), QA spike ticket (#42) created, 22 unit tests written
**Blocking Issues:** 37 token-lint violations pending

---

## Session Entries

### Session: 2026-04-24 - Set-by-Set Logging (#34) Implementation + QA Spike

**Duration:** ~2 hours
**Mode:** Claude Code
<<<<<<< HEAD
**Branch:** `main`
=======
**Branch:** `main` (changes reverted during commit — need re-application)
>>>>>>> 3b64d8c (Log session 20: set-by-set logging implementation + QA spike)

#### What Got Done
- **DB migrations written and applied locally:**
  - `00028_exercise_set_logs.sql` — new table with exercise_row_id, set_number, weight (NUMERIC), reps, rpe, is_warmup_set, RLS policies via FK chain
  - `00029_get_last_set_data_rpc.sql` — RPC returning per-exercise set history from most recent completed session, with legacy weight_logged fallback
- **Type system extended:** SetLog, ExerciseSetData interfaces; Exercise gained lastSetData + exerciseDefinitionId; WorkoutNotes gained setLogData; LoggedExercise gained setLogs
- **API layer updated:** completeWorkoutSession batch-inserts to exercise_set_logs + writes summary to weight_logged for backward compat; new fetchLastSetData() RPC caller; transformAPIWorkoutToFrontend and buildWorkoutFromSections inject exerciseDefinitionId
- **ActiveExerciseCard rewritten:** Detection heuristic (numeric reps + has sets + not timed/circuit) -> per-set input rows with weight/reps columns, add/remove set, pre-fill from lastSetData; onSetLog callback threaded through SectionRenderer -> SupersetRenderer -> StructureCards
- **WorkoutScreen:** New setLogData state, handleSetLog callback, passed through to finish workflow
- **History display:** fetchWorkoutDetail queries exercise_set_logs, SessionDetailScreen renders per-set breakdown with fallback to legacy single weight
- **Pre-fill for all flows:** Fresh generation, history repeat, and favorite repeat all call fetchLastSetData
- **22 unit tests added:** Detection heuristic (11 cases), buildInitialSets (5 cases), summarizeSets (6 cases) — all passing
- **QA spike ticket created (#42):** Researched AI-led QA practices (Playwright Test Agents, Claude Code headless CI, MCP), wrote comprehensive spike PRD

#### What Came Up (Unexpected)
- All implementation changes were reverted during user commit batch — code was fully functional (tsc + build + tests passing) but didn't survive the commit. Session transcript serves as blueprint for re-application.

#### Decisions Made
| Decision | Rationale |
|----------|-----------|
| No exercise_definition_id on set_logs table | Join chain exercise_set_logs -> exercises.exercise_id -> exercise_definitions provides this — avoids sync risk |
| weight as NUMERIC not TEXT | Enables future math (volume = weight x reps). Legacy weight_logged TEXT stays for backward compat |
| Detection heuristic for per-set inputs | Only exercises with numeric reps + standard sets + not timed/circuit get per-set rows |
| Write to BOTH exercise_set_logs AND exercises.weight_logged | Summary string in legacy column means existing code still works |
| Playwright E2E as recommended QA tier | Catches integration bugs across 12+ file surface area; Test Agents + MCP align with Claude Code workflow |

#### Files Changed (implemented then reverted)
| File | Action |
|------|--------|
| `supabase/migrations/00028_exercise_set_logs.sql` | Created — new table + RLS |
| `supabase/migrations/00029_get_last_set_data_rpc.sql` | Created — pre-fill RPC |
| `src/types/workout.ts` | Modified — SetLog, ExerciseSetData, extended Exercise/WorkoutNotes/LoggedExercise |
| `src/lib/workout-api.ts` | Modified — completeWorkoutSession (set logs), fetchLastSetData, exerciseDefinitionId injection |
| `src/components/workout/ActiveExerciseCard.tsx` | Rewritten — per-set input rows |
| `src/components/workout/ActiveExerciseCard.test.tsx` | Created — 22 unit tests |
| `src/pages/WorkoutScreen.tsx` | Modified — setLogData state, handleSetLog |
| `src/components/workout/SectionRenderer.tsx` | Modified — forward onSetLog prop |
| `src/components/workout/StructureCards.tsx` | Modified — forward onSetLog in SupersetCard |
| `src/components/workout/SupersetRenderer.tsx` | Modified — forward onSetLog |
| `src/pages/SessionDetailScreen.tsx` | Modified — per-set breakdown display |
| `src/lib/home-data.ts` | Modified — fetch set logs in fetchWorkoutDetail |
| `src/hooks/useWorkoutSession.ts` | Modified — pass setLogData, fetchLastSetData for repeats |
| `src/hooks/useWorkoutGeneration.ts` | Modified — injectLastSetData after generation |

#### Status
<<<<<<< HEAD
- Implementation complete and committed — all checks pass (tsc, build, lint, 48/51 tests — 3 pre-existing failures)
=======
- Implementation was complete and all checks passed (tsc, build, lint, 48/51 tests — 3 pre-existing failures)
- Code was reverted during commit batch — needs re-application next session
>>>>>>> 3b64d8c (Log session 20: set-by-set logging implementation + QA spike)
- GitHub Issue #42 (QA spike) created and on project board

---

### Session: 2026-04-23 - Smart Training System: PRD Ticket Suite

**Duration:** ~30 min
**Mode:** Claude Code
**Branch:** `main` (planning only — no code changes)

#### What Got Done
- **8 GitHub Issues created (#34–#41):** Full PRD ticket suite for the Smart Training System — set-by-set logging, rest timer, progressive overload, coaching cues, smart intensity, workout insights, offline-first, and adaptive learning loop
- **Cross-referenced existing issues:** #18 (circuit auto-progress), #24 (section notes), #26 (1RM testing) linked as related work
- **Closed superseded issues:** #20 (coaching cues via LLM) → superseded by #37 (client-side DB enrichment); #27 (progressive loading) → superseded by #36 (overload engine). All original context preserved in closing comments and new ticket bodies
- **New labels created:** `area:data`, `area:generation`, `status:blocked`

#### Decisions Made
| Decision | Rationale |
|----------|-----------|
| Close #20 and #27 as superseded | New tickets (#37, #36) fully encompass the original scope with better approaches — no context lost |
| Keep #26 (1RM testing) open | Distinct feature that extends #36's PR system but isn't replaced by it |
| Keep #18 and #24 open | Related but independent UX improvements, not encompassed by new tickets |
| Client-side cue enrichment over LLM re-enable | Avoids the token cost that caused original removal — better approach |

#### Files Changed
| File | Action |
|------|--------|
| No code files changed | Planning-only session |

#### Status
- No commits — planning session
- 8 issues ready on GitHub board
- Next: start Phase 1 — pull #34 (Set-by-Set Logging) or #37 (Coaching Cues)

---

### Session: 2026-04-23 - Generation Screen Overhaul: Auto-Anchor + Simplification

**Duration:** ~1 hour
**Mode:** Claude Code
**Branch:** `feature/generation-screen-overhaul`

#### What Got Done
- **Coverage-based anchor RPC** (`00027_suggest_anchor_rpc.sql`): Supabase RPC that queries last 7 days of completed sessions, joins through workout_sections → exercises → exercise_muscle_groups, groups by body region (lower/upper push/upper pull/core), scores by staleness + underwork, returns suggested anchor with reason
- **useSuggestedAnchor hook**: Calls RPC on mount, caches result, falls back to local `getSuggestedAnchor()` heuristic if RPC fails
- **GenerationScreen simplified**: Removed interactive AnchorGrid and goal badge. Added read-only "Recommended Focus" card showing system-suggested anchor with reason text
- **Textarea white background bug fixed**: Added `background: transparent` to form element CSS reset
- **Prompt updated**: Added principle #8 making notes-based anchor override explicit (e.g., "upper body today" overrides auto-selection)
- **Type narrowed**: `WorkoutParams.anchor` changed from `AnchorType | null` to `AnchorType`
- **Import cleanup**: `anchor-mapping.ts` redirected from `AnchorGrid` to `@/types/workout`
- **Goal badge CSS removed**: Dead styles cleaned up from index.css
- **Code review fixes**: Generate button disabled while anchor loads; removed stale `workoutHistory` from hook dependency array

#### What Came Up (Unexpected)
- Two concurrent sessions (tailwind removal close-out + this work) competed over file state. Tailwind removal PR (#30) was already merged to main by the other session, making `feature/tailwind-removal` stale. Had to create a fresh branch off main and re-apply all changes.

#### Decisions Made
| Decision | Rationale |
|----------|-----------|
| RPC over simple recency heuristic | Session-level anchors can't distinguish muscle coverage — RPC operates on actual exercise muscle groups for smarter recommendations |
| Read-only card, not interactive | System recommends; notes override. No need for user to manually pick anchor when coverage data is available |
| Keep AnchorGrid component in codebase | Still used by ComponentGallery — don't delete, just stop importing in GenerationScreen |
| `SECURITY DEFINER` on RPC | Needs to query across tables with RLS; function runs with creator's permissions |
| Fallback to local heuristic on RPC failure | Graceful degradation — new users or offline still get a reasonable suggestion |

#### Files Changed
| File | Action |
|------|--------|
| `src/index.css` | Modified — `background: transparent` in form reset; removed goal-badge CSS |
| `src/pages/GenerationScreen.tsx` | Modified — removed AnchorGrid/goal badge, added recommended focus card |
| `src/hooks/useSuggestedAnchor.ts` | Created — hook for coverage-based anchor suggestion |
| `supabase/migrations/00027_suggest_anchor_rpc.sql` | Created — RPC for muscle group coverage analysis |
| `src/types/workout.ts` | Modified — narrowed `WorkoutParams.anchor` to non-nullable |
| `src/components/OptionalFields.tsx` | Modified — updated notes placeholder |
| `src/lib/anchor-mapping.ts` | Modified — redirected type import to `@/types/workout` |
| `supabase/functions/generate-workout/prompt.ts` | Modified — added notes-override principle |

#### Status
- Build passes, typecheck passes
- 1 commit on `feature/generation-screen-overhaul`
- Not yet pushed or PR'd
- Migration `00027` needs to be applied locally

---

### Session: 2026-04-23 - LLM-Reproducible Design System & Self-Training Infrastructure

**Duration:** ~2 hours
**Mode:** Claude Code
**Branch:** `feature/tailwind-removal`

#### What Got Done
- **ui-rules.md** (new): 400-line concrete implementation reference — spacing scale, typography classes, visual hierarchy, card anatomy with container decision tree, interactive states, atmosphere utilities, page layout patterns
- **token-decision-tree.md** (new): Systematic lookup table for all 100+ semantic tokens — surfaces, borders, text, icons, brand, with theme swap rule and state baselines
- **anti-patterns.md** (new): 11 categories of don't/do pairs covering every observed LLM mistake
- **chamfered-component.md** (enriched): Added 4 sections — CSS variable hover technique, SVG double-width stroke + clip, ResizeObserver pattern, creating new angular shapes
- **component.md** (enriched): Added Phase 0 (load design system references before pre-flight), updated token creation rules
- **Integration pass**: Updated code-reviewer, figma-ui-implementer, gallery-add, token-check, token-audit to reference new docs
- **Component JSDoc**: Added @tokens blocks to Card, CTAButton, Chip, ExerciseCard, TabbedPanel
- **token-lint.ts** (new script): Scans for hex colors, primitive tokens, border-radius, lucide imports — `npm run token-lint`
- **registry-check.ts** (new script): Compares component.md registry vs actual src/components/ — `npm run registry-check`
- **Session-start hook**: Added automatic drift detection (registry + token-lint) to session-start-check.sh
- **Close-session step 5**: Design System Drift Check — registry sync, token lint, doc drift, taste feedback with graduation process
- **Aesthetic calibration system**: feedback_aesthetic.md with 30-entry cap, 3+ repetition graduation bar to ui-rules.md/anti-patterns.md
- **GitHub Issue #31**: Monthly check-in for May 23 to evaluate self-training effectiveness

#### Decisions Made
| Decision | Rationale |
|----------|-----------|
| Single aesthetic feedback file, not one per correction | Prevents memory bloat, enables consolidation and graduation |
| 3+ repetition graduation bar | Prevents one-off preferences from becoming rules |
| Registry-check matches filename to export name | Filters out icons, sub-components, helpers — focuses on reusable components |
| Drift checks at session start AND close | Catches missed close-sessions; no action required from user |
| Taste feedback refines existing rules, doesn't append new ones | Prevents ui-rules.md from growing unbounded |

#### Files Changed
| File | Action |
|------|--------|
| `.claude/skills/ui-rules.md` | Created — spacing, typography, hierarchy, cards, states, atmosphere, layout |
| `.claude/skills/token-decision-tree.md` | Created — systematic token lookup |
| `.claude/skills/anti-patterns.md` | Created — don't/do pairs for common LLM mistakes |
| `.claude/skills/chamfered-component.md` | Modified — 4 new sections (hover, SVG, resize, shapes) |
| `.claude/skills/component.md` | Modified — Phase 0, token rules update |
| `.claude/skills/close-session.md` | Modified — step 5 drift check + taste feedback |
| `.claude/skills/gallery-add.md` | Modified — semantic token template |
| `.claude/skills/token-check.md` | Rewritten — delegates to decision tree + lint |
| `.claude/skills/token-audit.md` | Modified — removes duplicated table, adds pointers |
| `.claude/agents/code-reviewer.md` | Modified — 11-item design system checklist + doc drift |
| `.claude/agents/figma-ui-implementer.md` | Modified — CLEAR-specific context + skill references |
| `.claude/README.md` | Modified — new skills in tables |
| `.claude/hooks/session-start-check.sh` | Modified — drift detection at session start |
| `CLAUDE.md` | Modified — typography, atmosphere, decision tree links |
| `package.json` | Modified — token-lint + registry-check scripts |
| `scripts/token-lint.ts` | Created — automated design system violation scanner |
| `scripts/registry-check.ts` | Created — component registry sync checker |
| `src/components/Card.tsx` | Modified — @tokens JSDoc |
| `src/components/CTAButton.tsx` | Modified — @tokens JSDoc |
| `src/components/Chip.tsx` | Modified — @tokens JSDoc |
| `src/components/ExerciseCard.tsx` | Modified — @tokens JSDoc |
| `src/components/TabbedPanel.tsx` | Modified — @tokens JSDoc |

#### Status
- Build passes, typecheck clean
- 30 uncommitted files on `feature/tailwind-removal` (includes some anchor-suggestion work from another session)
- PR #30 still open from previous session
- GitHub Issue #31 created for monthly check-in

---

### Session: 2026-04-22 - Fabricated Token Fixes & Tailwind Remnant Cleanup

**Duration:** ~30 min
**Mode:** Claude Code
**Branch:** `feature/tailwind-removal`

#### What Got Done
- **Fabricated token audit:** Scanned all components for CSS variables used but not defined in `src/index.css`. Found `--surface-cta-accent` (5 files), `--color-green` (1 file), and `--btn-*` Tailwind arbitrary properties (CTAButton).
- **Token fixes:** Replaced `--surface-cta-accent` → `--surface-cta-primary-accent` in HomeScreen, CTAButton, LeftColumn, ActionButton, ActionCard. Replaced `--color-green` → `--text-success` in ForgotPasswordScreen.
- **@layer/@apply removal:** Removed `@layer base`, `@layer components`, `@layer utilities` wrappers from `index.css`. Converted `@apply border-border` and `@apply bg-background text-foreground font-body antialiased` to plain CSS.
- **CTAButton Tailwind conversion:** Replaced Tailwind arbitrary property syntax (`[--btn-surface:var(...)]`) with inline style CSS custom properties + `.cta-btn-primary:hover` / `.cta-btn-secondary:hover` CSS classes.
- **Fixed `--font-body` reference:** Changed to `--font-paragraph` (the actual defined token).
- **PR created:** #30

#### Decisions Made
| Decision | Rationale |
|----------|-----------|
| Left ActionButton Tailwind syntax unfixed | Only used in ComponentGallery (museum) — frozen as snapshot |
| Used CSS classes for CTAButton hover instead of JS state | Cleaner, no re-renders, matches existing transition-colors pattern |

#### Files Changed
| File | Action |
|------|--------|
| `src/index.css` | Modified — removed @layer wrappers, @apply directives, added CTA hover classes, fixed --font-body |
| `src/components/CTAButton.tsx` | Modified — inline style CSS vars replacing Tailwind arbitrary properties |
| `src/components/LeftColumn.tsx` | Modified — default prop token fix |
| `src/components/ActionButton.tsx` | Modified — token fix |
| `src/components/ActionCard.tsx` | Modified — token fix |
| `src/pages/HomeScreen.tsx` | Modified — token fix |
| `src/pages/ForgotPasswordScreen.tsx` | Modified — --color-green → --text-success |

#### Status
- Build passes, typecheck clean
- PR #30 open: https://github.com/theycallme-eric/clear-app/pull/30
- ActionButton still has Tailwind syntax but only used in museum (intentional)

---

### Session: 2026-04-22 - Tailwind Removal & Forgot Password Flow

**Duration:** ~1 hour
**Mode:** Claude Code
**Branch:** `feature/tailwind-removal`

#### What Got Done
- **Tailwind removal (92 files):** Converted all Tailwind utility classes to inline styles using CSS custom properties across every component, layout, and page. Deleted 11 unused shadcn/ui primitives (badge, button, card, progress, slider, switch, toast, toaster, tooltip, use-toast, useToast hook).
- **Forgot password screen:** New `ForgotPasswordScreen.tsx` at `/forgot-password` — email input, calls `supabase.auth.resetPasswordForEmail()`, shows confirmation state. Vague confirmation message prevents email enumeration.
- **Reset password screen:** New `ResetPasswordScreen.tsx` at `/reset-password` — unguarded route (user arrives authenticated via recovery link). Listens for `PASSWORD_RECOVERY` event, shows new password + confirm fields, calls `updateUser()`.
- **SignInScreen wiring:** "Forgot password?" link now navigates to `/forgot-password` instead of showing a placeholder toast.
- **Linter pass on SignInScreen:** Tailwind classes converted to inline styles by linter/user.
- **Final Tailwind cleanup:** Deleted `tailwind.config.ts`, removed `tailwindcss` from PostCSS config, removed `@tailwind` directives from `index.css`, removed `cn()` utility from `utils.ts`.
- **Supabase config fix:** Updated `site_url` from port 3000 to 5173, added reset-password redirect URLs to allowlist.

#### Decisions Made
| Decision | Rationale |
|----------|-----------|
| Reset password route is unguarded (not PublicOnly or Protected) | User arrives authenticated via Supabase recovery link — PublicOnlyRoute would redirect them away |
| Single commit for tailwind removal + forgot password | Both on same feature branch, keeps history clean |
| Vague "if an account exists" confirmation | Prevents email enumeration attacks |

#### Files Changed
| File | Action |
|------|--------|
| `src/pages/ForgotPasswordScreen.tsx` | Created — email entry for password reset |
| `src/pages/ResetPasswordScreen.tsx` | Created — new password entry after recovery link |
| `src/App.tsx` | Modified — added forgot-password and reset-password routes |
| `src/pages/SignInScreen.tsx` | Modified — forgot password link navigates instead of toasting |
| 80+ component/page/layout files | Modified — Tailwind utilities → inline styles |
| 11 shadcn/ui files | Deleted — unused primitives removed |

#### Status
- Build passes, typecheck clean
- 1 commit on branch: `7307d1f`
- Supabase redirect URL config still needed for reset emails to work in production

---

### Session: 2026-04-22 - Workout Generation Overhaul

**Duration:** ~3 hours
**Mode:** Claude Code
**Branch:** `feature/tailwind-removal`

#### What Got Done
- **Phase 1 — Exercise muscle groups**: Created `exercise_muscle_groups` junction table (488 rows) mapping all ~140 exercises to 18 standardized muscle groups with primary/synergist/stabilizer roles. Updated `exercise_definitions_with_anchors` view to include muscle data as JSONB. Migration applied locally.
- **Phase 2 — Goal to settings**: Removed per-workout `GoalSelector` from GenerationScreen. Goal now reads from user profile (set in Settings). Added read-only goal badge to generation screen. Removed `goal` from `WorkoutParams` interface. Edge function reads `goal_preset` from profile if not in request.
- **Phase 3 — Prompt v3.1**: Full rewrite of system prompt. Added THE ARC (workout as intensity curve), THEMATIC COHERENCE (exercises serve one idea), MUSCLE GROUP INTELLIGENCE (use muscle tags for selection). Rewrote warmup as flow-based pattern prep, accessory as "what makes you better at today's primary," cooldown to target worked muscles. Updated exercise listing format: added `muscles:[...]`, removed `cues:[...]`.
- **Phase 4 — Weekly coverage**: Built `buildCoverageContext()` in edge function — queries last 7 days of completed sessions, aggregates muscle group hits by role and recency. Injected as formatted block in user prompt. Added WEEKLY COVERAGE section to prompt with rules for using coverage data.
- **Phase 5 — Balanced upgrade**: Rewrote balanced goal from "a bit of everything" to intentional programming with time allocation breakdown, weekly coverage adaptation, and active use of interesting structures (ladders, pyramids, EMOM, circuits).
- **Headless test harness**: Built `scripts/test-generation.ts` — standalone script that queries local DB for exercise library, builds the same prompt as the edge function, calls Claude directly, validates responses (exercise IDs, equipment, duration, warmup/cooldown relevance, structure rules). Ran 4 test generations — all pass.
- **`/test-generation` command**: Created `.claude/commands/test-generation.md` skill with argument parsing, pre-checks, and result interpretation guide. Registered in CLAUDE.md and README.md.

#### Decisions Made
| Decision | Rationale |
|----------|-----------|
| Goal from profile, not per-workout | Eliminates inconsistency (hypertrophy one day, conditioning the next = no progress). Simplifies generation screen. |
| Drop coaching cues from exercise listing | Cues bloat the prompt. LLM generates its own anyway. Muscle data in, cues out = net neutral tokens. |
| Accessories can be synergists/antagonists | Earlier draft was too restrictive ("only exercises that directly serve primary"). Tricep extensions on press day are valid. |
| Headless testing via direct Claude call | More useful than calling through edge function — portable, no auth needed, tests prompt quality directly. |
| Coverage data flows silently to LLM | No visible coverage indicator on generation screen yet. Could add later as a separate feature. |

#### Files Changed
| File | Action |
|------|--------|
| `supabase/migrations/00026_exercise_muscle_groups.sql` | Created — junction table + 488 rows of muscle data + view update |
| `src/types/database.ts` | Regenerated — includes new table types |
| `src/pages/GenerationScreen.tsx` | Modified — removed GoalSelector, added goal badge |
| `src/hooks/useWorkoutGeneration.ts` | Modified — reads goal from userPreferences |
| `src/types/workout.ts` | Modified — removed goal from WorkoutParams, updated balanced description |
| `src/index.css` | Modified — added goal-badge styles |
| `supabase/functions/generate-workout/index.ts` | Modified — muscle data in listing, coverage context, profile goal |
| `supabase/functions/generate-workout/prompt.ts` | Modified — full v3.1 rewrite |
| `scripts/test-generation.ts` | Created — headless generation test harness |
| `.claude/commands/test-generation.md` | Created — /test-generation skill |
| `.claude/README.md` | Modified — registered new command |
| `CLAUDE.md` | Modified — added to decision tree + command table |

#### Status
- Build passes, TypeScript clean
- Migration applied to local Supabase
- 4 test generations run and validated
- All committed on `feature/tailwind-removal` branch

---

### Session: 2026-04-22 - Design Token Audit & System Hardening

**Duration:** ~3 hours
**Mode:** Claude Code
**Branch:** `feature/tailwind-removal`

#### What Got Done
- **Token audit**: Systematically found and eliminated every primitive token reference in components (~20 files). All now use semantic tokens — zero visual changes.
- **Fabricated token cleanup**: Removed `brown-800`, `brown-400`, `cream-100` — tokens invented by a prior Claude session from misinterpreting alpha-transparent orange in screenshots. Replaced with correct `orange-800`, `orange-400`, `orange-100` (and `blue-100` in blue theme).
- **13 new semantic tokens**: `--border-subtle`, `--text-cta-destructive/hover`, `--text-info-light`, `--surface-skeleton`, `--text-error-light`, `--text-muted`, `--surface-muted`, `--brand-primary/glow-strong/glow-medium/glow-subtle/border`.
- **17 unused tokens deleted**: Pre-refactor orphans (`--surface-cta`, `--surface-select-switch`), over-engineered variants (`--surface-radio-text-selected`), wrong-paradigm imports (`--icon-success/error/info`), unused scales (all `--width-*`).
- **5 redundant blue overrides removed**: `--surface-selected`, `--border-selected`, `--text-selected`, `--icon-selected`, `--surface-cta-secondary-disabled` — all identical to root values (copy-paste artifacts).
- **StructureSettings chip replacement**: Swapped hand-built chip buttons with the reusable `Chip` component.
- **figma-design-tokens.json rewritten**: Full rewrite from clean CSS source of truth. Fixed swapped CTA mappings, wrong alpha values, stale tokens.
- **Stale files removed**: Deleted `clear-design-tokens.json` (wrong palette, wrong fonts), deleted `DevTokenAudit.tsx` temporary page.
- **Prevention rule added**: CLAUDE.md now has "never invent primitives" and "primitives only referenced by semantics" rules.
- **Session plans created**: `SESSION_PLAN_tailwind_removal.md` and `SESSION_PLAN_design_system_extraction.md` for follow-up work.

#### What Came Up (Unexpected)
- The brown/cream tokens were completely fabricated by a prior Claude session — they interpreted alpha-transparent orange as brown/cream in a screenshot. Highlights the need for the "never invent primitives" rule.
- AppErrorFallback and ClearLogo were initially considered exceptions to the "no primitives" rule, but the user explicitly wanted zero exceptions — "in an almost artistic way."
- The figma-design-tokens.json had the CTA structure/interaction model backwards — it was using structure color for CTAs instead of the complement color.

#### Decisions Made
| Decision | Rationale |
|----------|-----------|
| Zero exceptions to semantic-only rule | User wanted the standard to be absolute — even error fallbacks and brand logos use semantics |
| Brand tokens (`--brand-*`) for ClearLogo | Logo is theme-independent (always orange) but still needs semantic indirection |
| Use `--surface-disabled` for Checkbox dot | Matches the role (inactive indicator) better than raw neutral-400 |
| Tailwind removal as separate effort | ~67 files, 2-3 sessions. Token audit was already large enough. |
| Design system extraction after Tailwind removal | Cleaner extraction without Tailwind artifacts in the CSS |

#### Files Changed
| File | Action |
|------|--------|
| `src/index.css` | Modified — fixed tab tokens, added 13 semantics, deleted 17 unused, removed 5 redundant blue overrides |
| `src/components/*.tsx` (12 files) | Modified — swapped primitive refs to semantic tokens |
| `src/pages/*.tsx` (7 files) | Modified — swapped `neutral-900` to `--background` in gradients |
| `src/pages/settings/StructureSettings.tsx` | Modified — replaced hand-built chips with Chip component |
| `src/pages/settings/SettingsHub.tsx` | Modified — red primitives to `--text-cta-destructive` |
| `docs/frontend/figma-design-tokens.json` | Rewritten — full sync with code as source of truth |
| `docs/frontend/clear-design-tokens.json` | Deleted — severely stale |
| `src/pages/DevTokenAudit.tsx` | Deleted — temporary audit visualization page |
| `CLAUDE.md` | Modified — added primitive invention prevention rules |
| `design-system/tokens/themes/*.json` | Modified — fixed brown/cream refs, added new tokens |
| `.claude/plans/SESSION_PLAN_tailwind_removal.md` | Created — full execution plan |
| `.claude/plans/SESSION_PLAN_design_system_extraction.md` | Created — full execution plan |

#### Status
- Build passes, TypeScript clean
- 2 commits on `feature/tailwind-removal` branch
- Next: Tailwind removal (`/execute SESSION_PLAN_tailwind_removal`), then design system extraction

---

### Session: 2026-03-09 - Component Consolidation & TabbedPanel

**Duration:** ~2 hours
**Mode:** Claude Code
**Branch:** `feat/component-consolidation` → PR #17

#### What Got Done
- **TabbedPanel compound component**: Tabs + content in one chamfered SVG frame. Single SVG draws outer frame, tab fills, and internal borders. Active tab connects seamlessly to content panel. 24px diagonal between tabs, 12px corner chamfers on frame
- **Shared tab geometry**: Extracted diagonal polygon math into `src/lib/tab-geometry.ts` — pure functions used by both TabBar (standalone) and TabbedPanel (embedded)
- **TabBar embedded variant**: New `variant="embedded"` renders only interactive buttons, delegating all visuals to parent TabbedPanel
- **7 reusable component extractions**: EmptyState, ErrorState, LoadingSkeleton, WorkoutListItem, FavoriteListItem, WeekStreakDisplay, ConfirmationModal (replaces AbandonmentModal)
- **Screen refactors**: HistoryScreen and HomeScreen now use TabbedPanel with filters inside the frame. Default tab on History fixed to 'history'
- **Nested card accent bar hiding**: Added `showLeftColumn` prop to WorkoutListItem, FavoriteListItem, EmptyState, ErrorState, LoadingSkeleton — cards inside TabbedPanel hide their accent bars
- **Tab content animation**: Stepped opacity animation (`animate-tab-enter`) matching the materialize mechanical pattern
- **Design tokens**: Tab-specific tokens, universal state baselines (selected/unselected), FilterDropdown tokens
- **Date utilities**: `date-utils.ts` extracts shared date formatting from multiple screens

#### What Came Up (Unexpected)
- Tab diagonal direction was initially wrong (active tab wider at top instead of bottom) — needed to flip the chamfer assignment logic in geometry functions
- Grey artifact at top-right corner caused by inactive tab border strokes extending past the outer chamfer clip — fixed by wrapping all borders in nested `<g clipPath>` for intersection clipping
- TabbedPanel intentionally avoids CSS `clip-path` (unlike ChamferedFrame) so dropdown menus inside it aren't clipped

#### Decisions Made
| Decision | Rationale |
|----------|-----------|
| 24px tab diagonal, 12px frame corners | Reference design shows dramatic diagonal between tabs, but standard card-sized corners on the frame |
| No CSS clip-path on TabbedPanel | FilterDropdown flyout menus must extend beyond panel bounds |
| Separate DIAGONAL vs CORNER constants | Tab diagonal angle and frame corner cuts serve different visual purposes |
| `key={activeTab}` for content remount | Triggers animation on tab switch without managing animation state manually |

#### Files Changed
| File | Action |
|------|--------|
| `src/lib/tab-geometry.ts` | Created — shared constants + pure geometry functions |
| `src/components/TabbedPanel.tsx` | Created — compound component with SVG frame |
| `src/components/TabBar.tsx` | Modified — refactored to use shared geometry, added embedded variant |
| `src/components/EmptyState.tsx` | Modified — added showLeftColumn prop |
| `src/components/ErrorState.tsx` | Modified — added showLeftColumn prop |
| `src/components/FavoriteListItem.tsx` | Created — extracted from HistoryScreen/HomeScreen |
| `src/components/WorkoutListItem.tsx` | Created — extracted from HistoryScreen/HomeScreen |
| `src/components/LoadingSkeleton.tsx` | Modified — added showLeftColumn prop |
| `src/components/FilterDropdown.tsx` | Created — chamfered dropdown filter component |
| `src/components/WeekStreakDisplay.tsx` | Created — extracted week streak view |
| `src/components/ConfirmationModal.tsx` | Created — replaces AbandonmentModal |
| `src/lib/date-utils.ts` | Created — shared date formatting |
| `src/index.css` | Modified — tab tokens, state baselines, tab-enter animation |
| `src/pages/HistoryScreen.tsx` | Modified — uses TabbedPanel, filters inside frame |
| `src/pages/HomeScreen.tsx` | Modified — uses TabbedPanel |
| `src/pages/ComponentGallery.tsx` | Modified — TabbedPanel demos + standalone TabBar demos |

#### Status
- Build passes, TypeScript clean
- PR #17 open, pushed to remote
- Code review: no critical issues, 2 minor pre-existing token notes

---

### Session: 2026-03-06 - Workout Persistence, Favorites & UI Polish

**Duration:** ~3 hours (multi-session)
**Mode:** Claude Code
**Branch:** `feat/workout-persistence-and-favorites` → merged as PR #16

#### What Got Done
- **Workout persistence**: Atomic RPC (`save_generated_workout`) returns all section/exercise UUIDs in one transaction. Exercise logging (weights, notes, reps) persists to Supabase on workout completion
- **Favorites system**: Save/list/unfavorite/repeat workouts. Previous bests tracking, last weights/notes pre-fill, favorite naming with inline edit
- **History & Favorites tabs**: Added to both HomeScreen and HistoryScreen with shared filter UI
- **ChamferedFrame filter dropdowns**: Filter by anchor and intensity using chamfered dropdown menus with blur + scanline texture
- **Session detail rework**: Card-wrapped header, expandable sections (exercises visible by default, expand for logged data), star toggle, favorite name display
- **Scanline texture system**: `.scanlines` CSS class applied to all structural backdrop-blur surfaces (header, dropdowns, toasts, timer, CTA buttons)
- **Design tokens**: New dropdown (surface, border, text), overlay, and slider tokens. Slider thumb changed to interaction color
- **Custom icon system**: `src/components/icons.tsx` replacing Lucide imports for consistency
- **ChamferedFrame fixes**: SVG CSS variable resolution (attribute → style prop), clip-path for backdrop-blur containment
- **LocationAccordion fix**: Replaced grid-rows animation (conflicted with stagger-reveal) with conditional render
- **Code review fixes**: Removed corrupted DB types line, dead functions, hardcoded rgba → overlay token, safer Supabase join cast, remaining Lucide imports migrated
- **Git hook fix**: Safety hook regex matched `-f` in branch names; fixed to require space-prefixed flags

#### What Came Up (Unexpected)
- SVG `fill`/`stroke` attributes don't resolve CSS custom properties (`var(--...)`) — must use `style` prop instead
- `backdrop-blur` extends beyond CSS `clip-path` set via Tailwind — needed computed `polygon()` clip-path on the container div
- Git safety hook regex `git push.*-f` false-positived on branch name `feat/workout-persistence-and-favorites`

#### Decisions Made
| Decision | Rationale |
|----------|-----------|
| Atomic RPC returning UUIDs (not save-then-fetch) | Eliminates race condition window; single transaction guarantees consistency |
| Scanlines on structural blur only, not modal overlays | Modal `backdrop-blur-sm` is for dimming, not a UI surface — scanlines would look wrong |
| Dropdown surface = translucent alpha + blur (same as header) | User explicitly requested matching treatment, not opaque backgrounds |
| Slider thumb = interaction color (blue in orange theme) | Thumb is an interactive control, not structural — follows color logic from design philosophy |
| Replace grid-rows animation with conditional render | Animation conflicted with stagger-reveal; instant show/hide is acceptable for accordion |
| `--surface-overlay` token for modal backdrops | Three modals shared same hardcoded `rgba(23,23,23,0.8)` — tokenized for consistency |

#### Files Changed
| File | Action |
|------|--------|
| `src/lib/workout-api.ts` | Modified — atomic save RPC, UUID injection, exercise logging |
| `src/lib/favorites-api.ts` | Created — favorites CRUD, repeat workout, previous bests |
| `src/hooks/useWorkoutSession.ts` | Modified — session lifecycle with persistence |
| `src/hooks/useWorkoutFlow.ts` | Modified — repeat workout flow |
| `src/hooks/useWorkoutGeneration.ts` | Modified — repeat mode support |
| `src/contexts/WorkoutFlowContext.tsx` | Modified — repeat workout context |
| `src/pages/SessionDetailScreen.tsx` | Modified — card layout, expandable sections, favorite toggle/naming |
| `src/pages/HistoryScreen.tsx` | Modified — tabs, ChamferedFrame filter dropdowns, favorites list |
| `src/pages/HomeScreen.tsx` | Modified — History/Favorites tabs |
| `src/pages/SummaryScreen.tsx` | Modified — post-workout favorite star |
| `src/pages/ReviewScreen.tsx` | Modified — repeat mode guard |
| `src/pages/WorkoutScreen.tsx` | Modified — session persistence |
| `src/pages/ComponentGallery.tsx` | Modified — new component demos |
| `src/components/ChamferedFrame.tsx` | Modified — CSS variable fix, clip-path |
| `src/components/PageHeader.tsx` | Modified — blur toned down, scanlines |
| `src/components/CTAButton.tsx` | Modified — scanlines |
| `src/components/ChamferedToast.tsx` | Modified — scanlines |
| `src/components/LocationAccordion.tsx` | Modified — replaced animation with conditional render |
| `src/components/EmptyState.tsx` | Modified — icon prop type |
| `src/components/workout/GlobalTimer.tsx` | Modified — scanlines |
| `src/components/workout/SectionRenderer.tsx` | Modified — timed section support |
| `src/components/workout/TimedRenderer.tsx` | Modified — expanded timed section UI |
| `src/components/workout/ActiveExerciseCard.tsx` | Modified — pre-fill weights/notes, icon migration |
| `src/components/AbandonmentModal.tsx` | Modified — overlay token |
| `src/components/SignOutConfirmModal.tsx` | Modified — overlay token |
| `src/components/icons.tsx` | Created — custom icon system |
| `src/index.css` | Modified — dropdown, overlay, slider, scanline tokens |
| `src/lib/home-data.ts` | Modified — expanded home data queries |
| `src/lib/query-keys.ts` | Modified — favorites query key |
| `src/types/database.ts` | Modified — regenerated types, removed corrupted line |
| `src/types/workout.ts` | Modified — favorites and repeat types |
| `supabase/migrations/00023-00025` | Created — persistence + favorites schema |
| `.claude/hooks/git-safety-check.sh` | Modified — fixed regex false positive |

#### Status
- PR #16 merged to main, branch deleted
- TypeScript compiles cleanly
- All review issues addressed before merge

---

### Session: 2026-03-05 - Housekeeping: Inbox, Plan Archival, Workflow Fix

**Duration:** ~15 min
**Mode:** Claude Code
**Branch:** `main` (uncommitted)

#### What Got Done
- **Inbox processed**: Filed 2 session plans (`loading_screens`, `workout_complete_polish`) to `.claude/plans/` and 1 HTML prototype (`clear-loading-screen-prototype.html`) to `docs/specs/`
- **Plan archival system**: Created `.claude/plans/done/` folder and archived all 24 completed session plans, leaving `plans/` empty for future work
- **Close-session skill updated**: Added Step 4 "Archive Plan" to `close-session.md` so future sessions automatically move executed plans to `plans/done/` during close

#### Decisions Made
| Decision | Rationale |
|----------|-----------|
| `plans/done/` archive folder (not delete) | Preserves history — plans are reference material for session log entries |
| Archive step in close-session (not execute) | Plan should only be archived after full session completion, not at execution start |

#### Files Changed
| File | Action |
|------|--------|
| `.claude/skills/close-session.md` | Modified — added Step 4: Archive Plan + checklist item |
| `.claude/plans/done/*.md` | Created — 24 archived plan files moved here |
| `docs/specs/clear-loading-screen-prototype.html` | Filed — HTML prototype from inbox |

#### Status
- No commits — housekeeping changes uncommitted on main
- Inbox empty, plans folder clean

---

### Session: 2026-03-05 - Generation Speed + Save Bug Fix

**Duration:** ~45 min
**Mode:** Claude Code
**Branch:** `main` (direct, uncommitted)

#### What Got Done
- **Coaching cues removed from generation output**: Dropped `coaching_cues` from output schema in both `generate-workout/prompt.ts` and `generate-section/index.ts`. Reduces output tokens by 300-750 per workout (30-50 tokens per exercise × 10-15 exercises). Frontend transform and DB save updated to pass null/empty. UI already handles absence gracefully.
- **Workout save bug fixed**: `idx_workout_sections_unique_type` constraint on `(session_id, section_type)` was rejecting workouts with multiple sections of the same type (e.g., two accessory blocks). Dropped the constraint via migration `00022`. Added prompt guidance allowing multiple same-type sections when appropriate.
- **Generation speed plan evaluated**: Reviewed all 5 steps of the speed plan. Steps 1 (parallelize queries), 4 (defer save), and 5 (progressive stages) deprioritized as marginal or risky. Step 2 (prompt caching) noted as low-effort future win. Step 3 partially executed (coaching cues only, kept regression). Plan updated with rationale.
- **Backlog updated**: Added low-priority item for re-enabling coaching cues with restore instructions.
- **Migration pushed to production**: `00022_drop_unique_section_type.sql` applied to hosted Supabase via `supabase db push`.

#### Decisions Made
| Decision | Rationale |
|----------|-----------|
| Remove coaching cues, keep regression | Cues are generic fitness knowledge (high token cost, low value). Regression is actionable for users ("Easier: goblet squat"). |
| Drop DB constraint, don't tighten prompt | Multiple same-type sections are legitimate (two accessory blocks). Prompt already guides section composition via goal templates. |
| Deprioritize other speed plan steps | DB queries are ~200ms total (marginal). Deferred save risks silent data loss. Progressive stages would be fake (no intermediate signal from edge function). |
| Soft prompt guardrail instead of hard constraint | "Don't duplicate warmup or cooldown" in prompt vs DB enforcement. Allows flexibility while preventing obvious problems. |

#### Files Changed
| File | Action |
|------|--------|
| `supabase/functions/generate-workout/prompt.ts` | Modified — removed coaching_cues from output schema, added multi-section guidance |
| `supabase/functions/generate-section/index.ts` | Modified — removed coaching_cues from output schema |
| `src/lib/workout-api.ts` | Modified — nulled coaching_cues in transform and DB save |
| `src/hooks/useExerciseSwap.ts` | Modified — empty array for coaching_cues mapping |
| `supabase/migrations/00022_drop_unique_section_type.sql` | Created — drops unique section type constraint |
| `docs/BACKLOG.md` | Modified — added re-enable coaching cues item |
| `~/.claude/plans/lexical-scribbling-lamport.md` | Modified — Step 3 marked partially done, other steps deprioritized |

#### Status
- Build passes, types clean
- Migration applied locally and to production
- Changes uncommitted on main — needs commit + PR

---

### Session: 2026-03-05 - Exercise Swap, Scan Loader System, and UI Polish

**Duration:** ~3 hours
**Mode:** Claude Code
**Branch:** `feature/exercise-swap` → PR #14, merged

#### What Got Done
- **Exercise swap system**: Per-exercise and unit-level (superset/block) swap via new `generate-section` Supabase edge function. Swap history tracking with undo (previous) support. Individual swap controls appear only when exercise card is expanded
- **ScanLoader canvas system**: Shared `canvas-utils.ts` with 4×4px pixel-block CRT static rendering, scan line with glow, CRT horizontal lines. Theme-aware (reads `--primary-300` CSS variable at runtime), DPR-aware for retina displays
- **BootScreen**: Interruptible boot sequence in `ProtectedRoute` — 5 status messages with typewriter effect, progress bar, exits cleanly after current sweep when auth resolves
- **FullscreenLoader**: Bounce-mode overlay for workout generation — scan fills bottom→top then clears top→bottom in continuous loop. Typewriter message centered, secondary chamfered cancel CTA at bottom
- **CardLoader**: Same bounce loop pattern for exercise/section swaps — loops while loading, fades out on completion
- **Cancel generation**: `cancelledRef` flag in `useWorkoutGeneration`, threaded through context to FullscreenLoader's cancel button. Discards in-flight API response when cancelled
- **CRT static aesthetic**: Changed from Matrix-style text characters to 4×4px pixel blocks. Iterative opacity/blur tuning to `rgba(23,23,23,0.15)` + `backdrop-blur-sm`. Bounce loop smoothed (no grid re-seeding between sweeps)
- **UI polish**: Exercise title size reduction (h6 20px → label-md 16px), location text CTA color (`--icon-cta`), accordion persistence through swaps (position-based keys), generate card padding alignment, swap icon/text alignment and color
- **Edge function config**: Added `verify_jwt = false` for `generate-section` in `supabase/config.toml` for local dev
- **CSS token**: Added `--primary-300` variable (orange-300/blue-300) for desaturated scan loader pixels

#### What Came Up (Unexpected)
- Edge function 404: `generate-section` not found because local Supabase hadn't been restarted after adding the function. Required `npx supabase stop && npx supabase start`
- Edge function 401: `config.toml` had `verify_jwt = false` for `generate-workout` but not `generate-section` — needed matching config
- Abandon workout buttons silently failing: `handleAbandonIncomplete` had no error handling and didn't reload data. Added try/catch + `loadHomeData()` call
- Exercise cards losing expanded state on swap: keyed by `exercise.id` which changes on swap, causing remount. Fixed with position-based keys (`exercise-${originalIndex}`)
- Bounce loop jarring reset: grid re-seeded on direction flip causing instant noise refill. Fixed by removing re-seeding and alternating fill/clear sweep directions

#### Decisions Made
| Decision | Rationale |
|----------|-----------|
| 300-level primary for scan pixels (not 500) | Desaturated static feels more CRT-authentic, less saturated than full primary |
| `--primary-300` as new CSS token | No existing token mapped same-color 300 level. Needed for canvas `readThemeRGB()` |
| Position-based keys for exercise cards | `exercise.id` changes on swap causing remount/state reset. Position is stable |
| Secondary chamfered CTA for cancel button | Matches design system, gets CTA color swap (blue in orange mode, orange in blue mode) for free |
| Bounce loop: fill up then clear down, no re-seed | Seamless visual loop — no jarring instant refill between sweeps |
| CardLoader uses same bounce as FullscreenLoader | Consistent animation language across all loading states |
| `rgba(23,23,23,0.15)` + `backdrop-blur-sm` | See-through overlay that shows card outlines while maintaining CRT atmosphere |

#### Files Changed
| File | Action |
|------|--------|
| `src/components/ScanLoader/canvas-utils.ts` | Created — shared drawing utilities, pixel-block rendering, theme-aware color |
| `src/components/ScanLoader/ScanLoader.tsx` | Created — core canvas engine with bounce/down-once modes |
| `src/components/ScanLoader/BootScreen.tsx` | Created — interruptible boot sequence with progress bar |
| `src/components/ScanLoader/FullscreenLoader.tsx` | Created — generation overlay with cancel button |
| `src/components/ScanLoader/CardLoader.tsx` | Created — card-level bounce loader with fade-out |
| `src/components/ScanLoader/index.ts` | Created — barrel export |
| `src/hooks/useExerciseSwap.ts` | Created — swap logic with history and undo |
| `supabase/functions/generate-section/index.ts` | Created — edge function for exercise/section regeneration |
| `src/components/ExerciseCard.tsx` | Modified — swap controls, CardLoader, expand callback, title size |
| `src/components/WorkoutSectionCard.tsx` | Modified — group swap controls, expanded tracking, position-based keys |
| `src/components/LocationAccordion.tsx` | Modified — CTA color for location name |
| `src/contexts/WorkoutFlowContext.tsx` | Modified — added `cancelGeneration` to interface |
| `src/hooks/useWorkoutFlow.ts` | Modified — threaded `cancelGeneration` |
| `src/hooks/useWorkoutGeneration.ts` | Modified — cancel ref, cancellation check |
| `src/index.css` | Modified — added `--primary-300` token |
| `src/lib/workout-api.ts` | Modified — section swap API types |
| `src/pages/GenerationScreen.tsx` | Modified — FullscreenLoader + cancel, back arrow |
| `src/pages/HomeScreen.tsx` | Modified — padding alignment, abandon error handling |
| `src/pages/ReviewScreen.tsx` | Modified — wired exercise swap controls |
| `src/routes/guards.tsx` | Modified — BootScreen replaces LoadingScreen |
| `src/types/generation.ts` | Modified — section swap types |
| `src/types/workout.ts` | Modified — swap-related type additions |
| `supabase/config.toml` | Modified — `generate-section` JWT config |
| `supabase/functions/generate-workout/index.ts` | Modified — minor update |
| `supabase/functions/generate-workout/prompt.ts` | Modified — prompt refinement |

#### Status
- Build passes, TypeScript compiles cleanly
- PR #14 squash-merged to main, branch deleted
- Clean state on main

---

### Session: 2026-03-04 - Workout Complete Polish Round 2: Mood Fill, Streak Frames, Finish Fix, Stagger-Reveal

**Duration:** ~1 hour
**Mode:** Claude Code
**Branch:** `feature/workout-complete-polish-2` → PR #13, merged

#### What Got Done
- **"Workout Complete" in header**: Moved title into PageHeader center slot, replacing the CLEAR logo on the summary screen. Removed redundant inline h1
- **Summary line weight**: Bumped workout description from `font-medium` to `font-semibold` for better readability
- **Mood icon fill states**: Selected mood now fills the MoodIcon's chamfered SVG frame with green (`--surface-radio-selected` fill + `--border-radio-select` stroke) instead of wrapping a box around the entire button. Icon size bumped to 32px
- **ChamferedFrame streak cells**: Replaced plain bordered divs with `ChamferedFrame cornerSize="sm"` on both HomeScreen and SummaryScreen streak day cells — now have proper corner cuts matching the rest of the design system
- **Rest day purple color scheme**: Rest day cells use `--surface-info` / `--border-info` / `--color-purple-500` (info/purple palette) instead of neutral radio-unselect, visually distinguishing rest from workout days
- **Finish button fix**: `handleFinishSession` was async but called without `await` — any thrown error was a silently swallowed unhandled promise rejection causing "nothing happens". Fixed with try/catch in the hook + await in the caller. Navigation and state reset now always happen even if the Supabase save fails
- **Dynamic "Mark Rest Day"**: Button hidden when today already has a workout logged in `streakData.weekView`
- **Stagger-reveal on all screens**: Added load-in animation to 7 more screens (ReviewScreen, SummaryScreen, SessionDetailScreen, SettingsScreen, OnboardingScreen, SignInScreen, CreateAccountScreen). Skipped screens where it doesn't apply (NotFound, WorkoutScreen mid-workout, WelcomeScreen, TestWorkoutScreen)

#### What Came Up (Unexpected)
- Finish button "doing nothing" was a silent unhandled promise rejection — the async function was called without await, so errors were swallowed and the function died before reaching navigation/toast code. Not a Supabase issue, just a missing await + try/catch

#### Decisions Made
| Decision | Rationale |
|----------|-----------|
| Fill MoodIcon SVG frame (not box around button) | More expressive — the icon itself changes, not just a highlight rectangle around it |
| Purple for rest days (info color scheme) | Green = workout, purple = rest, neutral = empty — three distinct visual states. Purple already exists as info/contextual color in the design system |
| Hide rest day button dynamically | Prevents confusion — marking rest on a workout day makes no sense |
| try/catch + always navigate on finish | Save failure shouldn't trap user on summary screen. Show error toast but let them out |
| Skip stagger-reveal on WorkoutScreen | Mid-workout shouldn't feel like a "page load" — it's a continuous active experience |

#### Files Changed
| File | Action |
|------|--------|
| `src/components/MoodIcon.tsx` | Modified — added `selected` prop, fills frame with green when selected |
| `src/hooks/useWorkoutSession.ts` | Modified — try/catch around Supabase call, always navigates |
| `src/pages/SummaryScreen.tsx` | Modified — header title, mood fill, streak ChamferedFrames, await finish, stagger-reveal |
| `src/pages/HomeScreen.tsx` | Modified — streak ChamferedFrames, purple rest days, dynamic rest button hide |
| `src/pages/ReviewScreen.tsx` | Modified — added stagger-reveal |
| `src/pages/SessionDetailScreen.tsx` | Modified — added stagger-reveal |
| `src/pages/SettingsScreen.tsx` | Modified — added stagger-reveal |
| `src/pages/OnboardingScreen.tsx` | Modified — added stagger-reveal |
| `src/pages/SignInScreen.tsx` | Modified — added stagger-reveal |
| `src/pages/CreateAccountScreen.tsx` | Modified — added stagger-reveal |

#### Status
- Build passes, TypeScript compiles cleanly
- PR #13 squash-merged to main, branch deleted
- Clean state on main

---

### Session: 2026-03-04 - Workout Complete Polish: Fixed Header, Mood Icons, Card Wrapping

**Duration:** ~1.5 hours
**Mode:** Claude Code
**Branch:** `feature/workout-complete-polish`

#### What Got Done
- **Fixed PageHeader positioning**: Changed from `sticky top-0` to `fixed top-0 left-0 right-0` so header stays locked to viewport on long-scrolling pages. Updated all 4 layouts (AppLayout, WorkoutLayout, OnboardingLayout, AuthLayout) with `pt-12` clearance for the fixed header height
- **Custom MoodIcon component**: Created 5 angular/geometric SVG mood faces (Exhausted: X eyes + zigzag frown, Tough: dash eyes + angled frown, Okay: square dot eyes + flat mouth, Good: square dot eyes + V smile, Great: ^ happy eyes + wide V smile). All share a chamfered square frame matching the design system's low-tech sci-fi style. Uses `currentColor` for parent-controlled coloring
- **Card wrapping**: Wrapped mood selector and session notes textarea in `<Card padding="md">` with section labels inside, matching the visual rhythm of summary and streak cards
- **Glow treatment**: Added `.glow-emissive` to "Nice Work!" heading and new streak number for celebration emphasis
- **Streak token alignment**: Replaced hardcoded color primitives in streak day cells with radio button tokens (`--surface-radio-selected`, `--border-radio-select`, etc.) matching HomeScreen. Changed from flex to grid layout for consistent cell sizing
- **Cleanup**: Removed unused `cn` import, removed lucide mood icon dependency from SummaryScreen

#### What Came Up (Unexpected)
- `sticky` positioning was failing on long pages because of CSS stacking context issues — `fixed` was the proper solution but required coordinated padding changes across all layout components
- Anthropic API billing issue caused ~30 min of debugging — Edge Function returned 500, turned out to be "credit balance too low" on Anthropic's side despite credits showing in dashboard. Resolved itself after propagation delay

#### Decisions Made
| Decision | Rationale |
|----------|-----------|
| `position: fixed` not `sticky` for PageHeader | Sticky can break in certain scroll/transform contexts; fixed locks to viewport reliably |
| `pt-12` clearance on all layouts | Header is h-12 (48px). Top padding compensates so content doesn't render behind fixed header |
| Angular/geometric mood faces (not rounded emoji) | Matches design philosophy: "low-tech sci-fi", shapes should be angular with chamfered frames |
| MoodIcon uses `currentColor` inheritance | Parent controls color via style props, matching existing radio button selection pattern |

#### Files Changed
| File | Action |
|------|--------|
| `src/components/MoodIcon.tsx` | Created — 5 geometric SVG mood faces with shared chamfered frame |
| `src/components/PageHeader.tsx` | Modified — sticky → fixed positioning |
| `src/layouts/AppLayout.tsx` | Modified — header outside max-w-md, pt-12 clearance |
| `src/layouts/WorkoutLayout.tsx` | Modified — pt-14 clearance for fixed header |
| `src/layouts/OnboardingLayout.tsx` | Modified — header outside max-w-md, pt-12 clearance |
| `src/layouts/AuthLayout.tsx` | Modified — pt-12 clearance |
| `src/pages/SummaryScreen.tsx` | Modified — Card wrapping, MoodIcon integration, glow, streak tokens |
| `.claude/plans/SESSION_PLAN_clear_logo.md` | Added — archived plan from previous session |

#### Status
- Build passes, TypeScript compiles cleanly
- 1 commit on `feature/workout-complete-polish` ahead of main
- Ready for PR

---

### Session: 2026-03-04 - UI Refinement: Design Token Compliance & Exercise Card Rework

**Duration:** ~2.5 hours
**Mode:** Claude Code
**Branch:** `feature/clear-logo`

#### What Got Done
- **New design tokens**: Created `--text-on-cta` / `--icon-on-cta` (content on interaction surfaces) and `--text-card-header` (300-level for exercise name headers). Enforces color hierarchy: 100-level for page headers, 300-level for card headers, 500-level for icons on CTA surfaces
- **CTA color compliance**: HomeScreen Generate Workout and Quick Start cards now use CTA surface/border/accent tokens (blue in orange mode, orange in blue mode). CTAButton primary/secondary variants switched to on-cta tokens
- **ExerciseCard complete rewrite**: Transformed from static display into individually expandable accordion with chevron. Equipment moved from name line to prescription line with bullet separator. Matches ActiveExerciseCard structure for preview ↔ workout parity
- **WorkoutSectionCard simplification**: Removed section-level accordion. Each exercise is now its own expandable accordion via ExerciseCard. Section label stays static/visible
- **ActiveExerciseCard alignment**: Equipment moved to prescription line (matching ExerciseCard), name color changed to 300-level `--text-card-header`
- **Route transition fix**: Changed all `animation-fill-mode` from `both` to `backwards` in transitions.css — the persisting `transform: translateX(0)` was creating a containing block that broke `position: fixed/sticky` on every navigated-to screen
- **PageHeader structural band**: Reworked as sticky header with ChamferedFrame (new `bottomBorderOnly` prop), `backdrop-blur-xl`, surface/border heading tokens
- **Deleted PageHeading component**: Replaced with inline headings across all screens (onboarding, summary, auth, session detail, settings, 404, test workout)
- **Footer gradient unification**: All bottom-fixed buttons (GenerateButton, StartWorkoutButton, SummaryScreen, OnboardingScreen) now use consistent inline gradient style with `z-40`
- **WorkoutLayout cleanup**: Removed redundant sticky wrapper div around header
- **Onboarding refinements**: Headings restructured, limitations wrapped in Card, accordion triggers use interaction colors (`--text-cta`), section labels added
- **Auth screen restructure**: Sign In / Create Account headings moved inside content flow, form max-w-sm applied at wrapper level
- **Streak day cells**: Switched from hardcoded primitives to radio button tokens (`--surface-radio-selected`, `--border-radio-select`, etc.)
- **LocationAccordion**: Chevron and value text switched to interaction colors

#### What Came Up (Unexpected)
- Route transition `animation-fill-mode: both` was the root cause of broken `position: fixed/sticky` across the entire app — not just the preview screen. The persisting `transform` creates a new containing block per CSS spec. Switching to `backwards` preserves the enter animation while letting the transform clear after animation completes
- PageHeading component (created in earlier commit on this branch) was deleted in the same session — the structural band treatment moved into PageHeader itself via ChamferedFrame's new `bottomBorderOnly` prop
- Exercise card work required multiple careful reverts — user initially requested removing "containers around accordions" which was ambiguous between section-level Card wrappers and individual exercise borders

#### Decisions Made
| Decision | Rationale |
|----------|-----------|
| `animation-fill-mode: backwards` not `both` | `both` leaves `transform` persisting which breaks fixed/sticky positioning. `backwards` applies pre-animation state only |
| `--text-card-header` at 300-level (not 100) | Creates visual hierarchy: page headers (100) > card headers (300) > paragraph text |
| `--text-on-cta` / `--icon-on-cta` as separate token class | Content on CTA surfaces needs theme color (not interaction color). 100-level for text, 500-level for icons |
| Delete PageHeading, keep heading logic inline | PageHeader already handles the structural band. Screen headings are contextual enough to stay inline |
| Equipment on prescription line (not name line) | Keeps exercise name clean, groups equipment with the physical prescription (sets × reps) |
| ExerciseCard as accordion (not static) | Preview screen should match workout screen behavior — individually expandable exercises |

#### Files Changed
| File | Action |
|------|--------|
| `src/index.css` | Modified — added `--text-on-cta`, `--icon-on-cta`, `--text-card-header` tokens, cleaned `.exercise-card` |
| `src/components/ExerciseCard.tsx` | Rewritten — static display → individually expandable accordion |
| `src/components/WorkoutSectionCard.tsx` | Modified — removed section-level accordion, individual exercise accordions |
| `src/components/workout/ActiveExerciseCard.tsx` | Modified — equipment to prescription line, 300-level header |
| `src/components/CTAButton.tsx` | Modified — on-cta tokens for primary/secondary |
| `src/components/PageHeader.tsx` | Modified — sticky ChamferedFrame band with backdrop-blur-xl |
| `src/components/ChamferedFrame.tsx` | Modified — added `bottomBorderOnly` prop |
| `src/components/PageHeading.tsx` | Deleted — replaced by inline headings |
| `src/transitions.css` | Modified — animation-fill-mode both → backwards |
| `src/components/GenerateButton.tsx` | Modified — consistent gradient, max-w-md wrapper |
| `src/components/StartWorkoutButton.tsx` | Modified — consistent gradient |
| `src/components/LocationAccordion.tsx` | Modified — interaction colors |
| `src/components/ChamferedToast.tsx` | Modified — added backdrop-blur |
| `src/layouts/WorkoutLayout.tsx` | Modified — removed redundant sticky wrapper |
| `src/layouts/AppLayout.tsx` | Modified — minor layout adjustment |
| `src/components/workout/WorkoutNavigation.tsx` | Modified — consistent gradient |
| `src/pages/HomeScreen.tsx` | Modified — CTA tokens on action cards, streak radio tokens, recent section |
| `src/pages/OnboardingScreen.tsx` | Modified — headings, cards, interaction colors, labels |
| `src/pages/GenerationScreen.tsx` | Modified — footer prop for GenerateButton |
| `src/pages/ReviewScreen.tsx` | Modified — footer prop for StartWorkoutButton |
| `src/pages/SummaryScreen.tsx` | Modified — inline headings, footer z-40 |
| `src/pages/SignInScreen.tsx` | Modified — heading restructure |
| `src/pages/CreateAccountScreen.tsx` | Modified — heading restructure |
| `src/pages/SessionDetailScreen.tsx` | Modified — inline heading |
| `src/pages/SettingsScreen.tsx` | Modified — heading update |
| `src/pages/HistoryScreen.tsx` | Modified — minor update |
| `src/pages/NotFound.tsx` | Modified — inline heading |
| `src/pages/TestWorkoutScreen.tsx` | Modified — inline heading |
| `src/pages/settings/LimitationsSettings.tsx` | Modified — heading extracted from Card |
| `src/pages/ComponentGallery.tsx` | Modified — gallery update |
| `docs/BACKLOG.md` | Modified — added restore TestWorkoutScreen bug, git worktree idea |

#### Status
- Build passes, TypeScript compiles cleanly
- 4 commits on `feature/clear-logo` ahead of main
- Ready for PR

---

### Session: 2026-03-03 - Vibe Tuning: Animated Background + Branch Close

**Duration:** ~15 min
**Mode:** Claude Code
**Branch:** `feature/vibe-tuning` → PR #9, merged

#### What Got Done
- Committed user-authored **animated background system**: 4 GPU-accelerated radial-gradient blobs (amber, blue, cyan, dark) drifting via CSS transforms, responsive mobile/desktop sizing, static PNG fallback for `prefers-reduced-motion`
- Bumped **scanline opacity** from 0.025 to 0.10 for stronger texture
- Pushed `feature/vibe-tuning`, created PR #9, squash-merged to main, branch deleted
- Clean state: on `main`, up to date with remote

#### Files Changed
| File | Action |
|------|--------|
| `src/components/AnimatedBackground.tsx` | Created — 4-blob animated gradient layer |
| `src/App.tsx` | Modified — added AnimatedBackground import + render |
| `src/index.css` | Modified — full blob CSS (sizing, keyframes, responsive, reduced-motion), scanline opacity 0.025→0.10 |

#### Status
- PR #9 merged to main, branch deleted
- `bg-playground.html` scratch file left in working directory (not committed)
- Ready for screen-by-screen vibe tuning in next session

---

### Session: 2026-03-03 - Vibe Tuning: Atmosphere, Theme Toggle, CTA Complement

**Duration:** ~45 min
**Mode:** Claude Code
**Branch:** `feature/vibe-tuning`

#### What Got Done
- **Atmosphere layers** (per `design-philosophy.md`):
  - Scan lines — `::after` pseudo on `.grain-overlay`, 2px repeating horizontal lines at 2.5% opacity
  - Emissive glow — subtle `text-shadow` (25% currentColor) on CLEAR logo, timer display, streak number
  - Micro-pulse — 4s stepped oscillation (100%→85% opacity) on card accent bars via LeftColumn
  - Stagger reveal — children materialize in sequence (60ms delay, stepped timing) on Home, Generation, History screens
- **Theme toggle**: Orange/Blue mode switcher in Settings → Appearance section. localStorage persistence via `src/lib/theme.ts`, applied before `createRoot()` to prevent flash
- **CTA complement color fix**: All CTA buttons (primary + secondary) now use complement color — blue surfaces/borders/accents in orange mode, orange in blue mode. Per design philosophy: "theme color = structure, complement = interaction"
- **Glow tuning**: Initial glow was too heavy (double shadow + brightness filter). Reduced to single shadow at 25% opacity — subtle phosphor persistence, not neon sign

#### What Came Up (Unexpected)
- Initial glow implementation looked cheap ("jr designer cranked up glow") — needed to be dialed way back. Lesson: atmospheric effects should be invisible until removed
- CTA token fix required both primary AND secondary buttons — first pass only did primary, leaving secondary buttons still in theme color

#### Decisions Made
| Decision | Rationale |
|----------|-----------|
| localStorage only for theme (no DB) | Theme is a device-local visual preference, not a profile field |
| `initTheme()` before `createRoot()` | Prevents flash of wrong theme on page load |
| All CTA surfaces/borders → complement | Design philosophy: "Complement color = interaction. CTAs, buttons, links, tappable icons" |
| Single text-shadow at 25% opacity | "Seasoning, not the main course" — glow should feel emissive, not decorative |
| `steps(4, end)` for stagger reveal | Consistent with mechanical motion language throughout the app |

#### Files Changed
| File | Action |
|------|--------|
| `src/index.css` | Modified — scan lines, glow utility, micro-pulse, stagger reveal, CTA token swaps (16 tokens) |
| `src/lib/theme.ts` | Created — getTheme/setTheme/initTheme with localStorage |
| `src/main.tsx` | Modified — import initTheme, call before render |
| `src/components/CTAButton.tsx` | Modified — primary accent uses `--surface-cta-primary-accent` |
| `src/components/PageHeader.tsx` | Modified — glow-emissive on CLEAR logo |
| `src/components/TimerDisplay.tsx` | Modified — glow-emissive on timer text |
| `src/components/LeftColumn.tsx` | Modified — pulse-micro on accent bars |
| `src/pages/HomeScreen.tsx` | Modified — glow-emissive on streak, stagger-reveal on content |
| `src/pages/GenerationScreen.tsx` | Modified — stagger-reveal on content |
| `src/pages/HistoryScreen.tsx` | Modified — stagger-reveal on content |
| `src/pages/settings/SettingsHub.tsx` | Modified — Appearance section with Orange/Blue RadioButtons |
| `src/App.tsx` | Modified — ReactQueryDevtools moved to bottom-left |

#### Status
- Build passes, TypeScript compiles cleanly
- 3 commits on `feature/vibe-tuning` (atmosphere, theme toggle, session log)
- Merged to main via PR #9 (squash) in follow-up session

---

### Session: 2026-03-03 - Navigation System: Route Transitions (Phase 4)

**Duration:** ~30 min
**Mode:** Claude Code
**Branch:** `feature/codebase-streamline` (uncommitted — ready to stage)

#### What Got Done
- **Route transition animations**: Created `transitions.css` with 5 animation types: forward (shift right), back (shift left), workout entry (shift up), workout exit (shift down), and hard cut (opacity). All aligned with design philosophy — `steps(4, end)` timing, `linear` easing, 150-180ms durations
- **Transition direction hook**: `useTransitionDirection.ts` tracks previous vs current pathname, uses route depth map for forward/back inference, special-case overrides for workout entry/exit and summary→home
- **RouteTransition wrapper**: Component keyed by pathname, applies correct CSS class. Wired into all 3 route guards (`ProtectedRoute`, `PublicOnlyRoute`, `OnboardingRoute`)
- **Design philosophy compliance**: Initial implementation used smooth ease-out curves and 300ms crossfades. After reading `design-philosophy.md`, rewrote to use stepped timing functions, linear easing, smaller translate distances, and tighter durations to match the "mechanical, not organic" directive
- **Vibe tuning handoff**: Created `SESSION_PLAN_vibe_tuning.md` with tuning areas (timing, distances, step count, atmosphere layers, progressive reveal), key file map, and acceptance criteria

#### Decisions Made
| Decision | Rationale |
|----------|-----------|
| `steps(4, end)` timing function | Design philosophy: "Ratcheting, discrete steps" not "continuous fluid interpolation" |
| 150ms standard / 180ms mode transitions | Design philosophy: "Brief mechanical transitions (150-200ms)" |
| 16px translate distance (not 30px) | Smaller distance with stepped timing reads as mechanical shift, not fluid slide |
| Hard cut for summary→home (not crossfade) | Design philosophy: "Hard cuts between states (for speed)" not "slow crossfades" |
| Enter-only animations (no exit) | Old page unmounts immediately in React Router — exit animations would require keeping stale component mounted |

#### Files Changed
| File | Action |
|------|--------|
| `src/transitions.css` | Created — keyframes + CSS variables for 5 animation types + prefers-reduced-motion |
| `src/hooks/useTransitionDirection.ts` | Created — route depth map, special cases, CSS class resolver |
| `src/components/RouteTransition.tsx` | Created — pathname-keyed animation wrapper |
| `src/routes/guards.tsx` | Modified — wrapped `<Outlet />` with `<RouteTransition>` in all 3 guards |
| `src/main.tsx` | Modified — imported `transitions.css` |
| `.claude/plans/SESSION_PLAN_vibe_tuning.md` | Created — handoff for next session |

#### Status
- TypeScript compiles cleanly, build passes
- Changes uncommitted on `feature/codebase-streamline` branch
- Handoff prompt written for vibe tuning session

---

### Session: 2026-03-03 - Infrastructure: Error Boundaries, React Query, Tests

**Duration:** ~1.5 hours
**Mode:** Claude Code
**Branch:** `feature/codebase-streamline` → PR #7 (updated)

#### What Got Done
- **Error boundaries**: Installed `react-error-boundary`. Created two-layer system: `AppErrorFallback` (catastrophic crash screen with design tokens, dev-only error details) wrapping AuthProvider in `main.tsx`, and `RouteErrorFallback` (uses AppLayout + ErrorState with retry/navigate) wrapping Outlet in all three route guards with `resetKeys={[location.pathname]}` for auto-clear on navigation
- **React Query activation**: Configured `QueryClient` with 5min staleTime, 10min gcTime, retry:1, refetchOnWindowFocus:false. Created `lib/query-keys.ts` factory. Rewrote `useHomeData` from useState/useEffect/mountedRef to three `useQuery` calls — `loadHomeData()` now calls `invalidateQueries`, `clearIncompleteSession()` uses `setQueryData(key, null)`. Removed auto-fetch `useEffect` from `HomeDataContext` (React Query's `enabled` flag handles it). Migrated `SessionDetailScreen` data fetch to `useQuery`. Added `@tanstack/react-query-devtools`
- **Dead code cleanup**: Confirmed `Index.tsx`, `useAppNavigation.ts`, `useHistoryDetail.ts` already deleted from previous session. Removed obsolete "Index.tsx Monolith" constraint from CLAUDE.md
- **Test infrastructure**: Installed vitest + @testing-library/react + jest-dom + user-event + jsdom. Created `vitest.config.ts`, `test/setup.ts` (jest-dom + ResizeObserver polyfill), `test/test-utils.tsx` (custom render with QueryClientProvider + MemoryRouter). Added `test` and `test:run` scripts to package.json
- **28 foundational tests across 4 files**: `ErrorState.test.tsx` (5 — render, retry, click), `workout-api.test.ts` (10 — isGenerationError type guard + transformAPIWorkoutToFrontend mapping), `guards.test.tsx` (9 — all redirect/render scenarios for 3 guards), `home-data.test.ts` (4 — error resilience + data mapping)

#### What Came Up (Unexpected)
- `ResizeObserver is not defined` in jsdom — `ChamferedFrame` (used by `Card`, used by `ErrorState`) relies on ResizeObserver. Fixed with polyfill stub in test setup
- Dead code files were already deleted in working tree from previous session but not yet committed — just needed staging

#### Decisions Made
| Decision | Rationale |
|----------|-----------|
| Two-layer error boundary (app + route) | App-level catches provider/router failures where components can't render; route-level uses existing UI chrome |
| `resetKeys={[location.pathname]}` on route boundaries | Auto-clears error state when user navigates away — no stale error screens |
| 5min staleTime, 10min gcTime for React Query | Mobile-app feel: data stays fresh during a session, doesn't refetch on every navigation, but cleans up after idle |
| `refetchOnWindowFocus: false` | Mobile PWA — tab switching shouldn't trigger refetches |
| ResizeObserver stub (not full polyfill) | Tests only need to not crash; actual resize behavior is visual and not under test |
| Preserved useHomeData return shape exactly | Zero changes needed in consumers (HomeScreen, HistoryScreen, SummaryScreen, WorkoutFlowContext) |

#### Files Changed
| File | Action |
|------|--------|
| `src/components/AppErrorFallback.tsx` | Created — full-screen dark crash page with design tokens |
| `src/components/RouteErrorFallback.tsx` | Created — route-level fallback using AppLayout + ErrorState |
| `src/main.tsx` | Modified — wrapped with ErrorBoundary + AppErrorFallback |
| `src/routes/guards.tsx` | Modified — wrapped Outlet in each guard with ErrorBoundary |
| `src/lib/query-keys.ts` | Created — centralized query key factory |
| `src/hooks/useHomeData.ts` | Rewritten — useState/useEffect → three useQuery calls |
| `src/contexts/HomeDataContext.tsx` | Modified — removed auto-fetch useEffect |
| `src/App.tsx` | Modified — configured QueryClient defaults, added ReactQueryDevtools |
| `src/pages/SessionDetailScreen.tsx` | Modified — useState/useEffect → useQuery |
| `vitest.config.ts` | Created — jsdom, globals, @ alias, setup file |
| `src/test/setup.ts` | Created — jest-dom matchers + ResizeObserver polyfill |
| `src/test/test-utils.tsx` | Created — custom render with QueryClient + MemoryRouter |
| `src/components/ErrorState.test.tsx` | Created — 5 tests |
| `src/lib/workout-api.test.ts` | Created — 10 tests |
| `src/routes/guards.test.tsx` | Created — 9 tests |
| `src/lib/home-data.test.ts` | Created — 4 tests |
| `CLAUDE.md` | Modified — removed Index.tsx constraint, updated SPA architecture note |
| `package.json` | Modified — added test deps + scripts |

#### Status
- Build passes, TypeScript compiles cleanly, 28 tests pass
- PR #7 updated with new commit, pushed to remote
- Code review: 0 critical issues, ready for merge

---

### Session: 2026-03-03 - Session Awareness Hook + Auto-Branching

**Duration:** ~20 min
**Mode:** Claude Code
**Branch:** `feature/session-awareness` → PR #8

#### What Got Done
- **SessionStart hook**: Created `.claude/hooks/session-start-check.sh` that runs when a new Claude Code session opens. Detects uncommitted files, feature branches with unpushed commits, and stashed changes. Outputs a summary so Claude can relay it to the user; silent on clean start.
- **Auto-branching in /execute**: Added Step 2 ("Create Working Branch") to `execute-plan.md` skill. Derives branch name from plan filename (`SESSION_PLAN_auth_refactor.md` → `feature/auth-refactor`), handles three cases (on main, already on target, on different branch), warns about dirty working tree.
- **Documentation updates**: Added hook to `.claude/settings.json`, updated `.claude/README.md` registry (hooks table + file structure), updated `.claude/commands/execute.md` flow summary.

#### Decisions Made
| Decision | Rationale |
|----------|-----------|
| SessionStart hook (not manual check) | Passive awareness — user sees in-progress work automatically without remembering to check |
| Branch derived from plan filename | Consistent naming, no user input needed, easy to match branches back to plans |
| Three-case branch handling (main/target/other) | Covers fresh start, resume, and conflict scenarios without losing work |

#### Files Changed
| File | Action |
|------|--------|
| `.claude/hooks/session-start-check.sh` | Created — SessionStart awareness script |
| `.claude/settings.json` | Modified — added SessionStart hook config |
| `.claude/skills/execute-plan.md` | Modified — added Step 2: Create Working Branch, renumbered steps 3-9 |
| `.claude/commands/execute.md` | Modified — mentioned branch creation in flow |
| `.claude/README.md` | Modified — added hook to registry table and file structure |

#### Status
- PR #8 created on `feature/session-awareness` branch
- Code review passed (0 issues)
- All changes are .claude/ config and documentation — no source code changes

---

### Session: 2026-03-03 - Codebase Streamline

**Duration:** ~2 hours
**Mode:** Claude Code
**Branch:** `feature/codebase-streamline` → PR #7

#### What Got Done
- **TypeScript strict mode**: Enabled `strict: true`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`. Fixed ~14 type errors with proper solutions — zero `as any` or `@ts-ignore` escape hatches
- **Real bug found**: Strict mode surfaced `anchor: 'rest'` in Index.tsx — 'rest' is not a valid `anchor_type` enum, this insert would fail at DB level. Fixed to `'full_body'`
- **Logger standardization**: Replaced all `console.error/log/warn` in hooks and lib files with structured `logger.*` calls. Added ESLint `no-console` rule to prevent regression
- **Supabase call extraction**: Moved direct `supabase.from()` calls from hooks to `lib/workout-api.ts` and `lib/home-data.ts`. Hooks now import zero supabase dependencies
- **God file splits**:
  - `useWorkoutFlow.ts` (297→38 lines) → orchestrator + `useWorkoutGeneration.ts` (199) + `useWorkoutSession.ts` (125)
  - `SettingsScreen.tsx` (757→388 lines) → router + `SettingsHub.tsx` (174) + `LocationSettings.tsx` (194) + `StructureSettings.tsx` (144) + `LimitationsSettings.tsx` (48)
  - `SectionRenderer.tsx` (569→216 lines) → dispatcher + `TimedRenderer.tsx` (330) + `SupersetRenderer.tsx` (27) + `CircuitRenderer.tsx` (27) + `LadderRenderer.tsx` (58)
- **Gallery Museum**: Audited all gallery components for app usage. Moved ActionButton and ActionCard to Museum section. Added CLAUDE.md rule: Museum items must never be used as inspiration for new UI
- **Cleanup**: Removed unused `next-themes` dependency, renamed hook files to camelCase, consolidated duplicate section-type mappings into `lib/section-mapping.ts`, removed unused exports

#### What Came Up (Unexpected)
- Strict mode revealed a real runtime bug (`anchor: 'rest'` invalid enum) — not just type noise
- ActionButton (241 lines of code) was only ever used in ComponentGallery — a full duplicate of CTAButton that was never wired into the actual app

#### Decisions Made
| Decision | Rationale |
|----------|-----------|
| Zero escape hatches for strict mode | Proper type fixes prevent real bugs; `as any` just hides them |
| Keep god files as thin orchestrators after split | Preserves public API — no changes needed in consumers |
| Museum = read-only history, never inspiration | Prevents accidental use of legacy patterns in new UI work |
| Don't delete legacy components | Keep as "where we came from" reference in Museum section |
| ESLint no-console rule (warn level) | Catches regressions without breaking builds; allows `console.warn` |

#### Files Changed
| File | Action |
|------|--------|
| `tsconfig.app.json` | Modified — enabled strict mode and lint flags |
| `src/vite-env.d.ts` | Created — Vite type declarations for `import.meta.env` |
| `src/types/workout.ts` | Modified — added WorkoutParams, WorkoutNotes types |
| `src/types/database.ts` | Regenerated — includes new migrations |
| `src/lib/section-mapping.ts` | Created — consolidated SECTION_TO_DB/DB_TO_SECTION |
| `src/lib/workout-api.ts` | Modified — type fixes, added completeWorkoutSession() |
| `src/lib/home-data.ts` | Modified — type fixes, logger migration, added fetchIncompleteSession() |
| `src/contexts/AuthContext.tsx` | Modified — proper DB types, logger, section-mapping import |
| `src/hooks/useWorkoutFlow.ts` | Modified — thin 38-line orchestrator |
| `src/hooks/useWorkoutGeneration.ts` | Created — generation logic extracted |
| `src/hooks/useWorkoutSession.ts` | Created — session lifecycle extracted |
| `src/hooks/useHomeData.ts` | Modified — uses lib functions, no supabase import |
| `src/hooks/useOnboardingFlow.ts` | Modified — logger migration |
| `src/hooks/useHistoryDetail.ts` | Modified — logger migration |
| `src/hooks/useAppNavigation.ts` | Modified — removed unused export |
| `src/hooks/useMobile.ts` | Renamed from use-mobile.tsx |
| `src/hooks/useToast.ts` | Renamed from use-toast.ts |
| `src/pages/SettingsScreen.tsx` | Modified — router shell (757→388 lines) |
| `src/pages/settings/*.tsx` | Created — 4 sub-screen files |
| `src/components/workout/SectionRenderer.tsx` | Modified — dispatcher (569→216 lines) |
| `src/components/workout/{Timed,Superset,Circuit,Ladder}Renderer.tsx` | Created — 4 renderer files |
| `src/pages/ComponentGallery.tsx` | Modified — moved ActionButton/ActionCard to Museum |
| `CLAUDE.md` | Modified — added Museum rule |
| `eslint.config.js` | Modified — added no-console rule |
| `package.json` | Modified — removed next-themes |

#### Status
- Build passes, types compile cleanly
- PR #7 open for review
- 46 files changed, +2090 / -1375 lines

---

### Session: 2026-02-27 - History System Research & Favorite/Redo Scoping

**Duration:** ~15 min
**Mode:** Claude Code
**Branch:** `main` (no code changes)

#### What Got Done
- Deep-dive research into the history system: what's saved, what's displayed, how generation uses history
- Mapped the full data flow: generation → completion → history display → next generation
- Identified that `buildUserPrompt()` already queries last 5 workouts and injects recent anchors + exercises into the prompt for variation
- Scoped a **Favorite / Redo** feature with two sub-features and key design decisions documented
- Identified dependency: exercise-level logging persistence (existing backlog item) needed before "redo with logged weights" is viable

#### Decisions Made
| Decision | Rationale |
|----------|-----------|
| Add Favorite/Redo to backlog as Medium priority | Not blocking current work; needs design decisions before implementation |
| Two sub-features: Favorite (mark + filter) and Redo (clone vs re-gen) | Different complexity and UX implications — should be evaluated separately |

#### Backlog Additions
- [ ] **Favorite / Redo workout** → Added to BACKLOG.md (Medium priority, Feature)

#### Status
- Research only, no code changes
- Backlog updated with full context for next-week pickup

---

### Session: 2026-02-27 - Spacing Audit & Token Standardization

**Duration:** ~30 min
**Mode:** Claude Code
**Branch:** `feature/spacing-token-standardization` → PR #5, merged

#### What Got Done
- **Tailwind → CSS vars**: Wired Tailwind's spacing scale to existing `--spacing-*` CSS variables in `tailwind.config.ts`. 16 mappings, all verified pixel-equivalent via `scripts/verify-spacing.mjs`
- **Full codebase audit**: Read every component and screen file, cataloged all spacing classes, confirmed most were already on-scale
- **Fixed 5 off-scale values**: All `*-1.5` (6px) instances snapped to nearest token — either `*-1` (4px) or `*-2` (8px)
- **Documentation**: Added spacing token reference table and card padding presets to `memory/ui-rules.md`
- **Verification script**: Created `scripts/verify-spacing.mjs` that mathematically proves all mappings resolve to Tailwind defaults

#### Decisions Made
| Decision | Rationale |
|----------|-----------|
| Map only the 16 values actually in the CSS var scale | Values like 1.5/2.5/7/9 are intentionally excluded — they're off-scale |
| Snap `gap-1.5` → `gap-1` in Chip | 4px more appropriate for tight icon→text gap in small component |
| Snap `space-y-1.5` → `space-y-2` in ActiveExerciseCard | 8px label→input gap is standard form spacing |
| Leave `pb-28` (WorkoutScreen) as-is | Structural nav clearance value, not design system spacing |
| Leave shadcn upstream fractional values (tooltip, badge) | Not our code to maintain; they still resolve via Tailwind defaults |

#### Files Changed
| File | Action |
|------|--------|
| `tailwind.config.ts` | Modified — added `spacing` mapping in `theme.extend` |
| `scripts/verify-spacing.mjs` | Created — verification script |
| `src/components/workout/ActiveExerciseCard.tsx` | Modified — `space-y-1.5` → `space-y-2` (2 instances) |
| `src/components/Chip.tsx` | Modified — `gap-1.5` → `gap-1` |
| `src/components/ExerciseCard.tsx` | Modified — `px-1.5` → `px-1` |
| `src/components/workout/LadderRungs.tsx` | Modified — `py-1.5` → `py-2` |
| `src/components/ui/card.tsx` | Modified — `space-y-1.5` → `space-y-2` |

#### Status
- PR #5 merged to main
- TypeScript clean, build clean, verification script passes

---

### Session: 2026-02-27 - Extract System Prompt to Separate File

**Duration:** ~15 min
**Mode:** Claude Code
**Branch:** `feature/extract-prompt-file` → PR #4

#### What Got Done
- Extracted the workout generation system prompt from inline in `index.ts` to its own `prompt.ts` file
- Handler now imports `SYSTEM_PROMPT` from `./prompt.ts` — no functional changes
- Fixed git safety hook bug: `-f` flag regex was matching `-f` substrings in branch names (e.g. `feature/extract-prompt-file`)

#### Decisions Made
| Decision | Rationale |
|----------|-----------|
| Separate prompt.ts file | Enables prompt iteration without touching handler/validation logic |
| Keep output schema in prompt (not generated from types) | Simpler for now; noted as future improvement for type-prompt sync |

#### Files Changed
| File | Action |
|------|--------|
| `supabase/functions/generate-workout/prompt.ts` | Created — system prompt as exported const |
| `supabase/functions/generate-workout/index.ts` | Modified — removed inline prompt, added import |
| `.claude/hooks/git-safety-check.sh` | Modified — fixed `-f` regex false positive on branch names |

#### Status
- PR #4 created, ready for merge
- No functional changes — same prompt content, just relocated

---

### Session: 2026-02-27 - Generation Screen Duration & Notes Redesign

**Duration:** ~30 min
**Mode:** Claude Code
**Branch:** `feature/generation-screen-duration-notes-redesign` → PR #3

#### What Got Done
- **DurationSelector**: Rewrote Duration from plain Input into Card-wrapped radio button presets (15/30/45/60) with full-width Custom button on second row
- **NotesField**: Wrapped Textarea in Card with card-label styled heading
- **Custom duration validation**: Numbers-only input (strips non-digits), 5–120 range validation on blur with toast, generate button disabled until valid value entered
- **Default duration**: Set to 45 min on screen load
- **Label consistency**: Updated Intensity Level, Focus Area, Location labels from `--text-paragraph` to `--text-card-label` color token across all generation screen sections
- **Code review**: Caught redundant `font-bold` (already in `.text-label-xs` utility), removed from all labels

#### What Came Up (Unexpected)
- RadioButton row of 5 overflowed card on mobile — "CUSTOM" text at 14px bold couldn't fit in equal-width flex distribution. Fixed by moving Custom to its own full-width row below the 4 presets.

#### Decisions Made
| Decision | Rationale |
|----------|-----------|
| 4 presets in row + Custom stacked below | 5 equal-width RadioButtons overflow on mobile; stacking Custom gives it full width |
| Generate blocked when custom selected without valid value | User requirement — empty custom duration shouldn't allow workout generation |
| Numbers-only input with digit stripping | Prevents invalid input at keystroke level rather than just on blur |
| No `font-bold` on labels | `.text-label-xs` already includes `font-weight: 700` — redundant class |

#### Files Changed
| File | Action |
|------|--------|
| `src/components/OptionalFields.tsx` | Rewritten — DurationSelector + NotesField sub-components with Card wrapping |
| `src/pages/GenerationScreen.tsx` | Modified — default time "45", canGenerate requires time !== "" |
| `src/components/IntensitySlider.tsx` | Modified — label color to --text-card-label |
| `src/components/AnchorGrid.tsx` | Modified — label color to --text-card-label |
| `src/components/LocationAccordion.tsx` | Modified — label color to --text-card-label |

#### Status
- TypeScript compiles clean, build passes
- PR #3 created, ready for merge

---

### Session: 2026-02-26 - Workout Structure Clarity

**Duration:** ~3 hours
**Mode:** Claude Code
**Branch:** `feature/workout-structure-clarity` → merged to `main` via PR #2

#### What Got Done
- **EMOM**: Minute tracking with active/inactive exercise highlighting, ODD/EVEN MIN labels, minute indicator color matches warning state
- **AMRAP**: Round stepper completion UI with ChamferedFrame +/- buttons, "Each Round:" label for multi-exercise sections, partial round notes
- **Ladder (For Time)**: Rung detection from rep patterns (`isLadderReps`, `parseRungs`), plain text display during workout, interactive chamfered frame display on cap reached, two completion paths (finished early vs cap reached), "Each Rung:" label, cross-structure support for non-timed sections
- **Superset**: A1/A2 pairing labels, vertical connector line (flex-based for trimmed alignment), consolidated rest display ("Rest: 90s after both"), horizontal dividers removed
- **Circuit**: Numbered exercises (1. 2. 3.), "Each Round:" label, consolidated rest ("60s rest between rounds"), dividers removed
- **All cards**: Compact collapsed state (sets×reps format), tempo/rest moved to expanded only, weighted equipment whitelist (replaces bodyweight blacklist), Rest:0s suppression globally, consistent top/bottom card padding (pb-3 on all exercise wrappers)
- **Layout**: Removed h1 section heading, subtitle changed to "ANCHOR • INTENSITY", card labels show "TYPE • MODIFIER" (fixed duplication bug with section.type vs section.name)
- **Warmup/Mobility/Cooldown**: All exercises wrapped in single card with section label, dividers with breathing room (my-1)
- **Standalone exercises**: Wrapped in card with section label, single exercise defaults expanded
- **Timer**: Countup auto-complete at cap, updateState callback ordering fix (temporal dead zone)
- **Progress bar**: 2px border weight to match cards, border-box sizing fix
- **Spacing polish**: Iterative spacing refinements across all card types based on annotated screenshots

#### What Came Up (Unexpected)
- Two temporal dead zone bugs: `useCallback` declarations referenced before initialization crashed the app with blank screens. Pattern documented in memory.
- `section.name` included structure type causing duplicate labels ("Primary Superset • Superset"). Fixed by using `section.type` instead.
- Progress bar used `content-box` sizing, making it 6px wider than cards. Switching to border-box with adjusted height fixed it.
- Bottom card padding required more space than top to look visually equal due to text size/line-height differences between label text and exercise text.

#### Decisions Made
| Decision | Rationale |
|----------|-----------|
| Weighted equipment whitelist (not bodyweight blacklist) | More future-proof — new equipment types default to no weight field |
| Ladder detection via rep pattern, not structure type | Ladders can appear in any section type (standard, circuit, accessory, core) |
| Two ladder completion paths (finished early vs cap reached) | Different UX needs: early finish = all rungs done, cap reached = select highest rung |
| Vertical connector as flex sibling (not border-l) | Allows trimming line to align with exercise text content |
| pb-3 on all exercise wrappers | Visually balances bottom padding with pt-3 top label padding across all card types |

#### Files Changed
| File | Action |
|------|--------|
| `src/components/workout/LadderRungs.tsx` | Created — ladder rung display (text + interactive modes) |
| `src/components/workout/ActiveExerciseCard.tsx` | Modified — compact collapsed state, pairLabel, hideReps, defaultExpanded, bare padding, hasRest/formatPrescription helpers |
| `src/components/workout/SectionRenderer.tsx` | Modified — major overhaul: timed section content, ladder detection, AMRAP completion, section wrapping, card labels, spacing |
| `src/components/workout/SectionTimer.tsx` | Modified — countup auto-complete, callback ordering fix, hideControls prop |
| `src/components/workout/StructureCards.tsx` | Modified — superset connector, A1/A2 labels, circuit numbering, consolidated rest, dividers removed |
| `src/components/workout/ProgressTracker.tsx` | Modified — 2px border, border-box sizing |
| `src/pages/WorkoutScreen.tsx` | Modified — removed h1 heading, anchor•intensity subtitle |
| `src/types/workout.ts` | Modified — added is_interval_exercise field |
| `docs/specs/Clear_-_Structure_Types_Spec.md` | Modified — ladder_fixed_interval rep scheme |
| `docs/specs/Clear_-_Workout_Generation_Prompt_v2.md` | Modified — ladder_fixed_interval rep scheme |
| `supabase/functions/generate-workout/index.ts` | Modified — ladder_fixed_interval rep scheme |

#### Status
- TypeScript compiles clean, build passes
- Merged to main via PR #2, branch deleted
- Remaining: superset connector horizontal spacing needs fine-tuning (cosmetic)

---

### Session: 2026-02-25 - Auth Session Management

**Duration:** ~45 min
**Mode:** Claude Code
**Branch:** `feature/auth-session-management` (off `main`)

#### What Got Done
- Added "Stay logged in" checkbox to sign-in form (defaults to checked)
  - Custom storage adapter (`src/lib/auth-storage.ts`) delegates to localStorage or sessionStorage based on preference
  - Wired into Supabase client via `auth.storage` option
- Added sign out button to Settings hub with confirmation modal
  - Reusable `Checkbox` component (`src/components/Checkbox.tsx`) using ChamferedFrame design system
  - `SignOutConfirmModal` component following AbandonmentModal pattern
  - Sign out clears session preference so next login defaults to "stay logged in"
- Created reusable `Checkbox` component matching chamfered design system (green checked, orange unchecked)

#### What Came Up (Unexpected)
- Initial implementation used native `<input type="checkbox">` — replaced with ChamferedFrame-based Checkbox to match design system after user feedback
- Pre-existing uncommitted changes from `feature/workout-card-overhaul` carried over when branching — kept separate, only auth files staged

#### Decisions Made
| Decision | Rationale |
|----------|-----------|
| Custom storage adapter (not recreating Supabase client) | Adapter reads preference flag dynamically per call, so singleton client works unchanged |
| Preference flag always in localStorage | Must survive browser close so adapter knows which storage to read on reload |
| Clear preference on sign out | Next sign-in defaults to "stay logged in" checked — user makes fresh choice each time |
| Reusable Checkbox component | User requested it for future use; follows RadioButton pattern with ChamferedFrame |

#### Files Changed
| File | Action |
|------|--------|
| `src/lib/auth-storage.ts` | Created — storage adapter + preference helpers |
| `src/lib/supabase.ts` | Modified — pass adapter to createClient |
| `src/components/Checkbox.tsx` | Created — reusable chamfered checkbox |
| `src/components/SignOutConfirmModal.tsx` | Created — confirmation modal |
| `src/pages/SignInScreen.tsx` | Modified — added checkbox + wired preference |
| `src/pages/SettingsScreen.tsx` | Modified — added onSignOut prop + button + modal |
| `src/pages/Index.tsx` | Modified — pass signOut to SettingsScreen |
| `src/contexts/AuthContext.tsx` | Modified — clear preference on sign out |

#### Status
- TypeScript compiles clean, build passes
- Not yet committed — ready for review and PR

---

### Session: 2026-02-19 - Auth Deadlock Fix

**Duration:** ~30 min
**Mode:** Claude Code

#### What Got Done
- Diagnosed and fixed auth initialization deadlock causing infinite spinner on app load
- Root cause: circular `await` between supabase-js `initializePromise` and `onAuthStateChange` callback
- Fix: 6-line addition to skip `onAuthStateChange` handler during initialization (`initializingRef.current` check)

#### What Came Up (Unexpected)
- `supabase.from()` internally calls `auth.getSession()` to get the Bearer token — this hidden dependency created a circular await that was invisible at the application level
- The 8s timeout added in the previous auth stabilization session was masking the real issue (deadlock, not slow network)
- Auth service responded in <5ms via curl, confirming the hang was entirely client-side

#### Decisions Made
| Decision | Rationale |
|----------|-----------|
| Skip `onAuthStateChange` during init, let `initialize()` handle it | Breaks the deadlock with minimal code change; `initialize()` already fetches profile after `getSession()` |
| Keep the 8s timeout as safety net | Still useful for genuine network issues even though the deadlock was the primary cause |

#### Technical Notes
```
Deadlock chain:
  initializePromise
    → _notifyAllSubscribers('SIGNED_IN')  [awaits callbacks]
      → onAuthStateChange callback
        → fetchUserData()
          → supabase.from('profiles').select()
            → _getAccessToken()
              → auth.getSession()
                → await initializePromise  ← CIRCULAR

Fix: check initializingRef.current at top of SIGNED_IN/TOKEN_REFRESHED handler.
During init, callback is a no-op. initialize() handles initial profile fetch.
Post-init, callback works normally (initializePromise already resolved).

File: src/contexts/AuthContext.tsx (lines 331-340)
```

---

### Session: 2026-02-12 - UI Cleanup: RadioButton & Card Standardization

**Duration:** ~45 min
**Mode:** Claude Code

#### What Got Done
- Fixed RadioButton layout issue (button wasn't flex container, so ChamferedFrame didn't fill height)
- Standardized all RadioButton stack gaps to gap-2 (8px)
- Added accent bar to Focus Area card (AnchorGrid)
- Fixed Location Type padding in OnboardingScreen
- Refactored SettingsScreen: wrapped sections in Cards, used RadioButton for equipment/goal/locations
- Hidden Experience Level from settings UI
- Wrapped sign-up/log-in inputs in Card containers (not individual ChamferedFrames)
- Added chamfered corners to Input and Textarea components
- Fixed Streak card width overflow (flex → grid layout)
- Made settings card titles uppercase
- Wrapped Limitations textarea in Card
- Migrated 6 components from shadcn Card to chamfered Card (EmptyState, ErrorState, WorkoutSectionCard, NoteModal, ActiveExerciseCard, AbandonmentModal)
- Changed RadioButton font from text-label-md (16px) to text-label-sm (14px)
- Updated chamfered-component.md skill docs with "Container Pattern" section

#### Files Modified
- `src/components/RadioButton.tsx` — Fixed flex layout, added onEdit prop, smaller font
- `src/components/AnchorGrid.tsx` — Added accent bar, gap-2
- `src/components/LocationAccordion.tsx` — gap-2
- `src/components/ui/input.tsx` — Chamfered corners
- `src/components/ui/textarea.tsx` — Chamfered corners
- `src/pages/SettingsScreen.tsx` — Card wrappers, RadioButtons, uppercase titles, gap-2
- `src/pages/OnboardingScreen.tsx` — Padding fix, gap-2
- `src/pages/SignInScreen.tsx` — Card container for inputs
- `src/pages/CreateAccountScreen.tsx` — Card container for inputs
- `src/pages/HomeScreen.tsx` — Streak card grid fix
- `src/components/EmptyState.tsx` — Chamfered Card migration
- `src/components/ErrorState.tsx` — Chamfered Card migration
- `src/components/workout/WorkoutSectionCard.tsx` — Chamfered Card migration
- `src/components/workout/NoteModal.tsx` — Chamfered Card migration
- `src/components/workout/ActiveExerciseCard.tsx` — Chamfered Card migration
- `src/components/workout/AbandonmentModal.tsx` — Chamfered Card migration
- `.claude/skills/chamfered-component.md` — Container pattern docs

#### Decisions Made
| Decision | Rationale |
|----------|-----------|
| Button needs `display: flex` for child to stretch | `h-full` on child doesn't work with inline-block parent |
| gap-2 (8px) for RadioButton stacks | Consistent spacing across all selection lists |
| Container pattern (single Card wrapping multiple inputs) | Better visual grouping than individual ChamferedFrames |

#### Technical Notes
```
RadioButton fix:
  Before: button (inline-block) > ChamferedFrame (h-full) — doesn't stretch
  After:  button (flex) > ChamferedFrame (flex-1) — fills container

RadioButton stacks updated in:
  - LocationAccordion, AnchorGrid, OnboardingScreen, SettingsScreen (3 places)
```

---

### Session: 2026-02-10 - Auth System Refactor

**Duration:** ~30 min
**Mode:** Claude Code

#### What Got Done
- Created unified `AuthContext` to replace fragmented auth hooks
- Eliminated 3-4x redundant profile fetches on app init (now fetched once)
- Replaced ambiguous `onboardingComplete: boolean | null` with explicit `status: 'loading' | 'unauthenticated' | 'authenticated'`
- Simplified `useHomeData` to only fetch history/streak (no more profile fetching)
- Simplified `useOnboardingFlow` to use `AuthContext.completeOnboarding`
- Updated `Index.tsx` navigation to use clean status-based routing
- Deleted `useAuth.ts` and `usePreferencesSync.ts` (merged into AuthContext)
- Removed AbortError workaround from `supabase.ts` (no longer needed)

#### Files Created
- `src/contexts/AuthContext.tsx` — Single source of truth for auth state

#### Files Modified
- `src/main.tsx` — Wrapped app with AuthProvider
- `src/hooks/useHomeData.ts` — Removed preferences, added mounted checks
- `src/hooks/useOnboardingFlow.ts` — Uses AuthContext instead of direct Supabase
- `src/pages/Index.tsx` — Uses AuthContext, cleaner navigation logic
- `src/lib/supabase.ts` — Removed AbortError workaround

#### Files Deleted
- `src/hooks/useAuth.ts` — Replaced by AuthContext
- `src/hooks/usePreferencesSync.ts` — Merged into AuthContext

#### Decisions Made
| Decision | Rationale |
|----------|-----------|
| Single AuthContext vs multiple hooks | Eliminates race conditions, single source of truth |
| Explicit status enum vs boolean flags | Clearer state transitions, no ambiguous null states |
| Profile + locations fetched together | Reduces roundtrips, ensures consistency |

#### Technical Notes
```
New auth flow:
  AuthProvider → getSession() → fetchUserData() → setState()
                 ↓
  onAuthStateChange → fetchUserData() → setState()

Profile fetched exactly once per auth event.
useHomeData only handles workout history + streak.
```

---

### Session: [Date] - [Brief Title]

**Duration:** [Approx time]  
**Mode:** Claude.ai / Claude Code / Both

#### What Got Done
- [Accomplishment 1]
- [Accomplishment 2]

#### What Came Up (Unexpected)
- [Issue or idea that surfaced]
- [Another thing]

#### Decisions Made
| Decision | Rationale |
|----------|-----------|
| [Decision] | [Why] |

#### Backlog Additions
- [ ] [Item to address later] → Added to BACKLOG.md
- [ ] [Another item]

#### Technical Notes
```
[Code snippets, commands, or technical details worth remembering]
```

#### Next Session Starts With
- [ ] [First thing to do]
- [ ] [Second thing]

---

### Session: [Date] - [Brief Title]

[Repeat structure]

---

## Decision Archive

Major decisions that shape the project (pulled from sessions for easy reference):

| Date | Decision | Rationale | Impact |
|------|----------|-----------|--------|
| [Date] | [Decision] | [Why] | [What it affects] |
| | | | |

---

## Pivot Log

Significant direction changes:

### Pivot: [Date] - [Title]
**Original Plan:** [What we were going to do]  
**New Direction:** [What we're doing instead]  
**Why:** [What prompted the change]  
**Impact:** [What needed to change as a result]

---

## Learnings Archive

Insights worth remembering for this or future projects:

### [Topic]
**Learned:** [Date]  
**Insight:** [What we learned]  
**Application:** [How to use this knowledge]

---

## Session Templates

### Copy-Paste for New Session Entry

```markdown
### Session: [DATE] - [TITLE]

**Duration:** 
**Mode:** Claude.ai / Claude Code / Both

#### What Got Done
- 

#### What Came Up (Unexpected)
- 

#### Decisions Made
| Decision | Rationale |
|----------|-----------|

#### Backlog Additions
- [ ] 

#### Technical Notes
```
[notes]
```

#### Next Session Starts With
- [ ] 
```

---

### Phase Checkpoint Template

```markdown
## Phase Checkpoint - [Phase Name] - [Date]

### Phase Goal
[What this phase was supposed to accomplish]

### Achieved: Yes / Partial / No

### What Worked Well
- 

### What Didn't Work
- 

### Scope Changes from Original Plan
- 

### Technical Debt Created
- 

### Ready for Next Phase: Yes / No

### Blockers (if not ready)
- 
```

---

### Pivot Checkpoint Template

```markdown
## Pivot Checkpoint - [Date]

### Original Plan
[What we were going to do]

### New Direction
[What we're doing instead]

### Why the Change
[What prompted this]

### What This Affects
- Documents to update:
- Code to refactor:
- Timeline impact:

### Validated: Yes / No
```

---

## Checkpoint Reminders

**At end of every session, ask:**
1. What got done?
2. What came up that we didn't expect?
3. Any decisions to record?
4. Anything for the backlog?
5. What should next session start with?

**Don't skip this.** Future you will thank present you.

---

*Log started: [Date]*
- 2026-02-02: Phase 1: Extracted useAuth hook from Index.tsx
