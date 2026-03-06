# Card Styling Research - Figma Design Specifications

## Executive Summary

This document captures the card component specifications extracted from the Figma design tokens and existing codebase. The CLEAR design system uses **two distinct card patterns**: traditional glass cards and chamfered cards (with angled corners).

---

## 1. Card Design Tokens from Figma

### 1.1 Surface Colors (Backgrounds)

| Token | Orange Theme | Blue Theme | Usage |
|-------|--------------|------------|-------|
| `--surface-card` | `rgba(248, 120, 35, 0.15)` (orange-alpha-150) | `rgba(0, 169, 244, 0.15)` (blue-alpha-150) | Standard card background |
| `--surface-card-accent` | `rgba(248, 120, 35, 0.40)` (orange-alpha-400) | `rgba(0, 169, 244, 0.40)` (blue-alpha-400) | Accent/highlighted card areas |

### 1.2 Border Colors

| Token | Orange Theme | Blue Theme | Usage |
|-------|--------------|------------|-------|
| `--border-card` | `#F87823` (orange-500) | `#00A9F4` (blue-500) | Standard card border |

### 1.3 Border Width
- **Standard**: `2px` (used in ChamferedFrame, LeftColumn)
- **Glass cards**: `1.5px` (used in `.glass-card` class)

### 1.4 Border Radius
- **Design System**: `--radius: 0px` (no rounded corners - chamfered design language)
- **Glass Card**: `border-radius: var(--radius)` = 0px
- **Note**: The design system intentionally uses **sharp corners** with **chamfered (angled) cuts** instead of rounded corners

### 1.5 Spacing/Padding (from Figma spacing primitives)

| Token | Value | Common Usage |
|-------|-------|--------------|
| `--spacing-100` | 4px | xs padding |
| `--spacing-200` | 8px | sm padding |
| `--spacing-300` | 12px | md padding |
| `--spacing-400` | 16px | **Standard card padding** (p-4) |
| `--spacing-500` | 20px | lg padding |
| `--spacing-600` | 24px | xl padding (p-6) |

### 1.6 Shadow/Elevation
- **Current**: `shadow-sm` on base Card component
- **Glass cards**: No explicit shadow; relies on `backdrop-filter: blur(20px)` for depth
- **Figma tokens**: No explicit shadow tokens defined in design tokens JSON

---

## 2. Card Variants

### 2.1 Glass Card (`.glass-card`)

**Current Implementation** (`src/index.css`):
```css
.glass-card {
  background: rgba(23, 23, 23, 0.6);
  backdrop-filter: blur(20px);
  border: 1.5px solid var(--color-orange-alpha-400);
  border-radius: var(--radius); /* 0px */
}

[data-theme="blue"] .glass-card {
  border-color: var(--color-blue-alpha-400);
}
```

**Usage**: Most common card type - used across Settings, History, Home, Summary, Onboarding screens

**Characteristics**:
- Semi-transparent dark background
- Backdrop blur for glassmorphic effect
- Themed border color (40% alpha of primary)
- No rounded corners

### 2.2 Exercise Card (`.exercise-card`)

**Current Implementation**:
```css
.exercise-card {
  background: var(--surface-card);
  border: 1px solid var(--border-card);
  padding: var(--spacing-400); /* 16px */
}

.exercise-card-title {
  font-family: var(--font-headings);
  font-size: var(--heading-h6-size);
  font-weight: var(--font-weight-bold);
  color: var(--text-header);
}
```

**Characteristics**:
- Uses semantic surface token (15% alpha)
- Solid primary border color
- Standard 16px padding

### 2.3 Chamfered Card (ActionCard, ChamferedFrame)

**Structure**: Uses `ChamferedFrame` + optional `LeftColumn` components

**Tokens Used**:
- `--surface-cta-primary`: Main body fill (40% alpha)
- `--surface-cta-accent`: Left accent column fill (60% alpha)
- `--border-cta-primary`: Border color (solid primary)

**Corner Sizes**:
| Size | Chamfer Cut | Left Column Width |
|------|-------------|-------------------|
| sm | 8px | 8px |
| md | 12px | 12px |
| lg | 24px | 12px |

### 2.4 shadcn/ui Card (Base)

**Current Implementation** (`src/components/ui/card.tsx`):
```tsx
<div className="rounded-lg border bg-card text-card-foreground shadow-sm" />
```

**Issues**:
- Uses `rounded-lg` which conflicts with design system (should be 0px)
- Uses generic `border` instead of `--border-card`
- Maps to legacy tokens: `--card` and `--card-foreground`

