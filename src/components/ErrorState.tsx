import { cn } from "@/lib/utils";
import { RefreshCw } from "lucide-react";
import { Card } from "./Card";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

/**
 * Error state with optional retry button.
 * Used when data fetching or operations fail.
 */
export const ErrorState = ({
  message = "Something went wrong",
  onRetry,
  className,
}: ErrorStateProps) => {
  return (
    <Card padding="md" className={cn("text-center", className)}>
      <p
        className="text-label-sm uppercase tracking-wide mb-2"
        style={{ color: 'var(--text-header)' }}
      >
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 mt-2 px-4 py-2 text-label-sm transition-colors"
          style={{ color: 'var(--icon-cta)' }}
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </Card>
  );
};
