import { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { LeftColumn } from "./LeftColumn";
// import { RightColumn } from "./RightColumn"; // Removed as we use proper frame
import { ChamferedFrame } from "./ChamferedFrame";

interface ActionCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  /** Size of the angled corner and right column */
  cornerSize?: "sm" | "md" | "lg";
  /** Show chevron icon on right */
  showChevron?: boolean;
}

/**
 * ActionCard - 3-column card with angled corner
 *
 * Uses the reusable column building blocks:
 * - LeftColumn (md) - accent surface, border all sides
 * - Center (flex-1) - primary surface, border top + bottom
 * - RightColumn (md) - primary surface + corner angle
 *
 * This tests that LeftColumn and RightColumn work together
 * in a real component composition.
 */
export function ActionCard({
  children,
  className,
  onClick,
  cornerSize = "md",
  showChevron = true,
}: ActionCardProps) {
  // Size in pixels map, matching RightColumn/CornerAngle logic
  const sizeMap = {
    sm: 8,
    md: 12,
    lg: 24,
  };
  const px = sizeMap[cornerSize];


  // Map corner size to left column size
  // sm -> sm (8px)
  // md -> md (12px)
  // lg -> md (12px) - explicitly requested to stay md for large corners
  const leftColSize = cornerSize === "sm" ? "sm" : "md";

  return (
    <div
      className={cn(
        "relative flex items-stretch w-full",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {/* Left column - accent surface, border all sides */}
      <LeftColumn
        size={leftColSize}
        surfaceColor="var(--surface-cta-accent)"
        borderColor="var(--border-cta-primary)"
        className="relative z-10"
      />

      {/* Main Body - uses ChamferedFrame for seamless center+right */}
      <ChamferedFrame
        className="flex-1 -ml-[2px]" // -ml-2px to overlap the left column border
        cornerSize={cornerSize}
        surfaceColor="var(--surface-cta-primary)"
        borderColor="var(--border-cta-primary)"
        hasLeftBorder={false} // Open to the left to merge with LeftColumn
      >
        <div className="flex items-center justify-between h-full px-4 py-3">
          {/* Content */}
          <div className="flex-1">
            <p
              className="text-heading-h4 font-bold"
              style={{ color: "var(--text-cta)" }}
            >
              {children}
            </p>
          </div>

          {/* Chevron icon */}
          {showChevron && (
            <ChevronRight
              className="w-6 h-6 shrink-0"
              style={{ color: "var(--icon-cta)" }}
            />
          )}
        </div>
      </ChamferedFrame>
    </div>
  );
}
