import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useUiConfig } from '../context/UiConfigContext';
import { ReadmeModal } from './ReadmeModal';
import { fetchReadme } from '../services/api';
import type { Repo, ProjectLayoutMode } from '../types/ui';

type FilterType = 'all' | 'recent' | 'popular' | 'forked' | 'stars' | 'archived';

interface ProjectsProps {
  repos: Repo[];
  loading: boolean;
  error: string | null;
}

export function Projects({ repos, loading, error }: ProjectsProps) {
  const { theme } = useTheme();
  const { config } = useUiConfig();
  const containerRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [animateKey, setAnimateKey] = useState(0);
  const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null);
  const [modalOpenTime, setModalOpenTime] = useState<number>(0);
  const [layoutMode, setLayoutMode] = useState<ProjectLayoutMode>('auto');
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [layoutSwitching, setLayoutSwitching] = useState(false);

  useEffect(() => {
    if (config?.layout?.projects?.layout) {
      setLayoutMode(config.layout.projects.layout);
    }

    const checkScreenSize = () => {
      const breakpoint = config?.layout?.projects?.doubleColumnBreakpoint || 1200;
      setIsLargeScreen(window.innerWidth >= breakpoint);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [config]);

  const isDoubleColumn = useMemo(() => {
    if (layoutMode === 'double') return true;
    if (layoutMode === 'single') return false;
    return isLargeScreen;
  }, [layoutMode, isLargeScreen]);

  useEffect(() => {
    setAnimateKey((prev) => prev + 1);
  }, [filter, searchTerm]);

  const handleOpenModal = useCallback((repo: Repo) => {
    setModalOpenTime(Date.now());
    setSelectedRepo(repo);
  }, []);

  const handleLayoutChange = useCallback((mode: ProjectLayoutMode) => {
    if (mode === layoutMode || layoutSwitching) return;
    setLayoutSwitching(true);
    window.setTimeout(() => {
      setLayoutMode(mode);
      setCurrentPage(1);
      setAnimateKey((prev) => prev + 1);
      window.requestAnimationFrame(() => {
        window.setTimeout(() => setLayoutSwitching(false), 30);
      });
    }, 260);
  }, [layoutMode, layoutSwitching]);

  const handlePreviewProject = useCallback((repo: Repo) => {
    if (typeof JCuPupw === 'undefined') return;

    const starCount = repo.stargazers_count.toLocaleString();
    const forkCount = repo.forks_count.toLocaleString();
    const issueCount = repo.open_issues_count.toLocaleString();
    const updatedText = getTimeText(repo.updated_at);

    const previewHtml = `
      <div class="jc-preview">
        <div class="jc-preview-badges">
          ${repo.archived ? '<span class="jc-badge jc-badge--muted">已归档</span>' : ''}
          ${repo.language ? `<span class="jc-badge">${repo.language}</span>` : ''}
        </div>
        <p class="jc-preview-desc">
          ${repo.description || '该项目暂无描述信息'}
        </p>
        <div class="jc-preview-stats">
          <div class="jc-stat">
            <i class="fas fa-star"></i>
            <span class="jc-stat-label">Star</span>
            <span class="jc-stat-value">${starCount}</span>
          </div>
          <div class="jc-stat">
            <i class="fas fa-code-branch"></i>
            <span class="jc-stat-label">Fork</span>
            <span class="jc-stat-value">${forkCount}</span>
          </div>
          <div class="jc-stat">
            <i class="fas fa-exclamation-circle"></i>
            <span class="jc-stat-label">Issues</span>
            <span class="jc-stat-value">${issueCount}</span>
          </div>
          <div class="jc-stat">
            <i class="fas fa-clock"></i>
            <span class="jc-stat-label">更新</span>
            <span class="jc-stat-value">${updatedText}</span>
          </div>
        </div>
      </div>
    `;

    const buttons: Array<{
      text: string;
      type: 'default' | 'primary' | 'danger';
      action: () => void;
      close: boolean;
    }> = [
      {
        text: '查看 README',
        type: 'primary',
        close: true,
        action: () => handleOpenModal(repo),
      },
      {
        text: '访问仓库',
        type: 'default',
        close: true,
        action: () => {
          window.open(repo.html_url, '_blank', 'noopener,noreferrer');
          JCuPupw.toast({ content: `已打开 ${repo.name}`, type: 'info', duration: 1800 });
        },
      },
    ];

    if (repo.has_issues) {
      buttons.push({
        text: '提交问题',
        type: 'default',
        close: true,
        action: () => {
          window.open(`${repo.html_url}/issues`, '_blank', 'noopener,noreferrer');
        },
      });
    }

    JCuPupw.open({
      title: repo.name,
      content: previewHtml,
      size: 'lg',
      theme: 'auto',
      closeOnOverlay: true,
      closeOnEsc: true,
      buttons,
      onOpen: () => {
        JCuPupw.toast({ content: `预览 ${repo.name}`, type: 'info', duration: 1500 });
      },
    });
  }, [getTimeText, handleOpenModal]);

  if (!config) return null;

  const projectsConfig = config.layout?.projects;
  if (!projectsConfig) return null;
  const itemsPerPage = projectsConfig.itemsPerPage || 10;

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

  if (loading) {
    return (
      <section
        id="projects"
        className="section"
        style={{
          '--border-color': theme['border-color'],
          '--primary-rgb': theme.primary.replace(/[rgb()]/g, ''),
        } as React.CSSProperties}
      >
        <div className="layui-container">
          <h2 className="section-title scroll-animate">{projectsConfig.title}</h2>
          <div className={`project-list scroll-animate ${isDoubleColumn ? 'double-column' : ''}`}>
            {[...Array(isDoubleColumn ? 6 : 6)].map((_, idx) => (
              <div key={idx} className="project-item skeleton">
                <div className="project-item-header">
                  <div className="project-icon skeleton-icon"></div>
                  <div className="project-info">
                    <div className="project-name skeleton-text"></div>
                    <div className="project-description skeleton-text"></div>
                    <div className="project-meta">
                      <div className="meta-item skeleton-text small"></div>
                      <div className="meta-item skeleton-text small"></div>
                      <div className="meta-item skeleton-text small"></div>
                    </div>
                  </div>
                </div>
                <div className="project-links">
                  <div className="project-link skeleton-btn"></div>
                  <div className="project-link skeleton-btn"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section
        id="projects"
        className="section"
        style={{
          '--accent': theme.accent,
          '--primary': theme.primary,
          '--secondary': theme.secondary,
          '--dark-gray': theme['dark-gray'],
        } as React.CSSProperties}
      >
        <div className="layui-container">
          <h2 className="section-title">{projectsConfig.title}</h2>
          <div className="empty-state">
            <i className="fas fa-exclamation-triangle"></i>
            <h3>数据加载失败</h3>
            <p>{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section
        id="projects"
        className="section"
        style={{
          '--primary': theme.primary,
          '--secondary': theme.secondary,
          '--accent': theme.accent,
          '--dark-gray': theme['dark-gray'],
          '--text-color': theme['text-color'],
          '--card-bg': theme['card-bg'],
          '--border-color': theme['border-color'],
          '--primary-rgb': theme.primary.replace(/[rgb()]/g, ''),
          '--accent-rgb': theme.accent.replace(/[rgb()]/g, ''),
        } as React.CSSProperties}
      >
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

        <div className="project-toolbar">
          <div className="project-filters">
            {(projectsConfig.filters || []).map(({ key, label }) => (
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

          <div className="layout-switcher">
            <span className="layout-switcher-label">布局:</span>
            <button
              className={`layout-btn ${layoutMode === 'single' ? 'active' : ''}`}
              onClick={() => handleLayoutChange('single')}
              title="单列布局"
            >
              <i className="fas fa-list"></i>
            </button>
            <button
              className={`layout-btn ${layoutMode === 'auto' ? 'active' : ''}`}
              onClick={() => handleLayoutChange('auto')}
              title="自动布局"
            >
              <i className="fas fa-desktop"></i>
            </button>
            <button
              className={`layout-btn ${layoutMode === 'double' ? 'active' : ''}`}
              onClick={() => handleLayoutChange('double')}
              title="双列布局"
            >
              <i className="fas fa-th-large"></i>
            </button>
          </div>
        </div>

        {filteredRepos.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-search"></i>
            <h3>未找到匹配的项目</h3>
            <p>尝试使用其他搜索词或筛选条件</p>
          </div>
        ) : (
          <>
            <div ref={containerRef} className={`project-list ${isDoubleColumn ? 'double-column' : ''} ${layoutSwitching ? 'is-switching' : ''}`}>
              {paginatedRepos.map((repo, index) => (
                <div
                  key={`${repo.id}-${animateKey}`}
                  className="project-item"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
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
                      <button className="project-link preview" onClick={() => handlePreviewProject(repo)} title="项目预览">
                        <i className="fas fa-eye"></i>预览
                      </button>
                      <a href={repo.html_url} className="project-link" target="_blank" rel="noopener noreferrer">
                        <i className="fas fa-external-link-alt"></i>访问
                      </a>
                      <button className="project-link readme" onClick={() => handleOpenModal(repo)}>
                        <i className="fas fa-file-alt"></i>README
                      </button>
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
  </section>

  {selectedRepo && (
        <ReadmeModal
          key={modalOpenTime}
          repoName={selectedRepo.name}
          repoFullName={selectedRepo.full_name}
          repoUrl={selectedRepo.html_url}
          onFetch={fetchReadme}
          onClose={() => setSelectedRepo(null)}
        />
      )}
    </>
  );
}