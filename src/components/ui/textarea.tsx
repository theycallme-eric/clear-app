import * as React from "react";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { ChamferedFrame } from "@/components/ChamferedFrame";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Optional icon to show in the top-right corner */
  iconRight?: React.ReactNode;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, disabled, iconRight, ...props }, ref) => {
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
        className={cn("w-full min-h-[85px] transition-colors", className)}
      >
        <div className="relative flex h-full">
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
              "flex-1 w-full bg-transparent px-3 py-2 resize-none",
              "text-label-md",
              "text-[var(--text-input)]",
              "placeholder:text-[var(--text-input-placeholder)]",
              "focus:outline-none",
              disabled && "text-[var(--text-input-disabled)] cursor-not-allowed",
              iconRight && "pr-10"
            )}
            ref={ref}
            {...props}
          />
          {iconRight && (
            <span
              className={cn(
                "absolute top-2 right-3 flex items-center justify-center w-6 h-6 shrink-0",
                disabled ? "text-[var(--icon-input-disabled)]" : "text-[var(--icon-input)]"
              )}
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
