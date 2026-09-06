import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { UiConfigContext } from './uiConfig';
import type { UiConfigContextType } from './uiConfig';
import type { UiConfig } from '../types/ui';
import { loadUiConfig } from '../services/config';

export function UiConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<UiConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUiConfig()
      .then((data) => {
        setConfig(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load config');
        setLoading(false);
      });
  }, []);

  const contextValue: UiConfigContextType = { config, loading, error };

  return <UiConfigContext.Provider value={contextValue}>{children}</UiConfigContext.Provider>;
}
