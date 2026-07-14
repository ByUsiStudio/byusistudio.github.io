import { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useUiConfig } from '../context/UiConfigContext';

export function Team() {
  const { theme } = useTheme();
  const { config } = useUiConfig();
  const containerRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  if (!config) return null;

  const { team } = config.layout;

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
    <section id="team" className="section">
      <div className="layui-container">
        <h2 className="section-title scroll-animate">{team.title}</h2>
        <div ref={containerRef} className="team-grid scroll-animate">
          {team.items.map((item, index) => (
            <div
              key={index}
              className="team-card"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <div className="team-icon">
                <i className={item.icon}></i>
              </div>
              <h3 className="team-title">{item.title}</h3>
              <p className="team-description">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        #team {
          background: ${theme['light-gray']};
        }

        .team-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 25px;
          opacity: 0;
          transform: translateY(40px);
          transition: all 0.7s var(--ease-out-quart);
          will-change: opacity, transform;
        }

        .team-grid.animated {
          opacity: 1;
          transform: translateY(0);
        }

        .team-card {
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
          transform: scale(0.85) translateY(20px);
          will-change: transform, box-shadow;
          position: relative;
          overflow: hidden;
        }

        .team-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, ${theme.primary}, transparent);
          transform: scaleX(0);
          transition: transform 0.4s ease;
        }

        .team-grid.animated .team-card {
          opacity: 1;
          transform: scale(1) translateY(0);
          animation: scaleInUp 0.6s var(--ease-out-back) forwards;
        }

        .team-card:hover {
          transform: translateY(-10px) scale(1.03);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.18);
        }

        .team-card:hover::before {
          transform: scaleX(1);
        }

        .team-icon {
          font-size: 44px;
          color: ${theme.primary};
          margin-bottom: 20px;
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          display: inline-block;
        }

        .team-card:hover .team-icon {
          transform: scale(1.15) rotate(8deg);
          color: ${theme.accent};
        }

        .team-title {
          color: ${theme.secondary};
          margin-bottom: 15px;
          transition: color 0.3s ease;
          font-size: 18px;
        }

        .team-card:hover .team-title {
          color: ${theme.primary};
        }

        .team-description {
          color: ${theme['dark-gray']};
          line-height: 1.7;
          font-size: 14px;
        }

        @keyframes scaleInUp {
          from {
            opacity: 0;
            transform: scale(0.85) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @media (max-width: 992px) {
          .team-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 576px) {
          .team-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
