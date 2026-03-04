export type MoodValue = 1 | 2 | 3 | 4 | 5;

interface MoodIconProps {
  mood: MoodValue;
  size?: number;
  /** When true, frame fills with green and features use on-fill color */
  selected?: boolean;
}

/**
 * Geometric mood face SVGs for the workout complete screen.
 * Angular/square frames with minimal line features — cutesy but mechanical.
 * Color is inherited from the parent via currentColor.
 * When selected, the frame fills with green and features render in a contrasting color.
 */
export function MoodIcon({ mood, size = 32, selected = false }: MoodIconProps) {
  const s = size;
  const strokeWidth = 2;

  // All icons share a square frame with chamfered top-right corner
  const frameInset = 2; // inset from edge so strokes aren't clipped
  const fi = frameInset;
  const fs = s - frameInset; // frame size end
  const chamfer = 6; // top-right chamfer size

  const frame = `M ${fi} ${fi} L ${fs - chamfer} ${fi} L ${fs} ${fi + chamfer} L ${fs} ${fs} L ${fi} ${fs} Z`;

  return (
    <svg
      width={s}
      height={s}
      viewBox={`0 0 ${s} ${s}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="square"
      strokeLinejoin="miter"
    >
      {/* Shared frame — filled when selected */}
      <path
        d={frame}
        fill={selected ? 'var(--surface-radio-selected)' : 'none'}
        stroke={selected ? 'var(--border-radio-select)' : 'currentColor'}
      />

      {/* Face features per mood */}
      {mood === 1 && <ExhaustedFace s={s} />}
      {mood === 2 && <ToughFace s={s} />}
      {mood === 3 && <OkayFace s={s} />}
      {mood === 4 && <GoodFace s={s} />}
      {mood === 5 && <GreatFace s={s} />}
    </svg>
  );
}

// --- Individual face features ---

/** Exhausted: X eyes, wavy/zigzag frown */
function ExhaustedFace({ s }: { s: number }) {
  const cx = s / 2;
  const eyeY = s * 0.38;
  const eyeL = cx - s * 0.17;
  const eyeR = cx + s * 0.17;
  const e = s * 0.06; // eye cross half-size

  return (
    <>
      {/* X left eye */}
      <line x1={eyeL - e} y1={eyeY - e} x2={eyeL + e} y2={eyeY + e} />
      <line x1={eyeL + e} y1={eyeY - e} x2={eyeL - e} y2={eyeY + e} />
      {/* X right eye */}
      <line x1={eyeR - e} y1={eyeY - e} x2={eyeR + e} y2={eyeY + e} />
      <line x1={eyeR + e} y1={eyeY - e} x2={eyeR - e} y2={eyeY + e} />
      {/* Zigzag frown */}
      <polyline
        points={`${cx - s * 0.22},${s * 0.68} ${cx - s * 0.11},${s * 0.62} ${cx},${s * 0.68} ${cx + s * 0.11},${s * 0.62} ${cx + s * 0.22},${s * 0.68}`}
        fill="none"
      />
    </>
  );
}

/** Tough: dash eyes, angled frown */
function ToughFace({ s }: { s: number }) {
  const cx = s / 2;
  const eyeY = s * 0.38;
  const eyeL = cx - s * 0.17;
  const eyeR = cx + s * 0.17;
  const ew = s * 0.07; // eye dash half-width

  return (
    <>
      {/* Dash eyes */}
      <line x1={eyeL - ew} y1={eyeY} x2={eyeL + ew} y2={eyeY} />
      <line x1={eyeR - ew} y1={eyeY} x2={eyeR + ew} y2={eyeY} />
      {/* Angled frown — left corner lower */}
      <polyline
        points={`${cx - s * 0.2},${s * 0.68} ${cx + s * 0.2},${s * 0.62}`}
        fill="none"
      />
    </>
  );
}

/** Okay: dot eyes, flat line mouth */
function OkayFace({ s }: { s: number }) {
  const cx = s / 2;
  const eyeY = s * 0.38;
  const eyeL = cx - s * 0.17;
  const eyeR = cx + s * 0.17;

  return (
    <>
      {/* Square dot eyes */}
      <rect x={eyeL - 1.5} y={eyeY - 1.5} width={3} height={3} fill="currentColor" stroke="none" />
      <rect x={eyeR - 1.5} y={eyeY - 1.5} width={3} height={3} fill="currentColor" stroke="none" />
      {/* Flat mouth */}
      <line x1={cx - s * 0.15} y1={s * 0.65} x2={cx + s * 0.15} y2={s * 0.65} />
    </>
  );
}

/** Good: dot eyes, angled smile */
function GoodFace({ s }: { s: number }) {
  const cx = s / 2;
  const eyeY = s * 0.38;
  const eyeL = cx - s * 0.17;
  const eyeR = cx + s * 0.17;

  return (
    <>
      {/* Square dot eyes */}
      <rect x={eyeL - 1.5} y={eyeY - 1.5} width={3} height={3} fill="currentColor" stroke="none" />
      <rect x={eyeR - 1.5} y={eyeY - 1.5} width={3} height={3} fill="currentColor" stroke="none" />
      {/* V smile */}
      <polyline
        points={`${cx - s * 0.18},${s * 0.62} ${cx},${s * 0.7} ${cx + s * 0.18},${s * 0.62}`}
        fill="none"
      />
    </>
  );
}

/** Great: ^ happy eyes, wide V smile */
function GreatFace({ s }: { s: number }) {
  const cx = s / 2;
  const eyeY = s * 0.38;
  const eyeL = cx - s * 0.17;
  const eyeR = cx + s * 0.17;
  const ew = s * 0.06;

  return (
    <>
      {/* ^ happy eyes (inverted V) */}
      <polyline points={`${eyeL - ew},${eyeY + ew * 0.5} ${eyeL},${eyeY - ew * 0.5} ${eyeL + ew},${eyeY + ew * 0.5}`} fill="none" />
      <polyline points={`${eyeR - ew},${eyeY + ew * 0.5} ${eyeR},${eyeY - ew * 0.5} ${eyeR + ew},${eyeY + ew * 0.5}`} fill="none" />
      {/* Wide V smile */}
      <polyline
        points={`${cx - s * 0.22},${s * 0.6} ${cx},${s * 0.72} ${cx + s * 0.22},${s * 0.6}`}
        fill="none"
      />
    </>
  );
}
