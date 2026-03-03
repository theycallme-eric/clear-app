# Session Log
**Project:** [Name]  
**Started:** [Date]  
**Last Session:** 2026-02-27

---

## Purpose
Living document to capture progress, decisions, and learnings across sessions. This is your paper trail—the thing that lets you pick up weeks later without losing context.

**Update this:** At the end of EVERY session (Claude.ai or Claude Code)

---

## Quick Status
**Current Phase:** Design System Hardening
**Current Task:** Complete
**Last Completed:** History system research & favorite/redo feature scoping
**Blocking Issues:** Superset connector horizontal spacing needs fine-tuning (cosmetic)

---

## Session Entries

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
