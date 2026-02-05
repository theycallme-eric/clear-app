# Prompt for Antigravity: Continue UI Component Refactor

## Context
We've been refactoring the Clear App UI to use a consistent "chamfered corner" design pattern. You created `ChamferedFrame` which solved the border gap issues. Here's the current state:

## Completed Components (in `~/clear-app/src/components/`)
- **`CornerAngle.tsx`** - Standalone corner piece (sm/md/lg sizes)
- **`LeftColumn.tsx`** - Left border column with border on all sides
- **`RightColumn.tsx`** - Right column with corner (currently unused in ActionCard)
- **`ChamferedFrame.tsx`** - Your SVG-based solution - source of truth for chamfered shapes
- **`ActionCard.tsx`** - Updated to use LeftColumn + ChamferedFrame

## Still Needs Refactoring
**`ActionButton.tsx`** - The CTA button component still uses the old 3-column CSS approach with alignment issues. It should be refactored to use `ChamferedFrame` or a similar SVG approach.

Current ActionButton location: `~/clear-app/src/components/ActionButton.tsx`

## Key Reference Files
- **Design tokens**: `~/clear-app/src/index.css` (CSS variables for colors, surfaces, borders)
- **Token reference**: `~/clear-app/docs/frontend/figma-design-tokens.json`
- **Component Gallery**: `~/clear-app/src/pages/ComponentGallery.tsx` (for testing)

## Design Token Naming
- Surface: `--surface-cta-primary`, `--surface-cta-secondary`, `--surface-cta-accent`
- Border: `--border-cta-primary`, `--border-cta-secondary`
- Text: `--text-cta`, `--text-disabled`
- Icon: `--icon-cta`

## ActionButton Requirements
1. Three variants: `primary`, `secondary`, `transparent`
2. States: default, hover, disabled
3. Optional `iconLeft` and `iconRight` slots
4. Primary/Secondary use the chamfered shape with left accent bar
5. Transparent is simple text button (no chamfer)

## Suggested Approach
Consider creating a variant of `ChamferedFrame` or modifying `ActionButton` to:
1. Use LeftColumn for the accent bar
2. Use ChamferedFrame (or inline SVG) for the main body
3. Handle hover states via CSS variables or className toggles

## Figma MCP
You have access to Figma via MCP. The button component set is in the design file - you can pull the exact structure and variables from there.

---

## Workflow Note
> **Intentional Update (Feb 2026):** This document was previously maintained by Claude Code. The workflow has changed:
> - **Claude.ai (Opus):** Planning, prompt crafting, architecture decisions
> - **Antigravity:** All code implementation, file creation, deployment

*Last updated by Antigravity*
