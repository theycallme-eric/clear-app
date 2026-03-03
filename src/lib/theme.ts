export type ThemeMode = 'orange' | 'blue';

const STORAGE_KEY = 'clear.ui.theme';

export function getTheme(): ThemeMode {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'blue') return 'blue';
  return 'orange';
}

export function setTheme(mode: ThemeMode): void {
  localStorage.setItem(STORAGE_KEY, mode);
  applyTheme(mode);
}

function applyTheme(mode: ThemeMode): void {
  if (mode === 'blue') {
    document.documentElement.setAttribute('data-theme', 'blue');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
}

/** Call before createRoot() to prevent flash of wrong theme. */
export function initTheme(): void {
  applyTheme(getTheme());
}
