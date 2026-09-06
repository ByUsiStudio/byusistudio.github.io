import type { Repo } from '../types/ui';
import { loadApiConfig } from './config';

interface CacheData {
  data: Repo[];
  timestamp: number;
}

const CACHE_KEY = 'byusi_repos_cache';
const README_CACHE_KEY_PREFIX = 'byusi_readme_cache_';
// README 本地缓存条目数上限（超出后按写入时间淘汰最旧条目，防止 localStorage 膨胀）
const MAX_README_CACHE = 30;

function getCache(cacheLifetime: number): Repo[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cache: CacheData = JSON.parse(raw);
    if (Date.now() - cache.timestamp > cacheLifetime) return null;
    return cache.data;
  } catch {
    return null;
  }
}

function setCache(data: Repo[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {
    // storage might be full
  }
}

interface GiteeRepoRaw {
  id: number;
  name: string;
  full_name: string;
  description?: string | null;
  html_url: string;
  language: string | null;
  stargazers_count?: number;
  forks_count?: number;
  updated_at: string;
  created_at?: string;
  archived?: boolean;
  has_issues?: boolean;
  open_issues_count?: number;
}

// ---- 请求重试与错误分类 ----
const REPO_PAGE_SIZE = 100;
const MAX_REPO_PAGES = 10; // 单次最多拉取 1000 个仓库
const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504]);
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_BASE_DELAY_MS = 600;

function delayMs(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function describeHttpStatus(status: number): string {
  if (status === 401 || status === 403) return 'Gitee 拒绝了请求（权限或凭据不足）';
  if (status === 404) return '请求的资源不存在';
  if (status === 429) return '请求过于频繁（被接口限流），请稍后重试';
  if (status >= 500) return '接口服务器暂时不可用，请稍后重试';
  return `接口请求失败（HTTP ${status}）`;
}

function isNetworkError(error: unknown): boolean {
  return error instanceof TypeError;
}

/** 解析 Retry-After（秒），非法时返回 null */
function parseRetryAfter(value: string | null): number | null {
  if (!value) return null;
  const seconds = Number.parseInt(value, 10);
  if (Number.isNaN(seconds) || seconds <= 0) return null;
  return Math.min(seconds * 1000, 10000);
}

/**
 * 带退避重试的 Gitee fetch：网络错误与 429/5xx 会重试至多 MAX_RETRY_ATTEMPTS 次，
 * 最终失败抛出带用户可读文案的错误。
 */
async function giteeFetchWithRetry(url: string, init?: RequestInit): Promise<Response> {
  for (let attempt = 1; ; attempt++) {
    let response: Response;
    try {
      response = await fetch(url, init);
    } catch (error) {
      if (attempt < MAX_RETRY_ATTEMPTS && isNetworkError(error)) {
        await delayMs(RETRY_BASE_DELAY_MS * attempt);
        continue;
      }
      throw new Error('网络连接失败，请检查网络后重试');
    }

    if (response.ok) return response;

    const retriable = RETRYABLE_STATUS_CODES.has(response.status);
    if (retriable && attempt < MAX_RETRY_ATTEMPTS) {
      const retryAfterMs = parseRetryAfter(response.headers.get('Retry-After'));
      await delayMs(retryAfterMs ?? RETRY_BASE_DELAY_MS * attempt);
      continue;
    }

    throw new Error(describeHttpStatus(response.status));
  }
}

export async function fetchRepos(): Promise<Repo[]> {
  const config = await loadApiConfig();
  const CACHE_LIFETIME = config.api.cacheLifetime * 1000;

  const cached = getCache(CACHE_LIFETIME);
  if (cached) return cached;

  const { baseUrl, orgName } = config.api;
  const headers = {
    'User-Agent': 'ByUsi-Repo-Fetcher/1.0',
    Accept: 'application/json',
  };

  try {
    // 分页拉取组织全部仓库（每页 100），直到拿满或达到页数上限
    const rawRepos: GiteeRepoRaw[] = [];
    for (let page = 1; page <= MAX_REPO_PAGES; page++) {
      const url = `${baseUrl}/orgs/${orgName}/repos?type=all&page=${page}&per_page=${REPO_PAGE_SIZE}`;
      const data = (await (await giteeFetchWithRetry(url, { headers })).json()) as GiteeRepoRaw[];
      rawRepos.push(...data);
      if (data.length < REPO_PAGE_SIZE) break;
    }

    // 按 id 去重（防御接口异常），再统一映射
    const uniqueById = new Map<number, GiteeRepoRaw>();
    rawRepos.forEach((repo) => {
      if (repo && typeof repo.id === 'number') uniqueById.set(repo.id, repo);
    });

    const repos: Repo[] = [...uniqueById.values()].map((repo) => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description || '',
      html_url: repo.html_url,
      language: repo.language,
      stargazers_count: repo.stargazers_count || 0,
      forks_count: repo.forks_count || 0,
      updated_at: repo.updated_at,
      created_at: repo.created_at || '',
      archived: repo.archived || false,
      has_issues: repo.has_issues || false,
      open_issues_count: repo.open_issues_count || 0,
    }));

    repos.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

    setCache(repos);
    return repos;
  } catch (error) {
    console.error('Failed to fetch repos:', error);
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) return (JSON.parse(raw) as CacheData).data;
    } catch {
      // ignore
    }
    throw error instanceof Error ? error : new Error('加载仓库数据失败，请稍后重试');
  }
}

