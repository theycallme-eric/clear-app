import * as React from "react";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { ChamferedFrame } from "@/components/ChamferedFrame";

export interface InputProps extends React.ComponentProps<"input"> {
  /** Optional icon to show on the left */
  iconLeft?: React.ReactNode;
  /** Optional icon to show on the right */
  iconRight?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, iconLeft, iconRight, disabled, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    const surfaceColor = disabled
      ? "var(--surface-input-disabled)"
      : isFocused
      ? "var(--surface-input-active)"
      : "var(--surface-input)";

    const borderColor = disabled
      ? "var(--border-input-disabled)"
      : isFocused
      ? "var(--border-input-active)"
      : "var(--border-input)";

    return (
      <ChamferedFrame
        cornerSize="sm"
        surfaceColor={surfaceColor}
        borderColor={borderColor}
        hasLeftBorder={true}
        className={cn("transition-colors", className)}
        style={{ width: "100%", height: "var(--spacing-800)" }}
      >
        <div style={{ display: "flex", alignItems: "center", height: "100%" }}>
          {iconLeft && (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "var(--spacing-600)",
                height: "var(--spacing-600)",
                marginLeft: "var(--spacing-300)",
                flexShrink: 0,
                color: disabled ? "var(--icon-input-disabled)" : "var(--icon-input)",
              }}
            >
              {iconLeft}
            </span>
          )}
          <input
            type={type}
            disabled={disabled}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            className={cn(
              "text-label-md",
              disabled && "cursor-not-allowed"
            )}
            style={{
              flex: 1,
              height: "100%",
              background: "transparent",
              padding: "var(--spacing-200) var(--spacing-300)",
              color: disabled ? "var(--text-input-disabled)" : "var(--text-input)",
              outline: "none",
              border: "none",
              ...(iconLeft ? { paddingLeft: "var(--spacing-200)" } : {}),
              ...(iconRight ? { paddingRight: "var(--spacing-200)" } : {}),
            }}
            placeholder={props.placeholder}
            ref={ref}
            {...props}
          />
          {iconRight && (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "var(--spacing-600)",
                height: "var(--spacing-600)",
                marginRight: "var(--spacing-300)",
                flexShrink: 0,
                color: disabled ? "var(--icon-input-disabled)" : "var(--icon-input)",
              }}
            >
              {iconRight}
            </span>
          )}
        </div>
      </ChamferedFrame>
    );
  }
);
Input.displayName = "Input";

export { Input };
