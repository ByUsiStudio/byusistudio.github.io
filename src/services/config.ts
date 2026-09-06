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

/** ICP 备案与公安（网安）备案展示配置（均为可选，缺省/为空则不显示） */
export interface BeianConfig {
  /** ICP 备案号，如：京ICP备XXXXXXX号-1 */
  icpText?: string;
  /** ICP 备案查询链接，默认 https://beian.miit.gov.cn/ */
  icpUrl?: string;
  /** 公安备案号，如：京公网安备 110XXXXXXXXXXXXX号 */
  policeText?: string;
  /** 公安备案查询链接 */
  policeUrl?: string;
}

export interface BeianDisplay {
  icpText?: string;
  icpUrl?: string;
  policeText?: string;
  policeUrl?: string;
}

export interface Config {
  api: ApiConfig;
  github?: GithubConfig;
  beian?: BeianConfig;
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
 * 读取备案配置：ICP 与公安备案均未配置时返回 null（调用方不显示）。
 * 若只填了公安备案号而未填链接，会尝试从备案号中提取编号并拼接官网查询地址。
 */
export async function loadBeianConfig(): Promise<BeianDisplay | null> {
  const config = await loadApiConfig();
  const beian = config.beian;
  if (!beian) return null;

  const icpText = beian.icpText?.trim();
  const icpUrl = beian.icpUrl?.trim();
  const policeText = beian.policeText?.trim();
  const policeUrl = beian.policeUrl?.trim();

  if (!icpText && !policeText) return null;

  const result: BeianDisplay = {};
  if (icpText) {
    result.icpText = icpText;
    result.icpUrl = icpUrl || 'https://beian.miit.gov.cn/';
  }
  if (policeText) {
    result.policeText = policeText;
    const code = policeText.replace(/[^0-9]/g, '');
    const resolvedUrl =
      policeUrl ||
      (code ? `http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=${code}` : '');
    if (resolvedUrl) {
      result.policeUrl = resolvedUrl;
    }
  }
  return result;
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
