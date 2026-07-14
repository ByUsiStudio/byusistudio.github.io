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
          gap: 20px;
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.6s ease-out;
        }

        .team-grid.animated {
          opacity: 1;
          transform: translateY(0);
        }

        .team-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-radius: 12px;
          padding: 25px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.5);
          text-align: center;
          transition: all 0.3s ease;
          opacity: 0;
          transform: scale(0.8);
        }

        .team-grid.animated .team-card {
          opacity: 1;
          transform: scale(1);
          animation: scaleIn 0.6s ease-out forwards;
        }

        .team-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
        }

        .team-icon {
          font-size: 40px;
          color: ${theme.primary};
          margin-bottom: 15px;
          transition: transform 0.3s ease;
        }

        .team-card:hover .team-icon {
          transform: scale(1.1) rotate(5deg);
        }

        .team-title {
          color: ${theme.secondary};
          margin-bottom: 15px;
          transition: color 0.3s ease;
        }

        .team-card:hover .team-title {
          color: ${theme.primary};
        }

        .team-description {
          color: ${theme['dark-gray']};
          line-height: 1.6;
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
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
