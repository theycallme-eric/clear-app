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
      <div className="mt-8">
        <ErrorState
          message="Something went wrong on this page"
          onRetry={resetErrorBoundary}
        />
        <div className="flex justify-center mt-4">
          <button
            onClick={() => {
              resetErrorBoundary();
              navigate("/");
            }}
            className="text-label-sm uppercase tracking-wide transition-colors"
            style={{ color: "var(--icon-cta)" }}
          >
            Go Home
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
