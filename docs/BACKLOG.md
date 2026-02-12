# Backlog
**Project:** Clear App (5-3-1 Workout Generator)
**Last Updated:** 2026-02-02

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

- [x] **Refactor Index.tsx** - Extract auth state into React Context
  - Priority: High
  - Type: Tech Debt
  - Added: 2026-02-02
  - Completed: 2026-02-10
  - Context: Index.tsx now uses AuthContext for auth state. Auth-related useEffects simplified to single status-based navigation. Remaining: could still extract more screen-specific logic, but auth/profile handling is now clean.

---

### Medium Priority
Important but not blocking. Address after core features complete.

- [ ] **[Title]** - [Description]
  - Priority: Medium
  - Type: [Type]
  - Added: [Date]
  - Context: [Context]

---

### Low Priority
Nice to have. Address when time permits or for future versions.

- [ ] **[Title]** - [Description]
  - Priority: Low
  - Type: [Type]
  - Added: [Date]
  - Context: [Context]

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

- [ ] **Exercise Intensity/Load Field** - Add "heavy", "moderate", "light" field to Exercise type
  - Priority: Medium
  - Type: Feature
  - Added: 2026-02-12
  - Context: Figma designs show "heavy" chips on exercise cards. Need to add this field to Exercise interface in workout.ts, update API/generation to include intensity data, and add visual display to exercise cards. Part of workout card experience overhaul. 

---

### 🔧 Tech Debt
Code quality, refactoring, cleanup.

- [ ] **Refactor Index.tsx** - See High Priority section for details 

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
