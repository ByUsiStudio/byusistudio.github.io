import type { UiConfig } from '../types/ui';

let uiConfigCache: UiConfig | null = null;

export interface ApiConfig {
  baseUrl: string;
  orgName: string;
  accessToken: string;
  cacheLifetime: number;
}

export interface Config {
  api: ApiConfig;
}

let apiConfigCache: Config | null = null;

export async function loadUiConfig(): Promise<UiConfig> {
  if (uiConfigCache) return uiConfigCache;
  
  const response = await fetch('/ui.json');
  if (!response.ok) {
    throw new Error(`Failed to load ui.json: ${response.status}`);
  }
  const data = await response.json();
  uiConfigCache = data;
  return data;
}

export async function loadApiConfig(): Promise<Config> {
  if (apiConfigCache) return apiConfigCache;
  
  const response = await fetch('/config.json');
  if (!response.ok) {
    throw new Error(`Failed to load config.json: ${response.status}`);
  }
  const data = await response.json();
  apiConfigCache = data;
  return data;
}
