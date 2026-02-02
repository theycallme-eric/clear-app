# Core Flows
**Project:** [Name]  
**Status:** [Draft / In Progress / Locked]  
**Last Updated:** [Date]

---

## Purpose
Document user paths through the application with wireframes. This doc helps:
- Align on what screens exist and how they connect
- Provide Claude Code with visual references for implementation
- Track which flows are complete

**Format:** ASCII wireframes are token-efficient and work well for AI communication. Add higher-fidelity references when precision matters.

---

## Flow Overview

### User Paths
```
[Entry Point] → [Path 1] → [Path 2] → [End State]
                    ↓
              [Alternate Path]
```

### Screen Inventory
| Screen | Status | Flow |
|--------|--------|------|
| [Screen 1] | ⚪ Not Started | [Which flow] |
| [Screen 2] | 🔵 Wireframed | [Which flow] |
| [Screen 3] | ✅ Built | [Which flow] |

---

## Flow 1: [Flow Name]

### Overview
**Goal:** [What the user is trying to accomplish]  
**Entry:** [How they get here]  
**Exit:** [Where they go when done]

### Flow Diagram
```
[Screen A] → [Screen B] → [Screen C]
     ↓            ↓
[Error State] [Alt Path]
```

---

### Screen: [Screen Name]

**Purpose:** [What this screen does]  
**Entry Points:** [How users arrive]  
**Exit Points:** [Where users can go from here]

#### Wireframe (Mobile)
```
┌─────────────────────────────┐
│ ← Back           [Action]   │ ← Header
├─────────────────────────────┤
│                             │
│         [Content]           │
│                             │
│  ┌───────────────────────┐  │
│  │                       │  │
│  │    [Component]        │  │
│  │                       │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │    [Component]        │  │
│  └───────────────────────┘  │
│                             │
├─────────────────────────────┤
│    [Primary CTA Button]     │ ← Fixed footer
└─────────────────────────────┘
```

#### Wireframe (Desktop) — if different
```
┌──────────────────────────────────────────────────────┐
│  Logo        Nav Item    Nav Item         [Profile]  │
├──────────────────────────────────────────────────────┤
│              │                                       │
│   Sidebar    │         Main Content                  │
│              │                                       │
│   [Nav]      │    [Components laid out wider]        │
│   [Nav]      │                                       │
│   [Nav]      │                                       │
│              │                                       │
└──────────────────────────────────────────────────────┘
```

#### Content
| Element | Description | Data Source |
|---------|-------------|-------------|
| [Element 1] | [What it shows] | [Where data comes from] |
| [Element 2] | | |

#### Interactions
| Action | Result |
|--------|--------|
| Tap [element] | [What happens] |
| Swipe [direction] | [What happens] |
| Submit form | [What happens] |

#### States
| State | Trigger | Display |
|-------|---------|---------|
| Loading | On entry | Skeleton/spinner |
| Empty | No data | Empty state message + CTA |
| Error | Fetch fails | Error message + retry |
| Success | Action complete | Confirmation + next step |

#### Edge Cases
- [What if X happens?]
- [What if user is offline?]
- [What if data is missing?]

---

### Screen: [Next Screen Name]

[Repeat structure for each screen in the flow]

---

## Flow 2: [Flow Name]

[Repeat structure for each flow]

---

## Navigation Map

### Global Navigation
```
┌─────────────────────────────────────────┐
│  [Tab 1]  [Tab 2]  [Tab 3]  [Tab 4]    │
└─────────────────────────────────────────┘
```

| Tab | Screen | Icon |
|-----|--------|------|
| Tab 1 | Home | [icon name] |
| Tab 2 | [Screen] | [icon name] |

### Navigation Rules
- [e.g., "Back button always returns to previous screen"]
- [e.g., "Tab bar visible on all main screens, hidden during flows"]
- [e.g., "Modals don't affect navigation stack"]

---

## Responsive Behavior

### Breakpoint Behavior
| Screen | Mobile | Tablet | Desktop |
|--------|--------|--------|---------|
| [Screen 1] | Single column | [behavior] | [behavior] |
| [Screen 2] | | | |

### Mobile-First Rules
- [e.g., "All layouts start mobile, expand for larger screens"]
- [e.g., "Sidebar becomes bottom nav on mobile"]

---

## Shared Patterns

### Headers
```
Standard Header:
┌─────────────────────────────┐
│ ← Back        Title    [•••]│
└─────────────────────────────┘

Home Header:
┌─────────────────────────────┐
│ Logo                 [User] │
└─────────────────────────────┘
```

### Form Layouts
```
Standard Form:
┌─────────────────────────────┐
│ Label                       │
│ ┌─────────────────────────┐ │
│ │ Input                   │ │
│ └─────────────────────────┘ │
│ Helper text                 │
│                             │
│ Label                       │
│ ┌─────────────────────────┐ │
│ │ Input                   │ │
│ └─────────────────────────┘ │
│                             │
│    [Secondary] [Primary]    │
└─────────────────────────────┘
```

### Lists
```
Standard List Item:
┌─────────────────────────────┐
│ [Icon]  Title          [>]  │
│         Subtitle            │
└─────────────────────────────┘
```

---

## Checkpoint Prompt
Before building a screen:
1. Is the wireframe clear enough to implement?
2. Are all states documented (loading, empty, error)?
3. Are interactions defined?
4. Is navigation clear (where from, where to)?

After building a screen:
1. Update status in Screen Inventory
2. Note any deviations from wireframe
3. Add to backlog if improvements identified

---

*Created: [Date]*  
*Last updated: [Date]*
