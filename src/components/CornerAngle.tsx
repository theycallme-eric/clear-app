import { cn } from "@/lib/utils";

type CornerAngleSize = "sm" | "md" | "lg";

interface CornerAngleProps {
  size?: CornerAngleSize;
  className?: string;
  /** Surface fill color - defaults to --surface-cta-primary */
  surfaceColor?: string;
  /** Border stroke color - defaults to --border-cta-primary */
  borderColor?: string;
}

/**
 * CornerAngle - Reusable angled corner piece
 *
 * A triangle that creates a "cut corner" effect.
 * Used by ActionButton and other components with angled corners.
 *
 * Structure:
 * - background: Triangle fill using clip-path
 * - border: Diagonal stroke using SVG line
 *
 * Sizes (matching Figma widths/column tokens):
 * - sm: 8×8px
 * - md: 12×12px
 * - lg: 24×24px
 */
export function CornerAngle({
  size = "sm",
  className,
  surfaceColor = "var(--surface-cta-primary)",
  borderColor = "var(--border-cta-primary)",
}: CornerAngleProps) {
  // Size in pixels
  const sizeMap = {
    sm: 8,
    md: 12,
    lg: 24,
  };
  const px = sizeMap[size];

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{ width: px, height: px }}
    >
      {/* Background layer - triangle fill */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: surfaceColor,
          clipPath: "polygon(0 0, 100% 0, 0 100%)",
        }}
      />

      {/* Border layer - diagonal stroke */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox={`0 0 ${px} ${px}`}
        fill="none"
        aria-hidden="true"
      >
        <line
          x1={px - 1}
          y1={0}
          x2={0}
          y2={px - 1}
          stroke={borderColor}
          strokeWidth={2}
        />
      </svg>
    </div>
  );
}
