import { ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChamferedFrame } from "./ChamferedFrame";

type ChipVariant = "label" | "selectable";

interface ChipProps {
  /** Text content */
  children: ReactNode;
  /** Chip variant: "label" for display-only, "selectable" for interactive */
  variant?: ChipVariant;
  /** Whether this chip is selected (only for selectable variant) */
  selected?: boolean;
  /** Click handler (only for selectable variant) */
  onClick?: () => void;
  /** Whether the chip is disabled */
  disabled?: boolean;
  /** Optional icon to show before text */
  icon?: ReactNode;
  /** Show checkmark when selected (default: true) */
  showCheck?: boolean;
  /** Additional className */
  className?: string;
}

/**
 * Chip - Chamfered chip component for labels and selection.
 *
 * Figma specs:
 * - Corner cut: 8px (bottom-right)
 * - Border: 2px
 * - Font: Oxanium medium (text-label-xs), uppercase
 * - Padding: 12px horizontal, 6px vertical
 *
 * Variants:
 * - label: Display-only chip with more visible styling
 * - selectable: Interactive chip with selected/unselected states
 */
export function Chip({
  children,
  variant = "selectable",
  selected = false,
  onClick,
  disabled = false,
  icon,
  showCheck = true,
  className,
}: ChipProps) {
  const isLabel = variant === "label";
  const isSelectable = variant === "selectable";
  const isSelected = isSelectable && selected;
  // Token-based colors based on variant and state
  const surfaceColor = isLabel
    ? "var(--surface-chip)"
    : isSelected
    ? "var(--surface-chip-selected)"
    : "var(--surface-chip-unselected)";

  const borderColor = isLabel
    ? "var(--border-chip)"
    : isSelected
    ? "var(--border-chip-selected)"
    : "var(--border-chip-unselected)";

  const textColor = isLabel
    ? "var(--text-paragraph)"
    : isSelected
    ? "var(--text-chip-selected)"
    : "var(--text-chip-unselected)";

  const iconColor = isLabel
    ? "var(--icon-chip)"
    : isSelected
    ? "var(--icon-chip-selected)"
    : "var(--icon-chip-unselected)";

  // Disabled overrides
  const finalSurfaceColor = disabled ? "var(--surface-disabled)" : surfaceColor;
  const finalBorderColor = disabled ? "var(--border-disabled)" : borderColor;
  const finalTextColor = disabled ? "var(--text-disabled)" : textColor;
  const finalIconColor = disabled ? "var(--icon-disabled)" : iconColor;

  const content = (
    <ChamferedFrame
      cornerSize="sm"
      surfaceColor={finalSurfaceColor}
      borderColor={finalBorderColor}
      hasLeftBorder={true}
      className="h-full"
    >
      <div className="flex items-center justify-center gap-1 px-3 h-full">
        {isSelected && showCheck && (
          <Check
            className="w-3 h-3 shrink-0"
            style={{ color: finalIconColor }}
          />
        )}
        {icon && !isSelected && (
          <span
            className="w-4 h-4 flex items-center justify-center shrink-0"
            style={{ color: finalIconColor }}
          >
            {icon}
          </span>
        )}
        <span
          className="text-label-xs uppercase tracking-wide whitespace-nowrap"
          style={{ color: finalTextColor }}
        >
          {children}
        </span>
      </div>
    </ChamferedFrame>
  );

  if (isSelectable && onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "h-[28px] transition-colors",
          disabled ? "cursor-not-allowed" : "cursor-pointer",
          className
        )}
      >
        {content}
      </button>
    );
  }

  return (
    <div className={cn("h-[28px]", className)}>
      {content}
    </div>
  );
}
