import { createContext, useContext, useMemo, useEffect, ReactNode } from 'react';
import type { Theme } from '../types/ui';
import { useUiConfig } from './UiConfigContext';

interface ThemeContextType {
  theme: Theme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const defaultLightTheme: Theme = {
  'bg-color': '#f8fbff',
  'text-color': '#333',
  primary: '#3498db',
  'primary-dark': '#2980b9',
  secondary: '#2c3e50',
  accent: '#e74c3c',
  'light-gray': '#f5f7fa',
  'dark-gray': '#666',
  'card-bg': '#ffffff',
  'border-color': '#eee',
  shadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
  transition: 'all 0.3s ease',
};

type ThemeVarKey = keyof Theme;

const THEME_VAR_ORDER: ThemeVarKey[] = [
  'bg-color',
  'text-color',
  'primary',
  'primary-dark',
  'secondary',
  'accent',
  'light-gray',
  'dark-gray',
  'card-bg',
  'border-color',
  'shadow',
  'transition',
];

function applyThemeToRoot(theme: Theme) {
  const root = document.documentElement;
  for (const key of THEME_VAR_ORDER) {
    root.style.setProperty(`--${key}`, theme[key]);
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { config } = useUiConfig();

  const theme: Theme = useMemo(() => {
    if (config && config.light) {
      return config.light as Theme;
    }
    return defaultLightTheme;
  }, [config]);

  useEffect(() => {
    applyThemeToRoot(theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
