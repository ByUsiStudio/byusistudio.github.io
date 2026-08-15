import { useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import type { Repo } from '../types/ui';
import { useUiConfig } from '../context/UiConfigContext';

interface RecentReposProps {
  recentIds: string[];
  repos: Repo[];
  onOpen: (repo: Repo) => void;
  onRemove: (repoFullName: string) => void;
  onClear: () => void;
}

function timeText(updatedAt: string | undefined): string {
  if (!updatedAt) return '';
  const updatedDate = new Date(updatedAt);
  if (Number.isNaN(updatedDate.getTime())) return '';
  const diffDays = Math.floor((Date.now() - updatedDate.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return '今天更新';
  if (diffDays === 1) return '昨天更新';
  if (diffDays < 7) return `${diffDays}天前更新`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前更新`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}个月前更新`;
  return `${Math.floor(diffDays / 365)}年前更新`;
}

export function RecentRepos({ recentIds, repos, onOpen, onRemove, onClear }: RecentReposProps) {
  const { theme } = useTheme();
  const { config } = useUiConfig();

  const recentRepos = useMemo(() => {
    const byFullName = new Map<string, Repo>();
    repos.forEach((repo) => byFullName.set(repo.full_name, repo));
    return recentIds
      .map((id) => byFullName.get(id))
      .filter((repo): repo is Repo => !!repo);
  }, [recentIds, repos]);

  if (!config) return null;
  if (recentRepos.length === 0) return null;

  const projectsConfig = config.layout?.projects;
  if (!projectsConfig) return null;

  return (
    <section
      className="recent-section scroll-animate"
      style={{
        '--primary': theme.primary,
        '--secondary': theme.secondary,
        '--dark-gray': theme['dark-gray'],
        '--accent': theme.accent,
        '--text-color': theme['text-color'],
        '--card-bg': theme['card-bg'],
        '--border-color': theme['border-color'],
        '--primary-rgb': theme.primary.replace(/[rgb()]/g, ''),
      } as React.CSSProperties}
    >
      <div className="recent-header">
        <h3 className="recent-title">
          <i className="fas fa-history"></i> 最近访问
        </h3>
        <button className="recent-clear" onClick={onClear} title="清空最近访问">
          <i className="fas fa-trash-alt"></i> 清空
        </button>
      </div>

      <div className="recent-list">
        {recentRepos.map((repo) => (
          <div
            key={repo.full_name}
            className="recent-item"
            style={{ animationDelay: `0ms` }}
          >
            <div className="recent-item-main" onClick={() => onOpen(repo)} title={`打开 ${repo.name} 的 README`}>
              <div className="recent-item-icon">
                <i className="fas fa-file-alt"></i>
              </div>
              <div className="recent-item-info">
                <span className="recent-item-name">
                  {repo.name}
                  {repo.archived && <span className="project-badge archived">归档</span>}
                  {repo.language && <span className="project-badge">{repo.language}</span>}
                </span>
                <span className="recent-item-meta">
                  <i className="fas fa-star"></i> {repo.stargazers_count.toLocaleString()}
                  <span className="recent-item-dot">·</span>
                  {timeText(repo.updated_at)}
                </span>
              </div>
            </div>
            <button
              className="recent-item-remove"
              onClick={() => onRemove(repo.full_name)}
              title="从最近访问移除"
              aria-label={`从最近访问移除 ${repo.name}`}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
