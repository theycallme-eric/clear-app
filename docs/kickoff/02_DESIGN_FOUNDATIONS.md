# Design Foundations
**Project:** [Name]  
**Status:** [Draft / Locked]  
**Last Updated:** [Date]

---

## Purpose
This document locks visual decisions BEFORE asking AI to generate UI. Pre-defining these patterns prevents:
- Generic AI aesthetics
- Inconsistent output across sessions
- Refactor debt from misaligned generation

**Rule:** Don't generate UI until this doc is at "Locked" status.

---

## Design Direction

### Aesthetic in 3 Words
[e.g., "Bold, minimal, energetic" or "Soft, warm, approachable"]

### Reference/Inspiration
[Links to designs, screenshots, mood boards that capture the vibe]
- 
- 
- 

### What This Is NOT
[Explicitly call out aesthetics to avoid]
- 
- 

---

## Color System

### Primary Palette
| Name | Hex | Usage |
|------|-----|-------|
| Primary | `#______` | CTAs, key actions |
| Secondary | `#______` | Supporting elements |
| Accent | `#______` | Highlights, emphasis |

### Neutrals
| Name | Hex | Usage |
|------|-----|-------|
| Background | `#______` | Main background |
| Surface | `#______` | Cards, elevated elements |
| Border | `#______` | Dividers, outlines |
| Text Primary | `#______` | Main text |
| Text Secondary | `#______` | Supporting text |
| Text Muted | `#______` | Disabled, hints |

### Semantic Colors
| Name | Hex | Usage |
|------|-----|-------|
| Success | `#______` | Confirmations, complete |
| Warning | `#______` | Caution states |
| Error | `#______` | Errors, destructive |
| Info | `#______` | Informational |

### Color Usage Rules
- [e.g., "Primary color only for primary CTAs, never backgrounds"]
- [e.g., "Dark mode: invert neutrals, keep semantic colors"]
- 

---

## Typography

### Font Stack
| Role | Font | Fallback |
|------|------|----------|
| Headings | [Font name] | [Fallback] |
| Body | [Font name] | [Fallback] |
| Mono/Code | [Font name] | [Fallback] |

### Type Scale
| Name | Size | Weight | Line Height | Usage |
|------|------|--------|-------------|-------|
| Display | __px | ___ | ___ | Hero text |
| H1 | __px | ___ | ___ | Page titles |
| H2 | __px | ___ | ___ | Section headers |
| H3 | __px | ___ | ___ | Subsections |
| Body | __px | ___ | ___ | Main content |
| Small | __px | ___ | ___ | Captions, labels |
| Micro | __px | ___ | ___ | Tags, badges |

### Typography Rules
- [e.g., "Never use font weights below 400"]
- [e.g., "Headings always uppercase" or "Never uppercase"]
- 

---

## Spacing System

### Base Unit
[e.g., 4px or 8px base]

### Scale
| Token | Value | Usage |
|-------|-------|-------|
| xs | __px | Tight spacing |
| sm | __px | Related elements |
| md | __px | Default spacing |
| lg | __px | Section breaks |
| xl | __px | Major separations |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| none | 0 | Sharp corners |
| sm | __px | Subtle rounding |
| md | __px | Default |
| lg | __px | Cards, modals |
| full | 9999px | Pills, avatars |

---

## Shadows/Elevation

| Level | Shadow | Usage |
|-------|--------|-------|
| none | none | Flat elements |
| sm | [value] | Subtle lift |
| md | [value] | Cards |
| lg | [value] | Modals, dropdowns |

---

## Iconography

### Icon Source
[e.g., Lucide, Heroicons, custom, etc.]

### Icon Sizing
| Size | Dimensions | Usage |
|------|------------|-------|
| sm | __px | Inline with text |
| md | __px | Buttons, nav |
| lg | __px | Feature highlights |

### Icon Rules
- [e.g., "Stroke width: 1.5px consistently"]
- [e.g., "Always use current color, never hardcoded"]
- 

---

## Motion/Animation

### Timing
| Name | Duration | Easing | Usage |
|------|----------|--------|-------|
| fast | ___ms | [easing] | Micro-interactions |
| normal | ___ms | [easing] | Transitions |
| slow | ___ms | [easing] | Page transitions |

### Motion Rules
- [e.g., "No animation on reduced-motion preference"]
- [e.g., "Entrances: fade + slide up"]
- 

---

## Layout Patterns

### Breakpoints
| Name | Width | Notes |
|------|-------|-------|
| mobile | < ___px | Single column |
| tablet | ___px | Adaptive |
| desktop | ___px+ | Full layout |

### Container Widths
| Context | Max Width | Padding |
|---------|-----------|---------|
| Content | ___px | ___px |
| Wide | ___px | ___px |
| Full | 100% | ___px |

---

## Dark Mode (if applicable)

### Approach
[e.g., "Invert neutrals, reduce saturation on colors, maintain contrast ratios"]

### Specific Overrides
| Element | Light | Dark |
|---------|-------|------|
| Background | #___ | #___ |
| Surface | #___ | #___ |
| Text | #___ | #___ |

---

## Design Tokens Export
[Link to or include design-tokens.js / .css / .json file]

```javascript
// Example structure
export const colors = {
  primary: '#______',
  // ...
}

export const typography = {
  // ...
}
```

---

## Checkpoint Prompt
Before locking this document:
1. Are colors tested for accessibility (contrast ratios)?
2. Would someone else generate consistent UI from this?
3. Are "what not to do" rules clear?
4. Is the design token file ready for code?

---

*Created: [Date]*  
*Locked: [Date]*
