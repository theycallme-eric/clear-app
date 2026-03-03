/**
 * AnimatedBackground — Slowly drifting gradient blobs behind the app.
 *
 * Renders 4 oversized radial-gradient elements that animate via CSS
 * transforms (GPU-accelerated). Sits at z-index -3, beneath the
 * dark overlay (body::after, z-index -2) and grain/scanlines (z-index -1).
 *
 * Responsive: mobile uses vw/vh sizing for portrait viewports,
 * desktop (768px+) uses vmax for wide viewports.
 *
 * Falls back to static PNG backgrounds when prefers-reduced-motion is set.
 */
export function AnimatedBackground() {
  return (
    <div className="bg-animated-layer" aria-hidden="true">
      <div className="bg-blob bg-blob-amber" />
      <div className="bg-blob bg-blob-blue" />
      <div className="bg-blob bg-blob-cyan" />
      <div className="bg-blob bg-blob-dark" />
    </div>
  );
}
