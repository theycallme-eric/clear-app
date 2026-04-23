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
 *
 * @tokens
 * - Label surface: --surface-chip / --border-chip / --text-paragraph / --icon-chip
 * - Selected surface: --surface-chip-selected / --border-chip-selected / --text-chip-selected / --icon-chip-selected
 * - Unselected surface: --surface-chip-unselected / --border-chip-unselected / --text-chip-unselected / --icon-chip-unselected
 * - Disabled: --surface-disabled / --border-disabled / --text-disabled / --icon-disabled
 * - Typography: text-label-xs
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
      style={{ height: '100%' }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--spacing-100)',
        padding: `0 var(--spacing-300)`,
        height: '100%',
      }}>
        {isSelected && showCheck && (
          <Check
            style={{ width: 12, height: 12, flexShrink: 0, color: finalIconColor }}
          />
        )}
        {icon && !isSelected && (
          <span
            style={{
              width: 16,
              height: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              color: finalIconColor,
            }}
          >
            {icon}
          </span>
        )}
        <span
          className="text-label-xs"
          style={{
            textTransform: 'uppercase',
            letterSpacing: '0.025em',
            whiteSpace: 'nowrap',
            color: finalTextColor,
          }}
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
          "transition-colors",
          disabled ? "cursor-not-allowed" : "cursor-pointer",
          className
        )}
        style={{ height: 28 }}
      >
        {content}
      </button>
    );
  }

  return (
    <div className={className} style={{ height: 28 }}>
      {content}
    </div>
  );
}
