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

interface ImageCacheEntry {
  blobUrl: string;
  width: number;
  height: number;
}

const imageBlobCache = new Map<string, ImageCacheEntry>();

async function fetchAndCacheImage(url: string): Promise<ImageCacheEntry> {
  const cached = imageBlobCache.get(url);
  if (cached) return cached;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = blobUrl;
    });

    const entry: ImageCacheEntry = {
      blobUrl,
      width: img.width,
      height: img.height,
    };
    imageBlobCache.set(url, entry);
    return entry;
  } catch {
    const entry: ImageCacheEntry = {
      blobUrl: url,
      width: 0,
      height: 0,
    };
    imageBlobCache.set(url, entry);
    return entry;
  }
}

export function ReadmeModal({ repoName, repoFullName, repoUrl, onFetch, onClose }: ReadmeModalProps) {
  const [dataLoading, setDataLoading] = useState(true);
  const [imagesLoading, setImagesLoading] = useState(true);
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [imageDimensions, setImageDimensions] = useState<Map<string, { width: number; height: number }>>(new Map());
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
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 500);
  }, [onClose]);

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
      return cleanPath.startsWith('/') 
        ? `${giteeRawBase}${cleanPath}` 
        : `${giteeRawBase}/${cleanPath}`;
    };
    
    const imgs = doc.querySelectorAll('img');
    imgs.forEach((img) => {
      const src = img.getAttribute('src');
      if (src) {
        const convertedSrc = convertPath(src);
        img.setAttribute('data-src', convertedSrc);
        img.removeAttribute('src');
        img.classList.add('readme-image');
        img.classList.add('image-loading');
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
    setDataLoading(true);
    setImagesLoading(true);
    setError(null);
    codeBlocksRef.current = [];
    setImageDimensions(new Map());

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
          setImagesLoading(false);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setDataLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [repoFullName, onFetch, convertRelativePaths]);

  useEffect(() => {
    if (!content) return;

    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const imgs = doc.querySelectorAll('img[data-src]');
    
    if (imgs.length === 0) {
      setImagesLoading(false);
      return;
    }

    const imageUrls = Array.from(imgs).map(img => img.getAttribute('data-src')!).filter(Boolean);
    const dimensionsMap = new Map<string, { width: number; height: number }>();

    Promise.all(imageUrls.map(async (url) => {
      const entry = await fetchAndCacheImage(url);
      dimensionsMap.set(url, { width: entry.width, height: entry.height });
      return entry;
    })).then(() => {
      setImageDimensions(dimensionsMap);
      setImagesLoading(false);
    }).catch(() => {
      setImagesLoading(false);
    });
  }, [content]);

  useEffect(() => {
    if (!markdownRef.current || imagesLoading) return;

    const images = markdownRef.current.querySelectorAll('img.readme-image');
    
    images.forEach((img) => {
      const imgEl = img as HTMLImageElement;
      const dataSrc = imgEl.getAttribute('data-src');
      
      if (dataSrc) {
        const cached = imageBlobCache.get(dataSrc);
        if (cached) {
          imgEl.src = cached.blobUrl;
          
          if (cached.width > 0 && cached.height > 0) {
            imgEl.style.setProperty('--aspect-ratio', `${cached.width} / ${cached.height}`);
          }
        }
        
        imgEl.onload = () => {
          imgEl.classList.remove('image-loading');
          imgEl.classList.add('image-loaded');
        };
        
        imgEl.onerror = () => {
          imgEl.classList.remove('image-loading');
          imgEl.classList.add('image-error');
        };
      }
    });
  }, [imagesLoading, imageDimensions]);

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
  }, [content, imagesLoading, handleCopy]);

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
    const sanitized = DOMPurify.sanitize(content);
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
          {dataLoading || imagesLoading ? (
            <div className="readme-loading">
              <div className="loading-spinner"></div>
              <p>{dataLoading ? '正在加载 README...' : '正在加载图片...'}</p>
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
