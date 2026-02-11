import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ChamferedFrame } from "./ChamferedFrame";
import { LeftColumn } from "./LeftColumn";

type CTAButtonVariant = "primary" | "secondary" | "transparent";
type CTAButtonSize = "sm" | "md" | "lg";

interface CTAButtonProps {
  children: ReactNode;
  variant?: CTAButtonVariant;
  size?: CTAButtonSize;
  disabled?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit" | "reset";
  fullWidth?: boolean;
}

/**
 * CTAButton - Call-to-action button using LeftColumn + ChamferedFrame
 *
 * Hover states are handled via CSS custom properties that change on :hover,
 * allowing the child components to respond to hover without prop changes.
 *
 * Figma variables mapped:
 * - Primary default: surface/cta-primary, border/color/cta-primary
 * - Primary hover: surface/cta-primary-hover, border/color/cta-primary-hover
 * - Secondary default: surface/cta-secondary, border/color/cta-secondary
 * - Secondary hover: surface/cta-secondary-hover, border/color/cta-hover-secondary
 * - Accent (left bar): surface/cta-accent
 * - Text: text-color/cta → text-color/cta-hover
 */
export function CTAButton({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  iconLeft,
  iconRight,
  onClick,
  className,
  type = "button",
  fullWidth = false,
}: CTAButtonProps) {
  const isTransparent = variant === "transparent";
  const isPrimary = variant === "primary";

  // Size configurations - using Figma CTA typography tokens
  const sizeConfig = {
    sm: {
      height: "h-10",
      text: "text-cta-sm",
      icon: "size-5",
      padding: "px-3 py-2",
      leftColSize: "sm" as const,
    },
    md: {
      height: "h-10",
      text: "text-cta-md",
      icon: "size-6",
      padding: "px-3 py-2",
      leftColSize: "sm" as const,
    },
    lg: {
      height: "h-14",
      text: "text-cta-lg",
      icon: "size-6",
      padding: "px-4 py-3",
      leftColSize: "sm" as const,
    },
  };

  const currentSize = sizeConfig[size];

  // Transparent variant - simple button without frame
  if (isTransparent) {
    return (
      <button
        type={type}
        disabled={disabled}
        onClick={onClick}
        className={cn(
          "group inline-flex items-center justify-center gap-2",
          currentSize.height,
          currentSize.padding,
          currentSize.text,
          "font-bold",
          "transition-colors",
          disabled
            ? "text-[var(--text-disabled)] cursor-not-allowed"
            : "text-[var(--text-cta)] hover:text-[var(--text-cta-hover)]",
          fullWidth && "w-full",
          className
        )}
      >
        {iconLeft && (
          <span
            className={cn(
              currentSize.icon,
              "flex items-center justify-center shrink-0",
              disabled
                ? "text-[var(--text-disabled)]"
                : "text-[var(--icon-cta)] group-hover:text-[var(--text-cta-hover)]"
            )}
          >
            {iconLeft}
          </span>
        )}
        <span className="uppercase">{children}</span>
        {iconRight && (
          <span
            className={cn(
              currentSize.icon,
              "flex items-center justify-center shrink-0",
              disabled
                ? "text-[var(--text-disabled)]"
                : "text-[var(--icon-cta)] group-hover:text-[var(--text-cta-hover)]"
            )}
          >
            {iconRight}
          </span>
        )}
      </button>
    );
  }

  // Primary/Secondary variants - LeftColumn + ChamferedFrame
  // Using CSS custom properties for hover state changes
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "group inline-flex items-stretch",
        currentSize.height,
        disabled ? "cursor-not-allowed" : "cursor-pointer",
        fullWidth && "w-full",
        // CSS custom properties for colors - these change on hover
        // Default state
        isPrimary ? [
          "[--btn-surface:var(--surface-cta-primary)]",
          "[--btn-border:var(--border-cta-primary)]",
          "[--btn-accent:var(--surface-cta-accent)]",
          // Hover state (when not disabled)
          !disabled && "hover:[--btn-surface:var(--surface-cta-primary-hover)]",
          !disabled && "hover:[--btn-border:var(--border-cta-primary-hover)]",
        ] : [
          "[--btn-surface:var(--surface-cta-secondary)]",
          "[--btn-border:var(--border-cta-secondary)]",
          "[--btn-accent:var(--surface-cta-accent)]",
          // Hover state (when not disabled)
          !disabled && "hover:[--btn-surface:var(--surface-cta-secondary-hover)]",
          !disabled && "hover:[--btn-border:var(--border-cta-secondary-hover)]",
        ],
        // Disabled overrides
        disabled && [
          isPrimary
            ? "[--btn-surface:var(--surface-cta-primary-disabled)]"
            : "[--btn-surface:var(--surface-cta-secondary-disabled)]",
          "[--btn-border:var(--border-disabled)]",
          isPrimary
            ? "[--btn-accent:var(--surface-cta-primary-disabled)]"
            : "[--btn-accent:var(--surface-cta-secondary-disabled)]",
        ],
        className
      )}
    >
      {/* Left accent column */}
      <LeftColumn
        size={currentSize.leftColSize}
        surfaceColor="var(--btn-accent)"
        borderColor="var(--btn-border)"
        className="relative z-10 transition-colors"
      />

      {/* Main body with chamfered corner */}
      <ChamferedFrame
        cornerSize="sm"
        surfaceColor="var(--btn-surface)"
        borderColor="var(--btn-border)"
        hasLeftBorder={false}
        className="flex-1 -ml-[2px] transition-colors"
      >
        <div className={cn(
          "flex items-center justify-center gap-2 h-full",
          currentSize.padding
        )}>
          {iconLeft && (
            <span
              className={cn(
                currentSize.icon,
                "flex items-center justify-center shrink-0 transition-colors",
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
              currentSize.text,
              "font-bold whitespace-nowrap uppercase transition-colors",
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
                currentSize.icon,
                "flex items-center justify-center shrink-0 transition-colors",
                disabled
                  ? "text-[var(--text-disabled)]"
                  : "text-[var(--icon-cta)] group-hover:text-[var(--text-cta-hover)]"
              )}
            >
              {iconRight}
            </span>
          )}
        </div>
      </ChamferedFrame>
    </button>
  );
}
