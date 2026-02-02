# Component Library
**Project:** [Name]  
**Status:** [Draft / In Progress / Locked]  
**Last Updated:** [Date]

---

## Purpose
Pre-define UI components BEFORE asking AI to generate them. This prevents:
- Inconsistent component styles across sessions
- Generic AI aesthetics
- Wasted time re-explaining patterns

**Rule:** For custom/bespoke UI, define the pattern here first (even as a rough sketch or description), THEN ask Claude Code to build it.

---

## Component Inventory

### Status Key
- ✅ Defined & Built
- 🔵 Defined, Not Built
- ⚪ Not Yet Defined

### Core Components
| Component | Status | Notes |
|-----------|--------|-------|
| Button | ⚪ | |
| Input | ⚪ | |
| Card | ⚪ | |
| Modal | ⚪ | |
| Badge | ⚪ | |
| [Add more] | | |

### Feature Components
| Component | Status | Notes |
|-----------|--------|-------|
| [Feature-specific] | ⚪ | |

---

## Component Definitions

### Button

**Variants:**
| Variant | Usage | Visual |
|---------|-------|--------|
| primary | Main CTAs | Solid fill, primary color |
| secondary | Supporting actions | Outline or muted fill |
| ghost | Tertiary actions | No background, text only |
| destructive | Dangerous actions | Error color |

**Sizes:**
| Size | Height | Padding | Font Size |
|------|--------|---------|-----------|
| sm | 32px | 12px 16px | 14px |
| md | 40px | 16px 24px | 16px |
| lg | 48px | 20px 32px | 18px |

**States:**
- Default
- Hover (slight lift or color shift)
- Active/Pressed (darker, no lift)
- Disabled (reduced opacity, no interaction)
- Loading (spinner replaces text)

**Code Example:**
```tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  children: React.ReactNode
  onClick?: () => void
}

// Usage
<Button variant="primary" size="md">
  Save Changes
</Button>
```

**Visual Reference:**
```
┌─────────────────────┐
│    Button Text      │  ← Primary (solid fill)
└─────────────────────┘

┌─────────────────────┐
│    Button Text      │  ← Secondary (outline)
└─────────────────────┘
```

---

### Input

**Types:**
| Type | Usage |
|------|-------|
| text | General text input |
| email | Email with validation |
| password | Hidden characters |
| textarea | Multi-line text |

**Anatomy:**
```
Label (optional)
┌─────────────────────────────┐
│ Placeholder or value        │
└─────────────────────────────┘
Helper text or error message
```

**States:**
- Default
- Focus (ring/border highlight)
- Error (error color border, error message)
- Disabled (reduced opacity)

**Code Example:**
```tsx
interface InputProps {
  label?: string
  placeholder?: string
  error?: string
  helper?: string
  disabled?: boolean
  type?: 'text' | 'email' | 'password'
  value: string
  onChange: (value: string) => void
}
```

---

### Card

**Variants:**
| Variant | Usage | Visual |
|---------|-------|--------|
| default | Standard content container | Surface color, subtle shadow |
| elevated | Emphasized content | Larger shadow |
| outlined | Lighter visual weight | Border, no shadow |
| interactive | Clickable cards | Hover state with lift |

**Anatomy:**
```
┌─────────────────────────────────┐
│ Header (optional)               │
├─────────────────────────────────┤
│                                 │
│ Content area                    │
│                                 │
├─────────────────────────────────┤
│ Footer/Actions (optional)       │
└─────────────────────────────────┘
```

**Code Example:**
```tsx
interface CardProps {
  variant?: 'default' | 'elevated' | 'outlined' | 'interactive'
  children: React.ReactNode
  onClick?: () => void
}

// With subcomponents
<Card variant="default">
  <Card.Header>Title</Card.Header>
  <Card.Content>Body content</Card.Content>
  <Card.Footer>Actions</Card.Footer>
</Card>
```

---

### Modal

**Sizes:**
| Size | Width | Usage |
|------|-------|-------|
| sm | 400px | Confirmations, simple forms |
| md | 560px | Standard content |
| lg | 720px | Complex forms, detailed content |
| full | 90vw | Large data displays |

**Anatomy:**
```
┌─────────────────────────────────┐
│ Header                    [X]   │
├─────────────────────────────────┤
│                                 │
│ Content (scrollable if needed)  │
│                                 │
├─────────────────────────────────┤
│              [Cancel] [Confirm] │
└─────────────────────────────────┘
```

**Behavior:**
- Backdrop click closes (configurable)
- Escape key closes
- Focus trapped inside modal
- Body scroll locked when open

---

### Badge

**Variants:**
| Variant | Usage | Visual |
|---------|-------|--------|
| default | Neutral info | Muted background |
| success | Positive states | Green tones |
| warning | Attention needed | Yellow/orange tones |
| error | Problems | Red tones |
| info | Informational | Blue tones |

**Sizes:**
| Size | Height | Font Size |
|------|--------|-----------|
| sm | 20px | 12px |
| md | 24px | 14px |

---

## Custom/Feature Components

### [Component Name]

**Purpose:** [What problem does this solve?]

**Visual Reference:**
```
[ASCII representation or description]
```

**Props:**
```tsx
interface Props {
  // Define the interface
}
```

**Behavior:**
- [Interaction 1]
- [Interaction 2]

**Code Example:**
```tsx
// How to use it
```

---

## Pattern Library

### Loading States

**Skeleton:**
```
┌─────────────────────────────────┐
│ ████████████                    │  ← Animated pulse
│ ████████████████████            │
│ ████████████████                │
└─────────────────────────────────┘
```

**Spinner:**
- Use for buttons, small areas
- Centered in container
- Match text color

**Full Page:**
- Centered spinner + optional message
- Use for route transitions

---

### Empty States

**Pattern:**
```
┌─────────────────────────────────┐
│                                 │
│         [Illustration]          │
│                                 │
│     No [items] yet              │
│     [Helpful subtext]           │
│                                 │
│        [Primary CTA]            │
│                                 │
└─────────────────────────────────┘
```

**Rules:**
- Always encouraging, never discouraging
- Clear action to resolve empty state
- Appropriate illustration or icon

---

### Error States

**Inline Error:**
```
┌─────────────────────────────────┐
│ [X] Something went wrong        │
│     [Brief explanation]         │
│                    [Retry]      │
└─────────────────────────────────┘
```

**Full Page Error:**
```
┌─────────────────────────────────┐
│                                 │
│         [Error icon]            │
│                                 │
│   Oops, something went wrong    │
│   [What to do about it]         │
│                                 │
│   [Primary CTA]  [Secondary]    │
│                                 │
└─────────────────────────────────┘
```

---

## Checkpoint Prompt
When adding a new component:
1. Is this truly custom, or can we use a standard pattern?
2. Is the visual reference clear enough to build from?
3. Are all states defined (default, hover, disabled, error, loading)?
4. Is the code interface clear?

Before asking Claude Code to build:
1. Is this component defined in this doc?
2. If not, define it first (even roughly)

---

*Created: [Date]*  
*Last updated: [Date]*
