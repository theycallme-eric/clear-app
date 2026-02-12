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
      <p className="text-foreground text-label-sm uppercase tracking-wide mb-2">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 mt-2 px-4 py-2 text-label-sm text-clear-orange hover:text-clear-orange/80 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </Card>
  );
};
