import { createContext, useContext, useMemo, ReactNode } from 'react';
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
  'shadow': '0 2px 10px rgba(0, 0, 0, 0.08)',
  'transition': 'all 0.3s ease',
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { config } = useUiConfig();

  const theme: Theme = useMemo(() => {
    if (config && config.light) {
      return config.light as Theme;
    }
    return defaultLightTheme;
  }, [config]);

  return (
    <ThemeContext.Provider value={{ theme }}>
      <div
        style={
          {
            '--bg-color': theme['bg-color'],
            '--text-color': theme['text-color'],
            '--primary': theme.primary,
            '--primary-dark': theme['primary-dark'],
            '--secondary': theme.secondary,
            '--accent': theme.accent,
            '--light-gray': theme['light-gray'],
            '--dark-gray': theme['dark-gray'],
            '--card-bg': theme['card-bg'],
            '--border-color': theme['border-color'],
            '--shadow': theme.shadow,
            '--transition': theme.transition,
          } as React.CSSProperties
        }
      >
        {children}
      </div>
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
