import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { UiConfig } from '../types/ui';
import { loadUiConfig } from '../services/config';

interface UiConfigContextType {
  config: UiConfig | null;
  loading: boolean;
  error: string | null;
}

const UiConfigContext = createContext<UiConfigContextType | undefined>(undefined);

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

  return (
    <UiConfigContext.Provider value={{ config, loading, error }}>
      {children}
    </UiConfigContext.Provider>
  );
}

export function useUiConfig() {
  const context = useContext(UiConfigContext);
  if (context === undefined) {
    throw new Error('useUiConfig must be used within UiConfigProvider');
  }
  return context;
}
