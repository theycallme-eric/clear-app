---
name: anti-patterns
description: Common LLM mistakes when building CLEAR components and how to fix them
trigger: Building new components, reviewing code, avoiding known pitfalls
category: ui
---

# Anti-Patterns

Common mistakes when building CLEAR components. Every "Don't" has been observed in practice.

---

## Colors

| Don't | Do | Why |
|-------|-----|-----|
| `color: #00A9F4` | `color: var(--text-cta)` | Hardcoded colors break theming |
| `background: rgb(248, 120, 35)` | `background: var(--surface-card-accent)` | Same — use semantic tokens |
| `border-color: var(--color-orange-500)` | `border-color: var(--border-card)` | Primitive tokens are for `index.css` only, never in components |
| `fill: var(--color-blue-alpha-400)` | `fill: var(--surface-cta-primary)` | Use the semantic layer |
| `background: #171717` | `background: var(--background)` | Even "obvious" colors must use tokens |

**Rule:** Components only use `--surface-*`, `--border-*`, `--text-*`, `--icon-*`, `--brand-*` tokens. Primitive tokens (`--color-orange-*`, `--color-blue-*`, etc.) are only referenced inside `src/index.css` semantic definitions.

---

## Shapes

| Don't | Do | Why |
|-------|-----|-----|
| `border-radius: 8px` | Use `ChamferedFrame` or `corner-cut` class | CLEAR uses chamfered (angled) corners, never rounded |
| `rounded-lg`, `rounded-full` | `ChamferedFrame cornerSize="sm"` | No rounded corners in the design system |
| `border-radius: 50%` on UI elements | Square or chamfered containers | Only gradient background blobs use `border-radius` |

**Rule:** The `--radius` token is set to `0px`. Every container uses angular geometry.

---

## Icons

| Don't | Do | Why |
|-------|-----|-----|
| `import { Play } from "lucide-react"` | `import { PlayIcon } from "@/components/icons"` | CLEAR has its own icon set |
| Using any Lucide icon directly | Check `src/components/icons.tsx` first | If the icon doesn't exist, follow `icon-transform.md` to add it |
| `<Play size={24} />` | `<PlayIcon style={{ width: 24, height: 24 }} />` | CLEAR icons use standard React patterns |

