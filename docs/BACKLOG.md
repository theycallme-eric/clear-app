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

- [ ] **Refactor Index.tsx** - Split the 864-line "traffic controller" into smaller, focused modules
  - Priority: High
  - Type: Tech Debt
  - Added: 2026-02-02
  - Context: Index.tsx handles ALL screen routing, state management, and data fetching in one file. Flagged by Antigravity audit. Risk: increasingly difficult to add features without breaking unrelated code. Suggested fix: extract routing, move data fetching to custom hooks, consider React Context for shared state.

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

- [ ] 

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
