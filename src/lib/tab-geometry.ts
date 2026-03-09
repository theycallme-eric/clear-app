/**
 * tab-geometry.ts — Shared constants and pure geometry functions
 * for tab polygon math used by TabBar (standalone) and TabbedPanel (embedded).
 */

/** Tab row height in pixels — matches h-10 (40px) */
export const TAB_HEIGHT = 40;

/** Chamfer size for tab diagonals — matches ChamferedFrame "sm" (8px) */
export const TAB_CHAMFER = 8;

/** Border stroke width */
export const BORDER_WIDTH = 2;

/**
 * Get the fill polygon path for a single tab.
 *
 * Between tab[i] and tab[i+1], there's a diagonal cut.
 * The active tab is always wider at the bottom (connects to panel).
 *
 * If activeIndex <= i: active is left of boundary → diagonal runs top-left to bottom-right
 * If activeIndex > i:  active is right of boundary → diagonal runs top-right to bottom-left
 */
export function getTabPolygon(
  i: number,
  activeIndex: number,
  n: number,
  w: number,
  h: number,
  chamfer: number = TAB_CHAMFER,
): string {
  const tabW = w / n;
  const leftX = i * tabW;
  const rightX = (i + 1) * tabW;

  // Left edge
  let topLeftX: number;
  let bottomLeftX: number;
  if (i === 0) {
    topLeftX = 0;
    bottomLeftX = 0;
  } else {
    if (activeIndex < i) {
      // Active is to the left → this tab's left edge is indented at bottom
      topLeftX = leftX;
      bottomLeftX = leftX + chamfer;
    } else {
      // Active is at or right → this tab's left edge is indented at top
      topLeftX = leftX + chamfer;
      bottomLeftX = leftX;
    }
  }

  // Right edge
  let topRightX: number;
  let bottomRightX: number;
  if (i === n - 1) {
    topRightX = w;
    bottomRightX = w;
  } else {
    if (activeIndex <= i) {
      // Active is at or left → this tab extends at bottom-right
      topRightX = rightX;
      bottomRightX = rightX + chamfer;
    } else {
      // Active is to the right → this tab extends at top-right
      topRightX = rightX + chamfer;
      bottomRightX = rightX;
    }
  }

  return `M ${topLeftX} 0 L ${topRightX} 0 L ${bottomRightX} ${h} L ${bottomLeftX} ${h} Z`;
}

/**
 * Get the stroke path for a single tab (standalone mode).
 * Active tab: open at bottom (connects to card).
 * Inactive tab: closed polygon.
 */
export function getTabStrokePath(
  i: number,
  activeIndex: number,
  n: number,
  w: number,
  h: number,
  chamfer: number = TAB_CHAMFER,
): string {
  const tabW = w / n;
  const leftX = i * tabW;
  const rightX = (i + 1) * tabW;

  let topLeftX: number, bottomLeftX: number;
  if (i === 0) {
    topLeftX = 0;
    bottomLeftX = 0;
  } else {
    if (activeIndex < i) {
      topLeftX = leftX;
      bottomLeftX = leftX + chamfer;
    } else {
      topLeftX = leftX + chamfer;
      bottomLeftX = leftX;
    }
  }

  let topRightX: number, bottomRightX: number;
  if (i === n - 1) {
    topRightX = w;
    bottomRightX = w;
  } else {
    if (activeIndex <= i) {
      topRightX = rightX;
      bottomRightX = rightX + chamfer;
    } else {
      topRightX = rightX + chamfer;
      bottomRightX = rightX;
    }
  }

  if (i === activeIndex) {
    // Active: open at bottom
    return `M ${bottomLeftX} ${h} L ${topLeftX} 0 L ${topRightX} 0 L ${bottomRightX} ${h}`;
  } else {
    // Inactive: closed
    return `M ${bottomLeftX} ${h} L ${topLeftX} 0 L ${topRightX} 0 L ${bottomRightX} ${h} Z`;
  }
}
