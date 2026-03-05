import { useRef, useEffect, useCallback } from 'react';
import {
  type Cell,
  CW, CH,
  makeGrid,
  easeInOutQuad,
  readThemeRGB,
  drawNoise,
  drawScanLine,
  drawCRTLines,
} from './canvas-utils';

// ============================================
// TYPES
// ============================================

export interface ScanLoaderProps {
  /** 'down-once' for boot/card, 'bounce' for fullscreen loop */
  direction?: 'down-once' | 'bounce';
  /** Controls animation start/stop */
  running: boolean;
  /** Fires when a sweep completes (once for down-once, each direction flip for bounce) */
  onSweepComplete?: () => void;
}

// ============================================
// CONSTANTS
// ============================================

const SWEEP_MS = 2000;

// ============================================
// COMPONENT
// ============================================

export const ScanLoader = ({
  direction = 'down-once',
  running,
  onSweepComplete,
}: ScanLoaderProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const stateRef = useRef({
    grid: null as Cell[][] | null,
    cols: 0,
    rows: 0,
    filling: true, // true = fill sweep (up), false = clear sweep (down)
    t0: null as number | null,
    rgb: [248, 120, 35] as [number, number, number],
  });

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const rect = parent.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) ctx.scale(dpr, dpr);

    const cols = Math.ceil(rect.width / CW) + 2;
    const rows = Math.ceil(rect.height / CH) + 2;
    stateRef.current.cols = cols;
    stateRef.current.rows = rows;
    stateRef.current.grid = makeGrid(cols, rows);
  }, []);

  // Animation loop
  useEffect(() => {
    if (!running) {
      // Clear canvas when stopped
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }

    stateRef.current.rgb = readThemeRGB();
    resize();
    stateRef.current.t0 = null;
    stateRef.current.filling = true; // start with fill sweep (up)

    const frame = (ts: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const s = stateRef.current;
      if (!s.grid) return;

      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;

      if (s.t0 === null) s.t0 = ts;

      const p = Math.min((ts - s.t0) / SWEEP_MS, 1);
      const e = easeInOutQuad(p);

      let scanY: number;
      if (direction === 'down-once') {
        scanY = e * h;
      } else {
        // Bounce: fill sweep goes up (h→0), clear sweep goes down (0→h)
        // Noise is always drawn below scanY (dir=1)
        // Fill: scanY shrinks → noise zone grows (fills from bottom)
        // Clear: scanY grows → noise zone shrinks (clears from top)
        scanY = s.filling ? h * (1 - e) : h * e;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawCRTLines(ctx, w, h);
      // Always dir=1: noise draws below scanY. Scan direction handles fill vs clear.
      drawNoise(ctx, s.grid, scanY, s.cols, s.rows, s.rgb, 1);
      drawScanLine(ctx, scanY, w, h, s.rgb);

      if (p >= 1) {
        if (direction === 'down-once') {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          onSweepComplete?.();
          return;
        } else {
          // Bounce: alternate fill/clear — keep the same grid (no re-seed)
          s.filling = !s.filling;
          s.t0 = null;
          onSweepComplete?.();
        }
      }

      rafRef.current = requestAnimationFrame(frame);
    };

    rafRef.current = requestAnimationFrame(frame);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [running, direction, onSweepComplete, resize]);

  // ResizeObserver
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas?.parentElement) return;

    const observer = new ResizeObserver(() => {
      if (running) resize();
    });
    observer.observe(canvas.parentElement);
    return () => observer.disconnect();
  }, [running, resize]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
      }}
    />
  );
};
