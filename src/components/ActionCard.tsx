import { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { LeftColumn } from "./LeftColumn";
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
  // Map corner size to left column size
  const leftColSize = cornerSize === "sm" ? "sm" : "md";

  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'stretch',
        width: '100%',
        ...(onClick ? { cursor: 'pointer' } : {}),
      }}
    >
      {/* Left column - accent surface, border all sides */}
      <LeftColumn
        size={leftColSize}
        surfaceColor="var(--surface-cta-primary-accent)"
        borderColor="var(--border-cta-primary)"
        style={{ position: 'relative', zIndex: 10 }}
      />

      {/* Main Body - uses ChamferedFrame for seamless center+right */}
      <ChamferedFrame
        style={{ flex: 1, marginLeft: -2 }}
        cornerSize={cornerSize}
        surfaceColor="var(--surface-cta-primary)"
        borderColor="var(--border-cta-primary)"
        hasLeftBorder={false}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '100%',
          padding: `var(--spacing-300) var(--spacing-400)`,
        }}>
          {/* Content */}
          <div style={{ flex: 1 }}>
            <p
              className="text-heading-h4"
              style={{ fontWeight: 700, color: "var(--text-cta)" }}
            >
              {children}
            </p>
          </div>

          {/* Chevron icon */}
          {showChevron && (
            <ChevronRight
              style={{
                width: 24,
                height: 24,
                flexShrink: 0,
                color: "var(--icon-cta)",
              }}
            />
          )}
        </div>
      </ChamferedFrame>
    </div>
  );
}
