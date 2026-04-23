import { cn } from "@/lib/utils";

type ColumnSize = "sm" | "md" | "lg";

interface LeftColumnProps {
  size?: ColumnSize;
  className?: string;
  style?: React.CSSProperties;
  /** Surface fill color */
  surfaceColor?: string;
  /** Border stroke color */
  borderColor?: string;
}

/**
 * LeftColumn - Left side of the 3-column angled corner pattern
 *
 * Structure:
 * - Single element with border on all sides
 * - Fixed width based on size, height fills parent
 *
 * Sizes (matching Figma widths/column tokens):
 * - sm: 8px wide
 * - md: 12px wide
 * - lg: 24px wide
 */
export function LeftColumn({
  size = "sm",
  className,
  style,
  surfaceColor = "var(--surface-cta-primary-accent)",
  borderColor = "var(--border-cta-primary)",
}: LeftColumnProps) {
  // Width in pixels based on size
  // Note: lg uses md width (12px) per Figma spec
  const widthMap = {
    sm: 8,
    md: 12,
    lg: 12, // same as md
  };
  const width = widthMap[size];

  return (
    <div
      className={cn("pulse-micro", className)}
      style={{
        alignSelf: 'stretch',
        flexShrink: 0,
        border: '2px solid',
        width,
        backgroundColor: surfaceColor,
        borderColor: borderColor,
        ...style,
      }}
    />
  );
}
