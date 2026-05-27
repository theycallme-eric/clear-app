---
name: assembly-reference
description: Quick-reference for building UI — composition recipes, token lookup, spacing, atmosphere
trigger: Before any UI work, alongside component.md pre-flight
category: design-system
---

# Assembly Reference

The single starting point for building UI in CLEAR. Recipes first, details in linked docs.

**When to read what:**
- **This file** — how to assemble common patterns (tokens, classes, spacing, atmosphere)
- `component.md` — pre-flight checklist before building (mandatory)
- `token-decision-tree.md` — edge cases when this file doesn't cover your token need
- `ui-rules.md` — full rules (typography scale, spacing scale, state coverage, visual hierarchy)
- `design-philosophy.md` — judgment calls, the "why" layer
- `anti-patterns.md` — what NOT to do

---

## Token Cheat Sheet (by context)

### Card

```
surface:       --surface-card
surface-accent: --surface-card-accent        (for emphasized sub-areas)
border:        --border-card
label:         --text-card-label             (section labels like "INTENSITY LEVEL")
title:         --text-header                 (values like "UPPER BODY")
body:          --text-paragraph              (descriptions, explanations)
muted:         --text-muted                  (secondary info, subtitles)
```

### Form Input (Input, Textarea)

```
surface:       --surface-input               (default)
               --surface-input-active        (focused)
               --surface-input-disabled      (disabled)
border:        --border-input / --border-input-active / --border-input-disabled
text:          --text-input / --text-input-disabled
placeholder:   --text-input-placeholder
icon:          --icon-input / --icon-input-disabled
```

### CTA Button

```
surface:       --surface-cta-primary         (default)
               --surface-cta-primary-hover   (hover)
               --surface-cta-primary-disabled (disabled)
border:        --border-cta / --border-cta-hover
text:          --text-cta / --text-cta-hover
destructive:   --text-cta-destructive / --text-cta-destructive-hover
```

### Radio Button / Selection

```
surface:       --surface-radio-selected / --surface-radio-unselect
border:        --border-radio-select / --border-radio-unselected
text:          --text-radio-text-select / --text-radio-text-unselected
icon:          --icon-radio-selected / --icon-radio-unselected
```

### General Text

```
headers:       --text-header                 (page titles, card values)
paragraphs:    --text-paragraph              (body text)
muted:         --text-muted                  (secondary, subtle)
disabled:      --text-disabled               (inactive elements)
```

### Interactive Icons

```
cta:           --icon-cta                    (tappable icons, chevrons)
badge:         --icon-badge                  (status indicators)
```

---

## Spacing Recipes

| Context | Token | px (approx) |
|---------|-------|-------------|
| Page top padding | `spacing-600` | 24 |
| Gap between cards in a list | `spacing-600` | 24 |
| Padding inside Card (`padding="md"`) | `spacing-400` | 16 |
| Padding inside Card (`padding="lg"`) | `spacing-600` | 24 |
| Card label to its content | `spacing-100` to `spacing-200` | 4–8 |
| Card label `marginBottom` (with content below) | `spacing-200` to `spacing-300` | 8–12 |
| Gap between elements inside a card | `spacing-200` to `spacing-300` | 8–12 |
| Gap between form fields | `spacing-400` | 16 |
| Section divider padding-top | `spacing-400` | 16 |
| Between icon and text (inline) | `spacing-200` | 8 |

**Rule of thumb:** `spacing-600` between major sections, `spacing-400` inside sections, `spacing-200` between sibling elements.

---

## Composition Recipes

### 1. Card with Label + Value

The most common pattern. Used in GenerationScreen (Recommended Focus, Intensity, Duration, Notes).

```tsx
<Card cornerSize="md" padding="md">
  <span
    className="text-label-xs"
    style={{
      color: 'var(--text-card-label)',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      display: 'block',
      marginBottom: 'var(--spacing-200)',
    }}
  >
    Section Label
  </span>
  <span
    className="text-heading-h4"
    style={{ color: 'var(--text-header)', display: 'block' }}
  >
    Value
  </span>
  {/* Optional subtitle */}
  <span className="text-paragraph-sm" style={{ color: 'var(--text-muted)' }}>
    Supporting text
  </span>
</Card>
```

### 2. Form Field Card (Input or Textarea inside a Card)

```tsx
<Card cornerSize="md" padding="md">
  <label
    className="text-label-xs"
    style={{
      color: 'var(--text-card-label)',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      marginBottom: 'var(--spacing-300)',
      display: 'block',
    }}
  >
    Field Label
  </label>
  <Input placeholder="Placeholder text" />
  {/* or <Textarea placeholder="..." /> */}
</Card>
```

### 3. Accordion Card (Location selector pattern)

