# Backlog
**Project:** Clear App (5-3-1 Workout Generator)
**Last Updated:** 2026-03-03

---

## Purpose
Capture everything that comes up during work that isn't being addressed immediately. This prevents good ideas and necessary fixes from getting lost in the flow.

**Update this:** Continuously, whenever something surfaces

---

## How to Use This Doc

### When to Add Items
- During implementation: "This would be nice but not now"
- During review: "We should fix this eventually"
- During planning: "Future feature idea"
- After user feedback: "They want X"
- Anytime: "I just thought of something"

### Item Format
```
- [ ] **[Title]** - [Brief description]
  - Priority: High / Medium / Low
  - Type: Bug / Enhancement / Feature / Tech Debt / Idea
  - Added: [Date]
  - Context: [Why this matters, where it came from]
```

---

## Active Backlog

### High Priority
Items that should be addressed soon, possibly before V1.

- [x] **Auth System Refactor** - Single AuthContext replaces multi-hook auth system
  - Priority: High
  - Type: Tech Debt
  - Added: 2026-02-10
  - Completed: 2026-02-10
  - Context: Profile was fetched 3-4 times on init. Multiple hooks (useAuth, usePreferencesSync, useHomeData) independently managed auth state causing race conditions. Fixed with unified AuthContext. Index.tsx reduced from 280 to cleaner status-based navigation.

- [x] **Refactor Index.tsx** - Extract auth state into React Context, then replace entirely with react-router-dom
  - Priority: High
  - Type: Tech Debt
  - Added: 2026-02-02
  - Completed: 2026-03-03
  - Context: Phase 1 (2026-02-10): AuthContext replaced multi-hook auth. Phase 2 (2026-03-03): Index.tsx fully deleted, replaced by App.tsx routes + auth guards (ProtectedRoute, PublicOnlyRoute, OnboardingRoute).

---

### Medium Priority
Important but not blocking. Address after core features complete.

- [ ] **Data persistence for exercise logging** - Weight/reps/notes entered during workout not saved to DB
  - Priority: Medium
  - Type: Feature
  - Added: 2026-02-19
  - Context: ActiveExerciseCard has inputs and onLog callbacks but data never persists to Supabase

- [ ] **Timed intervals type gap** - `timed` structure (work_seconds/rest_seconds) missing from workout.ts ExerciseStructure
  - Priority: Medium
  - Type: Bug
  - Added: 2026-02-19
  - Context: Type exists in generation.ts but not workout.ts. SectionRenderer doesn't handle it. Timed intervals won't render properly

- [ ] **Circuit auto-progress** - Circuits require manual checkbox tapping per exercise
  - Priority: Medium
  - Type: Enhancement
  - Added: 2026-02-19
  - Context: Should auto-advance to next exercise when one is completed, with round tracking. Current UX is too disruptive during circuit training

- [x] **EMOM/AMRAP/ForTime distinct UX** - Each timed section type should have unique interaction patterns
  - Priority: Medium
  - Type: Enhancement
  - Added: 2026-02-19
  - Completed: 2026-02-26
  - Context: EMOM: minute tracking + active/inactive highlighting + ODD/EVEN MIN labels. AMRAP: round stepper + partial notes. ForTime: countup auto-complete at cap + ladder detection with two completion paths.

---

### Low Priority
Nice to have. Address when time permits or for future versions.

- [ ] **Superset connector spacing** - Horizontal gap between vertical connector line and exercise text needs fine-tuning
  - Priority: Low
  - Type: Enhancement
  - Added: 2026-02-26
  - Context: ml-4 + pl-2 still feels off. Needs design review for the right balance between card edge → line → text.

- [ ] **Section Notes (per-section)** - Revisit ADD SECTION NOTE feature for workout sections
  - Priority: Low
  - Type: Feature
  - Added: 2026-02-25
  - Context: Hidden for now from WorkoutScreen. NoteModal component still exists. May want per-section notes separate from per-exercise notes. Revisit when exercise notes UX is settled.

---

## By Type

### 🐛 Bugs
Known issues that need fixing.

- [ ] 

---

### ✨ Enhancements
Improvements to existing features.

- [ ] 

---

### 🚀 Features
New functionality to build.

- [ ] 

---

### 🔧 Tech Debt
Code quality, refactoring, cleanup.

- [x] **Codebase streamline** - TypeScript strict mode, logger standardization, god file splits, dependency cleanup, error boundaries, React Query, test infra (PR #7)
- [x] **Refactor Index.tsx** - Replaced by react-router-dom routes + auth guards. Index.tsx deleted. (Completed 2026-03-03)

---

### 💡 Ideas
Things to explore, not committed.

- [ ] 

---

## Completed Items
Move items here when done (for reference).

- [x] **[Title]** - [Description]
  - Completed: [Date]
  - Notes: [Any relevant notes]

---

## Discarded Items
Items we decided not to do (and why).

- ~~**[Title]**~~ - [Description]
  - Discarded: [Date]
  - Reason: [Why we're not doing this]

---

## Quick Add Section
Dump items here quickly, organize later.

- [ ] 
- [ ] 
- [ ] 

---

## Checkpoint Prompt
When reviewing backlog:
1. Any quick wins that should just get done?
2. Any high priority items blocking progress?
3. Any items that are no longer relevant?
4. Any items that should be promoted/demoted in priority?

When adding items:
1. Is this actually worth tracking, or just noise?
2. What's the right priority level?
3. Is there enough context for future-me to understand?

---

*Backlog started: [Date]*
