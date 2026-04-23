import type { FallbackProps } from "react-error-boundary";
import { useNavigate } from "react-router-dom";
import { ErrorState } from "./ErrorState";
import { PageHeader } from "./PageHeader";
import { AppLayout } from "@/layouts/AppLayout";

/**
 * Route-level error fallback. Wraps inside AppLayout so the user
 * still sees the app chrome. Uses the existing ErrorState component.
 */
export function RouteErrorFallback({ resetErrorBoundary }: FallbackProps) {
  const navigate = useNavigate();

  return (
    <AppLayout header={<PageHeader center="Error" />}>
      <div style={{ marginTop: 'var(--spacing-700)' }}>
        <ErrorState
          message="Something went wrong on this page"
          onRetry={resetErrorBoundary}
        />
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'var(--spacing-400)' }}>
          <button
            onClick={() => {
              resetErrorBoundary();
              navigate("/");
            }}
            className="text-label-sm transition-colors"
            style={{ color: "var(--icon-cta)", textTransform: 'uppercase', letterSpacing: '0.05em' }}
          >
            Go Home
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
