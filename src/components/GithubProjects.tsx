import { useState, useMemo } from 'react';
import { useTheme } from '../context/theme';
import { relativeTimeText } from '../utils/relativeTime';
import type { Repo } from '../types/ui';

interface GithubProjectsProps {
  repos: Repo[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

const PAGE_STEP = 20;

/**
 * GitHub 项目分区：config.json 中 github.enabled = true 时显示。
 * 提供名称/描述搜索与“加载更多”，点击卡片跳转到对应 GitHub 仓库。
 */
export function GithubProjects({ repos, loading, error, onRetry }: GithubProjectsProps) {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_STEP);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return repos;
    return repos.filter(
      (repo) =>
        repo.name.toLowerCase().includes(term) ||
        (repo.description && repo.description.toLowerCase().includes(term)),
    );
  }, [repos, searchTerm]);

  const sectionStyle = {
    '--primary': theme.primary,
    '--secondary': theme.secondary,
    '--accent': theme.accent,
    '--dark-gray': theme['dark-gray'],
    '--text-color': theme['text-color'],
    '--card-bg': theme['card-bg'],
    '--border-color': theme['border-color'],
    '--primary-rgb': theme.primary.replace(/[rgb()]/g, ''),
    '--accent-rgb': theme.accent.replace(/[rgb()]/g, ''),
  } as React.CSSProperties;

  if (loading) {
    return (
      <section id="github-projects" className="section" style={sectionStyle}>
        <div className="layui-container">
          <h2 className="section-title scroll-animate">
            GitHub 开源项目
            <span className="section-title-suffix">加载中...</span>
          </h2>
          <div className="project-list scroll-animate">
            {[...Array(6)].map((_, idx) => (
              <div key={idx} className="project-item skeleton">
                <div className="project-item-header">
                  <div className="project-icon skeleton-icon"></div>
                  <div className="project-info">
                    <div className="project-name skeleton-text"></div>
                    <div className="project-description skeleton-text"></div>
                    <div className="project-meta">
                      <div className="meta-item skeleton-text small"></div>
                      <div className="meta-item skeleton-text small"></div>
                    </div>
                  </div>
                </div>
                <div className="project-links">
                  <div className="project-link skeleton-btn"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error && repos.length === 0) {
    return (
      <section id="github-projects" className="section" style={sectionStyle}>
        <div className="layui-container">
          <h2 className="section-title">GitHub 开源项目</h2>
          <div className="empty-state">
            <i className="fas fa-exclamation-triangle"></i>
            <h3>GitHub 项目加载失败</h3>
            <p>{error}</p>
            <button type="button" className="notice-retry-btn" onClick={onRetry}>
              <i className="fas fa-redo"></i> 重新加载
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="github-projects" className="section" style={sectionStyle}>
      <div className="layui-container">
        <h2 className="section-title scroll-animate">
          <i className="fab fa-github"></i> GitHub 开源项目
          <span className="section-title-suffix">共 {repos.length} 个仓库</span>
        </h2>

        {repos.length > 0 && (
          <div className="project-search">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setVisibleCount(PAGE_STEP);
              }}
              placeholder="搜索 GitHub 项目名称或描述..."
            />
            <i className="fas fa-search search-icon"></i>
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-search"></i>
            <h3>未找到匹配的 GitHub 项目</h3>
            <p>尝试使用其他搜索词</p>
          </div>
        ) : (
          <>
            <div className="project-list scroll-animate">
              {filtered.slice(0, visibleCount).map((repo) => (
                <div key={`gh-${repo.id}`} className="project-item">
                  <div className="project-glow-border"></div>
                  <div className="project-item-inner">
                    <div className="project-item-header">
                      <div className="project-info">
                        <div className="project-name">
                          <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                            {repo.name}
                          </a>
                          {repo.archived && <span className="project-badge archived">归档</span>}
                          {repo.language && <span className="project-badge">{repo.language}</span>}
                        </div>
                        <div className="project-description">
                          {repo.description || '该项目暂无描述信息'}
                        </div>
                        <div className="project-meta">
                          <div className="meta-item">
                            <i className="fas fa-star"></i>
                            <span>{repo.stargazers_count.toLocaleString()}</span>
                          </div>
                          <div className="meta-item">
                            <i className="fas fa-code-branch"></i>
                            <span>{repo.forks_count.toLocaleString()}</span>
                          </div>
                          <div className="meta-item">
                            <i className="fas fa-clock"></i>
                            <span>更新于 {relativeTimeText(repo.updated_at)}</span>
                          </div>
                          {repo.open_issues_count > 0 && (
                            <div className="meta-item">
                              <i className="fas fa-exclamation-circle"></i>
                              <span>{repo.open_issues_count}个问题</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="project-links">
                      <a
                        href={repo.html_url}
                        className="project-link"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <i className="fab fa-github"></i>访问仓库
                      </a>
                      {repo.has_issues && (
                        <a
                          href={`${repo.html_url}/issues`}
                          className="project-link issue"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <i className="fas fa-bug"></i>问题
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {visibleCount < filtered.length && (
              <button
                type="button"
                className="github-more-btn"
                onClick={() => setVisibleCount((count) => count + PAGE_STEP)}
              >
                加载更多（剩余 {filtered.length - visibleCount} 个）
              </button>
            )}
          </>
        )}
      </div>
    </section>
  );
}
