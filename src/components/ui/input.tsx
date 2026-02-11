import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps extends React.ComponentProps<"input"> {
  /** Optional icon to show on the left */
  iconLeft?: React.ReactNode;
  /** Optional icon to show on the right */
  iconRight?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, iconLeft, iconRight, disabled, ...props }, ref) => {
    return (
      <div
        className={cn(
          "flex items-center w-full h-10 border-2 transition-colors",
          "bg-[var(--surface-input)] border-[var(--border-input)]",
          "focus-within:bg-[var(--surface-input-active)] focus-within:border-[var(--border-input-active)]",
          disabled && "bg-[var(--surface-input-disabled)] border-[var(--border-input-disabled)] cursor-not-allowed",
          className
        )}
      >
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
    );
  }
);
Input.displayName = "Input";

export { Input };
