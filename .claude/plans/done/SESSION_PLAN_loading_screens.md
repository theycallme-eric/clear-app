# Session Plan: Loading Screen Component

## Session Goal
Build and integrate three loading screen variants (boot, fullscreen overlay, card loader) using the approved scan line + character noise design pattern.

## Context
- **Spec:** This document + `clear-loading-screen-prototype.html` (reference implementation)
- **Figma:** N/A — design approved via prototype
- **Current state:** `src/pages/Index.tsx` renders a `'loading'` screen state with no implementation (placeholder). Exercise swap loading state is explicitly flagged as a placeholder in `Clear_-_Exercise_Swap_Spec.md`.
- **Related specs:** `Clear_-_Exercise_Swap_Spec.md` (card loader replaces the dim+spinner placeholder)

---

## Background: Three Variants

All three share the same design language — orange (#F87823 / `--color-orange-500`) scan line, character noise grid, dark background — scoped differently per use case.

| Variant | Logo | Message | Behavior | Used For |
|---|---|---|---|---|
| `boot` | ✓ | Status sequence (5 messages) | Plays once, progress bar | App launch / auth check |
| `fullscreen` | ✗ | Single contextual string | Bidirectional loop until dismissed | Workout generation |
| `card` | ✗ | None | Fills card → sweeps → reveals content | Exercise swap |

The prototype (`clear-loading-screen-prototype.html`) is the visual source of truth. Port the canvas logic directly — don't redesign.

---

## Tasks

### 1. Create `<ScanLoader>` base component

**Do:**
Create `src/components/ScanLoader/ScanLoader.tsx` with the shared canvas engine. This is the core — variants compose on top of it.

Props interface:
```typescript
interface ScanLoaderProps {
  // Canvas container — component fills its parent's bounds
  width?: number;   // defaults to 100% of parent
  height?: number;  // defaults to 100% of parent

  // Scan behavior
  direction?: 'down-once' | 'bounce'; // 'down-once' for boot, 'bounce' for fullscreen
  running: boolean;                    // controls animation start/stop
  onComplete?: () => void;             // fires when direction='down-once' finishes
}
```

Implementation notes from prototype:
- Canvas characters: `'01ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%!?><|~-_+=:;'`
- Cell size: 11px wide × 15px tall
- Character opacity: `0.04–0.14` range, flicker at 90.5–99% frame survival rate
- Scan line: 2px `#F87823` stroke + multi-layer glow (14px shadow blur, 4px core blur)
- Noise clears on the trailing side of scan direction
- Easing: ease-in-out-quad on scan position
- Bounce: re-seed grid on direction flip so fresh noise appears ahead of returning scan
- Subtle CRT scanline overlay: `rgba(0,0,0,0.04)` every 3px vertically

**Use tokens, not hardcoded values:**
```css
/* In component or via Tailwind */
--color-orange-500: #F87823   /* scan line + noise color */
--color-neutral-900: #171717  /* background */
--color-neutral-50: #F1F1F1   /* logo text */
```

**Acceptance:**
- [ ] Canvas fills parent container
- [ ] `running=false` → canvas is blank
- [ ] `running=true, direction='down-once'` → single downward sweep, `onComplete` fires
- [ ] `running=true, direction='bounce'` → continuous up/down loop
- [ ] Scan line glow matches prototype visually
- [ ] No hardcoded color values — uses CSS custom properties or token references
- [ ] Handles `ResizeObserver` — canvas redraws correctly when container resizes

---

### 2. Create `<BootScreen>` component

**Do:**
Create `src/components/ScanLoader/BootScreen.tsx`.

```typescript
interface BootScreenProps {
  onComplete: () => void; // called after final sweep — navigate to next screen
}
```

Layout (full screen, fixed position, z-index above everything):
- `<ScanLoader direction="down-once" running={true} onComplete={handleSweepComplete} />`
- CLEAR logo centered — static, Oxanium 700, `clamp(52px, 12vw, 80px)`
- Orange scan line rule across logo at 57% vertical height (static decoration, not the canvas scan line)
- Status message below logo — typewriter effect, 42ms per character
- Progress bar + percentage — bottom center, `min(260px, 65vw)` wide, 1px track

Status message sequence (one per sweep, ~2s each):
1. `AUTHENTICATING USER`
2. `LOADING TRAINING HISTORY`
3. `CALIBRATING INTENSITY`
4. `GENERATING WORKOUT`
5. `SYSTEM READY`

After sweep 5 completes → call `onComplete()`. Do not show a "done" state — just fire the callback and let Index.tsx navigate.

**Acceptance:**
- [ ] Full screen, renders above all other content
- [ ] Logo visible and centered throughout
- [ ] Each sweep triggers the next status message (typewriter)
- [ ] Progress bar advances from 0% → 100% over 5 sweeps
- [ ] `onComplete` fires after final sweep — not before
- [ ] Correct fonts: Oxanium for logo + messages, monospace for noise

---

### 3. Create `<FullscreenLoader>` component

**Do:**
Create `src/components/ScanLoader/FullscreenLoader.tsx`.

```typescript
interface FullscreenLoaderProps {
  message: string;     // e.g. 'GENERATING WORKOUT' or 'LOADING'
  visible: boolean;    // controls show/hide
  onDismiss?: () => void; // optional — if provided, shows close affordance (dev/debug only)
}
```

Layout (full screen, fixed, z-index above everything):
- `<ScanLoader direction="bounce" running={visible} />`
- Message string centered — same position as BootScreen message — typewriter on mount, then static
- No logo, no progress bar
- No close button in production — `onDismiss` is for dev use only
- Dismissed programmatically by parent setting `visible={false}`

**Acceptance:**
- [ ] Full screen when `visible=true`, unmounts (or `display:none`) when `visible=false`
- [ ] Scan line bounces continuously while visible
- [ ] Message types in once on mount, stays static
- [ ] Removing `visible` stops animation cleanly — no orphaned rAF loops
- [ ] `running` prop correctly pauses canvas when not visible (performance)

---

### 4. Create `<CardLoader>` component

**Do:**
Create `src/components/ScanLoader/CardLoader.tsx`.

```typescript
interface CardLoaderProps {
  running: boolean;      // true = start the fill→sweep sequence
  onSweepComplete: () => void; // fire at the moment the scan line exits the bottom
                               // parent swaps content here, THEN CardLoader fades out
}
```

Sequence (reference prototype for timing):
1. **Fill phase** (200ms): Noise fades in over the card
2. **Sweep phase** (750ms): Scan line sweeps top → bottom, clearing noise
3. At sweep complete: fire `onSweepComplete()` — parent updates content in DOM
4. **Fade phase** (260ms): Canvas fades out, revealing new content beneath

Component renders as `position: absolute; inset: 0` — it overlays its parent card. Parent card needs `position: relative; overflow: hidden`.

No noise re-seed between phases — this is a single one-way pass. Content reveal is the payoff.

**Acceptance:**
- [ ] Fills parent bounds via absolute positioning
- [ ] `running=false` → invisible (opacity 0, pointer-events none)
- [ ] `running=true` → fill → sweep → `onSweepComplete()` fires → fade out
- [ ] Parent content update happens between sweep complete and fade-out (content visible after canvas clears)
- [ ] Card height does NOT shift during animation — layout stable throughout
- [ ] Re-triggerable: `running` can go true → false → true for repeated swaps
- [ ] Canvas teardown is clean — no rAF loops running when `running=false`

---

### 5. Wire `BootScreen` into Index.tsx

**Do:**
Replace the `'loading'` screen state placeholder in `src/pages/Index.tsx` with `<BootScreen>`.

```typescript
// In the screen render block:
{currentScreen === 'loading' && (
  <BootScreen onComplete={() => {
    // Auth check should be done by now — route to correct next screen
    // (this callback fires after the animation; routing logic already exists)
  }} />
)}
```

The existing auth + routing logic doesn't change — the boot animation just plays while auth resolves. If auth resolves before the animation finishes, wait for `onComplete` before navigating. If auth resolves after, navigate immediately on `onComplete`.

Simplest implementation: kick off auth check on mount as before, store result in state, navigate when BOTH auth is resolved AND `onComplete` has fired.

**Acceptance:**
- [ ] App launch shows boot sequence
- [ ] Boot sequence plays to completion before navigating
- [ ] Auth resolving early doesn't interrupt animation
- [ ] Auth resolving late doesn't cause extra delay after animation
- [ ] No regression to existing auth flow

---

### 6. Wire `FullscreenLoader` into workout generation flow

**Do:**
In the generation flow (currently in `src/hooks/useWorkoutFlow.ts` or `Index.tsx`), show `<FullscreenLoader message="GENERATING WORKOUT" />` while `isGenerating === true`.

```typescript
// Wherever the generation screen is rendered:
<FullscreenLoader
  message="GENERATING WORKOUT"
  visible={isGenerating}
/>
```

This renders above the generation screen content. When `isGenerating` flips to false, `FullscreenLoader` hides and the review screen takes over.

**Acceptance:**
- [ ] Loader appears immediately when generation starts
- [ ] Loader disappears when generation completes (or errors)
- [ ] No flash of generation screen content during loading
- [ ] Error state: loader hides, error handling proceeds normally

---

### 7. Wire `CardLoader` into exercise swap

**Do:**
In the exercise card component used on the Review screen, replace the existing dim+spinner placeholder loading state with `<CardLoader>`.

Find the component handling single exercise swap (likely in `src/pages/ReviewScreen.tsx` or a child component). The swap flow currently:
1. Sets loading state on the card
2. Fires API call
3. Updates exercise on response

Update to:
1. Set `cardLoading=true` → `<CardLoader running={true} />`
2. Fire API call
3. In `onSweepComplete`: call the state update that swaps the exercise content
4. `CardLoader` fades out, revealing new content

```typescript
<div style={{ position: 'relative', overflow: 'hidden' }}>
  <ExerciseCardContent exercise={currentExercise} />
  <CardLoader
    running={isSwapping}
    onSweepComplete={() => {
      // This is where you update currentExercise to the new one
      setCurrentExercise(newExercise);
      setIsSwapping(false);
    }}
  />
</div>
```

**Acceptance:**
- [ ] Swap icon tap triggers CardLoader
- [ ] Noise fills card, scan sweeps, content updates, canvas fades out
- [ ] New exercise content revealed cleanly
- [ ] Card height stable throughout
- [ ] Works for single exercise swap only in this phase (section randomize can keep spinner for now)

---

## Design System Compliance
- Use CSS custom properties from `src/index.css` — no hardcoded hex values
- Fonts: `font-family: 'Oxanium'` for UI text (already loaded), monospace for noise characters
- All spacing and sizing via Tailwind tokens where possible
- No new dependencies — canvas API only, no animation libraries

## Prototype Reference
`clear-loading-screen-prototype.html` — port canvas logic directly. The prototype is vanilla JS; translate to React using `useRef` for the canvas element and `useEffect` for the animation loop. Use `useRef` for rAF handle to ensure cleanup on unmount.

```typescript
// Pattern for rAF cleanup in React:
const rafRef = useRef<number>();
useEffect(() => {
  // start loop
  rafRef.current = requestAnimationFrame(frame);
  return () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  };
}, [running]);
```

---

## File Structure After This Session

```
src/components/ScanLoader/
├── ScanLoader.tsx        ← canvas engine (Tasks 1)
├── BootScreen.tsx        ← boot variant (Task 2)
├── FullscreenLoader.tsx  ← fullscreen variant (Task 3)
├── CardLoader.tsx        ← card variant (Task 4)
└── index.ts              ← barrel export
```

---

## After Session (REQUIRED — you are not done until this is complete)
- [ ] Update `SESSION_LOG.md` with: Date, Tasks Completed, Files Touched
- [ ] Update `PROJECT_MAP.md`: add `src/components/ScanLoader/` to component directory
- [ ] Note in `Clear_-_Exercise_Swap_Spec.md`: loading placeholder replaced by `<CardLoader>`
- [ ] Confirm: "Session complete. Log and Backlog updated. Ready for next plan."
