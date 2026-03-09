import { ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { LeftColumn } from "./LeftColumn";
import { TabBar, type Tab } from "./TabBar";
import {
  TAB_HEIGHT,
  BORDER_WIDTH,
  getTabPolygon,
} from "@/lib/tab-geometry";

interface TabbedPanelProps<T extends string> {
  tabs: Tab<T>[];
  activeTab: T;
  onChange: (tab: T) => void;
  children: ReactNode;
  className?: string;
  /** Show the left accent column. Default: true */
  showLeftColumn?: boolean;
}

/** Diagonal chamfer between tabs — dramatic angle */
const DIAGONAL = 24;

/** Frame corner chamfer — matches Card "md" (12px) */
const CORNER = 12;

/**
 * TabbedPanel — Tabs + content in one chamfered frame.
 *
 * Draws ONE SVG containing outer frame, tab fills, and internal borders.
 * No CSS clip-path (so dropdown menus aren't clipped).
 * Follows ChamferedFrame's double-width-stroke + clip technique for borders.
 *
 * Outer shape has chamfered corners at top-right (tab area) and bottom-right (panel area).
 * Tab diagonals use a larger chamfer for a dramatic angled cut.
 */
export function TabbedPanel<T extends string>({
  tabs,
  activeTab,
  onChange,
  children,
  className,
  showLeftColumn = true,
}: TabbedPanelProps<T>) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ width: 0, height: 0 });
  const [clipId] = useState(`tp-clip-${Math.random().toString(36).substr(2, 9)}`);

  const activeIndex = tabs.findIndex(t => t.value === activeTab);
  const n = tabs.length;

  // Measure the panel body
  useEffect(() => {
    if (!bodyRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const el = entry.target as HTMLElement;
        setDims({ width: el.offsetWidth, height: el.offsetHeight });
      }
    });
    observer.observe(bodyRef.current);
    setDims({
      width: bodyRef.current.offsetWidth,
      height: bodyRef.current.offsetHeight,
    });
    return () => observer.disconnect();
  }, []);

  const { width: w, height: h } = dims;
  const tabH = TAB_HEIGHT;

  // --- SVG paths ---

  // Outer chamfered shape: top-right and bottom-right corners chamfered (CORNER size)
  const outerShape = `M 0 0 L ${w - CORNER} 0 L ${w} ${CORNER} L ${w} ${h - CORNER} L ${w - CORNER} ${h} L 0 ${h} Z`;

  // Outer border path — open on left when LeftColumn covers it
  const outerStroke = showLeftColumn
    ? `M 0 0 L ${w - CORNER} 0 L ${w} ${CORNER} L ${w} ${h - CORNER} L ${w - CORNER} ${h} L 0 ${h}`
    : outerShape;

  // Internal separator: horizontal line at tab bottom with gap for active tab,
  // plus diagonal separators between tabs (using DIAGONAL chamfer).
  function getInternalSeparatorPath(): string {
    const parts: string[] = [];
    const tabW = w / n;

    // Bottom edge of each inactive tab
    for (let i = 0; i < n; i++) {
      if (i === activeIndex) continue;

      const leftX = i * tabW;
      const rightX = (i + 1) * tabW;

      let bottomLeftX: number;
      if (i === 0) {
        bottomLeftX = 0;
      } else {
        bottomLeftX = activeIndex < i ? leftX + DIAGONAL : leftX;
      }

      let bottomRightX: number;
      if (i === n - 1) {
        bottomRightX = w;
      } else {
        bottomRightX = activeIndex <= i ? rightX + DIAGONAL : rightX;
      }

      parts.push(`M ${bottomLeftX} ${tabH} L ${bottomRightX} ${tabH}`);
    }

    // Diagonal separators between tabs
    for (let boundary = 1; boundary < n; boundary++) {
      const bx = boundary * tabW;
      if (activeIndex < boundary) {
        parts.push(`M ${bx} 0 L ${bx + DIAGONAL} ${tabH}`);
      } else {
        parts.push(`M ${bx + DIAGONAL} 0 L ${bx} ${tabH}`);
      }
    }

    return parts.join(' ');
  }

  return (
    <div className={cn("relative flex items-stretch w-full", className)}>
      {/* Left column — accent bar */}
      {showLeftColumn && (
        <LeftColumn
          size="md"
          surfaceColor="var(--surface-card-accent)"
          borderColor="var(--border-tab-active)"
          className="relative z-10"
        />
      )}

      {/* Panel body */}
      <div
        ref={bodyRef}
        className={cn("flex-1 relative", showLeftColumn && "-ml-[2px]")}
      >
        {/* SVG: fills + borders */}
        {w > 0 && h > 0 && (
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            width={w}
            height={h}
            viewBox={`0 0 ${w} ${h}`}
          >
            <defs>
              <clipPath id={clipId}>
                <path d={outerShape} />
              </clipPath>
              {/* Clip paths for each tab polygon (for clipping their borders) */}
              {tabs.map((_, i) => (
                <clipPath key={i} id={`${clipId}-tab-${i}`}>
                  <path d={getTabPolygon(i, activeIndex, n, w, tabH, DIAGONAL)} />
                </clipPath>
              ))}
            </defs>

            {/* All fills clipped to outer shape (handles corner chamfers) */}
            <g clipPath={`url(#${clipId})`}>
              {/* Layer 1: Panel fill (--surface-card) */}
              <path
                d={outerShape}
                stroke="none"
                style={{ fill: 'var(--surface-card)', transition: 'fill 0.2s ease' }}
              />

              {/* Layer 2: Inactive tab fills */}
              {tabs.map((_, i) => {
                if (i === activeIndex) return null;
                return (
                  <path
                    key={i}
                    d={getTabPolygon(i, activeIndex, n, w, tabH, DIAGONAL)}
                    stroke="none"
                    style={{
                      fill: 'var(--surface-tab-inactive)',
                      transition: 'fill 0.2s ease',
                    }}
                  />
                );
              })}
            </g>

            {/* Layer 3: All borders clipped to outer shape */}
            <g clipPath={`url(#${clipId})`}>
              {/* Outer border — double-width + clip */}
              <path
                d={outerStroke}
                fill="none"
                strokeWidth={BORDER_WIDTH * 2}
                strokeLinecap="butt"
                strokeLinejoin="miter"
                style={{
                  stroke: 'var(--border-tab-active)',
                  transition: 'stroke 0.2s ease',
                }}
              />

              {/* Internal separators + inactive tab bottom borders */}
              <path
                d={getInternalSeparatorPath()}
                fill="none"
                strokeWidth={BORDER_WIDTH}
                strokeLinecap="butt"
                strokeLinejoin="miter"
                shapeRendering="crispEdges"
                style={{
                  stroke: 'var(--border-tab-active)',
                  transition: 'stroke 0.2s ease',
                }}
              />

              {/* Inactive tab border strokes (clipped to both outer shape AND tab polygon) */}
              {tabs.map((_, i) => {
                if (i === activeIndex) return null;
                return (
                  <path
                    key={`stroke-${i}`}
                    d={getTabPolygon(i, activeIndex, n, w, tabH, DIAGONAL)}
                    fill="none"
                    strokeWidth={BORDER_WIDTH * 2}
                    strokeLinecap="butt"
                    strokeLinejoin="miter"
                    clipPath={`url(#${clipId}-tab-${i})`}
                    style={{
                      stroke: 'var(--border-tab-inactive)',
                      transition: 'stroke 0.2s ease',
                    }}
                  />
                );
              })}
            </g>
          </svg>
        )}

        {/* Content layer */}
        <div className="relative z-10">
          <TabBar
            tabs={tabs}
            activeTab={activeTab}
            onChange={onChange}
            variant="embedded"
          />
          <div key={activeTab} className="px-4 py-3 animate-tab-enter">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
