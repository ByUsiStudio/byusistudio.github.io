import { useState, useEffect, useCallback } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

interface ReadmeModalProps {
  repoName: string;
  repoFullName: string;
  repoUrl: string;
  onFetch: (repoFullName: string) => Promise<string>;
  onClose: () => void;
}

export function ReadmeModal({ repoName, repoFullName, repoUrl, onFetch, onClose }: ReadmeModalProps) {
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    onFetch(repoFullName)
      .then((readmeContent) => {
        if (!cancelled) {
          setContent(readmeContent);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : '获取 README 失败');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [repoFullName, onFetch]);

  const renderMarkdown = useCallback(() => {
    if (!content) return null;
    const html = marked(content) as string;
    const sanitized = DOMPurify.sanitize(html);
    return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
  }, [content]);

  return (
    <div className="readme-modal-overlay" onClick={onClose}>
      <div className="readme-modal" onClick={(e) => e.stopPropagation()}>
        <div className="readme-modal-header">
          <div className="readme-modal-title">
            <i className="fas fa-file-alt"></i>
            <span>{repoName} - README</span>
          </div>
          <button className="readme-modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="readme-modal-body">
          {loading ? (
            <div className="readme-loading">
              <div className="loading-spinner"></div>
              <p>正在加载 README...</p>
            </div>
          ) : error ? (
            <div className="readme-error">
              <i className="fas fa-exclamation-circle"></i>
              <p>{error}</p>
            </div>
          ) : content ? (
            <div className="readme-markdown-full">
              {renderMarkdown()}
            </div>
          ) : (
            <div className="readme-empty">
              <i className="fas fa-file-alt"></i>
              <p>该项目暂无 README 文件</p>
            </div>
          )}
        </div>

        <div className="readme-modal-footer">
          <a href={repoUrl} className="readme-modal-link" target="_blank" rel="noopener noreferrer">
            <i className="fas fa-external-link-alt"></i> 在仓库查看
          </a>
          <button className="readme-modal-close-btn" onClick={onClose}>
            <i className="fas fa-times"></i> 关闭
          </button>
        </div>
      </div>
    </div>
  );
}