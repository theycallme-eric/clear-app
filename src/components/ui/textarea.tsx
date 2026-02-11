import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Optional icon to show in the top-right corner */
  iconRight?: React.ReactNode;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, disabled, iconRight, ...props }, ref) => {
    return (
      <div
        className={cn(
          "relative flex w-full min-h-[85px] border-2 transition-colors",
          "bg-[var(--surface-input)] border-[var(--border-input)]",
          "focus-within:bg-[var(--surface-input-active)] focus-within:border-[var(--border-input-active)]",
          disabled && "bg-[var(--surface-input-disabled)] border-[var(--border-input-disabled)] cursor-not-allowed",
          className
        )}
      >
        <textarea
          disabled={disabled}
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
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
