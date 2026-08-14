import { useState, useEffect, useCallback, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useUiConfig } from '../context/UiConfigContext';
import { fetchHitokoto } from '../services/api';
import { Typewriter } from './Typewriter';

interface HitokotoState {
  hitokoto: string;
  from?: string;
  from_who?: string;
}

export function Hitokoto() {
  const { theme } = useTheme();
  const { config } = useUiConfig();
  const [data, setData] = useState<HitokotoState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [displayKey, setDisplayKey] = useState(0);
  const [typingComplete, setTypingComplete] = useState(false);
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const hitokotoConfig = config?.layout.hitokoto;

  const loadHitokoto = useCallback(async () => {
    setLoading(true);
    setError(false);
    setTypingComplete(false);
    try {
      const result = await fetchHitokoto();
      setData(result);
      setDisplayKey((k) => k + 1);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hitokotoConfig?.show) return;
    loadHitokoto();
  }, [hitokotoConfig?.show]);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  if (!config || !hitokotoConfig?.show) return null;

  const handleRefresh = () => {
    if (loading) return;
    loadHitokoto();
  };

  const buildCopyText = () => {
    if (!data) return '';
    const who = data.from_who?.trim();
    const from = data.from?.trim();
    let source = '';
    if (who) source += who;
    if (who && from) source += ' ';
    if (from) source += `《${from}》`;
    return source ? `${data.hitokoto}\n—— ${source}` : data.hitokoto;
  };

  const handleCopy = async () => {
    const text = buildCopyText();
    if (!text) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.style.top = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const renderSource = () => {
    if (!data) return null;
    const who = data.from_who?.trim();
    const from = data.from?.trim();
    if (!who && !from) return null;

    return (
      <p className={`hitokoto-source ${typingComplete ? 'visible' : ''}`}>
        —— {who}
        {who && from ? ' ' : ''}
        {from ? `《${from}》` : ''}
      </p>
    );
  };

  const canCopy = !!data && !loading;

  return (
    <section
      className="hitokoto-section"
      style={{
        '--primary': theme.primary,
        '--accent': theme.accent,
        '--dark-gray': theme['dark-gray'],
        '--primary-rgb': theme.primary.replace(/[rgb()]/g, ''),
      } as React.CSSProperties}
    >
      <div className="hitokoto-glow-bg"></div>
      <div className="layui-container">
        <div className="hitokoto-card">
          <div className="hitokoto-card-glow"></div>
          <div className="hitokoto-card-ring"></div>
          <div className="hitokoto-card-ring hitokoto-card-ring-delay"></div>
          <div className="hitokoto-scan-line"></div>

          <div className="hitokoto-quote-icon">
            <i className="fas fa-quote-left"></i>
          </div>

          <div className="hitokoto-content">
            {loading && !data ? (
              <div className="hitokoto-loading">
                <span className="hitokoto-loading-dot"></span>
                <span className="hitokoto-loading-dot"></span>
                <span className="hitokoto-loading-dot"></span>
              </div>
            ) : error && !data ? (
              <p className="hitokoto-text hitokoto-fallback">这一言，暂时走丢了…</p>
            ) : data ? (
              <div key={displayKey} className="hitokoto-text-wrap">
                <p className="hitokoto-text">
                  <Typewriter
                    text={data.hitokoto}
                    speed={120}
                    delay={200}
                    onComplete={() => setTypingComplete(true)}
                  />
                </p>
                {renderSource()}
              </div>
            ) : null}
          </div>

          <div className="hitokoto-actions">
            <button
              className={`hitokoto-action-btn ${copied ? 'copied' : ''}`}
              onClick={handleCopy}
              disabled={!canCopy}
              aria-label="复制一言"
              title="复制一言"
            >
              <i className={`fas ${copied ? 'fa-check' : 'fa-copy'}`}></i>
            </button>
            <button
              className={`hitokoto-action-btn ${loading ? 'spinning' : ''}`}
              onClick={handleRefresh}
              disabled={loading}
              aria-label="换一句"
              title="换一句"
            >
              <i className="fas fa-sync-alt"></i>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
