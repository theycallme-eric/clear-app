---
name: icon-transform
description: Transform Lucide icons into CLEAR-style solid geometric icons
trigger: When a new Lucide icon import is introduced or when converting existing icons
category: ui
---

# Skill: Icon Transform

## Context

CLEAR uses a custom icon set (`src/components/icons.tsx`) instead of Lucide's outline icons. Every icon in the app should come from this file. When a new icon is needed that doesn't exist in the set yet, create it following the established design language.

## Design Language

- **Solid fills** — `fill="currentColor"`, never stroked outlines
- **Angular/geometric construction** — built from hard primitives, no organic curves
- **Chamfered tips** on directional icons — flat edge instead of sharp point (signature CLEAR detail)
- **Chunky proportions** — 4-5px arm thickness at 24px scale, reads like stamped HUD glyphs
- **Negative space for detail** — cuts and knockouts define form, not outlines
- **24x24 viewBox** — all icons use the same coordinate space

## Steps

### 1. Check if the icon already exists

```tsx
// Current exports in src/components/icons.tsx:
// Directional: ChevronRight, ChevronLeft, ChevronDown, ChevronUp, ArrowRight, ArrowLeft
// Actions: Menu, X, Plus, Minus, Check, Pencil, Maximize2
// Status: RefreshCw, Loader2, Eye, EyeOff, CircleCheck, CircleX, CircleAlert, AlertCircle, HelpCircle
// Semantic: Zap, Flame, Dumbbell, Clock, Gauge, Target, Crosshair, FileText, User
// Mood: Frown, Meh, Smile, SmilePlus, ThumbsDown
```

If it exists, import from `@/components/icons` instead of `lucide-react`.

### 2. Create the new icon

Add to `src/components/icons.tsx` in the appropriate section:

```tsx
export const NewIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="..." />
  </Svg>
);
```

**Path construction rules:**
- Use `fill="currentColor"` (inherited from `<Svg>`)
- Prefer single `<path>` elements; use multiple only for disconnected shapes
- Use `fillRule="evenodd"` when the icon has holes/cutouts (e.g., circle with internal shape)
- Keep coordinates as simple integers/half-integers where possible
- Test readability at 12px, 16px, 20px, and 24px mentally — if detail would be lost at 16px, simplify

**Proportion guidelines:**
- Arms/strokes: 3-5px wide at 24px scale
- Padding from viewBox edge: minimum 2px
- Directional icons: add chamfered (flat) tips, 2-3px flat edge
- Circle-based icons: use r≈10 (diameter 20 in 24x24 viewBox)

### 3. Add to the gallery

Update `src/pages/ComponentGallery.tsx`:
1. Add the aliased import at the top
2. Add an `<IconDisplay>` entry in the appropriate subsection

### 4. Update the import in the consuming file

Replace:
```tsx
import { SomeIcon } from "lucide-react";
```
With:
```tsx
import { SomeIcon } from "@/components/icons";
```

The API is identical (`size`, `className`, `style` props) so no usage changes needed.

## Reference

- Icon source: `src/components/icons.tsx`
- Gallery: `src/pages/ComponentGallery.tsx` → "Iconography" section
- Design philosophy: `docs/design-philosophy.md`

## Checklist

- [ ] Icon doesn't already exist in `src/components/icons.tsx`
- [ ] Uses solid fill, not strokes
- [ ] Angular/geometric — no rounded curves
- [ ] Readable at 16px
- [ ] Added to gallery in correct subsection
- [ ] Import changed from `lucide-react` to `@/components/icons`