interface ReadmeCacheData {
  content: string;
  repoFullName: string;
  timestamp: number;
}

function getReadmeCache(
  repoFullName: string,
  cacheLifetime: number,
): { content: string; repoFullName: string } | null {
  try {
    const key = `${README_CACHE_KEY_PREFIX}${repoFullName}`;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const cache: ReadmeCacheData = JSON.parse(raw);
    if (Date.now() - cache.timestamp > cacheLifetime) return null;
    return { content: cache.content, repoFullName: cache.repoFullName };
  } catch {
    return null;
  }
}

function trimReadmeCache() {
  try {
    const entries: Array<{ key: string; timestamp: number }> = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(README_CACHE_KEY_PREFIX)) continue;
      try {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        const parsed = JSON.parse(raw) as ReadmeCacheData;
        entries.push({
          key,
          timestamp: typeof parsed.timestamp === 'number' ? parsed.timestamp : 0,
        });
      } catch {
        // 单条解析失败不影响整体淘汰
      }
    }
    if (entries.length <= MAX_README_CACHE) return;
    entries.sort((a, b) => b.timestamp - a.timestamp);
    entries.slice(MAX_README_CACHE).forEach((entry) => localStorage.removeItem(entry.key));
  } catch {
    // storage might be unavailable
  }
}

function setReadmeCache(repoFullName: string, content: string) {
  try {
    const key = `${README_CACHE_KEY_PREFIX}${repoFullName}`;
    localStorage.setItem(key, JSON.stringify({ content, repoFullName, timestamp: Date.now() }));
    trimReadmeCache();
  } catch {
    // storage might be full
  }
}

interface ReadmeResponse {
  content: string;
  encoding: string;
  repoFullName?: string;
}

export interface ReadmeData {
  content: string;
  repoFullName: string;
}

export interface HitokotoData {
  hitokoto: string;
  from?: string;
  from_who?: string;
}

const HITOKOTO_FETCH_TIMEOUT = 8000;

export async function fetchHitokoto(): Promise<HitokotoData> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), HITOKOTO_FETCH_TIMEOUT);
  try {
    const response = await fetch('https://api.www.cdifit.cn/yy/?encode=json', {
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      hitokoto: data.hitokoto,
      from: data.from,
      from_who: data.from_who,
    };
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchReadme(repoFullName: string): Promise<ReadmeData> {
  const config = await loadApiConfig();
  const CACHE_LIFETIME = config.api.cacheLifetime * 1000;

  const cached = getReadmeCache(repoFullName, CACHE_LIFETIME);
  if (cached) return cached;

  const { baseUrl } = config.api;
  const url = `${baseUrl}/repos/${repoFullName}/readme`;

  try {
    const response = await giteeFetchWithRetry(url, {
      headers: {
        'User-Agent': 'ByUsi-Readme-Fetcher/1.0',
        Accept: 'application/json',
      },
    });

    const data: ReadmeResponse = await response.json();

    let content = data.content;
    if (data.encoding === 'base64') {
      try {
        const binary = atob(data.content);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        content = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
      } catch {
        content = data.content;
      }
    }

    const result: ReadmeData = {
      content,
      repoFullName: data.repoFullName || repoFullName,
    };

    setReadmeCache(repoFullName, content);
    return result;
  } catch (error) {
    console.error(`Failed to fetch README for ${repoFullName}:`, error);
    const cached = getReadmeCache(repoFullName, CACHE_LIFETIME * 24);
    if (cached) return cached;
    throw error instanceof Error ? error : new Error('获取 README 失败，请稍后重试');
  }
}
