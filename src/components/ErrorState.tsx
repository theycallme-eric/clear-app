import { RefreshCw } from "lucide-react";
import { Card } from "./Card";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
  showLeftColumn?: boolean;
}

/**
 * Error state with optional retry button.
 * Used when data fetching or operations fail.
 */
export const ErrorState = ({
  message = "Something went wrong",
  onRetry,
  className,
  showLeftColumn,
}: ErrorStateProps) => {
  return (
    <Card padding="md" className={className} showLeftColumn={showLeftColumn}>
      <div style={{ textAlign: 'center' }}>
        <p
          className="text-label-sm"
          style={{ textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--spacing-200)', color: 'var(--text-header)' }}
        >
          {message}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-label-sm transition-colors"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--spacing-200)',
              marginTop: 'var(--spacing-200)',
              paddingLeft: 'var(--spacing-400)',
              paddingRight: 'var(--spacing-400)',
              paddingTop: 'var(--spacing-200)',
              paddingBottom: 'var(--spacing-200)',
              color: 'var(--icon-cta)',
            }}
          >
            <RefreshCw style={{ width: 'var(--spacing-400)', height: 'var(--spacing-400)' }} />
            Try Again
          </button>
        )}
      </div>
    </Card>
  );
};
