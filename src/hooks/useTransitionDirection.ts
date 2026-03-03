import { useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Animation class names (defined in transitions.css).
 * 'none' = instant, no animation.
 */
export type TransitionType = 'forward' | 'back' | 'up' | 'down' | 'fade' | 'none';

/**
 * Route depth map — higher numbers are "deeper" in the navigation stack.
 * Used to determine forward vs back when no special-case rule matches.
 */
const ROUTE_DEPTH: Record<string, number> = {
  '/welcome': 0,
  '/sign-in': 1,
  '/create-account': 1,
  '/onboarding': 1,
  '/': 2,
  '/generate': 3,
  '/review': 4,
  '/workout': 5,
  '/summary': 6,
  '/history': 3,
  '/settings': 3,
};

/**
 * Special-case transitions that override the depth-based default.
 * Key format: "from→to" using pathname prefixes.
 */
const SPECIAL_TRANSITIONS: Record<string, TransitionType> = {
  // Workout mode entry — slide up
  '/review→/workout': 'up',

  // Workout mode exit — slide down
  '/workout→/summary': 'down',
  '/workout→/review': 'down',
  '/workout→/generate': 'down',
  '/workout→/': 'down',

  // Summary → Home — hard cut (debrief complete)
  '/summary→/': 'fade',
};

function getDepth(pathname: string): number {
  // Exact match first
  if (pathname in ROUTE_DEPTH) return ROUTE_DEPTH[pathname];

  // Check prefix matches for parameterized routes (e.g. /history/:id)
  if (pathname.startsWith('/history/')) return 4;
  if (pathname.startsWith('/dev/')) return 3;

  return 2; // Default depth
}

function resolveTransition(from: string, to: string): TransitionType {
  // Check special cases
  const key = `${from}→${to}`;
  if (key in SPECIAL_TRANSITIONS) return SPECIAL_TRANSITIONS[key];

  // Depth-based fallback
  const fromDepth = getDepth(from);
  const toDepth = getDepth(to);

  if (toDepth > fromDepth) return 'forward';
  if (toDepth < fromDepth) return 'back';
  return 'none'; // Same depth (e.g. sibling routes)
}

/**
 * Returns the CSS class name for the current route transition.
 * Tracks the previous pathname to determine direction.
 */
export function useTransitionDirection(): string {
  const location = useLocation();
  const prevPathRef = useRef<string>(location.pathname);

  const from = prevPathRef.current;
  const to = location.pathname;

  // Update ref for next render
  prevPathRef.current = to;

  // Same route — no animation (e.g. query param changes)
  if (from === to) return 'route-enter-none';

  const type = resolveTransition(from, to);
  return `route-enter-${type}`;
}
