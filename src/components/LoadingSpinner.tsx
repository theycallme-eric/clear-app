import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  message?: string;
}

/**
 * Inline loading spinner for buttons and in-place loading.
 * Componentized for easy future styling/animation customization.
 */
export const LoadingSpinner = ({ size = "md", className, message }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-8 h-8 border-3",
  };

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <div
        className={cn(
          "rounded-full animate-spin",
          sizeClasses[size]
        )}
        style={{
          borderColor: 'var(--color-neutral-alpha-300)',
          borderTopColor: 'var(--border-card)',
        }}
      />
      {message && (
        <span className="text-label-sm font-mono" style={{ color: 'var(--text-paragraph)' }}>{message}</span>
      )}
    </div>
  );
};
