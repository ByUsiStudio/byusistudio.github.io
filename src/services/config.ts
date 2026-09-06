import type { UiConfig } from '../types/ui';

let uiConfigCache: UiConfig | null = null;

export interface ApiConfig {
  baseUrl: string;
  orgName: string;
  cacheLifetime: number;
}

export interface GithubConfig {
  enabled: boolean;
  /** GitHub 组织 / 用户名 */
  orgName: string;
  /** 可选，默认 https://api.github.com */
  baseUrl?: string;
  /** 缓存有效期（秒），默认 3600 */
  cacheLifetime?: number;
}

export interface Config {
  api: ApiConfig;
  github?: GithubConfig;
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

/**
 * 读取 GitHub 配置：未启用或组织名为空时返回 null（调用方据此隐藏 GitHub 分区）。
 */
export async function loadGithubConfig(): Promise<GithubConfig | null> {
  const config = await loadApiConfig();
  const github = config.github;
  if (!github || !github.enabled) return null;
  if (!github.orgName || !github.orgName.trim()) return null;
  return github;
}
