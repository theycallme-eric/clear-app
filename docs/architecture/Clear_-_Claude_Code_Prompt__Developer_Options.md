# Clear — Claude Code Prompt: Developer Options + Component Gallery

**Session Type:** Implementation  
**Target:** React app with established design system  
**Created:** January 22, 2026

---

## Overview

Add a Developer Options feature to audit the design system. This creates a Component Gallery that displays all reusable design-system components in their various states and variants.

---

## Goal

Add a "Developer" entry point to the Settings page that opens a Developer Options section containing a Component Gallery displaying all design system components.

---

## Requirements

### 1. Settings Page Integration

**Add Developer Entry Point:**
- Add a "Developer" button to the existing Settings page
- Use the app's existing Button component
- When clicked, navigate to (or reveal) the Developer Options page
- Follow existing navigation patterns in the app

### 2. Component Gallery Features

**Display Requirements:**

Each component should show:
- **Component name** as a clear heading
- **Default state** showing at least one representative example
- **Key variants** (sizes, intents, states, disabled, etc.) when applicable
- **Props used** for each variant (optional but helpful)

**Characteristics:**
- **Read-only presentation** — no side effects or interactive behaviors that modify app state
- **Safe to ship** — suitable for production but tucked behind the Developer entry point
- **Organized layout** — group related components or variants logically

### 3. Technical Implementation

**Discovery & Import:**
- Automatically discover and import components from the canonical directory
  - Likely locations: `components/ui`, `design-system`, `src/components/ui`
- Use explicit imports over dynamic magic where clarity matters
- Create a central registry if helpful for maintainability

**Rendering Strategy:**
- For each component, provide sensible default props
- If a component requires context (auth, routing, theme, etc.):
  - Include it but label it as "context-dependent" OR
  - Wrap it safely with minimal context providers
- Group components by category/section if logical (e.g., "Inputs", "Buttons", "Layout")

**Layout Structure:**
- Use neutral layout primitives from the design system (Stack, Card, Grid, etc.)
- Keep styling minimal and consistent with the app's aesthetic
- Sectioned layout with one section per component (or component family)
- Clear visual separation between variants

---

## Constraints

- ✅ Use **only existing design system components** — do not recreate styles
- ✅ **No external tooling** (Storybook, etc.)
- ✅ Keep it **simple and explicit** — prioritize clarity over polish
- ✅ Production-ready code with proper error handling
- ✅ Follow existing code conventions and patterns in the app

---

## Deliverables

### 1. Settings Page Modification
- Add "Developer" button with proper styling and placement
- Wire up navigation to Developer Options

### 2. Developer Options Page/Route
- New page or section component
- Follow existing routing patterns (React Router, Next.js, etc.)

### 3. Component Gallery Implementation
- Systematic rendering of all design system components
- Clear labeling and organization
- Sensible default props for each component

### 4. Documentation
Brief explanation of:
- **How the gallery works** — architecture and component discovery
- **How to add new components** — steps to include new components in the gallery
- **Tradeoffs made** — decisions around auto-discovery vs. manual registration, layout choices, etc.

---

## Implementation Approach

### Step 1: Survey the Project
**Before writing code:**
1. Identify where design system components live (directory structure)
2. Examine Settings page structure and routing pattern
3. Note any existing navigation or page patterns to follow
4. Identify available layout primitives (Stack, Grid, Card, etc.)

### Step 2: Plan the Architecture
**Decide on:**
- Route vs. modal vs. drawer for Developer Options
- Auto-discovery vs. manual component registration
- How to handle context-dependent components
- Grouping/categorization strategy

### Step 3: Implement Core Features
**Build in this order:**
1. Developer Options page/route structure
2. Basic Component Gallery layout
3. Component discovery and import logic
4. Rendering logic for components with variants
5. Settings page integration

### Step 4: Polish and Document
- Add error boundaries if needed
- Test with all existing components
- Write brief documentation for maintainability

---

## Think Step-by-Step

**Explain tradeoffs where relevant:**
- **Auto-discovery vs. manual registration**
  - Auto: Less maintenance, but may break if directory structure changes
  - Manual: More explicit, but requires updates when adding components
  
- **Route vs. modal vs. drawer**
  - Route: Better for deep linking, more space
  - Modal/Drawer: Less intrusive, but limited screen space
  
- **Completeness vs. maintainability**
  - Show every variant: Comprehensive but harder to maintain
  - Show key variants: Easier to maintain, still valuable

**Produce production-ready code:**
- Proper TypeScript types (if applicable)
- Error boundaries where appropriate
- Clean, maintainable code following the app's conventions
- Consistent with existing design patterns

---

## Expected Outcome

After implementation, developers should be able to:
1. Click "Developer" in Settings
2. See all design system components rendered
3. Visually audit consistency across components
4. Quickly reference available variants and states
5. Easily add new components to the gallery as they're created

---

## Notes

- This is an **internal tool** for development/design QA, not a user-facing feature
- Focus on **utility over polish** — it should be functional and clear, not beautiful
- The gallery should **expose gaps** in the design system (missing states, inconsistent sizing, etc.)
- Keep it **lightweight** — no heavy dependencies or complex build steps

---

*This prompt is designed to be copied into Claude Code to begin implementation of the Developer Options feature.*