```tsx
<Card cornerSize="md" padding="none">
  <button
    onClick={toggle}
    style={{
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 'var(--spacing-400)',
      textAlign: 'left',
    }}
  >
    <div>
      <span className="text-label-xs"
        style={{ textTransform: 'uppercase', letterSpacing: '0.1em',
                 display: 'block', marginBottom: 'var(--spacing-100)',
                 color: 'var(--text-card-label)' }}>
        Label
      </span>
      <span className="text-heading-h5" style={{ color: 'var(--icon-cta)' }}>
        {selectedValue}
      </span>
    </div>
    <ChevronDown size={20} style={{ color: 'var(--icon-cta)' }} />
  </button>
  {isOpen && (
    <div style={{ padding: '0 var(--spacing-400) var(--spacing-400)',
                  display: 'flex', flexDirection: 'column', gap: 'var(--spacing-200)' }}>
      {/* RadioButton options */}
    </div>
  )}
</Card>
```

Note: `padding="none"` on Card because the button handles its own padding.

### 4. Page Layout (standard screen)

```tsx
<AppLayout
  header={<PageHeader left="back" onBack={handleBack} right="menu" onMenu={handleMenu} />}
  footer={<CTAButton onClick={handleAction} size="lg" fullWidth>Action Label</CTAButton>}
>
  <div className="stagger-reveal" style={{
    paddingTop: 'var(--spacing-600)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-600)',
  }}>
    {/* Cards go here */}
  </div>
</AppLayout>
```

- `grain-overlay` is applied by AppLayout automatically
- `stagger-reveal` on the content wrapper for sequential card reveal
- `spacing-600` gap between top-level cards

### 5. Selection Group (RadioButtons in a Card)

```tsx
<Card cornerSize="md" padding="md">
  <label className="text-label-xs"
    style={{ textTransform: 'uppercase', letterSpacing: '0.1em',
             marginBottom: 'var(--spacing-400)', display: 'block',
             color: 'var(--text-card-label)' }}>
    Choose One
  </label>
  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-200)' }}>
    <RadioButton selected={val === 'a'} onClick={() => set('a')} label="Option A" style={{ width: '100%' }} />
    <RadioButton selected={val === 'b'} onClick={() => set('b')} label="Option B" style={{ width: '100%' }} />
  </div>
</Card>
```

For inline options (like duration presets), use `flexDirection: 'row'` with `flex: 1` on each.

### 6. Confirmation Modal

```tsx
<ConfirmationModal
  title="Action Title"
  description="Are you sure you want to do this?"
  confirmLabel="Confirm"
  onConfirm={handleConfirm}
  onCancel={handleCancel}
/>
```

---

## Atmosphere Rules

Apply these by default — don't wait to be asked.

| Surface | Class | Notes |
|---------|-------|-------|
| Page wrapper | `grain-overlay` | Applied by layout components (AppLayout, etc.) — don't add manually |
| Card lists / content groups | `stagger-reveal` | Always on the parent div wrapping cards |
| CTA buttons | `scanlines` | Built into CTAButton component |
| Modals / toasts | `scanlines` | Built into ConfirmationModal, ChamferedToast |
| PageHeader | `scanlines` | Built into PageHeader component |
| Timer displays | `glow-emissive` | On text-time-lg elements |
| Key data (streak, logo) | `glow-emissive` | Sparingly — only truly important numbers |
| Accent bars / LeftColumn | `pulse-micro` | Structural elements only, never content |
| Filter dropdowns | `scanlines` | Built into FilterDropdown |

**Rule:** If you're building a new component and it's NOT in this table, don't add atmosphere. Ask first.

---

## State Coverage Checklist

Every interactive element must have these states. Check before considering a component done.

```
[ ] default   — base appearance
[ ] hover     — cursor over (subtle surface/border shift)
[ ] selected  — currently active (if applicable — use green tokens)
[ ] disabled  — non-interactive (muted surface, reduced opacity text)
[ ] focus     — keyboard focus (if applicable — match hover or add border)
```

---

## Typography Quick Ref

| Class | Font | Use for |
|-------|------|---------|
| `text-heading-h1`–`h6` | Rajdhani bold | Page titles, card values, section headers. Add `uppercase`. |
| `text-label-xs`–`xl` | Oxanium bold | Card labels, form labels, chip text, data readouts |
| `text-paragraph-xs`–`xl` | Space Grotesk medium | Body text, descriptions, form content |
| `text-cta-xs`–`lg` | Oxanium | Button labels. Uppercase + letter-spaced. |
| `text-time-lg`/`xl` | Oxanium | Timer displays only |
| `text-tab-xs`–`xl` | Oxanium | Tab labels |

**Bold is default** — heading and label classes include `font-weight: bold`.
**Uppercase is structural** — everything except paragraph text is uppercase.

---

## File Rename / Removal Checklist

When renaming or removing any file in `src/`:

1. `grep -r "filename" .claude/skills/` — update any skill references
2. `grep -r "filename" .claude/agents/` — update any agent references
3. `grep -r "ComponentName" .claude/skills/component.md` — update registry
