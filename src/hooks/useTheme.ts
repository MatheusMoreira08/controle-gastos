import { useEffect } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';

export function useTheme() {
  const { settings, toggleTheme } = useFinanceStore();
  const theme = settings.theme;

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
  }, [theme]);

  return { theme, toggleTheme };
}
