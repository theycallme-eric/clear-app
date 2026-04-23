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
      height: 40,
      text: "text-cta-sm",
      iconSize: 20,
      paddingX: 'var(--spacing-300)',
      paddingY: 'var(--spacing-200)',
      leftColSize: "md" as const,
    },
    md: {
      height: 40,
      text: "text-cta-md",
      iconSize: 24,
      paddingX: 'var(--spacing-300)',
      paddingY: 'var(--spacing-200)',
      leftColSize: "md" as const,
    },
    lg: {
      height: 56,
      text: "text-cta-lg",
      iconSize: 24,
      paddingX: 'var(--spacing-400)',
      paddingY: 'var(--spacing-300)',
      leftColSize: "md" as const,
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
          currentSize.text,
          "transition-colors",
          disabled && "cursor-not-allowed",
          className
        )}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--spacing-200)',
          height: currentSize.height,
          padding: `${currentSize.paddingY} ${currentSize.paddingX}`,
          fontWeight: 700,
          color: disabled ? 'var(--text-disabled)' : 'var(--text-cta)',
          ...(fullWidth ? { width: '100%' } : {}),
        }}
      >
        {iconLeft && (
          <span
            style={{
              width: currentSize.iconSize,
              height: currentSize.iconSize,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              color: disabled ? 'var(--text-disabled)' : 'var(--icon-cta)',
            }}
          >
            {iconLeft}
          </span>
        )}
        <span style={{ textTransform: 'uppercase' }}>{children}</span>
        {iconRight && (
          <span
            style={{
              width: currentSize.iconSize,
              height: currentSize.iconSize,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              color: disabled ? 'var(--text-disabled)' : 'var(--icon-cta)',
            }}
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
        "group scanlines",
        disabled ? "cursor-not-allowed" : "cursor-pointer",
        // CSS custom properties for colors - these change on hover
        // Default state
        isPrimary ? [
          "[--btn-surface:var(--surface-cta-primary)]",
          "[--btn-border:var(--border-cta-primary)]",
          "[--btn-accent:var(--surface-cta-primary-accent)]",
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
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'stretch',
        backdropFilter: 'blur(12px)',
        height: currentSize.height,
        ...(fullWidth ? { width: '100%' } : {}),
      }}
    >
      {/* Left accent column */}
      <LeftColumn
        size={currentSize.leftColSize}
        surfaceColor="var(--btn-accent)"
        borderColor="var(--btn-border)"
        className="transition-colors"
        style={{ position: 'relative', zIndex: 10 }}
      />

      {/* Main body with chamfered corner */}
      <ChamferedFrame
        cornerSize="sm"
        surfaceColor="var(--btn-surface)"
        borderColor="var(--btn-border)"
        hasLeftBorder={false}
        className="transition-colors"
        style={{ flex: 1, marginLeft: -2 }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--spacing-200)',
          height: '100%',
          padding: `${currentSize.paddingY} ${currentSize.paddingX}`,
        }}>
          {iconLeft && (
            <span
              className="transition-colors"
              style={{
                width: currentSize.iconSize,
                height: currentSize.iconSize,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: disabled ? 'var(--text-disabled)' : 'var(--icon-on-cta)',
              }}
            >
              {iconLeft}
            </span>
          )}
          <span
            className={cn(currentSize.text, "transition-colors")}
            style={{
              fontWeight: 700,
              whiteSpace: 'nowrap',
              textTransform: 'uppercase',
              color: disabled ? 'var(--text-disabled)' : 'var(--text-on-cta)',
            }}
          >
            {children}
          </span>
          {iconRight && (
            <span
              className="transition-colors"
              style={{
                width: currentSize.iconSize,
                height: currentSize.iconSize,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: disabled ? 'var(--text-disabled)' : 'var(--icon-on-cta)',
              }}
            >
              {iconRight}
            </span>
          )}
        </div>
      </ChamferedFrame>
    </button>
  );
}
