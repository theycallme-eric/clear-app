import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { LeftColumn } from "./LeftColumn";
import { ChamferedFrame } from "./ChamferedFrame";

type CornerSize = "sm" | "md" | "lg";
type PaddingSize = "none" | "sm" | "md" | "lg";

interface CardProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** Size of the chamfered corner: sm (8px), md (12px), lg (24px) */
  cornerSize?: CornerSize;
  /** Content padding preset */
  padding?: PaddingSize;
  /** Click handler - makes card interactive */
  onClick?: () => void;
  /** Show the left accent column. Default: true */
  showLeftColumn?: boolean;
  /** Surface color for the main card area */
  surfaceColor?: string;
  /** Border color for the card */
  borderColor?: string;
  /** Surface color for the left accent column */
  accentColor?: string;
}

/**
 * Card - Universal container with chamfered corner and optional accent bar.
 *
 * Composition:
 * - LeftColumn (accent bar, optional)
 * - ChamferedFrame (main content area with chamfered bottom-right corner)
 *
 * Uses the same pattern as ActionCard but without hardcoded content structure,
 * allowing flexible content via children.
 */
export function Card({
  children,
  className,
  style,
  cornerSize = "md",
  padding = "md",
  onClick,
  showLeftColumn = true,
  surfaceColor = "var(--surface-card)",
  borderColor = "var(--border-card)",
  accentColor = "var(--surface-card-accent)",
}: CardProps) {
  // Map corner size to left column size
  // sm -> sm (8px), md -> md (12px), lg -> md (12px per Figma spec)
  const leftColSize = cornerSize === "sm" ? "sm" : "md";

  // Padding styles
  const paddingStyles: Record<PaddingSize, React.CSSProperties> = {
    none: {},
    sm: { padding: `var(--spacing-200) var(--spacing-300)` },
    md: { padding: `var(--spacing-300) var(--spacing-400)` },
    lg: { padding: `var(--spacing-400) var(--spacing-600)` },
  };

  const Wrapper = onClick ? "button" : "div";

  return (
    <Wrapper
      className={className}
      onClick={onClick}
      type={onClick ? "button" : undefined}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'stretch',
        width: '100%',
        textAlign: 'left',
        ...(onClick ? { cursor: 'pointer' } : {}),
        ...style,
      }}
    >
      {/* Left column - accent surface, border all sides */}
      {showLeftColumn && (
        <LeftColumn
          size={leftColSize}
          surfaceColor={accentColor}
          borderColor={borderColor}
          style={{ position: 'relative', zIndex: 10 }}
        />
      )}

      {/* Main Body - ChamferedFrame */}
      <ChamferedFrame
        style={{
          flex: 1,
          ...(showLeftColumn ? { marginLeft: -2 } : {}),
        }}
        cornerSize={cornerSize}
        surfaceColor={surfaceColor}
        borderColor={borderColor}
        hasLeftBorder={!showLeftColumn}
      >
        <div style={{ height: '100%', ...paddingStyles[padding] }}>
          {children}
        </div>
      </ChamferedFrame>
    </Wrapper>
  );
}
