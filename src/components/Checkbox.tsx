import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChamferedFrame } from "./ChamferedFrame";

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Checkbox - Chamfered toggle with check/dot states.
 *
 * Checked: green surface + border, checkmark icon
 * Unchecked: dark surface, orange border, center dot
 *
 * Size: 32x32px, corner cut: sm (8px)
 */
export function Checkbox({
  checked,
  onChange,
  disabled = false,
  className,
}: CheckboxProps) {
  const surfaceColor = checked
    ? "var(--surface-success)"
    : "var(--surface-radio-unselect)";
  const borderColor = checked
    ? "var(--border-success)"
    : "var(--border-radio-unselected)";

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={cn(
        disabled && "cursor-not-allowed",
        className,
      )}
      style={{
        width: 32,
        height: 32,
        flexShrink: 0,
        transition: 'opacity 150ms',
        ...(disabled ? { opacity: 0.5 } : {}),
      }}
    >
      <ChamferedFrame
        cornerSize="sm"
        surfaceColor={surfaceColor}
        borderColor={borderColor}
        hasLeftBorder={true}
        style={{ width: '100%', height: '100%' }}
      >
        <div style={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {checked ? (
            <Check
              size={18}
              strokeWidth={3}
              style={{ color: "var(--border-success)" }}
            />
          ) : (
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: '9999px',
                backgroundColor: "var(--surface-disabled)",
              }}
            />
          )}
        </div>
      </ChamferedFrame>
    </button>
  );
}
