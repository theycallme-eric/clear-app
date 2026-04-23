import { ReactNode, CSSProperties } from "react";
import { Pencil } from "lucide-react";
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
  /** Additional inline styles for the container */
  style?: CSSProperties;
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
  style,
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
      className={className}
      style={{
        display: 'flex',
        minHeight: hasDescription ? '64px' : undefined,
        height: hasDescription ? undefined : '40px',
        width: isIconVariant ? '40px' : undefined,
        minWidth: isIconVariant ? undefined : '49px',
        ...style,
      }}
    >
      <ChamferedFrame
        cornerSize="sm"
        surfaceColor={surfaceColor}
        borderColor={borderColor}
        hasLeftBorder={true}
        style={{ flex: 1 }}
      >
        <div
          style={{
            height: '100%',
            display: 'flex',
            padding: '0 var(--spacing-300)',
            ...(hasDescription
              ? { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 'var(--spacing-200)', paddingBottom: 'var(--spacing-200)' }
              : { alignItems: 'center', justifyContent: 'center' }),
          }}
        >
          <div style={hasDescription ? { display: 'flex', flexDirection: 'column', alignItems: 'flex-start' } : undefined}>
            {label && (
              <span
                className="text-label-sm"
                style={{ color: textColor, textTransform: 'uppercase', ...(!hasDescription ? { whiteSpace: 'nowrap' } : {}) }}
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
              style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: iconColor }}
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
              style={{ padding: 'var(--spacing-100)', color: textColor, transition: 'opacity 0.15s' }}
            >
              <Pencil style={{ width: '16px', height: '16px' }} />
            </button>
          )}
        </div>
      </ChamferedFrame>
    </button>
  );
}