---

## 3. Card States

### 3.1 Hover States

**Glass Card Hover**:
```css
hover:border-clear-orange/60 transition-all
```
- Border becomes 60% opacity on hover
- Used widely across interactive cards

**Chamfered Card Hover** (CTA pattern):
| Token | Default | Hover |
|-------|---------|-------|
| `--surface-cta-primary` | 40% alpha | `--surface-cta-primary-hover` (60% alpha) |
| `--border-cta-primary` | orange-500 | `--border-cta-primary-hover` (orange-400, lighter) |

### 3.2 Disabled State

| Token | Value |
|-------|-------|
| `--surface-disabled` | `rgba(114, 114, 116, 0.30)` (neutral-alpha-300) |
| `--border-disabled` | `#8E8E90` (neutral-400) |
| `--text-disabled` | `#8E8E90` (neutral-400) |

### 3.3 Completed/Selected States (Exercise Cards)

**ActiveExerciseCard**:
- Completed: `opacity-60 bg-secondary/30`
- Active: `border-l-4 border-l-clear-orange` (left accent stripe)

---

## 4. Typography Within Cards

### 4.1 Card Title
- **Font**: `--font-headings` (Rajdhani)
- **Size**: `--heading-h6-size` (20px mobile, responsive)
- **Weight**: `--font-weight-bold` (700)
- **Color**: `--text-header` (blue-300 in orange theme, orange-300 in blue theme)

### 4.2 Card Description/Body
- **Font**: `--font-paragraph` (Space Grotesk)
- **Color**: `--text-paragraph` (blue-100 in orange theme)
- **Size**: 14px-16px (sm to md paragraph sizes)

### 4.3 Labels
- **Font**: `--font-label` (Oxanium)
- **Transform**: uppercase
- **Letter-spacing**: wider tracking

---

## 5. Identified Inconsistencies

### 5.1 Border Radius Conflict
- **Design System**: `--radius: 0px`
- **shadcn/ui Card**: Uses `rounded-lg`
- **Some inputs**: Use `rounded-lg` inline
- **Action**: All cards should use sharp corners (0px radius)

### 5.2 Border Color Inconsistency
- **Glass Card**: Uses `--color-orange-alpha-400` (raw primitive)
- **Exercise Card**: Uses `--border-card` (semantic token)
- **Action**: Standardize on semantic tokens

### 5.3 Border Width Variation
- Glass cards: 1.5px
- Exercise cards: 1px
- Chamfered cards: 2px
- **Action**: Define semantic border width tokens

### 5.4 Background Approach
- Glass cards: Fixed rgba with backdrop-blur
- Exercise cards: Semantic `--surface-card` token
- **Action**: Consider if glass cards should use semantic tokens

---

## 6. Recommended Token Additions

### 6.1 Missing Card Tokens (to add to index.css)

```css
/* Card-specific tokens */
--card-border-width: 2px;
--card-border-width-subtle: 1px;
--card-padding-sm: var(--spacing-300);  /* 12px */
--card-padding-md: var(--spacing-400);  /* 16px */
--card-padding-lg: var(--spacing-600);  /* 24px */

/* Glass card specific */
--surface-glass: rgba(23, 23, 23, 0.6);
--surface-glass-blur: 20px;
```

---

## 7. Current Card Usage Summary

| Component | Pattern | Border | Background | Radius |
|-----------|---------|--------|------------|--------|
| `glass-card` class | Glass | 1.5px alpha-400 | rgba(23,23,23,0.6) + blur | 0px |
| `exercise-card` class | Solid | 1px border-card | surface-card | 0px |
| `ActionCard` | Chamfered | 2px cta-primary | surface-cta-primary | 0px + cut |
| `ChamferedFrame` | Chamfered | 2px configurable | configurable | 0px + cut |
| `Card` (shadcn) | Rounded | default | bg-card | rounded-lg (ISSUE) |

---

## 8. Files to Modify for Global Card Update

1. **`src/index.css`** - Add missing tokens, update `.glass-card` and `.exercise-card`
2. **`src/components/ui/card.tsx`** - Remove `rounded-lg`, use semantic tokens
3. **`tailwind.config.ts`** - Ensure design tokens are available as Tailwind utilities
4. **Component files** - Update any hardcoded values to use tokens

---

## 9. Next Steps (Implementation Plan)

1. **Define complete card token set** in index.css
2. **Update base Card component** to use design system tokens
3. **Audit all glass-card usages** for consistency
4. **Create Card variants** (glass, solid, chamfered) as proper React components
5. **Document card usage guidelines** for the team
