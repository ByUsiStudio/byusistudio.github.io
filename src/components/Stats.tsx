import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/theme';
import { useUiConfig } from '../context/uiConfig';
import type { Repo } from '../types/ui';

interface StatsProps {
  repos: Repo[];
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
}

function AnimatedNumber({
  value,
  duration = 2000,
  delay = 0,
}: {
  value: string | number;
  duration?: number;
  delay?: number;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const parsedValue = typeof value === 'string' ? parseInt(value.replace(/,/g, ''), 10) : value;
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;

    const timer = setTimeout(() => {
      hasAnimated.current = true;
      let startTime: number | null = null;

      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        setDisplayValue(Math.floor(easeOutQuart * parsedValue));

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }, delay);

    return () => clearTimeout(timer);
  }, [parsedValue, duration, delay]);

  return <span>{displayValue.toLocaleString()}</span>;
}

const LANG_COLORS = [
  '#3498db',
  '#9b59b6',
  '#e74c3c',
  '#f39c12',
  '#2ecc71',
  '#1abc9c',
  '#e67e22',
  '#7f8c8d',
];

interface LanguageItem {
  name: string;
  count: number;
}

/** 语言构成分布（按仓库数量统计，最多显示前 8 种，其余并入“其他”） */
function LanguageBreakdown({ repos }: { repos: Repo[] }) {
  const counts = new Map<string, number>();
  repos.forEach((repo) => {
    if (!repo.language) return;
    counts.set(repo.language, (counts.get(repo.language) ?? 0) + 1);
  });

  const items = [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  if (items.length === 0) return null;

  const top = items.slice(0, 8);
  const restCount = items.slice(8).reduce((sum, item) => sum + item.count, 0);
  const display: LanguageItem[] =
    restCount > 0 ? [...top, { name: '其他', count: restCount }] : top;
  const total = items.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="lang-dist scroll-animate">
      <h3 className="lang-dist-title">
        <i className="fas fa-code"></i> 语言构成
      </h3>
      <div className="lang-dist-bars">
        {display.map((item, index) => {
          const percent = total > 0 ? Math.round((item.count / total) * 100) : 0;
          const color = LANG_COLORS[index % LANG_COLORS.length] ?? LANG_COLORS[0];
          return (
            <div className="lang-dist-row" key={item.name}>
              <span className="lang-dist-name" title={item.name}>
                {item.name}
              </span>
              <div className="lang-dist-track">
                <div
                  className="lang-dist-fill"
                  style={{ width: `${Math.max(percent, 1)}%`, backgroundColor: color }}
                ></div>
              </div>
              <span className="lang-dist-count">
                {item.count} · {percent}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Stats({ repos, loading, error, onRetry }: StatsProps) {
  const { theme } = useTheme();
  const { config } = useUiConfig();
  const containerRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  const totalRepos = repos.length;
  const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
  const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const activeRepos = repos.filter((repo) => new Date(repo.updated_at) > thirtyDaysAgo).length;

  const valueMap: Record<string, string | number> = {
    totalRepos,
    totalStars: totalStars.toLocaleString(),
    totalForks: totalForks.toLocaleString(),
    activeRepos,
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true;
            entry.target.classList.add('animated');
          }
        });
      },
      { threshold: 0.1 },
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const statsConfig = config?.layout?.stats;
  if (!config || !statsConfig) return null;

  const failedWithoutData = !!error && !loading && repos.length === 0;

  return (
    <section
      id="stats"
      className="section"
      style={
        {
          '--primary': theme.primary,
          '--accent': theme.accent,
          '--secondary': theme.secondary,
          '--dark-gray': theme['dark-gray'],
          '--primary-rgb': theme.primary.replace(/[rgb()]/g, ''),
          '--accent-rgb': theme.accent.replace(/[rgb()]/g, ''),
        } as React.CSSProperties
      }
    >
      <div className="layui-container">
        <div className="stats-glow-bg"></div>

        {failedWithoutData ? (
          <div className="stats-error scroll-animate">
            <i className="fas fa-exclamation-triangle"></i>
            <h3>统计数据加载失败</h3>
            <p>{error}</p>
            {onRetry && (
              <button type="button" className="notice-retry-btn" onClick={onRetry}>
                <i className="fas fa-redo"></i> 重新加载
              </button>
            )}
          </div>
        ) : (
          <>
            <div ref={containerRef} className="stats-container scroll-animate">
              {(statsConfig.cards || []).map((card, index) => (
                <div
                  key={card.key}
                  className="stat-card"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="stat-card-inner">
                    <div className="stat-number">
                      <AnimatedNumber value={valueMap[card.key] ?? 0} delay={index * 150} />
                    </div>
                    <div className="stat-label">{card.label}</div>
                  </div>
                  <div className="stat-card-ring"></div>
                  <div className="stat-card-ring stat-card-ring-delay"></div>
                </div>
              ))}
            </div>
            {!loading && repos.length > 0 && <LanguageBreakdown repos={repos} />}
          </>
        )}
      </div>
    </section>
  );
}
