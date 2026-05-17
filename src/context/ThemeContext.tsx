// ─────────────────────────────────────────────────────────────────────────────
// FILE: context/ThemeContext.tsx
// Manages the application's light/dark mode.
//
// How it works:
//   1. On first load, read the stored preference from localStorage.
//   2. Whenever the theme changes, add/remove the "dark" CSS class on <html>.
//      Tailwind CSS uses this class to apply dark-mode styles globally.
//   3. Save the preference to localStorage so it persists across page refreshes.
//
// Any component can call useTheme() to read or toggle the current theme.
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = 'eqc-theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Initialise from localStorage so the correct theme is set immediately,
  // preventing a flash of wrong theme on page load.
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'dark' ? 'dark' : 'light';
  });

  // Sync the theme to the DOM every time it changes.
  // Tailwind's dark mode variant works by checking for class="dark" on <html>.
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  // toggleTheme: flips between light and dark.
  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
