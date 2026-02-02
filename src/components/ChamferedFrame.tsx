import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

type CornerSize = "sm" | "md" | "lg";

interface ChamferedFrameProps extends React.HTMLAttributes<HTMLDivElement> {
    cornerSize?: CornerSize;
    surfaceColor?: string;
    borderColor?: string;
    children?: React.ReactNode;
    borderWidth?: number;
    /** Whether to draw the left border. Defaults to false (open for LeftColumn) */
    hasLeftBorder?: boolean;
}

/**
 * ChamferedFrame - A container with a cut bottom-right corner.
 *
 * Uses SVG with Double-Width Stroke + Clip technique to ensure
 * perfectly uniform borders and seamless corners.
 */
export function ChamferedFrame({
    cornerSize = "md",
    surfaceColor = "var(--surface-cta-primary)",
    borderColor = "var(--border-cta-primary)",
    borderWidth = 2,
    hasLeftBorder = false,
    className,
    children,
    ...props
}: ChamferedFrameProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [clipId] = useState(`chamfer-clip-${Math.random().toString(36).substr(2, 9)}`);

    // Size mapping for the corner cut
    const sizeMap = {
        sm: 8,
        md: 12,
        lg: 24,
    };
    const s = sizeMap[cornerSize];

    // Measure container size
    useEffect(() => {
        if (!containerRef.current) return;

        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                if (entry.contentBoxSize) {
                    const { offsetWidth, offsetHeight } = entry.target as HTMLElement;
                    setDimensions({ width: offsetWidth, height: offsetHeight });
                }
            }
        });

        observer.observe(containerRef.current);
        // Initial measure
        setDimensions({
            width: containerRef.current.offsetWidth,
            height: containerRef.current.offsetHeight,
        });

        return () => observer.disconnect();
    }, []);

    const { width: w, height: h } = dimensions;

    // Outer Edge Path (matches component boundary exactly)
    // (0,0) -> (w,0) -> (w, h-s) -> (w-s, h) -> (0, h) -> close
    const shapePath = `
    M 0 0
    L ${w} 0
    L ${w} ${h - s}
    L ${w - s} ${h}
    L 0 ${h}
    Z
  `;

    // Border Path (Centerline for the stroke)
    // If we stroke this with 2x width and clip to shapePath, we get uniform inner border.
    // If NO LeftBorder: We must ensure the left side is NOT stroked or clipped out.
    // Actually, if we stroke the left edge with 2x width and clip it, we get a left border.
    // If we DON'T want a left border, we should NOT draw the line segment there.
    // But we still need the CLIP to include it so the background fills.

    // Path for stroking:
    const strokePath = hasLeftBorder
        ? shapePath // Full loop
        : `
      M 0 0
      L ${w} 0
      L ${w} ${h - s}
      L ${w - s} ${h}
      L 0 ${h}
    `; // Open loop (starts 0,0 ends 0,h - no line closing back to 0,0)

    return (
        <div
            ref={containerRef}
            className={cn("relative", className)}
            {...props}
        >
            {/* Background & Border SVG - Render only if we have dims */}
            {w > 0 && h > 0 && (
                <svg
                    className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden"
                    width={w}
                    height={h}
                    viewBox={`0 0 ${w} ${h}`}
                >
                    <defs>
                        <clipPath id={clipId}>
                            <path d={shapePath} />
                        </clipPath>
                    </defs>

                    {/* Fill Layer */}
                    <path
                        d={shapePath}
                        fill={surfaceColor}
                        stroke="none"
                    />

                    {/* Stroke Layer - Double Width + Clipped = Perfect Inner Border */}
                    <path
                        d={strokePath}
                        fill="none"
                        stroke={borderColor}
                        strokeWidth={borderWidth * 2}
                        strokeLinecap="butt"
                        strokeLinejoin="miter"
                        clipPath={`url(#${clipId})`}
                    />
                </svg>
            )}

            {/* Content Container */}
            <div className="relative z-10 h-full">
                {children}
            </div>
        </div>
    );
}
