import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface Tab<T extends string> {
  value: T;
  label: string;
}

interface TabBarProps<T extends string> {
  tabs: Tab<T>[];
  activeTab: T;
  onChange: (tab: T) => void;
  className?: string;
}

const CHAMFER = 8; // matches ChamferedFrame "sm" corner size
const BORDER_WIDTH = 2;

/**
 * TabBar — Chamfered file-folder tabs.
 *
 * The active tab appears "in front" via a diagonal cut between adjacent tabs.
 * The diagonal angle matches ChamferedFrame's sm corner (8px, 45 degrees).
 * Designed for N tabs; currently used with 2.
 */
export function TabBar<T extends string>({
  tabs,
  activeTab,
  onChange,
  className,
}: TabBarProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ width: 0, height: 0 });
  const [clipId] = useState(`tab-clip-${Math.random().toString(36).substr(2, 9)}`);

  const activeIndex = tabs.findIndex(t => t.value === activeTab);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const el = entry.target as HTMLElement;
        setDims({ width: el.offsetWidth, height: el.offsetHeight });
      }
    });
    observer.observe(containerRef.current);
    setDims({
      width: containerRef.current.offsetWidth,
      height: containerRef.current.offsetHeight,
    });
    return () => observer.disconnect();
  }, []);

  const { width: w, height: h } = dims;
  const n = tabs.length;
  const s = CHAMFER;

  // Compute each tab's polygon vertices.
  // Between tab[i] and tab[i+1], there's a diagonal.
  // If activeIndex <= i: diagonal is \ (top-right to bottom-left)
  // If activeIndex > i:  diagonal is / (top-left to bottom-right)
  function getTabPath(i: number): string {
    const tabW = w / n;
    const leftX = i * tabW;
    const rightX = (i + 1) * tabW;

    // Left edge points
    let topLeftX: number;
    let bottomLeftX: number;
    if (i === 0) {
      topLeftX = 0;
      bottomLeftX = 0;
    } else {
      // Diagonal between tab[i-1] and tab[i]
      if (activeIndex < i) {
        // Active is to the left → diagonal is \ → tab[i] left edge indented at top
        topLeftX = leftX + s;
        bottomLeftX = leftX;
      } else {
        // Active is at or to the right → diagonal is / → tab[i] left edge indented at bottom
        topLeftX = leftX;
        bottomLeftX = leftX + s;
      }
    }

    // Right edge points
    let topRightX: number;
    let bottomRightX: number;
    if (i === n - 1) {
      topRightX = w;
      bottomRightX = w;
    } else {
      // Diagonal between tab[i] and tab[i+1]
      if (activeIndex <= i) {
        // Active is at or to the left → diagonal is \ → tab[i] right edge extends at top
        topRightX = rightX + s;
        bottomRightX = rightX;
      } else {
        // Active is to the right → diagonal is / → tab[i] right edge extends at bottom
        topRightX = rightX;
        bottomRightX = rightX + s;
      }
    }

    return `M ${topLeftX} 0 L ${topRightX} 0 L ${bottomRightX} ${h} L ${bottomLeftX} ${h} Z`;
  }

  // Build a stroke path for each tab (open at the bottom so it connects to content below)
  function getTabStrokePath(i: number): string {
    const tabW = w / n;
    const leftX = i * tabW;
    const rightX = (i + 1) * tabW;

    let topLeftX: number, bottomLeftX: number;
    if (i === 0) {
      topLeftX = 0;
      bottomLeftX = 0;
    } else {
      if (activeIndex < i) {
        topLeftX = leftX + s;
        bottomLeftX = leftX;
      } else {
        topLeftX = leftX;
        bottomLeftX = leftX + s;
      }
    }

    let topRightX: number, bottomRightX: number;
    if (i === n - 1) {
      topRightX = w;
      bottomRightX = w;
    } else {
      if (activeIndex <= i) {
        topRightX = rightX + s;
        bottomRightX = rightX;
      } else {
        topRightX = rightX;
        bottomRightX = rightX + s;
      }
    }

    const isActive = i === activeIndex;
    if (isActive) {
      // Active tab: draw top + sides, open at bottom (connects to card below)
      return `M ${bottomLeftX} ${h} L ${topLeftX} 0 L ${topRightX} 0 L ${bottomRightX} ${h}`;
    } else {
      // Inactive tab: draw top + sides + bottom
      return `M ${bottomLeftX} ${h} L ${topLeftX} 0 L ${topRightX} 0 L ${bottomRightX} ${h} Z`;
    }
  }

  // Render order: inactive tabs first (behind), active tab last (on top)
  const renderOrder = tabs
    .map((_, i) => i)
    .sort((a, b) => {
      if (a === activeIndex) return 1;
      if (b === activeIndex) return -1;
      return a - b;
    });

  return (
    <div ref={containerRef} className={cn("relative h-10", className)}>
      {w > 0 && h > 0 && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          width={w}
          height={h}
          viewBox={`0 0 ${w} ${h}`}
        >
          <defs>
            {tabs.map((_, i) => (
              <clipPath key={i} id={`${clipId}-${i}`}>
                <path d={getTabPath(i)} />
              </clipPath>
            ))}
          </defs>

          {renderOrder.map((i) => {
            const isActive = i === activeIndex;
            return (
              <g key={i}>
                {/* Fill */}
                <path
                  d={getTabPath(i)}
                  style={{
                    fill: isActive ? 'var(--surface-tab-active)' : 'var(--surface-tab-inactive)',
                    transition: 'fill 0.2s ease',
                  }}
                />
                {/* Border stroke — clipped to tab shape */}
                <path
                  d={getTabStrokePath(i)}
                  fill="none"
                  strokeWidth={BORDER_WIDTH * 2}
                  strokeLinecap="butt"
                  strokeLinejoin="miter"
                  clipPath={`url(#${clipId}-${i})`}
                  style={{
                    stroke: isActive ? 'var(--border-tab-active)' : 'var(--border-tab-inactive)',
                    transition: 'stroke 0.2s ease',
                  }}
                />
              </g>
            );
          })}
        </svg>
      )}

      {/* Interactive buttons overlaid on top */}
      <div className="relative z-10 flex h-full">
        {tabs.map((tab) => {
          const isActive = tab.value === activeTab;
          return (
            <button
              key={tab.value}
              onClick={() => onChange(tab.value)}
              className="flex-1 text-label-xs font-bold uppercase tracking-widest text-center transition-colors cursor-pointer"
              style={{
                color: isActive ? 'var(--text-tab-active)' : 'var(--text-tab-inactive)',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
