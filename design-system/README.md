# CLEAR Design System

A platform-agnostic design system for building low-tech sci-fi terminal interfaces. Extracted from the CLEAR workout app but designed to be applied to any application domain.

## What this is

A complete visual language — tokens, component specs, and design guides — that an LLM or human developer can use to implement the CLEAR aesthetic on any platform: web (React, Vue, vanilla), iOS (SwiftUI/UIKit), Android (Compose/Views), React Native, Flutter, or anything else.

**This directory is the source of truth.** Platform-specific outputs (CSS variables, Swift constants, etc.) are generated from these files, never authored directly.

## Structure

```
design-system/
├── tokens/                    # The atomic values
│   ├── primitives.json        # Colors, spacing, corner cuts — raw values
│   ├── typography.json        # Font families, scale, weights, tracking
│   ├── semantic.json          # Token role definitions (what each token means)
│   ├── effects.json           # Atmosphere: scanlines, glow, pulse, motion
│   └── themes/
│       ├── orange.json        # Default theme: structure=orange, interaction=blue
│       └── blue.json          # Alt theme: structure=blue, interaction=orange
│
├── specs/                     # Component blueprints (not code)
│   ├── chamfer.md             # The signature chamfered corner geometry
│   ├── composition.md         # LeftColumn + ChamferedFrame pattern
│   └── components/            # Per-component specs with dimensions and states
│
├── guides/                    # Design philosophy and rules
│   ├── philosophy.md          # The vision: low-tech sci-fi terminal OS
│   ├── color-logic.md         # Structure vs interaction color system
│   ├── typography.md          # Three fonts, three jobs
│   ├── motion.md              # Mechanical timing, progressive reveal
│   ├── atmosphere.md          # Scan lines, glow, grain, pulse
│   ├── voice.md               # Copy/tone: terse, confident, gym-literate
│   └── states.md              # Universal state definitions
│
└── platform/                  # Generated outputs (DO NOT EDIT)
    ├── web/                   # CSS custom properties
    ├── ios/                   # Swift/SwiftUI tokens
    ├── android/               # Kotlin/Compose tokens
    └── react-native/          # TypeScript token objects
```

## How to use this

### For an LLM implementing a new app

1. Read `tokens/` to understand the visual palette and spacing
2. Read `tokens/semantic.json` to understand what each token role means
3. Read the relevant `themes/*.json` to get the actual color mappings
4. Read `specs/` for component geometry and composition rules
5. Read `guides/` for judgment calls the specs don't cover
6. Implement using the target platform's native components, referencing the token values

### Key concepts

**Structure vs Interaction colors:** The design system has two color roles that swap between themes. "Structure" (orange in default theme) is used for frames, borders, accent bars — the scaffolding. "Interaction" (blue in default theme) is used for buttons, CTAs, links — things you can act on.

**Chamfered corners, not rounded:** The signature visual element is a diagonal cut on the bottom-right corner of containers. Never use border-radius. The cut sizes are: sm (8px), md (12px), lg (24px).

**Emissive, not flat:** Surfaces use alpha-transparent fills (10-60% opacity) against a dark background. Content looks like it's being emitted from a display, not painted on a surface.

**Mechanical motion:** All animations use linear or stepped timing. No spring physics, no bounce. The one exception: ChamferedFrame color transitions use a 1-second ease for an atmospheric "breathing" effect.

## Theme system

Themes don't change the palette — they swap which colors play which roles:

| Token | Orange Theme | Blue Theme |
|-------|-------------|------------|
| `surface.card` | orange @ 10% | blue @ 10% |
| `border.card` | orange 500 | blue 500 |
| `surface.cta-primary` | blue @ 40% | orange @ 40% |
| `border.cta-primary` | blue 500 | orange 500 |
| `surface.selected` | green @ 60% | green @ 60% |

Green (selected) and red (urgency) are theme-independent — they always mean the same thing.

## Status

- [x] Token extraction (primitives, typography, effects)
- [x] Semantic token structure
- [x] Theme definitions (orange, blue)
- [ ] Component specs
- [ ] Design guides (platform-agnostic versions)
- [ ] Platform output generation (Style Dictionary)
- [ ] Web app consuming from design system
