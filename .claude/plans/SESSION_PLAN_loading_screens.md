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
| `boot` | Yes | Status sequence (up to 5 messages) | Plays sweeps until `ready`, then exits cleanly | App launch / auth check |
| `fullscreen` | No | Single contextual string | Bidirectional loop until dismissed | Workout generation |
| `card` | No | None | Fills card, sweeps, reveals content | Exercise swap |

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
- Cell size: 11px wide x 15px tall
- Character opacity: `0.04-0.14` range, flicker at 90.5-99% frame survival rate
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
- [ ] `running=false` -> canvas is blank
- [ ] `running=true, direction='down-once'` -> single downward sweep, `onComplete` fires
- [ ] `running=true, direction='bounce'` -> continuous up/down loop
- [ ] Scan line glow matches prototype visually
- [ ] No hardcoded color values — uses CSS custom properties or token references
- [ ] Handles `ResizeObserver` — canvas redraws correctly when container resizes

---

### 2. Create `<BootScreen>` component

**Do:**
Create `src/components/ScanLoader/BootScreen.tsx`.

```typescript
interface BootScreenProps {
  ready: boolean;        // true once auth/data has resolved
  onComplete: () => void; // called when boot animation is done — navigate to next screen
}
```

Layout (full screen, fixed position, z-index above everything):
- `<ScanLoader direction="down-once" running={true} onComplete={handleSweepComplete} />`
- CLEAR logo centered — static, Oxanium 700, `clamp(52px, 12vw, 80px)`
- Orange scan line rule across logo at 57% vertical height (static decoration, not the canvas scan line)
- Status message below logo — typewriter effect, 42ms per character
- Progress bar + percentage — bottom center, `min(260px, 65vw)` wide, 1px track

Status message sequence (one per sweep, shown in order as sweeps play):
1. `AUTHENTICATING USER`
2. `LOADING TRAINING HISTORY`
3. `CALIBRATING INTENSITY`
4. `GENERATING WORKOUT`
5. `SYSTEM READY`

**Interruptible behavior:**
- The boot sequence does NOT require all 5 sweeps to complete
- When `ready` becomes true mid-sweep, finish the CURRENT sweep so the scan line exits cleanly (no sharp visual jump), then fire `onComplete()` immediately
- If `ready` is already true when BootScreen mounts, still play at least one full sweep for visual continuity before firing `onComplete()`
- Status messages advance in order as sweeps play, but stop advancing once `ready` triggers early exit
- Progress bar: if exiting early, snap to 100% on the final sweep before calling `onComplete()`

**Acceptance:**
- [ ] Full screen, renders above all other content
- [ ] Logo visible and centered throughout
- [ ] Each sweep triggers the next status message (typewriter)
- [ ] Progress bar advances proportionally across played sweeps
- [ ] When `ready` is true, current sweep finishes cleanly, then `onComplete` fires
- [ ] If `ready` is true on mount, at least one full sweep plays before `onComplete`
- [ ] Progress bar snaps to 100% on the final (exit) sweep
- [ ] `onComplete` never fires before a sweep finishes — no mid-animation jumps
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
  running: boolean;      // true = start the fill->sweep sequence
  onSweepComplete: () => void; // fire at the moment the scan line exits the bottom
                               // parent swaps content here, THEN CardLoader fades out
}
```

Sequence (reference prototype for timing):
1. **Fill phase** (200ms): Noise fades in over the card
2. **Sweep phase** (750ms): Scan line sweeps top -> bottom, clearing noise
3. At sweep complete: fire `onSweepComplete()` — parent updates content in DOM
4. **Fade phase** (260ms): Canvas fades out, revealing new content beneath

Component renders as `position: absolute; inset: 0` — it overlays its parent card. Parent card needs `position: relative; overflow: hidden`.

No noise re-seed between phases — this is a single one-way pass. Content reveal is the payoff.

**Acceptance:**
- [ ] Fills parent bounds via absolute positioning
- [ ] `running=false` -> invisible (opacity 0, pointer-events none)
- [ ] `running=true` -> fill -> sweep -> `onSweepComplete()` fires -> fade out
- [ ] Parent content update happens between sweep complete and fade-out (content visible after canvas clears)
- [ ] Card height does NOT shift during animation — layout stable throughout
- [ ] Re-triggerable: `running` can go true -> false -> true for repeated swaps
- [ ] Canvas teardown is clean — no rAF loops running when `running=false`

---

### 5. Wire `BootScreen` into route guards

**Do:**
Replace the `<LoadingScreen>` placeholder in `src/routes/guards.tsx` with `<BootScreen>`.

The three route guard components (`ProtectedRoute`, `PublicOnlyRoute`, `OnboardingRoute`) each currently render `<LoadingScreen subtitle="Initializing..." />` when `status === 'loading'`. The BootScreen should replace `<LoadingScreen>` in these guards — at minimum in `ProtectedRoute`, which is the main entry point.

The `ready` prop maps to `status !== 'loading'` (auth resolved). `onComplete` triggers the existing routing logic — the guard already handles redirect, so BootScreen just delays it visually until the animation finishes.

```typescript
// In ProtectedRoute (src/routes/guards.tsx):
const { status, profile } = useAuthContext();
const [bootComplete, setBootComplete] = useState(false);

