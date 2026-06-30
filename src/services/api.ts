import type { Repo } from '../types/ui';
import { loadApiConfig } from './config';

interface GiteeRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  created_at: string;
  archived: boolean;
  has_issues: boolean;
  open_issues_count: number;
}

interface CacheData {
  data: Repo[];
  timestamp: number;
}

const CACHE_KEY = 'byusi_repos_cache';

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

export async function fetchRepos(): Promise<Repo[]> {
  const config = await loadApiConfig();
  const CACHE_LIFETIME = config.api.cacheLifetime * 1000;
  
  const cached = getCache(CACHE_LIFETIME);
  if (cached) return cached;

  const { baseUrl, orgName, accessToken } = config.api;
  const url = `${baseUrl}/orgs/${orgName}/repos?type=all&page=1&per_page=100&access_token=${accessToken}`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'ByUsi-Repo-Fetcher/1.0',
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data: GiteeRepo[] = await response.json();

    const repos: Repo[] = data.map((repo) => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description || '',
      html_url: repo.html_url,
      language: repo.language,
      stargazers_count: repo.stargazers_count || 0,
      forks_count: repo.forks_count || 0,
      updated_at: repo.updated_at,
      created_at: repo.created_at,
      archived: repo.archived || false,
      has_issues: repo.has_issues || false,
      open_issues_count: repo.open_issues_count || 0,
    }));

    repos.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

    setCache(repos);
    return repos;
  } catch (error) {
    console.error('Failed to fetch repos from Gitee:', error);
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) return (JSON.parse(raw) as CacheData).data;
    } catch {
      // ignore
    }
    throw error;
  }
}
