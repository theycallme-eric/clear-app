const STAY_LOGGED_IN_KEY = 'clear.auth.stayLoggedIn';

/**
 * Read the "stay logged in" preference. Defaults to true.
 * Always stored in localStorage so it survives browser close.
 */
export function getStayLoggedIn(): boolean {
  const stored = localStorage.getItem(STAY_LOGGED_IN_KEY);
  if (stored === null) return true;
  return stored === 'true';
}

/**
 * Set the "stay logged in" preference.
 * Call before signing in so the storage adapter picks it up.
 */
export function setStayLoggedIn(value: boolean): void {
  localStorage.setItem(STAY_LOGGED_IN_KEY, String(value));
}

/**
 * Clear the preference on sign-out so next login defaults to checked.
 */
export function clearStayLoggedIn(): void {
  localStorage.removeItem(STAY_LOGGED_IN_KEY);
}

/**
 * Custom storage adapter for Supabase auth.
 * Delegates to localStorage or sessionStorage based on the preference flag.
 */
export const authStorageAdapter = {
  getItem(key: string): string | null {
    const stayLoggedIn = getStayLoggedIn();
    const primary = stayLoggedIn ? localStorage : sessionStorage;
    const value = primary.getItem(key);
    if (value !== null) return value;

    // Fallback: check the other storage in case preference changed between sessions
    const fallback = stayLoggedIn ? sessionStorage : localStorage;
    return fallback.getItem(key);
  },

  setItem(key: string, value: string): void {
    const stayLoggedIn = getStayLoggedIn();
    const primary = stayLoggedIn ? localStorage : sessionStorage;
    primary.setItem(key, value);

    // Clean up the other storage to prevent stale tokens
    const other = stayLoggedIn ? sessionStorage : localStorage;
    other.removeItem(key);
  },

  removeItem(key: string): void {
    // Remove from both to be thorough
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  },
};
