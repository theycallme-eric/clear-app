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
        className={cn("w-full h-10 transition-colors", className)}
      >
        <div className="flex items-center h-full">
          {iconLeft && (
            <span
              className={cn(
                "flex items-center justify-center w-6 h-6 ml-3 shrink-0",
                disabled ? "text-[var(--icon-input-disabled)]" : "text-[var(--icon-input)]"
              )}
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
              "flex-1 h-full bg-transparent px-3 py-2",
              "text-label-md",
              "text-[var(--text-input)]",
              "placeholder:text-[var(--text-input-placeholder)]",
              "focus:outline-none",
              disabled && "text-[var(--text-input-disabled)] cursor-not-allowed",
              iconLeft && "pl-2",
              iconRight && "pr-2"
            )}
            ref={ref}
            {...props}
          />
          {iconRight && (
            <span
              className={cn(
                "flex items-center justify-center w-6 h-6 mr-3 shrink-0",
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
Input.displayName = "Input";

export { Input };
