import type { Repo } from '../types/ui';
import { loadApiConfig } from './config';

interface CacheData {
  data: Repo[];
  timestamp: number;
}

const CACHE_KEY = 'byusi_repos_cache';
const README_CACHE_KEY_PREFIX = 'byusi_readme_cache_';

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

  const { baseUrl } = config.api;
  const url = `${baseUrl}/repos`;

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

    const data = await response.json();

    const repos: Repo[] = data.map((repo: any) => ({
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
    console.error('Failed to fetch repos:', error);
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) return (JSON.parse(raw) as CacheData).data;
    } catch {
      // ignore
    }
    throw error;
  }
}

interface ReadmeCacheData {
  content: string;
  repoFullName: string;
  timestamp: number;
}

function getReadmeCache(repoFullName: string, cacheLifetime: number): { content: string; repoFullName: string } | null {
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

function setReadmeCache(repoFullName: string, content: string) {
  try {
    const key = `${README_CACHE_KEY_PREFIX}${repoFullName}`;
    localStorage.setItem(key, JSON.stringify({ content, repoFullName, timestamp: Date.now() }));
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

export async function fetchReadme(repoFullName: string): Promise<ReadmeData> {
  const config = await loadApiConfig();
  const CACHE_LIFETIME = config.api.cacheLifetime * 1000;

  const cached = getReadmeCache(repoFullName, CACHE_LIFETIME);
  if (cached) return cached;

  const { baseUrl } = config.api;
  const url = `${baseUrl}/repos/${repoFullName}/readme`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'ByUsi-Readme-Fetcher/1.0',
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

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
    throw error;
  }
}