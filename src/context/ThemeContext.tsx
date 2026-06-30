import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import type { Theme, ThemeMode } from '../types/ui';
import { useUiConfig } from './UiConfigContext';

interface ThemeContextType {
  theme: Theme;
  mode: ThemeMode;
  toggleMode: () => void;
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

const defaultDarkTheme: Theme = {
  'bg-color': '#1a1a2e',
  'text-color': '#e0e0e0',
  primary: '#4da6ff',
  'primary-dark': '#3399ff',
  secondary: '#e8e8e8',
  accent: '#ff6b6b',
  'light-gray': '#2d2d44',
  'dark-gray': '#a0a0a0',
  'card-bg': '#252540',
  'border-color': '#3d3d5c',
  shadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
  transition: 'all 0.3s ease',
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme-mode');
      return (saved as ThemeMode) || 'light';
    }
    return 'light';
  });

  const { config } = useUiConfig();

  useEffect(() => {
    localStorage.setItem('theme-mode', mode);
  }, [mode]);

  const toggleMode = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const theme: Theme = useMemo(() => {
    if (config && config[mode]) {
      return config[mode] as Theme;
    }
    return mode === 'light' ? defaultLightTheme : defaultDarkTheme;
  }, [config, mode]);

  return (
    <ThemeContext.Provider value={{ theme, mode, toggleMode }}>
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