**Rule:** `lucide-react` should not appear in new component imports. (Some legacy usage exists — don't add more.)

---

## Animation

| Don't | Do | Why |
|-------|-----|-----|
| `transition: all 0.5s ease-in-out` | `transition: fill 1s ease` (ChamferedFrame only) or ≤200ms | Long smooth transitions feel consumer-app, not terminal |
| `spring`, `bounce`, `elastic` easing | `linear` or `steps(N, end)` | Motion is mechanical, not organic |
| `animation-duration: 800ms` | ≤200ms (except ChamferedFrame 1s fill) | Quick, stepped transitions |
| Animating for decoration | Only animate on state change | Every motion communicates a state change |
| `ease-in-out` on UI transitions | `steps(3, end)` for reveals, `linear` for rotation | Stepped = mechanical = CLEAR |

**The one exception:** ChamferedFrame fill/stroke transition is `1s ease`. This is the system's "heartbeat" — the single atmospheric, slow animation. Everything else is fast and stepped.

---

## Typography

| Don't | Do | Why |
|-------|-----|-----|
| `style={{ fontFamily: 'Oxanium' }}` | `className="text-label-md"` | Typography classes ensure consistency |
| `style={{ fontSize: 14 }}` | `className="text-paragraph-sm"` | Use the pre-defined sizes |
| `style={{ fontWeight: 700 }}` alone | Pair with correct typography class | Classes already set the right weight |
| Mixing font families ad hoc | Rajdhani for headings, Oxanium for labels/CTAs, Space Grotesk for body | Three fonts, three jobs |

---

## Hover States

| Don't | Do | Why |
|-------|-----|-----|
| React `useState` + `onMouseEnter`/`onMouseLeave` to swap ChamferedFrame props | CSS custom property technique | React state causes re-render; CSS variables are paint-only |
| `:hover` in CSS trying to change inline `style={{ fill }}` | Set `--btn-surface` in default, override in hover class | CSS `:hover` can't reach SVG inline styles |
| Changing `surfaceColor` prop on hover | `surfaceColor="var(--btn-surface)"` + CSS class hover override | Props trigger React re-render; CSS vars just repaint |

See `chamfered-component.md` Section A for the full CSS variable hover pattern.

---

## Composition (LeftColumn + ChamferedFrame)

| Don't | Do | Why |
|-------|-----|-----|
| `hasLeftBorder={true}` when using LeftColumn | `hasLeftBorder={false}` + `marginLeft: -2` | Double border at the junction looks broken |
| Forgetting `zIndex: 10` on LeftColumn | Always set `style={{ position: 'relative', zIndex: 10 }}` | LeftColumn must sit above the ChamferedFrame overlap |
| Building Card-like layouts from scratch | Use the `Card` component | Card handles LeftColumn + ChamferedFrame + overlap + padding |

---

## Atmosphere

| Don't | Do | Why |
|-------|-----|-----|
| `scanlines` on every element | Only on blurred/frosted surfaces, CTA buttons, modal overlays | Over-applied, it looks like a rendering bug |
| `pulse-micro` on content text | Only on structural elements (accent bars, borders, LeftColumn) | Content should be stable; structure should hum |
| `glow-emissive` on body text | Only on key data: timers, streak numbers, logo | Glow is a signal, not decoration |
| `stagger-reveal` with >8 children | Up to 8 children (auto-indexed). Beyond that, set `--stagger-index` manually | Only 8 CSS selectors are defined |

---

## Voice & Copy

| Don't | Do | Why |
|-------|-----|-----|
| "Let's get started!" | "Initiate Workout" | Imperative, not inviting |
| "Great job! You're amazing!" | "Nice Work." | Earned celebration, terse |
| "Take a break, you deserve it" | "Mark Rest Day" | No guilt, no pressure |
| "Your fitness journey starts here" | "Strength training, simplified." | Factual, not motivational |
| Full sentences in labels | Abbreviated: "Int. 7", "3x10" | Labels are stenciled, not typed |
| Exclamation stacking ("!!!") | One "!" maximum, or none | The system is composed |

---

## Containers

| Don't | Do | Why |
|-------|-----|-----|
| Wrap each form field in its own `ChamferedFrame` | Wrap the group in a `Card` | One frame per group, not per field |
| Put a `Card` inside a `Card` | Use a plain `<div>` between framed elements | No double-framing |
| Put a `ChamferedFrame` inside a `Card` | Use plain `<div>` — Card already has a ChamferedFrame | Double-framing |
| Build page layout from scratch | Use `AppLayout`, `WorkoutLayout`, `AuthLayout`, or `OnboardingLayout` | Consistent structure |
| Invent new page-level spacing | Use `--spacing-600` between major sections, `--spacing-200` between list items | Match existing pages |
| Apply atmosphere without checking existing pages | Reference similar existing pages first, then extend if needed | Start from what exists, don't invent from scratch |

## Automated Checks

Run `npx tsx scripts/token-lint.ts` to catch mechanical violations (hex colors, primitive tokens, border-radius, lucide-react imports). This doesn't catch semantic mistakes (wrong token choice) — use `token-decision-tree.md` for those decisions.

---

## CSS Patterns

| Don't | Do | Why |
|-------|-----|-----|
| `!important` | Fix the specificity issue properly | Bandaid that creates cascading problems |
| `@ts-ignore` / `as any` | Fix the type error | Type safety prevents bugs |
| `setTimeout` to fix race conditions | Fix the underlying timing issue | Fragile workaround |
| `try/catch` to silence errors | Handle or propagate the error | Hidden errors cause worse bugs later |

---

## Related Skills

- [ui-rules](ui-rules.md) — Spacing, typography, visual hierarchy
- [token-decision-tree](token-decision-tree.md) — Which token to use
- [chamfered-component](chamfered-component.md) — Correct composition patterns
- [component](component.md) — Pre-flight checklist
