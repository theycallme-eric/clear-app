import { useRef, useEffect } from 'react';
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

interface CardLoaderProps {
  /** true starts the bounce loop, false triggers fade-out */
  running: boolean;
}

// ============================================
// CONSTANTS
// ============================================

const SWEEP_MS = 2000;
const FADE_MS = 260;

// ============================================
// COMPONENT
// ============================================

/**
 * Overlay loader for exercise cards during swap.
 * Bounce loop (fill up / clear down) while running, fades out when stopped.
 * Parent needs position:relative overflow:hidden.
 */
export const CardLoader = ({ running }: CardLoaderProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const runningRef = useRef(running);
  runningRef.current = running;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    if (!running) {
      // Fade out
      const start = performance.now();
      const fadeOut = (ts: number) => {
        const p = Math.min((ts - start) / FADE_MS, 1);
        canvas.style.opacity = (1 - p).toFixed(3);
        if (p < 1) {
          rafRef.current = requestAnimationFrame(fadeOut);
        } else {
          canvas.style.opacity = '0';
          const ctx = canvas.getContext('2d');
          if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      };
      rafRef.current = requestAnimationFrame(fadeOut);
      return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    }

    // Setup canvas
    const rect = parent.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    canvas.style.opacity = '1';

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const cols = Math.ceil(w / CW) + 2;
    const rows = Math.ceil(h / CH) + 2;
    const grid: Cell[][] = makeGrid(cols, rows);
    const rgb = readThemeRGB();

    let filling = true;
    let t0: number | null = null;

    const frame = (ts: number) => {
      if (t0 === null) t0 = ts;

      const p = Math.min((ts - t0) / SWEEP_MS, 1);
      const e = easeInOutQuad(p);

      // Same bounce logic as ScanLoader
      const scanY = filling ? h * (1 - e) : h * e;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawCRTLines(ctx, w, h);
      drawNoise(ctx, grid, scanY, cols, rows, rgb, 1);
      drawScanLine(ctx, scanY, w, h, rgb);

      if (p >= 1) {
        filling = !filling;
        t0 = null;
      }

      rafRef.current = requestAnimationFrame(frame);
    };

    rafRef.current = requestAnimationFrame(frame);

    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [running]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 2,
        pointerEvents: 'none',
        opacity: 0,
      }}
    />
  );
};
