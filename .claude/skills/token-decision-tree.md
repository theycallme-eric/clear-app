---
name: token-decision-tree
description: Systematic lookup table for choosing the right semantic token
trigger: Unsure which token to use for a surface, border, text, or icon
category: ui
---

# Token Decision Tree

Use this to pick the correct semantic token. Never reference primitive tokens (`--color-orange-*`) in components — only in `src/index.css`.

---

## Quick Lookup

### Surfaces (backgrounds)

| Building... | Token |
|-------------|-------|
| Card/container background | `--surface-card` |
| Card accent bar (LeftColumn) | `--surface-card-accent` |
| Section heading background | `--surface-heading` |
| Primary CTA button | `--surface-cta-primary` |
| Primary CTA hover | `--surface-cta-primary-hover` |
| Primary CTA accent bar | `--surface-cta-primary-accent` |
| Primary CTA disabled | `--surface-cta-primary-disabled` |
| Secondary CTA button | `--surface-cta-secondary` |
| Secondary CTA hover | `--surface-cta-secondary-hover` |
| Secondary CTA disabled | `--surface-cta-secondary-disabled` |
| Selected state (any) | `--surface-selected` |
| Unselected state (any) | `--surface-unselected` |
| Disabled state (any) | `--surface-disabled` |
| Radio button (selected) | `--surface-radio-selected` |
| Radio button (unselected) | `--surface-radio-unselect` |
| Input field | `--surface-input` |
| Input field (focused) | `--surface-input-active` |
| Input field (disabled) | `--surface-input-disabled` |
| Timer (normal) | `--surface-timer` |
| Timer (low/urgent) | `--surface-timer-low` |
| Chip (label variant) | `--surface-chip` |
| Chip (selected) | `--surface-chip-selected` |
| Chip (unselected) | `--surface-chip-unselected` |
| Dropdown menu | `--surface-dropdown` |
| Tab (active) | `--surface-tab-active` |
| Tab (inactive) | `--surface-tab-inactive` |
| Modal overlay | `--surface-overlay` |
| Slider thumb | `--surface-slider-thumb` |
| Slider active track | `--surface-slider-active` |
| Slider inactive track | `--surface-slider-inactive` |
| Success toast/banner | `--surface-success` |
| Error toast/banner | `--surface-error` |
| Info toast/banner | `--surface-info` |
| Loading skeleton | `--surface-skeleton` |
| Muted container (code blocks) | `--surface-muted` |

### Borders

| Building... | Token |
|-------------|-------|
| Card border | `--border-card` |
| Section heading border | `--border-heading` |
| Primary CTA border | `--border-cta-primary` |
| Primary CTA hover | `--border-cta-primary-hover` |
| Secondary CTA border | `--border-cta-secondary` |
| Secondary CTA hover | `--border-cta-secondary-hover` |
| Selected state (any) | `--border-selected` |
| Unselected state (any) | `--border-unselected` |
| Disabled state (any) | `--border-disabled` |
| Subtle/inactive elements | `--border-subtle` |
| Input field | `--border-input` |
| Input field (focused) | `--border-input-active` |
| Input field (disabled) | `--border-input-disabled` |
| Timer (normal) | `--border-timer` |
| Timer (low/urgent) | `--border-timer-low` |
| Chip (label variant) | `--border-chip` |
| Chip (selected) | `--border-chip-selected` |
| Chip (unselected) | `--border-chip-unselected` |
| Dropdown menu | `--border-dropdown` |
| Tab (active) | `--border-tab-active` |
| Tab (inactive) | `--border-tab-inactive` |
| Spacer/divider | `--border-spacer` |
| Slider track | `--border-slider` |
| Slider thumb | `--border-slider-thumb` |
| Success toast | `--border-success` |
| Error toast | `--border-error` |
| Info toast | `--border-info` |

### Text

