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
 * @tokens
 * - CSS vars: --btn-surface, --btn-border, --btn-accent (set on wrapper, read by children)
 * - Primary surface: --surface-cta-primary → --surface-cta-primary-hover (via .cta-btn-primary:hover)
 * - Primary border: --border-cta-primary → --border-cta-primary-hover
 * - Secondary surface: --surface-cta-secondary → --surface-cta-secondary-hover
 * - Secondary border: --border-cta-secondary → --border-cta-secondary-hover
 * - Accent (left bar): --surface-cta-primary-accent
 * - Disabled: --surface-cta-primary-disabled / --surface-cta-secondary-disabled, --border-disabled
 * - Text: --text-on-cta (on CTA surface), --text-cta (transparent variant), --text-disabled
 * - Icons: --icon-on-cta (on CTA surface), --icon-cta (transparent variant)
 * - Typography: text-cta-sm / text-cta-md / text-cta-lg
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
  // CSS custom properties for colors, with hover overrides via CSS classes
  const btnVars = disabled
    ? {
        '--btn-surface': isPrimary ? 'var(--surface-cta-primary-disabled)' : 'var(--surface-cta-secondary-disabled)',
        '--btn-border': 'var(--border-disabled)',
        '--btn-accent': isPrimary ? 'var(--surface-cta-primary-disabled)' : 'var(--surface-cta-secondary-disabled)',
      }
    : {
        '--btn-surface': isPrimary ? 'var(--surface-cta-primary)' : 'var(--surface-cta-secondary)',
        '--btn-border': isPrimary ? 'var(--border-cta-primary)' : 'var(--border-cta-secondary)',
        '--btn-accent': 'var(--surface-cta-primary-accent)',
      };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "group scanlines",
        disabled ? "cursor-not-allowed" : "cursor-pointer",
        !disabled && (isPrimary ? "cta-btn-primary" : "cta-btn-secondary"),
        className
      )}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'stretch',
        backdropFilter: 'blur(12px)',
        height: currentSize.height,
        ...(fullWidth ? { width: '100%' } : {}),
        ...btnVars,
      } as React.CSSProperties}
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
