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
        "w-8 h-8 flex-shrink-0 transition-opacity",
        disabled && "opacity-50 cursor-not-allowed",
        className,
      )}
    >
      <ChamferedFrame
        cornerSize="sm"
        surfaceColor={surfaceColor}
        borderColor={borderColor}
        hasLeftBorder={true}
        className="w-full h-full"
      >
        <div className="h-full flex items-center justify-center">
          {checked ? (
            <Check
              size={18}
              strokeWidth={3}
              style={{ color: "var(--border-success)" }}
            />
          ) : (
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: "var(--surface-disabled)" }}
            />
          )}
        </div>
      </ChamferedFrame>
    </button>
  );
}
