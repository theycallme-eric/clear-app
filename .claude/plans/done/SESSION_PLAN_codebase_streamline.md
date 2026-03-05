# Session Plan: Codebase Streamline & Best Practices

## Session Goal
Improve codebase quality, consistency, and maintainability — prioritized by impact. Make future sessions faster and less error-prone for both human and AI work.

## Context
- Based on a 5-part codebase audit (dead code, type safety, CSS tokens, dependencies, patterns)
- Overall grade: A- — no critical issues, but meaningful improvements available
- **Do NOT delete intentional placeholders** — type guards, mock generators, and logger utilities may have been left for future use. Flag them in comments instead of removing.
- **Orphaned design tokens are intentional** — sourced from Figma, kept for completeness. Leave them.
- **Visual/UI changes require user collaboration** — never make visual decisions autonomously.

---

## Phase 1: TypeScript Strict Mode (Highest Impact — Autonomous)

**Why:** With `strict: false`, TypeScript misses null bugs, implicit `any`, and dead code. This is the single biggest quality lever — it protects every future change.

**Mode: Autonomous (no visual impact)**

### Task 1.1: Assess strict mode error count
- Enable `strict: true` in `tsconfig.app.json`
- Run `npx tsc --noEmit` and capture the full error list
- Categorize errors: null checks, implicit any, unused vars, other
- Report the count and categories to the user before fixing

### Task 1.2: Fix strict mode errors incrementally
- Fix errors file by file, starting with `src/types/` and `src/lib/` (no UI risk)
- For `Record<string, any>` in WorkoutScreen.tsx → define proper `LoggedExerciseData` interface
- For `Record<string, any>` in AuthContext.tsx → type the update object properly
- For `loc: any` in AuthContext.tsx → use database location type
- **Do NOT change any component rendering or visual output**

### Task 1.3: Enable lint guards
- Enable `noUnusedLocals: true` and `noUnusedParameters: true` in `tsconfig.app.json`
- Fix any new errors this surfaces (prefix unused params with `_` where intentional)

### Acceptance Criteria
- [ ] `npx tsc --noEmit` passes with `strict: true`
- [ ] Zero `any` types in AuthContext.tsx and WorkoutScreen.tsx
- [ ] No visual changes to any component
- [ ] Build passes: `npm run build`

---

## Phase 2: Logger & Error Handling Standardization (High Impact — Autonomous)

**Why:** Half the codebase uses the structured `logger` utility, half uses raw `console.error`. This means broken breadcrumb trails when debugging.

**Mode: Autonomous (no visual impact)**

### Task 2.1: Replace console.error with logger in data/hook files
Files to update:
- `src/lib/home-data.ts` → use `logger.data`
- `src/hooks/useHomeData.ts` → use `logger.data`
- `src/hooks/useWorkoutFlow.ts` → use `logger.workout`
- `src/hooks/useOnboardingFlow.ts` → use `logger.api`
- `src/hooks/useHistoryDetail.ts` → use `logger.data`
- `src/pages/CreateAccountScreen.tsx` → use `logger.auth`

### Task 2.2: Remove debug console.log statements
- Remove the 7 `console.log` calls in `useWorkoutFlow.ts` (lines 95, 124, 128, 132, 141, 208)
- These are debug statements, not error handling

### Task 2.3: Add eslint rule to prevent regression
- Add `no-console: ["warn", { allow: ["warn"] }]` rule to `eslint.config.js`
- This catches future raw console usage at lint time

### Acceptance Criteria
- [ ] Zero raw `console.error` or `console.log` calls in src/lib/ and src/hooks/
- [ ] All error logging uses `logger.*` categories
- [ ] ESLint warns on new console usage
- [ ] No behavior changes — same errors are still caught and reported to users

---

## Phase 3: Supabase Call Extraction (High Impact — Autonomous)

**Why:** `useWorkoutFlow.ts` calls Supabase directly while the rest of the codebase goes through `src/lib/`. If the DB schema changes, this is a hidden place that gets missed.

**Mode: Autonomous (no visual impact)**

### Task 3.1: Extract session management to workout-api.ts
Move these operations from `useWorkoutFlow.ts` to `src/lib/workout-api.ts`:
- Session completion update (`supabase.from('workout_sessions').update(...)`)
- Any other direct Supabase calls in the hook

Create typed functions:
```typescript
export async function completeWorkoutSession(
  sessionId: string,
  data: { completed_at: string; duration_mins: number; mood?: string; session_notes?: string }
): Promise<{ error?: string }>
```

### Task 3.2: Update useWorkoutFlow to use lib functions
- Replace direct Supabase calls with imported functions
- Keep toast notifications in the hook (those are UI concerns, not data concerns)

