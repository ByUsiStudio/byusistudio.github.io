import { useTheme } from '../context/theme';
import { useUiConfig } from '../context/uiConfig';
import { Typewriter } from './Typewriter';

export function Hero() {
  const { theme } = useTheme();
  const { config } = useUiConfig();

  if (!config) return null;

  const hero = config.layout?.hero;
  if (!hero) return null;

  const scrollToProjects = () => {
    const element = document.querySelector('#projects');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section
      id="home"
      className="hero"
      style={
        {
          '--primary': theme.primary,
          '--secondary': theme.secondary,
          '--dark-gray': theme['dark-gray'],
          '--bg-color': theme['bg-color'],
          '--primary-rgb': theme.primary.replace(/[rgb()]/g, ''),
        } as React.CSSProperties
      }
    >
      <div className="hero-particles">
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className={`particle ${i % 3 === 0 ? 'animate-float-random' : ''}`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 5}s`,
              width: `${4 + Math.random() * 8}px`,
              height: `${4 + Math.random() * 8}px`,
            }}
          />
        ))}
      </div>

      <div className="hero-glow animate-breathe"></div>
      <div className="hero-glow-ring"></div>
      <div className="hero-glow-ring hero-glow-ring-delay"></div>

      <div className="hero-scan-line"></div>

      <div className="layui-container">
        <div className="hero-content">
          <h1 className="hero-title animate-spring">
            <Typewriter text={hero.title} speed={180} delay={300} />
          </h1>
          <p className="hero-subtitle animate-step-in delay-300">{hero.subtitle}</p>
          <div className="hero-buttons">
            {(hero.buttons || []).map((btn, idx) =>
              btn.action === 'scrollToProjects' ? (
                <button
                  key={idx}
                  className={`btn ${btn.primary ? 'btn-primary' : 'btn-outline'} animate-slide-scale-in`}
                  style={{ animationDelay: `${400 + idx * 150}ms` }}
                  onClick={scrollToProjects}
                >
                  <i className={btn.icon}></i>
                  {btn.label}
                </button>
              ) : (
                <a
                  key={idx}
                  href={btn.href}
                  className={`btn ${btn.primary ? 'btn-primary' : 'btn-outline'} animate-slide-scale-in`}
                  style={{ animationDelay: `${400 + idx * 150}ms` }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className={btn.icon}></i>
                  {btn.label}
                </a>
              ),
            )}
          </div>
        </div>

        <div className="hero-scroll-indicator animate-wave">
          <i className="fas fa-chevron-down"></i>
        </div>
      </div>
    </section>
  );
}
