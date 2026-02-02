import { cn } from "@/lib/utils";
import { CornerAngle } from "./CornerAngle";

type ColumnSize = "sm" | "md" | "lg";

interface RightColumnProps {
  size?: ColumnSize;
  className?: string;
  /** Surface fill color */
  surfaceColor?: string;
  /** Border stroke color */
  borderColor?: string;
}

/**
 * RightColumn - Right side of the 3-column angled corner pattern
 *
 * Structure:
 * - right-top: Fills remaining height, border on top + right
 * - corner-angle: CornerAngle component at bottom
 *
 * Sizes (matching Figma widths/column tokens):
 * - sm: 8px wide
 * - md: 12px wide
 * - lg: 24px wide
 */
export function RightColumn({
  size = "sm",
  className,
  surfaceColor = "var(--surface-card)",
  borderColor = "var(--border-card)",
}: RightColumnProps) {
  // Width in pixels based on size
  const widthMap = {
    sm: 8,
    md: 12,
    lg: 24,
  };
  const width = widthMap[size];

  return (
    <div
      className={cn("relative flex flex-col items-start", className)}
      style={{ width }}
    >
      {/* Background shape */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundColor: surfaceColor,
          // Clip path matches the column shape: straight down, then angled at bottom
          clipPath: `polygon(0 0, 100% 0, 100% calc(100% - ${width}px), 0 100%)`,
        }}
      />

      {/* right-top: fills remaining height */}
      <div
        className="relative z-10 flex-1 w-full border-t-2 border-r-2"
        style={{
          borderColor: borderColor,
        }}
      />

      {/* corner-angle: fixed size at bottom */}
      <CornerAngle
        size={size}
        surfaceColor="transparent"
        borderColor={borderColor}
        className="relative z-10"
      />
    </div>
  );
}
