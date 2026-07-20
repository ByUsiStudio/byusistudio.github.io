import { useState, useEffect, useCallback, useRef } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';

interface ReadmeData {
  content: string;
  repoFullName: string;
}

interface ReadmeModalProps {
  repoName: string;
  repoFullName: string;
  repoUrl: string;
  onFetch: (repoFullName: string) => Promise<ReadmeData>;
  onClose: () => void;
}

export function ReadmeModal({ repoName, repoFullName, repoUrl, onFetch, onClose }: ReadmeModalProps) {
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const markdownRef = useRef<HTMLDivElement>(null);
  const codeBlocksRef = useRef<{ code: string; lang: string }[]>([]);

  const handleCopy = useCallback(async (code: string, index: number) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(code);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = code;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.style.top = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const convertRelativePaths = useCallback((markdown: string, fullName: string): string => {
    const giteeRawBase = `https://gitee.com/${fullName}/raw/master`;
    
    let converted = markdown;
    
    converted = converted.replace(
      /!\[([^\]]*)\]\(([^)]+)\)/g,
      (match, alt, src) => {
        if (src.startsWith('http://') || src.startsWith('https://')) {
          return match;
        }
        let cleanSrc = src.replace(/^['"]|['"]$/g, '');
        cleanSrc = cleanSrc.replace(/^\.\//, '');
        const fullPath = cleanSrc.startsWith('/') 
          ? `${giteeRawBase}${cleanSrc}` 
          : `${giteeRawBase}/${cleanSrc}`;
        return `![${alt}](${fullPath})`;
      }
    );
    
    converted = converted.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      (match, text, href) => {
        if (href.startsWith('http://') || href.startsWith('https://')) {
          return match;
        }
        if (href.startsWith('#')) {
          return match;
        }
        let cleanHref = href.replace(/^['"]|['"]$/g, '');
        cleanHref = cleanHref.replace(/^\.\//, '');
        const fullPath = cleanHref.startsWith('/')
          ? `${giteeRawBase}${cleanHref}`
          : `${giteeRawBase}/${cleanHref}`;
        return `[${text}](${fullPath})`;
      }
    );
    
    return converted;
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    codeBlocksRef.current = [];

    onFetch(repoFullName)
      .then((readmeData) => {
        if (!cancelled) {
          const convertedContent = convertRelativePaths(readmeData.content, readmeData.repoFullName);
          setContent(convertedContent);
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
  }, [repoFullName, onFetch, convertRelativePaths]);

  useEffect(() => {
    if (!markdownRef.current) return;

    const codeBlocks = markdownRef.current.querySelectorAll('pre code');
    codeBlocks.forEach((codeBlock, index) => {
      const parentPre = codeBlock.parentElement as HTMLPreElement;
      const langClass = codeBlock.className || '';
      const match = langClass.match(/language-(\w+)/);
      const lang = match ? match[1] : 'plaintext';
      const code = codeBlock.textContent || '';

      codeBlocksRef.current[index] = { code, lang };

      try {
        hljs.highlightElement(codeBlock as HTMLElement);
      } catch (err) {
        console.warn('代码高亮失败:', err);
      }

      const existingBtn = parentPre.querySelector('.copy-btn');
      if (!existingBtn) {
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
        copyBtn.onclick = () => handleCopy(code, index);
        parentPre.appendChild(copyBtn);
      }
    });
  }, [content, handleCopy]);

  useEffect(() => {
    if (!markdownRef.current) return;

    const copyBtns = markdownRef.current.querySelectorAll('.copy-btn');
    copyBtns.forEach((btn, index) => {
      const icon = btn.querySelector('i');
      if (copiedIndex === index) {
        btn.classList.add('copied');
        if (icon) icon.className = 'fas fa-check';
      } else {
        btn.classList.remove('copied');
        if (icon) icon.className = 'fas fa-copy';
      }
    });
  }, [copiedIndex]);

  const renderMarkdown = useCallback(() => {
    if (!content) return null;
    const html = marked(content) as string;
    const sanitized = DOMPurify.sanitize(html);
    return <div ref={markdownRef} className="readme-markdown-full" dangerouslySetInnerHTML={{ __html: sanitized }} />;
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
            renderMarkdown()
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