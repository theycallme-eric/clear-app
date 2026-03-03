import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useTransitionDirection } from '@/hooks/useTransitionDirection';

interface RouteTransitionProps {
  children: ReactNode;
}

/**
 * Wraps route content with an enter animation.
 * The `key` on the outer div forces React to remount (and replay
 * the CSS animation) whenever the pathname changes.
 */
export function RouteTransition({ children }: RouteTransitionProps) {
  const location = useLocation();
  const transitionClass = useTransitionDirection();

  return (
    <div key={location.pathname} className={transitionClass}>
      {children}
    </div>
  );
}
