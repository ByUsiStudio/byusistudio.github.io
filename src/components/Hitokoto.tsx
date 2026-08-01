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
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const hitokotoConfig = config?.layout.hitokoto;

  const loadHitokoto = useCallback(async (category?: string) => {
    setLoading(true);
    setError(false);
    try {
      const result = await fetchHitokoto(category);
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

    loadHitokoto(hitokotoConfig.category);

    if (hitokotoConfig.autoRefresh && hitokotoConfig.interval > 0) {
      timerRef.current = setInterval(() => {
        loadHitokoto(hitokotoConfig.category);
      }, hitokotoConfig.interval * 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [
    hitokotoConfig?.show,
    hitokotoConfig?.autoRefresh,
    hitokotoConfig?.interval,
    hitokotoConfig?.category,
    loadHitokoto,
  ]);

  if (!config || !hitokotoConfig?.show) return null;

  const handleRefresh = () => {
    if (loading) return;
    loadHitokoto(hitokotoConfig.category);
  };

  const renderSource = () => {
    if (!data) return null;
    const who = data.from_who?.trim();
    const from = data.from?.trim();
    if (!who && !from) return null;

    return (
      <p className="hitokoto-source">
        —— {who}
        {who && from ? ' ' : ''}
        {from ? `《${from}》` : ''}
      </p>
    );
  };

  return (
    <section
      className="hitokoto-section"
      style={{
        '--primary': theme.primary,
        '--dark-gray': theme['dark-gray'],
        '--card-bg': theme['card-bg'],
        '--border-color': theme['border-color'],
        '--primary-rgb': theme.primary.replace(/[rgb()]/g, ''),
      } as React.CSSProperties}
    >
      <div className="hitokoto-glow-bg"></div>
      <div className="layui-container">
        <div className="hitokoto-card">
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
              <>
                <p className="hitokoto-text">
                  <Typewriter
                    key={displayKey}
                    text={data.hitokoto}
                    speed={120}
                    delay={200}
                  />
                </p>
                {renderSource()}
              </>
            ) : null}
          </div>

          <button
            className={`hitokoto-refresh ${loading ? 'spinning' : ''}`}
            onClick={handleRefresh}
            disabled={loading}
            aria-label="换一句"
            title="换一句"
          >
            <i className="fas fa-sync-alt"></i>
          </button>
        </div>
      </div>
    </section>
  );
}
