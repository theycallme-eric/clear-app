// ============================================
// Shared canvas utilities for ScanLoader variants
// ============================================

export const CW = 4;  // pixel cell width — small for dense static
export const CH = 4;  // pixel cell height

// ============================================
// GRID
// ============================================

export interface Cell {
  op: number; // base opacity 0.03–0.18
  fr: number; // flicker rate — lower = more flicker
}

export function makeGrid(cols: number, rows: number): Cell[][] {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      op: 0.03 + Math.random() * 0.15,
      fr: 0.82 + Math.random() * 0.16, // faster flicker than text variant
    }))
  );
}

// ============================================
// EASING
// ============================================

export function easeInOutQuad(p: number): number {
  return p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
}

// ============================================
// COLOR
// ============================================

/**
 * Parse a CSS color (hex or rgb) to [r, g, b] tuple.
 * Falls back to orange-500 if parsing fails.
 */
export function parseColor(color: string): [number, number, number] {
  const trimmed = color.trim();

  if (trimmed.startsWith('#')) {
    const hex = trimmed.slice(1);
    if (hex.length === 3) {
      return [
        parseInt(hex[0] + hex[0], 16),
        parseInt(hex[1] + hex[1], 16),
        parseInt(hex[2] + hex[2], 16),
      ];
    }
    if (hex.length >= 6) {
      return [
        parseInt(hex.slice(0, 2), 16),
        parseInt(hex.slice(2, 4), 16),
        parseInt(hex.slice(4, 6), 16),
      ];
    }
  }

  const match = trimmed.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (match) {
    return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
  }

  return [248, 120, 35];
}

/** Read the --primary-300 CSS custom property and parse to RGB */
export function readThemeRGB(): [number, number, number] {
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--primary-300');
  return raw ? parseColor(raw) : [251, 174, 123];
}

// ============================================
// DRAWING
// ============================================

/** Draw scan-relative static noise — clears on trailing side of scanY */
export function drawNoise(
  ctx: CanvasRenderingContext2D,
  grid: Cell[][],
  scanY: number,
  cols: number,
  rows: number,
  rgb: [number, number, number],
  dir: 1 | -1 = 1,
  globalAlpha = 1
) {
  const [r, g, b] = rgb;
  for (let row = 0; row < rows; row++) {
    const cy = row * CH;
    const dist = dir === 1 ? cy - scanY : scanY - cy;
    if (dist < -CH) continue;
    for (let col = 0; col < cols; col++) {
      const cell = grid[row][col];
      // Flicker: randomly reassign opacity
      if (Math.random() > cell.fr) {
        cell.op = 0.03 + Math.random() * 0.15;
      }
      const fadeIn = Math.min(dist / 32, 1);
      const prox = Math.max(0, 1 - Math.abs(dist) / 60) * 0.08;
      const a = (cell.op + prox) * Math.max(0, fadeIn) * globalAlpha;
      if (a < 0.004) continue;
      ctx.fillStyle = `rgba(${r},${g},${b},${a.toFixed(3)})`;
      ctx.fillRect(col * CW, cy, CW - 1, CH - 1);
    }
  }
}

/** Draw uniform static noise — no scan-relative clearing */
export function drawStaticNoise(
  ctx: CanvasRenderingContext2D,
  grid: Cell[][],
  cols: number,
  rows: number,
  rgb: [number, number, number],
  globalAlpha = 1
) {
  const [r, g, b] = rgb;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cell = grid[row][col];
      if (Math.random() > cell.fr) {
        cell.op = 0.03 + Math.random() * 0.15;
      }
      const a = cell.op * globalAlpha;
      if (a < 0.004) continue;
      ctx.fillStyle = `rgba(${r},${g},${b},${a.toFixed(3)})`;
      ctx.fillRect(col * CW, row * CH, CW - 1, CH - 1);
    }
  }
}

/** Draw the glowing scan line */
export function drawScanLine(
  ctx: CanvasRenderingContext2D,
  scanY: number,
  width: number,
  height: number,
  rgb: [number, number, number]
) {
  if (scanY < -4 || scanY > height + 4) return;
  const [r, g, b] = rgb;

  const grad = ctx.createLinearGradient(0, scanY - 12, 0, scanY + 12);
  grad.addColorStop(0, `rgba(${r},${g},${b},0)`);
  grad.addColorStop(0.5, `rgba(${r},${g},${b},0.15)`);
  grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, scanY - 12, width, 24);

  ctx.save();
  ctx.shadowColor = `rgba(${r},${g},${b},0.7)`;
  ctx.shadowBlur = 14;
  ctx.beginPath();
  ctx.moveTo(0, scanY);
  ctx.lineTo(width, scanY);
  ctx.strokeStyle = `rgb(${r},${g},${b})`;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.shadowBlur = 4;
  ctx.beginPath();
  ctx.moveTo(0, scanY);
  ctx.lineTo(width, scanY);
  const hr = Math.min(255, r + (255 - r) * 0.5);
  const hg = Math.min(255, g + (255 - g) * 0.5);
  const hb = Math.min(255, b + (255 - b) * 0.5);
  ctx.strokeStyle = `rgba(${hr | 0},${hg | 0},${hb | 0},0.7)`;
  ctx.lineWidth = 0.7;
  ctx.stroke();
  ctx.restore();
}

/** Subtle CRT horizontal scan line overlay */
export function drawCRTLines(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.fillStyle = 'rgba(0,0,0,0.04)';
  for (let y = 0; y < height; y += 3) {
    ctx.fillRect(0, y, width, 1);
  }
}
