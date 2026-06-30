import { useState, useMemo, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useUiConfig } from '../context/UiConfigContext';
import type { Repo } from '../types/ui';

type FilterType = 'all' | 'recent' | 'popular' | 'forked' | 'stars' | 'archived';

interface ProjectsProps {
  repos: Repo[];
  loading: boolean;
  error: string | null;
}

export function Projects({ repos, loading, error }: ProjectsProps) {
  const { theme } = useTheme();
  const { config } = useUiConfig();

  if (!config) return null;

  const { projects: projectsConfig } = config.layout;
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = projectsConfig.itemsPerPage;

  const filteredRepos = useMemo(() => {
    let result = [...repos];

    switch (filter) {
      case 'recent':
        result.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
        break;
      case 'popular':
      case 'stars':
        result.sort((a, b) => b.stargazers_count - a.stargazers_count);
        break;
      case 'forked':
        result.sort((a, b) => b.forks_count - a.forks_count);
        break;
      case 'archived':
        result = result.filter((repo) => repo.archived);
        result.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
        break;
      default:
        result.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (repo) =>
          repo.name.toLowerCase().includes(term) ||
          (repo.description && repo.description.toLowerCase().includes(term))
      );
    }

    return result;
  }, [repos, filter, searchTerm]);

  const totalPages = Math.ceil(filteredRepos.length / itemsPerPage);
  const paginatedRepos = filteredRepos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getTimeText = useCallback((updatedAt: string) => {
    const updatedDate = new Date(updatedAt);
    const timeDiff = Math.floor((new Date().getTime() - updatedDate.getTime()) / (1000 * 60 * 60 * 24));
    if (timeDiff === 0) return '今天';
    if (timeDiff === 1) return '昨天';
    if (timeDiff < 7) return `${timeDiff}天前`;
    if (timeDiff < 30) return `${Math.floor(timeDiff / 7)}周前`;
    if (timeDiff < 365) return `${Math.floor(timeDiff / 30)}个月前`;
    return `${Math.floor(timeDiff / 365)}年前`;
  }, []);

  const getRepoIcon = useCallback((repo: Repo) => {
    const name = repo.name.toLowerCase();
    const desc = (repo.description || '').toLowerCase();

    if (name.includes('os') || desc.includes('操作系统')) return 'fas fa-laptop-code';
    if (name.includes('ui') || name.includes('frontend') || desc.includes('前端')) return 'fas fa-palette';
    if (name.includes('api') || name.includes('backend') || desc.includes('后端')) return 'fas fa-server';
    if (name.includes('lib') || name.includes('library') || desc.includes('库')) return 'fas fa-book';
    if (name.includes('tool') || name.includes('utility') || desc.includes('工具')) return 'fas fa-tools';
    if (name.includes('mobile') || desc.includes('移动')) return 'fas fa-mobile-alt';
    if (name.includes('web') || desc.includes('网站')) return 'fas fa-globe';
    if (name.includes('data') || desc.includes('数据')) return 'fas fa-database';
    if (name.includes('ai') || desc.includes('智能')) return 'fas fa-robot';
    return 'fab fa-git-alt';
  }, []);

  if (loading) {
    return (
      <section id="projects" className="section">
        <div className="layui-container">
          <h2 className="section-title">{projectsConfig.title}</h2>
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>正在加载项目数据...</p>
          </div>
        </div>

        <style>{`
          .loading-container {
            text-align: center;
            padding: 60px 0;
          }

          .loading-spinner {
            width: 50px;
            height: 50px;
            border: 3px solid rgba(52, 152, 219, 0.3);
            border-radius: 50%;
            border-top-color: ${theme.primary};
            animation: spin 1s ease-in-out infinite;
            margin: 0 auto 20px;
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </section>
    );
  }

  if (error) {
    return (
      <section id="projects" className="section">
        <div className="layui-container">
          <h2 className="section-title">{projectsConfig.title}</h2>
          <div className="empty-state" style={{ color: theme.accent }}>
            <i className="fas fa-exclamation-triangle fa-3x" style={{ marginBottom: '20px', display: 'block' }}></i>
            <h3>数据加载失败</h3>
            <p>{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="projects" className="section">
      <div className="layui-container">
        <h2 className="section-title">{projectsConfig.title}</h2>

        <div className="project-search">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={projectsConfig.searchPlaceholder}
          />
          <i className="fas fa-search search-icon"></i>
        </div>

        <div className="project-filters">
          {projectsConfig.filters.map(({ key, label }) => (
            <button
              key={key}
              className={`filter-btn ${filter === key ? 'active' : ''}`}
              onClick={() => {
                setFilter(key as FilterType);
                setCurrentPage(1);
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {filteredRepos.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-search"></i>
            <h3>未找到匹配的项目</h3>
            <p>尝试使用其他搜索词或筛选条件</p>
          </div>
        ) : (
          <>
            <div className="project-list">
              {paginatedRepos.map((repo) => (
                <div key={repo.id} className="project-item">
                  <div className="project-item-header">
                    <div className="project-icon">
                      <i className={getRepoIcon(repo)}></i>
                    </div>
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
                          <span>更新于 {getTimeText(repo.updated_at)}</span>
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
                    <a href={repo.html_url} className="project-link" target="_blank" rel="noopener noreferrer">
                      <i className="fas fa-external-link-alt"></i>访问
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
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="page-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                >
                  <i className="fas fa-chevron-left"></i> 上一页
                </button>
                <span className="page-info">
                  第 {currentPage} 页 / 共 {totalPages} 页
                </span>
                <button
                  className="page-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                >
                  下一页 <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        .project-search {
          max-width: 500px;
          margin: 0 auto 40px;
          position: relative;
        }

        .project-search input {
          width: 100%;
          padding: 12px 45px 12px 20px;
          border: 1px solid ${theme['border-color']};
          border-radius: 25px;
          font-size: 16px;
          box-sizing: border-box;
          background: ${theme['card-bg']};
          color: ${theme['text-color']};
        }

        .project-search input:focus {
          outline: none;
          border-color: ${theme.primary};
          box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
        }

        .project-search input::placeholder {
          color: ${theme['dark-gray']};
        }

        .project-search .search-icon {
          position: absolute;
          right: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: ${theme['dark-gray']};
          pointer-events: none;
          z-index: 2;
          font-size: 16px;
        }

        .project-search input:focus + .search-icon {
          color: ${theme.primary};
        }

        .project-filters {
          margin-bottom: 30px;
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: center;
        }

        .filter-btn {
          padding: 8px 20px;
          border: 1px solid ${theme['border-color']};
          background: ${theme['card-bg']};
          color: ${theme['text-color']};
          border-radius: 20px;
          cursor: pointer;
          font-size: 14px;
        }

        .filter-btn.active {
          background: ${theme.primary};
          color: white;
          border-color: ${theme.primary};
        }

        .project-list {
          background: ${theme['card-bg']};
          border-radius: 8px;
          box-shadow: ${theme.shadow};
          overflow: hidden;
        }

        .project-item {
          padding: 20px 25px;
          border-bottom: 1px solid ${theme['border-color']};
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .project-item:last-child {
          border-bottom: none;
        }

        .project-item-header {
          display: flex;
          align-items: center;
          flex: 1;
          min-width: 0;
        }

        .project-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, ${theme.primary}, #2ecc71);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 15px;
          flex-shrink: 0;
        }

        .project-icon i {
          color: white;
          font-size: 18px;
        }

        .project-info {
          flex: 1;
          min-width: 0;
        }

        .project-name {
          font-size: 18px;
          font-weight: 600;
          color: ${theme.secondary};
          margin-bottom: 5px;
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
        }

        .project-name a {
          color: ${theme.secondary};
          text-decoration: none;
        }

        .project-badge {
          display: inline-block;
          padding: 2px 8px;
          background: rgba(52, 152, 219, 0.1);
          color: ${theme.primary};
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }

        .project-badge.archived {
          background: rgba(231, 76, 60, 0.1);
          color: ${theme.accent};
        }

        .project-description {
          color: ${theme['dark-gray']};
          font-size: 14px;
          line-height: 1.5;
          margin-bottom: 8px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .project-meta {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 15px;
          font-size: 13px;
          color: ${theme['dark-gray']};
        }

        .meta-item {
          display: flex;
          align-items: center;
        }

        .meta-item i {
          margin-right: 5px;
          color: ${theme.primary};
          font-size: 14px;
        }

        .project-links {
          display: flex;
          gap: 10px;
          margin-left: 20px;
          flex-shrink: 0;
        }

        .project-link {
          padding: 6px 12px;
          background: rgba(52, 152, 219, 0.1);
          color: ${theme.primary};
          border-radius: 4px;
          font-size: 13px;
          font-weight: 500;
          display: flex;
          align-items: center;
          text-decoration: none;
        }

        .project-link i {
          margin-right: 5px;
        }

        .project-link.issue {
          background: rgba(231, 76, 60, 0.1);
          color: ${theme.accent};
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 20px;
          margin-top: 40px;
        }

        .page-btn {
          padding: 10px 20px;
          border: 1px solid ${theme['border-color']};
          background: ${theme['card-bg']};
          color: ${theme['text-color']};
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .page-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .page-info {
          color: ${theme['dark-gray']};
          font-size: 14px;
        }

        .empty-state {
          text-align: center;
          padding: 60px 0;
          color: ${theme['dark-gray']};
        }

        .empty-state i {
          font-size: 48px;
          margin-bottom: 20px;
          display: block;
          color: ${theme.primary};
        }

        .empty-state h3 {
          margin-bottom: 10px;
          color: ${theme.secondary};
        }
      `}</style>
    </section>
  );
}
