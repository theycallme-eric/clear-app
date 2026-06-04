import * as React from "react";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { ChamferedFrame } from "@/components/ChamferedFrame";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Optional icon to show in the top-right corner */
  iconRight?: React.ReactNode;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, disabled, iconRight, style, ...props }, ref) => {
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
        style={{ width: "100%", minHeight: "85px" }}
      >
        <div style={{ position: "relative", display: "flex", height: "100%" }}>
          <textarea
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
              width: "100%",
              background: "transparent",
              padding: "var(--spacing-400) var(--spacing-500)",
              resize: "none",
              color: disabled ? "var(--text-input-disabled)" : "var(--text-input)",
              outline: "none",
              border: "none",
              ...(iconRight ? { paddingRight: "var(--spacing-800)" } : {}),
              ...style,
            }}
            ref={ref}
            {...props}
          />
          {iconRight && (
            <span
              style={{
                position: "absolute",
                top: "var(--spacing-200)",
                right: "var(--spacing-300)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "var(--spacing-600)",
                height: "var(--spacing-600)",
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
Textarea.displayName = "Textarea";

export { Textarea };