| Building... | Token |
|-------------|-------|
| Page headings | `--text-header` |
| Card headings | `--text-card-header` |
| Body text / descriptions | `--text-paragraph` |
| Card metadata labels | `--text-card-label` |
| CTA button text (on dark bg) | `--text-cta` |
| CTA button text (on CTA surface) | `--text-on-cta` |
| CTA hover text | `--text-cta-hover` |
| Destructive CTA text | `--text-cta-destructive` |
| Destructive CTA hover | `--text-cta-destructive-hover` |
| Secondary/dimmed text | `--text-muted` |
| Disabled text | `--text-disabled` |
| Timer display | `--text-timer` |
| Timer low/urgent | `--text-timer-low` |
| Selected state text | `--text-selected` |
| Unselected state text | `--text-unselected` |
| Chip (selected) | `--text-chip-selected` |
| Chip (unselected) | `--text-chip-unselected` |
| Input field text | `--text-input` |
| Input placeholder | `--text-input-placeholder` |
| Input (disabled) | `--text-input-disabled` |
| Dropdown text | `--text-dropdown` |
| Dropdown selected item | `--text-dropdown-selected` |
| Tab (active) | `--text-tab-active` |
| Tab (inactive) | `--text-tab-inactive` |
| Label info text | `--text-label-info` |
| Label selected | `--text-label-selected` |
| Label timer | `--text-label-timer` |
| Success toast text | `--text-success` |
| Error toast text | `--text-error` |
| Error text (on dark bg) | `--text-error-light` |
| Info toast text | `--text-info` |
| Info text (on dark bg) | `--text-info-light` |

### Icons

| Building... | Token |
|-------------|-------|
| Interactive icon (clickable) | `--icon-cta` |
| Icon on CTA button surface | `--icon-on-cta` |
| Icon hover | `--icon-cta-hover` |
| Disabled icon | `--icon-disabled` |
| Selected state icon | `--icon-selected` |
| Unselected state icon | `--icon-unselected` |
| Decorative/badge icon | `--icon-badge` |
| Input field icon | `--icon-input` |
| Input icon (disabled) | `--icon-input-disabled` |
| Chip icon (label) | `--icon-chip` |
| Chip icon (selected) | `--icon-chip-selected` |
| Chip icon (unselected) | `--icon-chip-unselected` |

### Brand

| Building... | Token |
|-------------|-------|
| Logo primary color | `--brand-primary` |
| Logo strong glow | `--brand-glow-strong` |
| Logo medium glow | `--brand-glow-medium` |
| Logo subtle glow | `--brand-glow-subtle` |
| Logo border | `--brand-border` |

---

## Theme Swap Rule

Tokens automatically swap values between orange and blue themes. The mapping:

| Role | Orange theme (default) | Blue theme |
|------|----------------------|------------|
| Structure (surfaces, borders) | Orange primitives | Blue primitives |
| Interaction (CTAs, buttons) | Blue primitives | Orange primitives |
| Selected | Green (unchanged) | Green (unchanged) |
| Error/urgent | Red (unchanged) | Red (unchanged) |
| Info | Purple (unchanged) | Purple (unchanged) |
| Disabled | Neutral (unchanged) | Neutral (unchanged) |

**You never need to handle theme swapping manually.** Just use semantic tokens and both themes work.

---

## Universal State Baselines

These cascade to all selectable components. One change here cascades everywhere:

```
--surface-selected   →  --surface-chip-selected, --surface-radio-selected
--surface-unselected →  --surface-chip-unselected, --surface-radio-unselect
--border-selected    →  --border-chip-selected, --border-radio-select
--border-unselected  →  --border-chip-unselected, --border-radio-unselected
--text-selected      →  --text-chip-selected, --text-radio-text-select
--icon-selected      →  --icon-chip-selected, --icon-radio-selected
```

Only override component-specific tokens when you need a component to deviate from the baseline.

---

## Related Skills

- [ui-rules](ui-rules.md) — Spacing, typography, visual hierarchy
- [anti-patterns](anti-patterns.md) — Common mistakes to avoid
- [token-check](token-check.md) — Post-build token verification
