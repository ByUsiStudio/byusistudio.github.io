import { createContext, useContext } from 'react';
import type { ThemeContextType } from '../types/theme';

/**
 * 主题上下文与 Hook（与 ThemeProvider 分离存放，
 * 以兼容 react-refresh 的 Fast Refresh 规则）。
 */
export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
