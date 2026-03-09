import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  TAB_HEIGHT,
  TAB_CHAMFER,
  BORDER_WIDTH,
  getTabPolygon,
  getTabStrokePath,
} from "@/lib/tab-geometry";

export interface Tab<T extends string> {
  value: T;
  label: string;
}

interface TabBarProps<T extends string> {
  tabs: Tab<T>[];
  activeTab: T;
  onChange: (tab: T) => void;
  className?: string;
  /** "standalone" draws full SVG visuals. "embedded" renders only interactive buttons. */
  variant?: "standalone" | "embedded";
}

/**
 * TabBar — Chamfered file-folder tabs.
 *
 * Standalone: Full SVG with fills, borders, diagonal cuts, ResizeObserver.
 * Embedded: Button row only — visuals delegated to parent TabbedPanel.
 */
export function TabBar<T extends string>({
  tabs,
  activeTab,
  onChange,
  className,
  variant = "standalone",
}: TabBarProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ width: 0, height: 0 });
  const [clipId] = useState(`tab-clip-${Math.random().toString(36).substr(2, 9)}`);

  const activeIndex = tabs.findIndex(t => t.value === activeTab);

  // Only observe size in standalone mode
  useEffect(() => {
    if (variant !== "standalone") return;
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
  }, [variant]);

  const { width: w, height: h } = dims;
  const n = tabs.length;

  // Render order: inactive tabs first (behind), active tab last (on top)
  const renderOrder = tabs
    .map((_, i) => i)
    .sort((a, b) => {
      if (a === activeIndex) return 1;
      if (b === activeIndex) return -1;
      return a - b;
    });

  // --- Embedded variant: buttons only ---
  if (variant === "embedded") {
    return (
      <div className={cn("relative", className)} style={{ height: TAB_HEIGHT }}>
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

  // --- Standalone variant: full SVG + buttons ---
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
                <path d={getTabPolygon(i, activeIndex, n, w, h, TAB_CHAMFER)} />
              </clipPath>
            ))}
          </defs>

          {renderOrder.map((i) => {
            const isActive = i === activeIndex;
            return (
              <g key={i}>
                <path
                  d={getTabPolygon(i, activeIndex, n, w, h, TAB_CHAMFER)}
                  style={{
                    fill: isActive ? 'var(--surface-tab-active)' : 'var(--surface-tab-inactive)',
                    transition: 'fill 0.2s ease',
                  }}
                />
                <path
                  d={getTabStrokePath(i, activeIndex, n, w, h, TAB_CHAMFER)}
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
