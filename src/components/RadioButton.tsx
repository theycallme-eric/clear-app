import { ReactNode } from "react";
import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChamferedFrame } from "./ChamferedFrame";

interface RadioButtonProps {
  /** Whether this option is selected */
  selected: boolean;
  /** Click handler */
  onClick: () => void;
  /** Text label (for text variant) */
  label?: string;
  /** Optional description line (shown below label) */
  description?: string;
  /** Icon element (for icon variant) */
  icon?: ReactNode;
  /** Additional className for the container */
  className?: string;
  /** Optional edit handler - shows pencil icon when provided */
  onEdit?: () => void;
}

/**
 * RadioButton - Chamfered selection button with text or icon variant.
 *
 * Figma specs:
 * - Height: 40px (or auto with description)
 * - Corner cut: 8px (bottom-right)
 * - Border: 2px
 * - Icon size: 24px
 * - Font: Oxanium medium 14px (text-label-sm)
 *
 * Usage:
 * - Text variant: <RadioButton selected={true} onClick={fn} label="Option" />
 * - With description: <RadioButton selected={true} onClick={fn} label="Option" description="Details here" />
 * - Icon variant: <RadioButton selected={false} onClick={fn} icon={<Icon />} />
 */
export function RadioButton({
  selected,
  onClick,
  label,
  description,
  icon,
  className,
  onEdit,
}: RadioButtonProps) {
  const isIconVariant = !!icon && !label;
  const hasDescription = !!description;

  // Token-based colors
  const surfaceColor = selected
    ? "var(--surface-radio-selected)"
    : "var(--surface-radio-unselect)";
  const borderColor = selected
    ? "var(--border-radio-select)"
    : "var(--border-radio-unselected)";
  const textColor = selected
    ? "var(--text-radio-text-select)"
    : "var(--text-radio-text-unselected)";
  const iconColor = selected
    ? "var(--icon-radio-selected)"
    : "var(--icon-radio-unselected)";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        hasDescription ? "min-h-[64px]" : "h-[40px]",
        isIconVariant ? "w-[40px]" : "min-w-[49px]",
        className
      )}
    >
      <ChamferedFrame
        cornerSize="sm"
        surfaceColor={surfaceColor}
        borderColor={borderColor}
        hasLeftBorder={true}
        className="h-full"
      >
        <div
          className={cn(
            "h-full flex px-3",
            hasDescription
              ? "flex-row justify-between items-center py-2"
              : "items-center justify-center"
          )}
        >
          <div className={cn(hasDescription && "flex flex-col items-start")}>
            {label && (
              <span
                className={cn(
                  "text-label-sm uppercase",
                  !hasDescription && "whitespace-nowrap"
                )}
                style={{ color: textColor }}
              >
                {label}
              </span>
            )}
            {description && (
              <span
                className="text-paragraph-sm"
                style={{ color: textColor, opacity: 0.8 }}
              >
                {description}
              </span>
            )}
          </div>
          {icon && (
            <div
              className="w-6 h-6 flex items-center justify-center"
              style={{ color: iconColor }}
            >
              {icon}
            </div>
          )}
          {onEdit && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-1 hover:opacity-80 transition-opacity"
              style={{ color: textColor }}
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
        </div>
      </ChamferedFrame>
    </button>
  );
}
