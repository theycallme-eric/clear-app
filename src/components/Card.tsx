import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { LeftColumn } from "./LeftColumn";
import { ChamferedFrame } from "./ChamferedFrame";

type CornerSize = "sm" | "md" | "lg";
type PaddingSize = "none" | "sm" | "md" | "lg";

interface CardProps {
  children: ReactNode;
  className?: string;
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

  // Padding classes
  const paddingClasses = {
    none: "",
    sm: "px-3 py-2",
    md: "px-4 py-3",
    lg: "px-6 py-4",
  };

  const Wrapper = onClick ? "button" : "div";

  return (
    <Wrapper
      className={cn(
        "relative flex items-stretch w-full text-left",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
      type={onClick ? "button" : undefined}
    >
      {/* Left column - accent surface, border all sides */}
      {showLeftColumn && (
        <LeftColumn
          size={leftColSize}
          surfaceColor={accentColor}
          borderColor={borderColor}
          className="relative z-10"
        />
      )}

      {/* Main Body - ChamferedFrame */}
      <ChamferedFrame
        className={cn("flex-1", showLeftColumn && "-ml-[2px]")}
        cornerSize={cornerSize}
        surfaceColor={surfaceColor}
        borderColor={borderColor}
        hasLeftBorder={!showLeftColumn}
      >
        <div className={cn("h-full", paddingClasses[padding])}>
          {children}
        </div>
      </ChamferedFrame>
    </Wrapper>
  );
}
