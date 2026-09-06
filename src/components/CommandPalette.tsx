import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useTheme } from '../context/theme';
import { relativeTimeText } from '../utils/relativeTime';
import type { Repo } from '../types/ui';

interface CommandPaletteProps {
  repos: Repo[];
  onOpen: (repo: Repo) => void;
}

const MAX_RESULTS = 50;

/**
 * Ctrl/Cmd + K 仓库快速搜索面板：上下键选择、回车打开 README、Esc 关闭。
 */
export function CommandPalette({ repos, onOpen }: CommandPaletteProps) {
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const lastQueryRef = useRef('');

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    const list = term
      ? repos.filter(
          (repo) =>
            repo.name.toLowerCase().includes(term) ||
            (repo.description && repo.description.toLowerCase().includes(term)),
        )
      : repos;
    return list.slice(0, MAX_RESULTS);
  }, [repos, query]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
    setActiveIndex(0);
  }, []);

  // 全局快捷键：Ctrl/Cmd + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        // README 弹窗打开时不抢占焦点，避免与弹窗焦点陷阱冲突
        if (document.querySelector('.readme-modal-overlay')) return;
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 打开时聚焦输入框；关闭时重置查询
  useEffect(() => {
    if (open) {
      const frame = requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
      return () => cancelAnimationFrame(frame);
    }
    close();
  }, [open, close]);

  // 查询变化时重置选中项
  useEffect(() => {
    if (lastQueryRef.current !== query) {
      lastQueryRef.current = query;
      setActiveIndex(0);
    }
  }, [query]);

  // 高亮当前项滚动可见
  useEffect(() => {
    if (!open) return;
    const list = listRef.current;
    if (!list) return;
    const el = list.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [open, activeIndex]);

  const handlePick = useCallback(
    (repo: Repo) => {
      onOpen(repo);
      close();
    },
    [onOpen, close],
  );

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, Math.max(results.length - 1, 0)));
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      const repo = results[activeIndex];
      if (repo) handlePick(repo);
    }
  };

  if (!open) return null;

  return (
    <div
      className="palette-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        className="palette"
        role="dialog"
        aria-modal="true"
        aria-label="仓库搜索"
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
        <div className="palette-input-wrap">
          <i className="fas fa-search palette-search-icon"></i>
          <input
            ref={inputRef}
            className="palette-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="搜索仓库名称或描述，回车打开 README..."
            aria-label="搜索仓库"
          />
          <kbd className="palette-kbd">Esc</kbd>
        </div>

        <div className="palette-body">
          {repos.length === 0 ? (
            <div className="palette-hint">仓库数据加载中或不可用，请稍后重试</div>
          ) : results.length === 0 ? (
            <div className="palette-hint">未找到匹配的仓库</div>
          ) : (
            <ul className="palette-list" role="listbox" ref={listRef}>
              {results.map((repo, index) => (
                <li
                  key={repo.full_name}
                  role="option"
                  aria-selected={index === activeIndex}
                  data-index={index}
                  className={`palette-item ${index === activeIndex ? 'active' : ''}`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handlePick(repo);
                  }}
                >
                  <span className="palette-item-icon">
                    <i className="fas fa-file-alt"></i>
                  </span>
                  <span className="palette-item-main">
                    <span className="palette-item-name">{repo.name}</span>
                    {repo.description && (
                      <span className="palette-item-desc">{repo.description}</span>
                    )}
                  </span>
                  <span className="palette-item-meta">
                    {repo.language && <span className="palette-item-lang">{repo.language}</span>}
                    <span className="palette-item-time">
                      {relativeTimeText(repo.updated_at)}更新
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="palette-footer">
          <span>
            <kbd>↑</kbd>
            <kbd>↓</kbd> 选择
          </span>
          <span>
            <kbd>Enter</kbd> 打开
          </span>
          <span>
            <kbd>Ctrl K</kbd> 唤起/关闭
          </span>
        </div>
      </div>
    </div>
  );
}
