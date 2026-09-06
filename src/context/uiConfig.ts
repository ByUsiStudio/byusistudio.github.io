import { createContext, useContext } from 'react';
import type { UiConfig } from '../types/ui';

export interface UiConfigContextType {
  config: UiConfig | null;
  loading: boolean;
  error: string | null;
}

/**
 * UI 配置上下文与 Hook（与 UiConfigProvider 分离存放，
 * 以兼容 react-refresh 的 Fast Refresh 规则）。
 */
export const UiConfigContext = createContext<UiConfigContextType | undefined>(undefined);

export function useUiConfig(): UiConfigContextType {
  const context = useContext(UiConfigContext);
  if (context === undefined) {
    throw new Error('useUiConfig must be used within a UiConfigProvider');
  }
  return context;
}
