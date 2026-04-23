## Session Goal
Complete the platform-agnostic design system extraction in `design-system/`. Re-extract all token files from the now-clean CSS source, write component specs, and set up the generation pipeline.

## Context
- The CSS source of truth (`src/index.css`) was fully cleaned in the token audit session:
  - No brown/cream fabricated tokens
  - No primitive-in-component violations
  - 13 new semantic tokens added (border-subtle, brand-*, text-muted, etc.)
  - 17 unused tokens deleted
  - Redundant blue overrides removed
- `docs/frontend/figma-design-tokens.json` was rewritten to match code
- `design-system/tokens/themes/orange.json` and `blue.json` were partially updated (brown/cream fixed, new tokens added) but not holistically re-extracted
- Other files in `design-system/tokens/` (primitives.json, semantic.json, effects.json, typography.json) were written from pre-cleanup state — need verification and update
- The `design-system/` directory structure is defined but `specs/` and `guides/` directories don't exist yet
- The goal: an LLM can read `design-system/` and implement the CLEAR aesthetic on any platform without seeing the React code

## What exists today

### `design-system/tokens/`
- `primitives.json` — Color palettes, spacing, corner cuts, border widths. **Needs verification** against cleaned CSS.
- `typography.json` — Font families, weights, heading/label/paragraph scales, breakpoints. **Needs verification.**
- `semantic.json` — Token role documentation (descriptions only, no values). **Needs update** to reflect deleted/added tokens.
- `effects.json` — Atmosphere tokens (scanlines, grain, glow, pulse, stagger, motion timing, background blobs). **Needs verification.**
- `themes/orange.json` — Default theme mappings. **Partially updated** — brown/cream fixed, some new tokens added, but deleted tokens may still be present. Needs full reconciliation with CSS.
- `themes/blue.json` — Blue theme overrides. **Partially updated** — same as orange.

### `design-system/README.md`
Exists with structure overview, usage guide, and key concepts. Status checklist needs updating.

### Not yet created
- `design-system/specs/` — Component blueprints (chamfer geometry, composition patterns, per-component specs)
- `design-system/guides/` — Platform-agnostic design philosophy, color logic, typography, motion, atmosphere, voice, states
- `design-system/platform/` — Generated outputs (CSS, Swift, Kotlin)

## Execution plan

### Phase 1: Re-verify and reconcile token files
1. Read `src/index.css` (the source of truth) and compare against each JSON file
2. Update `primitives.json` if any discrepancies found
3. Update `typography.json` if any discrepancies found
4. Update `effects.json` if any discrepancies found
5. Fully reconcile `semantic.json` — remove descriptions for deleted tokens, add descriptions for new tokens
6. Fully reconcile `themes/orange.json` — ensure every semantic token in CSS has a corresponding entry, no extras
7. Fully reconcile `themes/blue.json` — same as orange, but only include tokens that differ from root

### Phase 2: Write component specs
Create `design-system/specs/` with platform-agnostic component blueprints:

Priority components (the ones that define the CLEAR identity):
1. `chamfer.md` — The signature chamfered corner geometry. SVG clip-path math, cut sizes, border rendering approach.
2. `composition.md` — LeftColumn + ChamferedFrame composition pattern. How accent bars attach to cards.
3. `components/card.md` — Card component: padding variants, corner sizes, left column, surface/border tokens.
4. `components/cta-button.md` — Primary/secondary/ghost variants, size scale, hover/disabled states.
5. `components/chip.md` — Selectable/label variants, selected/unselected/disabled states.
6. `components/radio-button.md` — Radio with description text, selected/unselected states.
7. `components/checkbox.md` — Chamfered checkbox with check/dot states.
8. `components/timer-display.md` — Countdown timer with urgency escalation (green → red).
9. `components/loading-spinner.md` — Spinner with size variants.
10. `components/toast.md` — Chamfered toast with success/error/info variants.

Each spec should include:
- Purpose and when to use
- Dimensions, padding, spacing
- Token references for each state (default, hover, selected, disabled)
- Platform-agnostic rendering notes (how to achieve chamfered corners on each platform)

### Phase 3: Write design guides
Create `design-system/guides/` — distilled from `docs/design-philosophy.md` and `docs/frontend/ui-rules.md`:

1. `philosophy.md` — The "why": low-tech sci-fi terminal metaphor, references, emotional arc
2. `color-logic.md` — Structure vs interaction, theme swapping, emissive surfaces, alpha usage
3. `typography.md` — Three fonts three jobs, scale, weight, case, tracking
4. `motion.md` — Mechanical timing, progressive reveal, urgency escalation
5. `atmosphere.md` — Scan lines, glow, grain, pulse — the seasoning that makes it alive
6. `voice.md` — Copy/tone: terse, confident, imperative, gym-literate
7. `states.md` — Universal state definitions, cascade from baselines

### Phase 4: Platform generation setup (optional/stretch)
1. Set up Style Dictionary config
2. Generate CSS custom properties output (should match src/index.css)
3. Generate Swift/SwiftUI token constants
4. Generate Kotlin/Compose token constants
5. Update build scripts

## Files to reference
- `src/index.css` — THE source of truth for all tokens
- `docs/design-philosophy.md` — Design vision (source for guides)
- `docs/frontend/figma-design-tokens.json` — Already synced with code
- `src/components/` — Reference implementations for component specs
- `design-system/README.md` — Current structure overview

## Dependencies
- **Should be done AFTER Tailwind removal** if possible — the CSS will be cleaner and the extraction more accurate without Tailwind artifacts (`@tailwind` directives, Tailwind-specific resets, etc.)
- If done before Tailwind removal, just note that `@tailwind base/components/utilities` directives and the Tailwind config are not part of the design system

## Definition of done
- All token files verified against CSS source of truth — zero discrepancies
- `semantic.json` has descriptions for every token, no extras
- Theme files have entries for every semantic token
- At least the 10 priority component specs written
- All 7 design guides written
- `README.md` status checklist updated
- An LLM reading only `design-system/` could implement a CLEAR-styled app without seeing the React code
