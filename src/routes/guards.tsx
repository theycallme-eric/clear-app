import { useState, useCallback } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { useAuthContext } from '@/contexts/AuthContext';
import { BootScreen } from '@/components/ScanLoader';
import { LoadingScreen } from '@/components/LoadingScreen';
import { RouteErrorFallback } from '@/components/RouteErrorFallback';
import { RouteTransition } from '@/components/RouteTransition';

/**
 * Wraps authenticated routes. Redirects to /welcome if unauthenticated,
 * /onboarding if authenticated but not onboarded.
 * Shows boot sequence while auth resolves.
 */
export function ProtectedRoute() {
  const { status, profile } = useAuthContext();
  const location = useLocation();
  const [bootComplete, setBootComplete] = useState(false);

  const handleBootComplete = useCallback(() => {
    setBootComplete(true);
  }, []);

  // Show boot sequence while loading OR while boot animation hasn't finished
  if (status === 'loading' || !bootComplete) {
    return (
      <BootScreen
        ready={status !== 'loading'}
        onComplete={handleBootComplete}
      />
    );
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/welcome" replace />;
  }

  if (!profile?.onboardingComplete) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <ErrorBoundary fallbackRender={RouteErrorFallback} resetKeys={[location.pathname]}>
      <RouteTransition>
        <Outlet />
      </RouteTransition>
    </ErrorBoundary>
  );
}

/**
 * Wraps public-only routes (welcome, login).
 * Redirects to / if already authenticated and onboarded.
 */
export function PublicOnlyRoute() {
  const { status, profile } = useAuthContext();
  const location = useLocation();

  if (status === 'loading') {
    return <LoadingScreen subtitle="Initializing..." />;
  }

  if (status === 'authenticated') {
    if (!profile?.onboardingComplete) {
      return <Navigate to="/onboarding" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return (
    <ErrorBoundary fallbackRender={RouteErrorFallback} resetKeys={[location.pathname]}>
      <RouteTransition>
        <Outlet />
      </RouteTransition>
    </ErrorBoundary>
  );
}

/**
 * Must be authenticated but NOT onboarded.
 * Redirects to /welcome if unauthenticated, / if already onboarded.
 */
export function OnboardingRoute() {
  const { status, profile } = useAuthContext();
  const location = useLocation();

  if (status === 'loading') {
    return <LoadingScreen subtitle="Initializing..." />;
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/welcome" replace />;
  }

  if (profile?.onboardingComplete) {
    return <Navigate to="/" replace />;
  }

  return (
    <ErrorBoundary fallbackRender={RouteErrorFallback} resetKeys={[location.pathname]}>
      <RouteTransition>
        <Outlet />
      </RouteTransition>
    </ErrorBoundary>
  );
}
