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
  const markdownRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const codeBlocksRef = useRef<{ code: string; lang: string }[]>([]);
  const blobCacheRef = useRef<Map<string, string>>(new Map());

  const revokeBlobUrls = useCallback(() => {
    blobCacheRef.current.forEach((blobUrl) => {
      URL.revokeObjectURL(blobUrl);
    });
    blobCacheRef.current.clear();
  }, []);

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
      revokeBlobUrls();
      onClose();
    }, 500);
  }, [onClose, revokeBlobUrls]);

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

  useEffect(() => {
    if (!markdownRef.current) return;

    const images = markdownRef.current.querySelectorAll('img.readme-image');
    const imgElements = Array.from(images) as HTMLImageElement[];

    imgElements.forEach((imgEl) => {
      imgEl.classList.add('image-loading');
    });

    const fetchAndConvertImages = async () => {
      const giteePromises: Promise<{
        imgEl: HTMLImageElement;
        originalSrc: string;
        blobUrl: string | null;
        success: boolean;
        fromCache: boolean;
      }>[] = [];
      const nonGiteeImages: HTMLImageElement[] = [];

      imgElements.forEach((imgEl) => {
        const originalSrc = imgEl.getAttribute('data-src');
        if (!originalSrc) {
          imgEl.classList.remove('image-loading');
          imgEl.classList.add('image-error');
          return;
        }

        if (originalSrc.includes('gitee.com')) {
          giteePromises.push(
            (async () => {
              const cachedUrl = blobCacheRef.current.get(originalSrc);
              if (cachedUrl) {
                return { imgEl, originalSrc, blobUrl: cachedUrl, success: true, fromCache: true };
              }

              try {
                const response = await fetch(originalSrc, {
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
                blobCacheRef.current.set(originalSrc, blobUrl);

                return { imgEl, originalSrc, blobUrl, success: true, fromCache: false };
              } catch (err) {
                console.error(`[Blob Fetch Failed] ${originalSrc}:`, err);
                return { imgEl, originalSrc, blobUrl: null, success: false, fromCache: false };
              }
            })(),
          );
        } else {
          nonGiteeImages.push(imgEl);
        }
      });

      nonGiteeImages.forEach((imgEl) => {
        const originalSrc = imgEl.getAttribute('data-src');
        if (originalSrc) {
          imgEl.src = originalSrc;
          imgEl.classList.remove('image-loading');
          imgEl.classList.add('image-loaded');
        } else {
          imgEl.classList.remove('image-loading');
          imgEl.classList.add('image-error');
        }
      });

      const results = await Promise.all(giteePromises);

      results.forEach((result) => {
        const { imgEl, originalSrc, blobUrl, success } = result;

        if (success && blobUrl) {
          imgEl.src = blobUrl;

          imgEl.onload = () => {
            imgEl.classList.remove('image-loading');
            imgEl.classList.add('image-loaded');
          };
          imgEl.onerror = () => {
            imgEl.classList.remove('image-loading');
            imgEl.classList.add('image-error');
            const cached = blobCacheRef.current.get(originalSrc);
            if (cached) {
              URL.revokeObjectURL(cached);
              blobCacheRef.current.delete(originalSrc);
            }
          };
        } else {
          imgEl.classList.remove('image-loading');
          imgEl.classList.add('image-error');
        }
      });
    };

    fetchAndConvertImages();

    return () => {
      revokeBlobUrls();
    };
  }, [content, revokeBlobUrls]);

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
    const sanitized = DOMPurify.sanitize(content, {
      ADD_ATTR: ['data-src'],
    });
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
          <button type="button" className="readme-modal-close-btn" onClick={handleClose}>
            <i className="fas fa-times"></i> 关闭
          </button>
        </div>
      </div>
    </div>
  );
}