// Show boot screen while loading OR while boot animation hasn't finished
if (status === 'loading' || !bootComplete) {
  return (
    <BootScreen
      ready={status !== 'loading'}
      onComplete={() => setBootComplete(true)}
    />
  );
}

// After boot completes, existing routing logic runs:
if (status === 'unauthenticated') {
  return <Navigate to="/welcome" replace />;
}
// ...etc
```

For `PublicOnlyRoute` and `OnboardingRoute`, keep `<LoadingScreen>` or use a simpler treatment — the boot sequence is primarily for the main app entry.

**Acceptance:**
- [ ] App launch shows boot sequence in `ProtectedRoute`
- [ ] Boot animation plays until `ready` becomes true, then finishes current sweep and fires `onComplete`
- [ ] If auth resolves quickly, at least one full sweep plays
- [ ] After `onComplete`, guard proceeds with normal routing (redirect or render outlet)
- [ ] No regression to existing auth flow
- [ ] `PublicOnlyRoute` and `OnboardingRoute` still show a loading state (either BootScreen or existing LoadingScreen)

---

### 6. Wire `FullscreenLoader` into workout generation flow

**Do:**
In `src/pages/GenerationScreen.tsx`, show `<FullscreenLoader message="GENERATING WORKOUT" />` while `isGenerating === true`. The `isGenerating` state is consumed at line 18 from `useWorkoutFlowContext()` and currently only drives the `GenerateButton` loading state.

The FullscreenLoader should render in `GenerationScreen.tsx` alongside the existing content, overlaying the generation form while the API call is in progress.

```typescript
// In GenerationScreen.tsx:
import { FullscreenLoader } from "@/components/ScanLoader";

// ... existing component code ...

return (
  <AppLayout
    header={<PageHeader ... />}
    footer={<GenerateButton onClick={handleGenerate} disabled={!canGenerate} isLoading={isGenerating} />}
  >
    <div className="pt-6 space-y-6 stagger-reveal">
      {/* ...existing form fields... */}
    </div>

    <FullscreenLoader
      message="GENERATING WORKOUT"
      visible={isGenerating}
    />
  </AppLayout>
);
```

**Acceptance:**
- [ ] FullscreenLoader appears immediately when generation starts (`isGenerating` becomes true)
- [ ] FullscreenLoader disappears when generation completes (or errors) — `isGenerating` becomes false
- [ ] FullscreenLoader renders above the generation form content
- [ ] Error state: loader hides, error handling proceeds normally

---

### 7. Wire `CardLoader` into exercise swap

**Do:**
Replace the existing opacity-dim loading pattern in `src/components/ExerciseCard.tsx` and `src/components/WorkoutSectionCard.tsx` with `<CardLoader>`.

Currently:
- `ExerciseCard.tsx` (line 41): `opacity: isSwapLoading ? 0.5 : 1` — dims the entire card when `isSwapLoading` is true
- `WorkoutSectionCard.tsx` (line 163): `opacity: isLoading ? 0.5 : 1` — dims grouped exercises when `isSwapLoading` is true on the group controls

CardLoader replaces this `opacity: 0.5` dim pattern in both components:

```typescript
// In ExerciseCard.tsx — replace the opacity dim wrapper:
<div style={{ position: 'relative', overflow: 'hidden' }}>
  {/* ...existing exercise card content... */}
  <CardLoader
    running={isSwapLoading}
    onSweepComplete={() => {
      // Content update happens via parent state — CardLoader just provides the visual transition
    }}
  />
</div>

// In WorkoutSectionCard.tsx — replace the opacity dim on grouped exercises:
<div
  key={`group-${group.groupId || groupIdx}`}
  style={{ position: 'relative', overflow: 'hidden' }}
>
  {/* ...existing group content... */}
  <CardLoader
    running={isLoading}
    onSweepComplete={() => {
      // Content update happens via parent state
    }}
  />
</div>
```

**Acceptance:**
- [ ] Swap tap triggers CardLoader instead of opacity dim in ExerciseCard (`isSwapLoading` prop)
- [ ] Group swap triggers CardLoader instead of opacity dim in WorkoutSectionCard (`isLoading` from `groupControls?.isSwapLoading`)
- [ ] Noise fills card, scan sweeps, content updates, canvas fades out
- [ ] New exercise content revealed cleanly
- [ ] Card height stable throughout
- [ ] No remaining `opacity: 0.5` swap loading patterns

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
--- ScanLoader.tsx        <- canvas engine (Tasks 1)
--- BootScreen.tsx        <- boot variant (Task 2)
--- FullscreenLoader.tsx  <- fullscreen variant (Task 3)
--- CardLoader.tsx        <- card variant (Task 4)
--- index.ts              <- barrel export
```

---

## After Session (REQUIRED — you are not done until this is complete)
- [ ] Update `SESSION_LOG.md` with: Date, Tasks Completed, Files Touched
- [ ] Update `PROJECT_MAP.md`: add `src/components/ScanLoader/` to component directory
- [ ] Note in `Clear_-_Exercise_Swap_Spec.md`: loading placeholder replaced by `<CardLoader>`
- [ ] Confirm: "Session complete. Log and Backlog updated. Ready for next plan."
