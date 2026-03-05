# Session Log
**Project:** [Name]  
**Started:** [Date]  
**Last Session:** 2026-03-05 (9th session)

---

## Purpose
Living document to capture progress, decisions, and learnings across sessions. This is your paper trail—the thing that lets you pick up weeks later without losing context.

**Update this:** At the end of EVERY session (Claude.ai or Claude Code)

---

## Quick Status
**Current Phase:** Optimization — generation speed, DB constraint fix
**Current Task:** Complete — coaching cues removed, section type constraint dropped
**Last Completed:** Coaching cues output reduction, duplicate section type constraint fix, generation speed plan evaluation
**Blocking Issues:** None — changes on main, need commit + PR

---

## Session Entries

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
