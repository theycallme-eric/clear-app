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
  const isSecondary = variant === "secondary";

  // Transparent variant - simple button without columns
  if (isTransparent) {
    return (
      <button
        type={type}
        disabled={disabled}
        onClick={onClick}
        className={cn(
          "group inline-flex items-center justify-between gap-2",
          "px-2 py-2",
          "text-cta-md font-medium",
          "transition-colors",
          disabled
            ? "text-[var(--text-disabled)] cursor-not-allowed"
            : "text-[var(--text-cta)] hover:text-[var(--text-cta-hover)]",
          className
        )}
      >
        {iconLeft && (
          <span className={cn(
            "size-6 flex items-center justify-center",
            disabled ? "text-[var(--text-disabled)]" : "text-[var(--icon-cta)] group-hover:text-[var(--text-cta-hover)]"
          )}>
            {iconLeft}
          </span>
        )}
        <span>{children}</span>
        {iconRight && (
          <span className={cn(
            "size-6 flex items-center justify-center",
            disabled ? "text-[var(--text-disabled)]" : "text-[var(--icon-cta)] group-hover:text-[var(--text-cta-hover)]"
          )}>
            {iconRight}
          </span>
        )}
      </button>
    );
  }

  // Primary and Secondary variants with 3-column layout
  // Token mappings based on variant and state
  const getBorderColor = () => {
    if (disabled) return "var(--border-disabled)";
    if (isPrimary) return "var(--border-cta-primary)";
    return "var(--border-cta-secondary)";
  };

  const getHoverBorderColor = () => {
    if (disabled) return "var(--border-disabled)";
    if (isPrimary) return "var(--border-cta-primary-hover)";
    return "var(--border-cta-secondary)"; // secondary doesn't change on hover
  };

  const getAccentBg = () => {
    if (disabled) {
      return isPrimary
        ? "var(--surface-cta-primary-disabled)"
        : "var(--surface-cta-secondary-disabled)";
    }
    return "var(--surface-cta-accent)";
  };

  const getBodyBg = () => {
    if (disabled) {
      return isPrimary
        ? "var(--surface-cta-primary-disabled)"
        : "var(--surface-cta-secondary-disabled)";
    }
    return isPrimary
      ? "var(--surface-cta-primary)"
      : "var(--surface-cta-secondary)";
  };

  const getHoverBodyBg = () => {
    if (disabled) return getBodyBg();
    return isPrimary
      ? "var(--surface-cta-primary-hover)"
      : "var(--surface-cta-secondary-hover)";
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "group inline-flex h-10 items-stretch",
        "transition-all",
        disabled ? "cursor-not-allowed" : "cursor-pointer",
        className
      )}
    >
      {/* cta-left: Left border column */}
      <div
        className={cn(
          "w-2 shrink-0 border-2 transition-colors",
          disabled
            ? "border-[var(--border-disabled)]"
            : isPrimary
            ? "border-[var(--border-cta-primary)] group-hover:border-[var(--border-cta-primary-hover)]"
            : "border-[var(--border-cta-secondary)]"
        )}
        style={{ backgroundColor: getAccentBg() }}
      />

      {/* cta-center: Main content area */}
      <div
        className={cn(
          "flex-1 flex flex-col items-center justify-between",
          "border-t-2 border-b-2 transition-colors",
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
      >
        {/* cta-center-container: Content wrapper */}
        <div className="flex-1 flex items-center justify-between w-full pl-2 pr-0 py-2">
          {iconLeft && (
            <span
              className={cn(
                "size-6 flex items-center justify-center shrink-0",
                disabled
                  ? "text-[var(--text-disabled)]"
                  : "text-[var(--icon-cta)] group-hover:text-[var(--text-cta-hover)]"
              )}
            >
              {iconLeft}
            </span>
          )}
          <span
            className={cn(
              "text-cta-md font-medium whitespace-nowrap flex-1 text-center",
              disabled
                ? "text-[var(--text-disabled)]"
                : "text-[var(--text-cta)] group-hover:text-[var(--text-cta-hover)]"
            )}
          >
            {children}
          </span>
          {iconRight && (
            <span
              className={cn(
                "size-6 flex items-center justify-center shrink-0",
                disabled
                  ? "text-[var(--text-disabled)]"
                  : "text-[var(--icon-cta)] group-hover:text-[var(--text-cta-hover)]"
              )}
            >
              {iconRight}
            </span>
          )}
        </div>
      </div>

      {/* cta-right: Right border + corner */}
      <div className="w-2 shrink-0 flex flex-col items-start">
        {/* cta-right-top: Upper right section */}
        <div
          className={cn(
            "flex-1 w-2 border-t-2 border-r-2 transition-colors",
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
        />

        {/* cta-right-bottom: Corner angle (8×8 fixed) */}
        {/* -mt-px closes subpixel rendering gap */}
        <div className="w-2 h-2 shrink-0 relative -mt-px">
          {/* Background layer - surface fill triangle */}
          <div
            className={cn(
              "absolute inset-0 transition-colors",
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
          />
          {/* Border layer - diagonal stroke */}
          <svg
            className="absolute inset-0 w-full h-full"
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
