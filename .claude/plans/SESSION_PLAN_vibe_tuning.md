# Session Plan: Vibe Tuning — Transitions & Atmosphere

## Context

The navigation system migration is complete (Phases 1–4). Route transition animations are wired in and functional. This session is for tuning how those transitions *feel* and layering in the atmospheric details that make CLEAR feel like a living system.

**Read `docs/design-philosophy.md` before doing anything.** The Motion section is the north star:
> "Mechanical, not organic. Stepped, not eased. Linear, not springy. Brief mechanical transitions (150-200ms)."

## What's in place

### Route transition system
- **`src/transitions.css`** — Keyframes + CSS variables. All animations use `steps(4, end)` timing (mechanical/ratcheting) at 150-180ms.
- **`src/hooks/useTransitionDirection.ts`** — Route depth map determines forward/back. Special cases for workout entry (up), workout exit (down), summary→home (hard cut).
- **`src/components/RouteTransition.tsx`** — Wrapper keyed by pathname, applied in all 3 route guards.
- **`src/routes/guards.tsx`** — `RouteTransition` wraps `<Outlet />` inside `<ErrorBoundary>`.

### Current animation values

| CSS Variable | Value | Purpose |
|---|---|---|
| `--transition-duration` | 150ms | Standard nav transitions |
| `--transition-duration-mode` | 180ms | Workout entry/exit |
| `--transition-easing` | linear | Fade-only animations |
| `--transition-steps` | steps(4, end) | Stepped movement animations |

| Animation | Class | Transform | Notes |
|---|---|---|---|
| Forward | `route-enter-forward` | translateX(16px) → 0, stepped | Deeper in nav stack |
| Back | `route-enter-back` | translateX(-16px) → 0, stepped | Shallower in nav stack |
| Workout entry | `route-enter-up` | translateY(24px) → 0, stepped | Entering focused mode |
| Workout exit | `route-enter-down` | translateY(-12px) → 0, stepped | Leaving focused mode |
| Hard cut | `route-enter-fade` | opacity 0 → 1, linear | Summary → Home |
| None | `route-enter-none` | instant | Same-route, initial load |

## Tuning areas

### 1. Transition feel
Walk through these flows and tune by eye:
- Home → Generate → Review → Workout → Summary → Home (full session arc)
- Home → History → Session Detail → Back → Back (drill-down/return)
- Home → Settings → Back (sidebar pattern)
- Browser back button at each step

Questions to answer by feel:
- Is `steps(4, end)` the right step count? Try 3, 5, 6.
- Is 150ms right? Could be 120ms for snappier or 180ms for more visible.
- Are the translate distances (16px, 24px, 12px) perceivable? Too subtle? Too much?
- Does the workout entry feel like entering a focused mode?
- Does the hard cut (summary → home) feel like mission debrief → reset?

### 2. Atmosphere layers (from design-philosophy.md)
The doc describes these atmospheric elements. They're currently absent — add them as seasoning:

- **Scan lines** — Faint horizontal lines via `repeating-linear-gradient`, very low opacity on surfaces
- **Glow / bloom** — Subtle `box-shadow`/`text-shadow` on timer, logo, streak numbers
- **Micro-pulse** — Barely perceptible brightness oscillation on accent bars/borders
- **Progressive reveal** — Data sections staggering in on page load (stepped timing, not smooth)
- **Urgency escalation** — Timer low → environment shifts (scan lines intensify, glow blooms)

**Caution:** "Seasoning, not the main course. Subtle enough you'd only notice if removed."

### 3. Progressive reveal pattern
The design philosophy calls for "staggered sequential reveals" rather than everything appearing at once. This would apply to:
- Home screen cards (streak, history, actions)
- Generation screen sections
- Workout section content
- History list items

Implementation approach: a `useStaggeredReveal` hook or CSS animation with `animation-delay` on children.

## Key files

| File | Purpose |
|---|---|
| `src/transitions.css` | Keyframes + variables — all timing/distance tuning |
| `src/hooks/useTransitionDirection.ts` | Route depth map + special cases |
| `src/components/RouteTransition.tsx` | Transition wrapper structure |
| `docs/design-philosophy.md` | The north star — Motion, Atmosphere Toolkit, What CLEAR Never Is |

## Acceptance criteria

- [ ] Route transitions feel mechanical/stepped, not smooth/fluid
- [ ] Workout entry/exit is perceptibly distinct from standard nav
- [ ] Back button feels like reverse of forward
- [ ] No jank or layout shift during transitions
- [ ] `prefers-reduced-motion` disables all animations
- [ ] At least one atmosphere layer applied (scan lines or glow)
- [ ] Nothing animates without communicating a state change
