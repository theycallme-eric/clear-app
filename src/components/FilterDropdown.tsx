import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ChamferedFrame } from "./ChamferedFrame";
import { ChevronDown } from "@/components/icons";

export interface FilterOption<T extends string = string> {
  value: T;
  label: string;
}

interface FilterDropdownProps<T extends string = string> {
  /** Label shown when no specific option is selected (value is the allValue). */
  label: string;
  options: FilterOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

/**
 * Chamfered dropdown filter button with a flyout menu.
 * Used in filter bars (e.g., History screen filters for Anchor, Intensity, Goal).
 */
export function FilterDropdown<T extends string>({
  label,
  options,
  value,
  onChange,
  className,
}: FilterDropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const isActive = value !== options[0]?.value;
  const displayLabel = isActive
    ? options.find(o => o.value === value)?.label ?? label
    : label;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className={cn("relative", className)} ref={ref}>
      <ChamferedFrame
        cornerSize="sm"
        hasLeftBorder
        surfaceColor={isActive || open ? 'var(--surface-card-accent)' : 'transparent'}
        borderColor={isActive || open ? 'var(--border-card)' : 'var(--color-neutral-alpha-300)'}
      >
        <button
          onClick={() => setOpen(!open)}
          className="px-3 py-2 text-label-xs uppercase tracking-wide flex items-center gap-1"
          style={{ color: isActive || open ? 'var(--text-cta)' : 'var(--text-disabled)' }}
        >
          {displayLabel}
          <ChevronDown size={12} />
        </button>
      </ChamferedFrame>

      {open && (
        <ChamferedFrame
          cornerSize="sm"
          hasLeftBorder
          surfaceColor="var(--surface-dropdown)"
          borderColor="var(--border-dropdown)"
          className="absolute top-full left-0 mt-1 z-10 min-w-[140px] backdrop-blur-md scanlines"
        >
          <div className="py-1">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-label-xs uppercase tracking-wide transition-colors"
                style={{
                  color: value === option.value ? 'var(--text-dropdown-selected)' : 'var(--text-dropdown)',
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </ChamferedFrame>
      )}
    </div>
  );
}

interface FilterToggleProps {
  /** Whether this toggle is currently active (filters are cleared). */
  active: boolean;
  onClick: () => void;
  label?: string;
  className?: string;
}

/**
 * Simple chamfered toggle button for "All" filter reset.
 * Same visual as FilterDropdown trigger, but no dropdown menu.
 */
export function FilterToggle({
  active,
  onClick,
  label = "All",
  className,
}: FilterToggleProps) {
  return (
    <ChamferedFrame
      cornerSize="sm"
      hasLeftBorder
      surfaceColor={active ? 'var(--surface-card-accent)' : 'transparent'}
      borderColor={active ? 'var(--border-card)' : 'var(--color-neutral-alpha-300)'}
      className={className}
    >
      <button
        onClick={onClick}
        className="px-3 py-2 text-label-xs uppercase tracking-wide"
        style={{ color: active ? 'var(--text-cta)' : 'var(--text-disabled)' }}
      >
        {label}
      </button>
    </ChamferedFrame>
  );
}
