import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useUiConfig } from '../context/UiConfigContext';
import type { Repo } from '../types/ui';

interface StatsProps {
  repos: Repo[];
  loading: boolean;
  error: string | null;
}

function AnimatedNumber({ value, duration = 2000 }: { value: string | number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  const parsedValue = typeof value === 'string' ? parseInt(value.replace(/,/g, ''), 10) : value;
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;
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
  }, [parsedValue, duration]);

  return <span>{displayValue.toLocaleString()}</span>;
}

export function Stats({ repos }: StatsProps) {
  const { theme } = useTheme();
  const { config } = useUiConfig();
  const containerRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  if (!config) return null;

  const { stats: statsConfig } = config.layout;

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
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="stats"
      className="section"
      style={{
        '--primary': theme.primary,
        '--accent': theme.accent,
        '--secondary': theme.secondary,
        '--dark-gray': theme['dark-gray'],
        '--primary-rgb': theme.primary.replace(/[rgb()]/g, ''),
        '--accent-rgb': theme.accent.replace(/[rgb()]/g, ''),
      } as React.CSSProperties}
    >
      <div className="layui-container">
        <div ref={containerRef} className="stats-container scroll-animate">
          {statsConfig.cards.map((card, index) => (
            <div
              key={card.key}
              className="stat-card"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="stat-number">
                <AnimatedNumber value={valueMap[card.key] ?? 0} />
              </div>
              <div className="stat-label">{card.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}