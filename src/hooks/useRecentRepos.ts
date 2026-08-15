import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

const RECENT_KEY = 'byusi_recent_repos';
export const MAX_RECENT = 8;

export type RecentReposApi = {
  recentIds: string[];
  recordRecent: (repoFullName: string) => void;
  removeRecent: (repoFullName: string) => void;
  clearRecent: () => void;
};

export function useRecentRepos(): RecentReposApi {
  const [recentIds, setRecentIds] = useLocalStorage<string[]>(RECENT_KEY, []);

  const recordRecent = useCallback((repoFullName: string) => {
    setRecentIds((prev) => {
      const filtered = (prev || []).filter((id) => id !== repoFullName);
      return [repoFullName, ...filtered].slice(0, MAX_RECENT);
    });
  }, [setRecentIds]);

  const removeRecent = useCallback((repoFullName: string) => {
    setRecentIds((prev) => (prev || []).filter((id) => id !== repoFullName));
  }, [setRecentIds]);

  const clearRecent = useCallback(() => {
    setRecentIds([]);
  }, [setRecentIds]);

  return { recentIds, recordRecent, removeRecent, clearRecent };
}

export function getRecentStorageKey(): string {
  return RECENT_KEY;
}
