import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ActionButtonVariant = "primary" | "secondary" | "transparent";

interface ActionButtonProps {
  children: ReactNode;
  variant?: ActionButtonVariant;
  disabled?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit" | "reset";
}

/**
 * ActionButton - Custom button component matching Figma design system
 *
 * Uses a 3-column layout to achieve the angled corner effect:
 * - cta-left: Left border column (8px fixed)
 * - cta-center: Main content area (flexible)
 * - cta-right: Right border + corner (8px fixed)
 *   - cta-right-top: Upper right border
 *   - cta-right-bottom: Angled corner piece (8×8 fixed)
 *
 * The borders of each column align to create a continuous border effect.
 */
export function ActionButton({
  children,
  variant = "primary",
  disabled = false,
  iconLeft,
  iconRight,
  onClick,
  className,
  type = "button",
}: ActionButtonProps) {
  const isTransparent = variant === "transparent";
  const isPrimary = variant === "primary";
  // Transparent variant - simple button without columns
  if (isTransparent) {
    return (
      <button
        type={type}
        disabled={disabled}
        onClick={onClick}
        className={cn(
          "text-cta-md",
          "transition-colors",
          disabled && "cursor-not-allowed",
          className
        )}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--spacing-200)',
          padding: `var(--spacing-200) var(--spacing-200)`,
          fontWeight: 500,
          color: disabled ? 'var(--text-disabled)' : 'var(--text-cta)',
        }}
      >
        {iconLeft && (
          <span style={{
            width: 24,
            height: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: disabled ? 'var(--text-disabled)' : 'var(--icon-cta)',
          }}>
            {iconLeft}
          </span>
        )}
        <span>{children}</span>
        {iconRight && (
          <span style={{
            width: 24,
            height: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: disabled ? 'var(--text-disabled)' : 'var(--icon-cta)',
          }}>
            {iconRight}
          </span>
        )}
      </button>
    );
  }

  // Primary and Secondary variants with 3-column layout
  // Token mappings based on variant and state
  const getAccentBg = () => {
    if (disabled) {
      return isPrimary
        ? "var(--surface-cta-primary-disabled)"
        : "var(--surface-cta-secondary-disabled)";
    }
    return "var(--surface-cta-accent)";
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "group transition-all",
        disabled ? "cursor-not-allowed" : "cursor-pointer",
        className
      )}
      style={{
        display: 'inline-flex',
        height: 40,
        alignItems: 'stretch',
      }}
    >
      {/* cta-left: Left border column */}
      <div
        className={cn(
          "transition-colors",
          disabled
            ? "border-[var(--border-disabled)]"
            : isPrimary
            ? "border-[var(--border-cta-primary)] group-hover:border-[var(--border-cta-primary-hover)]"
            : "border-[var(--border-cta-secondary)]"
        )}
        style={{
          width: 8,
          flexShrink: 0,
          borderWidth: 2,
          borderStyle: 'solid',
          backgroundColor: getAccentBg(),
        }}
      />

      {/* cta-center: Main content area */}
      <div
        className={cn(
          "transition-colors",
          disabled
            ? "border-[var(--border-disabled)]"
            : isPrimary
            ? "border-[var(--border-cta-primary)] group-hover:border-[var(--border-cta-primary-hover)]"
            : "border-[var(--border-cta-secondary)]",
          // Background
          disabled
            ? isPrimary
              ? "bg-[var(--surface-cta-primary-disabled)]"
              : "bg-[var(--surface-cta-secondary-disabled)]"
            : isPrimary
            ? "bg-[var(--surface-cta-primary)] group-hover:bg-[var(--surface-cta-primary-hover)]"
            : "bg-[var(--surface-cta-secondary)] group-hover:bg-[var(--surface-cta-secondary-hover)]"
        )}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTopWidth: 2,
          borderBottomWidth: 2,
          borderTopStyle: 'solid',
          borderBottomStyle: 'solid',
        }}
      >
        {/* cta-center-container: Content wrapper */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          paddingLeft: 'var(--spacing-200)',
          paddingRight: 0,
          paddingTop: 'var(--spacing-200)',
          paddingBottom: 'var(--spacing-200)',
        }}>
          {iconLeft && (
            <span
              className={cn(
                disabled
                  ? "text-[var(--text-disabled)]"
                  : "text-[var(--icon-cta)] group-hover:text-[var(--text-cta-hover)]"
              )}
              style={{
                width: 24,
                height: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {iconLeft}
            </span>
          )}
          <span
            className={cn(
              "text-cta-md",
              disabled
                ? "text-[var(--text-disabled)]"
                : "text-[var(--text-cta)] group-hover:text-[var(--text-cta-hover)]"
            )}
            style={{
              fontWeight: 500,
              whiteSpace: 'nowrap',
              flex: 1,
              textAlign: 'center',
            }}
          >
            {children}
          </span>
          {iconRight && (
            <span
              className={cn(
                disabled
                  ? "text-[var(--text-disabled)]"
                  : "text-[var(--icon-cta)] group-hover:text-[var(--text-cta-hover)]"
              )}
              style={{
                width: 24,
                height: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {iconRight}
            </span>
          )}
        </div>
      </div>

      {/* cta-right: Right border + corner */}
      <div style={{
        width: 8,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
      }}>
        {/* cta-right-top: Upper right section */}
        <div
          className={cn(
            "transition-colors",
            disabled
              ? "border-[var(--border-disabled)]"
              : isPrimary
              ? "border-[var(--border-cta-primary)] group-hover:border-[var(--border-cta-primary-hover)]"
              : "border-[var(--border-cta-secondary)]",
            // Background
            disabled
              ? isPrimary
                ? "bg-[var(--surface-cta-primary-disabled)]"
                : "bg-[var(--surface-cta-secondary-disabled)]"
              : isPrimary
              ? "bg-[var(--surface-cta-primary)] group-hover:bg-[var(--surface-cta-primary-hover)]"
              : "bg-[var(--surface-cta-secondary)] group-hover:bg-[var(--surface-cta-secondary-hover)]"
          )}
          style={{
            flex: 1,
            width: 8,
            borderTopWidth: 2,
            borderRightWidth: 2,
            borderTopStyle: 'solid',
            borderRightStyle: 'solid',
          }}
        />

        {/* cta-right-bottom: Corner angle (8×8 fixed) */}
        {/* -mt-px closes subpixel rendering gap */}
        <div style={{
          width: 8,
          height: 8,
          flexShrink: 0,
          position: 'relative',
          marginTop: -1,
        }}>
          {/* Background layer - surface fill triangle */}
          <div
            className={cn(
              "transition-colors",
              // Triangle: top-left, top-right, bottom-left (cuts off bottom-right)
              "[clip-path:polygon(0_0,100%_0,0_100%)]",
              disabled
                ? isPrimary
                  ? "bg-[var(--surface-cta-primary-disabled)]"
                  : "bg-[var(--surface-cta-secondary-disabled)]"
                : isPrimary
                ? "bg-[var(--surface-cta-primary)] group-hover:bg-[var(--surface-cta-primary-hover)]"
                : "bg-[var(--surface-cta-secondary)] group-hover:bg-[var(--surface-cta-secondary-hover)]"
            )}
            style={{ position: 'absolute', inset: 0 }}
          />
          {/* Border layer - diagonal stroke */}
          <svg
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
            }}
            viewBox="0 0 8 8"
            aria-hidden="true"
          >
            <line
              x1="8"
              y1="0"
              x2="0"
              y2="8"
              strokeWidth="2"
              className={cn(
                "transition-[stroke]",
                disabled
                  ? "stroke-[var(--border-disabled)]"
                  : isPrimary
                  ? "stroke-[var(--border-cta-primary)] group-hover:stroke-[var(--border-cta-primary-hover)]"
                  : "stroke-[var(--border-cta-secondary)]"
              )}
            />
          </svg>
        </div>
      </div>
    </button>
  );
}
