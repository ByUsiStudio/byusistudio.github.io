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
    <section
      id="team"
      className="section"
      style={{
        '--primary': theme.primary,
        '--secondary': theme.secondary,
        '--accent': theme.accent,
        '--dark-gray': theme['dark-gray'],
        '--light-gray': theme['light-gray'],
      } as React.CSSProperties}
    >
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
    </section>
  );
}