### Acceptance Criteria
- [ ] Zero `supabase.from()` calls in src/hooks/
- [ ] All database operations go through src/lib/
- [ ] Existing workout flow behavior unchanged
- [ ] Build passes

---

## Phase 4: God File Splits (Medium-High Impact — Autonomous)

**Why:** 757-line SettingsScreen, 569-line SectionRenderer, and 298-line useWorkoutFlow mean every change in these areas risks touching unrelated code. Splitting them makes future work faster and safer.

**Mode: Autonomous (no visual impact — pure structural refactor)**

### Task 4.1: Split useWorkoutFlow.ts
Extract into focused hooks:
- `useWorkoutGeneration.ts` — generation params, API call, transformation
- `useWorkoutSession.ts` — session lifecycle (create, complete, resume)
- Keep `useWorkoutFlow.ts` as the orchestrator that composes these hooks

### Task 4.2: Split SettingsScreen.tsx
Extract views into separate components:
- `SettingsHub.tsx` — main settings menu
- `LocationSettings.tsx` — location CRUD (add/edit/delete)
- `StructureSettings.tsx` — workout section selection
- `LimitationsSettings.tsx` — limitations input
- Keep `SettingsScreen.tsx` as the router/shell

### Task 4.3: Split SectionRenderer.tsx
Extract structure-specific renderers:
- `TimedRenderer.tsx` — EMOM/AMRAP/For Time
- `SupersetRenderer.tsx`
- `CircuitRenderer.tsx`
- `LadderRenderer.tsx`
- Keep `SectionRenderer.tsx` as the dispatcher

### Acceptance Criteria
- [ ] No file over 300 lines (except auto-generated types and ComponentGallery)
- [ ] All existing functionality preserved — zero visual changes
- [ ] Build passes, TypeScript compiles
- [ ] Import chain is clean (no circular dependencies)

---

## Phase 5: Button Consolidation (Medium Impact — HANDS-ON WITH USER)

**Why:** ActionButton and CTAButton serve similar purposes with different implementations. This creates ambiguity for every future UI decision.

**Mode: Collaborative — requires user input on visual decisions**

### Task 5.1: Audit current usage (autonomous prep)
- Map every import of ActionButton and CTAButton across the codebase
- Document where each is used and what visual variant it represents
- Present findings to user

### Task 5.2: Design the consolidated component (with user)
- User decides: which visual language is canonical?
- User decides: are there cases where both are needed, or should one fully replace the other?
- User reviews any visual changes before they ship

### Task 5.3: Implement consolidation (with user review)
- Refactor per user decisions
- User approves each visual change

### Acceptance Criteria
- [ ] Clear single button component (or documented reason for two)
- [ ] All visual changes approved by user
- [ ] No ambiguity about which component to use in future work

---

## Phase 6: Cleanup & Guard Rails (Low-Medium Impact — Autonomous)

### Task 6.1: Remove unused dependencies
- Remove `next-themes` from package.json
- Evaluate `@tanstack/react-query` — either remove or flag for future adoption discussion

### Task 6.2: Rename inconsistent hook files
- `use-mobile.tsx` → `useMobile.ts`
- `use-toast.ts` → `useToast.ts`
- Update all imports

### Task 6.3: Consolidate section-type mapping
- Extract `SECTION_TO_DB` / `DB_TO_SECTION` from AuthContext.tsx to a shared utility
- Import from both AuthContext and anywhere else that needs it

### Task 6.4: Remove `setCurrentScreen` export from useAppNavigation
- Force all navigation through `navigateTo()` API

### Acceptance Criteria
- [ ] No unused dependencies in package.json
- [ ] Consistent hook file naming (camelCase)
- [ ] Single source of truth for section-type mappings
- [ ] Build passes

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Strict mode surfaces many errors | High | Low (no runtime change) | Assess count first (Task 1.1), fix incrementally |
| God file splits introduce re-render bugs | Low-Medium | Medium | Test behavior before/after, keep state boundaries clean |
| Hook extraction breaks workout flow | Low | High | Test full workout generation → completion flow after changes |
| Button consolidation breaks visual design | Medium | High | **User reviews all visual changes** — nothing ships without approval |

---

## Notes
- **Intentional placeholders to preserve:** Type guards in generation.ts, mock generators in workout.ts, unused logger functions — these were scaffolded for future use. Do not delete.
- **Orphaned design tokens:** Intentionally sourced from Figma. Leave them.
- **Phase 5 is blocked on user availability** — do not proceed without collaboration.
- Phases 1-4 and 6 can be executed autonomously in any order, though the numbered order is recommended (strict mode protects subsequent work).
