import { useState, useEffect, useCallback, useRef } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';
import { copyToClipboard } from '../utils/clipboard';

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

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

// ---- 会话级图片 Blob 缓存 ----
// 跨弹窗复用，第二次打开同一仓库时无需重新请求 Gitee 图片（修复二次打开图片失效），
// 仅在页面卸载（pagehide）时统一回收，避免悬空对象 URL 与内存泄漏。
const sessionImageBlobCache = new Map<string, string>();
let pageHideBound = false;

function bindPageHideCleanup() {
  if (pageHideBound || typeof window === 'undefined') return;
  pageHideBound = true;
  window.addEventListener(
    'pagehide',
    () => {
      sessionImageBlobCache.forEach((blobUrl) => URL.revokeObjectURL(blobUrl));
      sessionImageBlobCache.clear();
    },
    { once: true },
  );
}

async function fetchImageBlobUrl(src: string): Promise<string> {
  const cached = sessionImageBlobCache.get(src);
  if (cached) return cached;

  const response = await fetch(src, {
    mode: 'cors',
    headers: {
      Accept: 'image/*',
    },
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);
  sessionImageBlobCache.set(src, blobUrl);
  return blobUrl;
}

// ---- README 清洗策略 ----
// 在 DOMPurify 默认（去脚本/事件/危险协议）基础上放行 README 中常见的
// 排版 HTML 与属性（details/居中/表格对齐/行内样式等），保持相对安全的底线。
const SANITIZE_CONFIG = {
  ADD_TAGS: [
    'details',
    'summary',
    'center',
    'mark',
    'kbd',
    'var',
    'samp',
    'strike',
    'u',
    'abbr',
    'bdi',
    'bdo',
    'data',
    'time',
    'wbr',
    'figure',
    'figcaption',
    'picture',
    'source',
    'section',
    'article',
    'aside',
    'header',
    'footer',
    'nav',
    'main',
    'hgroup',
  ],
  ADD_ATTR: [
    'data-src',
    'align',
    'width',
    'height',
    'style',
    'start',
    'border',
    'cellpadding',
    'cellspacing',
    'valign',
    'bgcolor',
    'colspan',
    'rowspan',
    'loading',
    'decoding',
  ],
};

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function ReadmeModal({
  repoName,
  repoFullName,
  repoUrl,
  onFetch,
  onClose,
}: ReadmeModalProps) {
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [toc, setToc] = useState<TocItem[]>([]);
  const markdownRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const codeBlocksRef = useRef<{ code: string; lang: string }[]>([]);

  const handleCopy = useCallback(async (code: string, index: number) => {
    try {
      await copyToClipboard(code);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  }, []);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 500);
  }, [onClose]);

  // 供一次性挂载的键盘监听读取最新 close 函数，避免重复订阅
  const handleCloseRef = useRef(handleClose);
  useEffect(() => {
    handleCloseRef.current = handleClose;
  }, [handleClose]);

  // 弹窗生命周期：焦点陷阱、初始聚焦、Esc 关闭、滚动锁定、焦点还原
  useEffect(() => {
    const panel = modalRef.current;
    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    bindPageHideCleanup();

    const focusTimer = window.setTimeout(() => {
      (panel?.querySelector<HTMLElement>('.readme-modal-close') ?? panel)?.focus({
        preventScroll: true,
      });
    }, 0);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleCloseRef.current();
        return;
      }

      if (e.key !== 'Tab' || !panel) return;

      const focusables = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (el) => !el.hasAttribute('disabled'),
      );

      if (focusables.length === 0) {
        e.preventDefault();
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!first || !last) return;
      const active = document.activeElement as HTMLElement | null;
      const activeInside = active !== null && panel.contains(active);

      if (e.shiftKey) {
        if (active === first || !activeInside) {
          e.preventDefault();
          last.focus();
        }
      } else if (active === last || !activeInside) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus({ preventScroll: true });
    };
  }, []);

  const convertRelativePaths = useCallback((markdown: string, fullName: string): string => {
    const giteeRawBase = `https://gitee.com/${fullName}/raw/master`;

    const html = marked(markdown) as string;
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const convertPath = (path: string): string => {
      if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
      }
      if (path.startsWith('#')) {
        return path;
      }
      let cleanPath = path.replace(/^\.\//, '');
      if (cleanPath.startsWith('/')) {
        return `${giteeRawBase}${cleanPath}`;
      }
      if (cleanPath.startsWith('../')) {
        const segments = giteeRawBase.split('/').filter(Boolean);
        while (cleanPath.startsWith('../')) {
          cleanPath = cleanPath.substring(3);
          if (segments.length > 4) {
            segments.pop();
          }
        }
        return `${segments.join('/')}/${cleanPath}`;
      }
      return `${giteeRawBase}/${cleanPath}`;
    };

    const imgs = doc.querySelectorAll('img');
    imgs.forEach((img) => {
      const src = img.getAttribute('src');
      if (src) {
        const fullPath = convertPath(src);
        img.setAttribute('data-src', fullPath);
        img.removeAttribute('src');
        img.classList.add('readme-image');
      }
    });

    const links = doc.querySelectorAll('a');
    links.forEach((link) => {
      const href = link.getAttribute('href');
      if (href) {
        link.setAttribute('href', convertPath(href));
      }
    });

    return doc.body.innerHTML;
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    codeBlocksRef.current = [];

    onFetch(repoFullName)
      .then((readmeData) => {
        if (!cancelled) {
          const convertedContent = convertRelativePaths(
            readmeData.content,
            readmeData.repoFullName,
          );
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

  // 图片加载：单图加载 + 失败标记（点击可重试）
  const loadSingleImage = useCallback(async (imgEl: HTMLImageElement) => {
    const src = imgEl.getAttribute('data-src');
    if (!src) {
      imgEl.classList.remove('image-loading');
      imgEl.classList.add('image-error');
      return;
    }

    const markFailed = () => {
      imgEl.classList.remove('image-loading');
      imgEl.classList.add('image-error');
      imgEl.setAttribute('data-failed', '1');
      imgEl.title = '图片加载失败，点击重试';
    };

    imgEl.classList.remove('image-error');
    imgEl.classList.add('image-loading');
    try {
      const displaySrc = src.includes('gitee.com') ? await fetchImageBlobUrl(src) : src;
      imgEl.removeAttribute('data-failed');
      imgEl.onload = () => {
        imgEl.classList.remove('image-loading');
        imgEl.classList.add('image-loaded');
      };
      imgEl.onerror = () => {
        markFailed();
      };
      imgEl.src = displaySrc;
    } catch (err) {
      console.error(`[Image Load Failed] ${src}:`, err);
      markFailed();
    }
  }, []);

  useEffect(() => {
    if (!markdownRef.current) return;

    const imgElements = Array.from(
      markdownRef.current.querySelectorAll<HTMLImageElement>('img.readme-image'),
    );

    imgElements.forEach((imgEl) => {
      // 失败图片点击重试
      imgEl.onclick = () => {
        if (imgEl.hasAttribute('data-failed')) {
          loadSingleImage(imgEl);
        }
      };
      loadSingleImage(imgEl);
    });
  }, [content, loadSingleImage]);

  // 目录：为 h2/h3 生成锚点
  useEffect(() => {
    if (!markdownRef.current) {
      setToc([]);
      return;
    }

    const headings = Array.from(markdownRef.current.querySelectorAll<HTMLElement>('h2, h3')).filter(
      (el) => el.textContent?.trim(),
    );

    if (headings.length === 0) {
      setToc([]);
      return;
    }

    const items: TocItem[] = headings.map((el, index) => {
      const level = el.tagName === 'H3' ? 3 : 2;
      const id = `readme-h-${index}`;
      el.id = id;
      el.tabIndex = -1;
      return { id, text: el.textContent?.trim() ?? '', level };
    });
    setToc(items);
  }, [content]);

  const jumpToHeading = useCallback((id: string) => {
    const heading = markdownRef.current?.querySelector<HTMLElement>(`#${CSS.escape(id)}`);
    if (!heading) return;
    heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
    heading.focus({ preventScroll: true });
    heading.classList.add('heading-highlight');
    window.setTimeout(() => heading.classList.remove('heading-highlight'), 1600);
  }, []);

  useEffect(() => {
    if (!markdownRef.current) return;

    const codeBlocks = markdownRef.current.querySelectorAll('pre code');
    codeBlocks.forEach((codeBlock, index) => {
      const parentPre = codeBlock.parentElement as HTMLPreElement;
      const langClass = codeBlock.className || '';
      const match = langClass.match(/language-(\w+)/);
      const lang = match ? (match[1] ?? 'plaintext') : 'plaintext';
      const code = codeBlock.textContent || '';

      codeBlocksRef.current[index] = { code, lang };

      try {
        hljs.highlightElement(codeBlock as HTMLElement);
      } catch (err) {
        console.warn('代码高亮失败:', err);
      }

      // 语言角标
      if (lang && lang !== 'plaintext' && !parentPre.querySelector('.code-lang-tag')) {
        const tag = document.createElement('span');
        tag.className = 'code-lang-tag';
        tag.textContent = lang;
        parentPre.appendChild(tag);
      }

      const existingBtn = parentPre.querySelector('.copy-btn');
      if (!existingBtn) {
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.type = 'button';
        copyBtn.setAttribute('aria-label', '复制代码');
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
    const sanitized = DOMPurify.sanitize(content, SANITIZE_CONFIG);
    return (
      <div
        ref={markdownRef}
        className="readme-markdown-full"
        dangerouslySetInnerHTML={{ __html: sanitized }}
      />
    );
  }, [content]);

  return (
    <div className={`readme-modal-overlay ${isClosing ? 'closing' : ''}`} onClick={handleClose}>
      <div
        ref={modalRef}
        className={`readme-modal ${isClosing ? 'closing' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={`${repoName} 的 README 预览`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="readme-modal-header">
          <div className="readme-modal-title">
            <i className="fas fa-file-alt"></i>
            <span>{repoName} - README</span>
          </div>
          <button
            type="button"
            className="readme-modal-close"
            onClick={handleClose}
            aria-label="关闭 README 预览"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div ref={bodyRef} className="readme-modal-body">
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
            <>
              {toc.length > 1 && (
                <nav className="readme-toc" aria-label="README 目录">
                  <button
                    type="button"
                    className="readme-toc-toggle"
                    aria-expanded={true}
                    onClick={(e) => {
                      const nav = e.currentTarget.closest('.readme-toc') as HTMLElement;
                      nav?.classList.toggle('collapsed');
                    }}
                  >
                    <i className="fas fa-list-ul"></i> 目录
                    <i className="fas fa-chevron-up readme-toc-arrow"></i>
                  </button>
                  <ul className="readme-toc-list">
                    {toc.map((item) => (
                      <li key={item.id} className={`readme-toc-item level-${item.level}`}>
                        <button type="button" onClick={() => jumpToHeading(item.id)}>
                          {item.text}
                        </button>
                      </li>
                    ))}
                  </ul>
                </nav>
              )}
              {renderMarkdown()}
            </>
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
          <button type="button" className="readme-modal-close-btn" onClick={handleClose}>
            <i className="fas fa-times"></i> 关闭
          </button>
        </div>
      </div>
    </div>
  );
}
