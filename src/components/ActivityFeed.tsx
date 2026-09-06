import { useMemo } from 'react';
import { useTheme } from '../context/theme';
import { useUiConfig } from '../context/uiConfig';
import { relativeTimeText } from '../utils/relativeTime';
import type { Repo } from '../types/ui';

interface ActivityFeedProps {
  repos: Repo[];
  onOpen: (repo: Repo) => void;
}

const DEFAULT_DAYS = 30;
const DEFAULT_MAX_ITEMS = 8;

/**
 * 最近动态：展示组织仓库最近更新情况（时间段与条数可由 ui.json 的
 * layout.activity 配置），点击打开对应仓库的 README。
 */
export function ActivityFeed({ repos, onOpen }: ActivityFeedProps) {
  const { theme } = useTheme();
  const { config } = useUiConfig();

  const activityConfig = config?.layout?.activity;
  const title = activityConfig?.title ?? '最近动态';
  const days = activityConfig?.days ?? DEFAULT_DAYS;
  const maxItems = activityConfig?.maxItems ?? DEFAULT_MAX_ITEMS;

  const recent = useMemo(() => {
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return repos
      .filter((repo) => {
        const time = new Date(repo.updated_at).getTime();
        return !Number.isNaN(time) && time >= cutoff;
      })
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, maxItems);
  }, [repos, days, maxItems]);

  if (!config || recent.length === 0) return null;

  return (
    <section
      id="activity"
      className="section activity-section"
      style={
        {
          '--primary': theme.primary,
          '--secondary': theme.secondary,
          '--accent': theme.accent,
          '--dark-gray': theme['dark-gray'],
          '--text-color': theme['text-color'],
          '--card-bg': theme['card-bg'],
          '--border-color': theme['border-color'],
        } as React.CSSProperties
      }
    >
      <div className="layui-container">
        <h2 className="section-title scroll-animate">{title}</h2>
        <div className="activity-list scroll-animate">
          {recent.map((repo) => (
            <button
              type="button"
              key={repo.full_name}
              className="activity-item"
              onClick={() => onOpen(repo)}
              title={`打开 ${repo.name} 的 README`}
            >
              <span className="activity-dot"></span>
              <span className="activity-name">{repo.name}</span>
              {repo.language && <span className="activity-lang">{repo.language}</span>}
              <span className="activity-time">
                <i className="fas fa-clock"></i> {relativeTimeText(repo.updated_at)}更新
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
