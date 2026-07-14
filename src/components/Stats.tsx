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
    <section id="stats" className="section">
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

      <style>{`
        .stats-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 25px;
          margin-bottom: 40px;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-radius: 16px;
          padding: 30px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.5);
          text-align: center;
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          opacity: 0;
          transform: translateY(35px) scale(0.95);
          will-change: transform, box-shadow;
          position: relative;
          overflow: hidden;
        }

        .stat-card::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(52, 152, 219, 0.1) 0%, transparent 70%);
          opacity: 0;
          transition: opacity 0.4s ease;
        }

        .stats-container.animated .stat-card {
          opacity: 1;
          transform: translateY(0) scale(1);
          animation: statSlideUp 0.7s var(--ease-out-back) forwards;
        }

        .stat-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 15px 45px rgba(0, 0, 0, 0.15);
        }

        .stat-card:hover::after {
          opacity: 1;
        }

        .stat-number {
          font-size: 42px;
          font-weight: 800;
          color: ${theme.primary};
          margin-bottom: 12px;
          transition: color 0.3s ease;
          display: inline-block;
        }

        .stat-card:hover .stat-number {
          color: ${theme.accent};
          transform: scale(1.05);
        }

        .stat-label {
          color: ${theme['dark-gray']};
          font-size: 15px;
          font-weight: 500;
        }

        @keyframes statSlideUp {
          from {
            opacity: 0;
            transform: translateY(35px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (max-width: 992px) {
          .stats-container {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 576px) {
          .stats-container {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
