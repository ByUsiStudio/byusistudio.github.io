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
  const [isClosing, setIsClosing] = useState(false);
  const markdownRef = useRef<HTMLDivElement>(null);
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
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      revokeBlobUrls();
      onClose();
    }, 500);
  }, [onClose, revokeBlobUrls]);

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

    const images = markdownRef.current.querySelectorAll('img.readme-image');
    const imgElements = Array.from(images) as HTMLImageElement[];

    imgElements.forEach((imgEl) => {
      imgEl.classList.add('image-loading');
    });

    const fetchAndConvertImages = async () => {
      const fetchPromises = imgElements.map(async (imgEl) => {
        const originalSrc = imgEl.getAttribute('data-src');
        if (!originalSrc) {
          return { imgEl, originalSrc: '', blobUrl: null, success: false, fromCache: false };
        }
        
        const cachedUrl = blobCacheRef.current.get(originalSrc);
        if (cachedUrl) {
          console.log(`[Blob Cache Hit] ${originalSrc}`);
          return { imgEl, originalSrc, blobUrl: cachedUrl, success: true, fromCache: true };
        }

        try {
          const response = await fetch(originalSrc, {
            mode: 'cors',
            headers: {
              'Accept': 'image/*',
            },
          });
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const blob = await response.blob();
          const blobUrl = URL.createObjectURL(blob);
          blobCacheRef.current.set(originalSrc, blobUrl);
          
          console.log(`[Blob Created] ${originalSrc} -> ${blobUrl}`);
          return { imgEl, originalSrc, blobUrl, success: true, fromCache: false };
        } catch (err) {
          console.error(`[Blob Fetch Failed] ${originalSrc}:`, err);
          return { imgEl, originalSrc, blobUrl: null, success: false, fromCache: false };
        }
      });

      const results = await Promise.all(fetchPromises);

      let replacedCount = 0;
      results.forEach((result) => {
        const { imgEl, originalSrc, blobUrl, success, fromCache } = result;
        
        if (success && blobUrl) {
          imgEl.src = blobUrl;
          replacedCount++;
          console.log(`[Src Replaced] ${originalSrc} -> ${blobUrl} (fromCache: ${fromCache})`);
          
          imgEl.onload = () => {
            imgEl.classList.remove('image-loading');
            imgEl.classList.add('image-loaded');
            console.log(`[Image Loaded] ${blobUrl}`);
          };
          imgEl.onerror = () => {
            imgEl.classList.remove('image-loading');
            imgEl.classList.add('image-error');
            console.error(`[Image Load Failed] ${blobUrl}`);
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

      console.log(`[Blob Replacement Complete] Total: ${imgElements.length}, Replaced: ${replacedCount}`);
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
    const sanitized = DOMPurify.sanitize(content, {
      ADD_ATTR: ['data-src'],
    });
    return <div ref={markdownRef} className="readme-markdown-full" dangerouslySetInnerHTML={{ __html: sanitized }} />;
  }, [content]);

  return (
    <div 
      className={`readme-modal-overlay ${isClosing ? 'closing' : ''}`} 
      onClick={handleClose}
    >
      <div className={`readme-modal ${isClosing ? 'closing' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="readme-modal-header">
          <div className="readme-modal-title">
            <i className="fas fa-file-alt"></i>
            <span>{repoName} - README</span>
          </div>
          <button className="readme-modal-close" onClick={handleClose}>
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
          <button className="readme-modal-close-btn" onClick={handleClose}>
            <i className="fas fa-times"></i> 关闭
          </button>
        </div>
      </div>
    </div>
  );
}
