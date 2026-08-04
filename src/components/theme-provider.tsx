'use client';

import * as React from 'react';

const THEME_KEY = 'lumora-theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY);
    const theme = saved === 'light' ? 'light' : 'dark';
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.classList.toggle('light', theme === 'light');
  }, []);

  return <>{children}</>;
}

export function useTheme() {
  const [theme, setThemeState] = React.useState<'dark' | 'light'>('dark');

  React.useEffect(() => {
    setThemeState(document.documentElement.classList.contains('light') ? 'light' : 'dark');
  }, []);

  const setTheme = React.useCallback((t: 'dark' | 'light') => {
    document.documentElement.classList.toggle('dark', t === 'dark');
    document.documentElement.classList.toggle('light', t === 'light');
    localStorage.setItem(THEME_KEY, t);
    setThemeState(t);
  }, []);

  return { theme, setTheme };
}
