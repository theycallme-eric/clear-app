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
    <div className={className} style={{ position: 'relative' }} ref={ref}>
      <ChamferedFrame
        cornerSize="sm"
        hasLeftBorder
        surfaceColor={isActive || open ? 'var(--surface-card-accent)' : 'transparent'}
        borderColor={isActive || open ? 'var(--border-card)' : 'var(--border-subtle)'}
      >
        <button
          onClick={() => setOpen(!open)}
          className="text-label-xs"
          style={{
            paddingLeft: 'var(--spacing-300)',
            paddingRight: 'var(--spacing-300)',
            paddingTop: 'var(--spacing-200)',
            paddingBottom: 'var(--spacing-200)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-100)',
            color: isActive || open ? 'var(--text-cta)' : 'var(--text-disabled)',
          }}
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
          className="scanlines"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: 'var(--spacing-100)',
            zIndex: 10,
            minWidth: '140px',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div style={{ paddingTop: 'var(--spacing-100)', paddingBottom: 'var(--spacing-100)' }}>
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className="text-label-xs transition-colors"
                style={{
                  width: '100%',
                  textAlign: 'left',
                  paddingLeft: 'var(--spacing-300)',
                  paddingRight: 'var(--spacing-300)',
                  paddingTop: 'var(--spacing-200)',
                  paddingBottom: 'var(--spacing-200)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
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
      borderColor={active ? 'var(--border-card)' : 'var(--border-subtle)'}
      className={className}
    >
      <button
        onClick={onClick}
        className="text-label-xs"
        style={{
          paddingLeft: 'var(--spacing-300)',
          paddingRight: 'var(--spacing-300)',
          paddingTop: 'var(--spacing-200)',
          paddingBottom: 'var(--spacing-200)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: active ? 'var(--text-cta)' : 'var(--text-disabled)',
        }}
      >
        {label}
      </button>
    </ChamferedFrame>
  );
}
