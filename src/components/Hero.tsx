import { useTheme } from '../context/ThemeContext';
import { useUiConfig } from '../context/UiConfigContext';

export function Hero() {
  const { theme } = useTheme();
  const { config } = useUiConfig();

  if (!config) return null;

  const { hero } = config.layout;

  const scrollToProjects = () => {
    const element = document.querySelector('#projects');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section id="home" className="hero">
      <div className="layui-container">
        <div className="hero-content">
          <h1 className="hero-title">{hero.title}</h1>
          <p className="hero-subtitle">{hero.subtitle}</p>
          <div className="hero-buttons">
            {hero.buttons.map((btn, idx) =>
              btn.action === 'scrollToProjects' ? (
                <button key={idx} className={`btn ${btn.primary ? 'btn-primary' : 'btn-outline'}`} onClick={scrollToProjects}>
                  <i className={btn.icon}></i>
                  {btn.label}
                </button>
              ) : (
                <a
                  key={idx}
                  href={btn.href}
                  className={`btn ${btn.primary ? 'btn-primary' : 'btn-outline'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className={btn.icon}></i>
                  {btn.label}
                </a>
              )
            )}
          </div>
        </div>
      </div>

      <style>{`
        .hero {
          padding: 160px 0 100px;
          background: linear-gradient(135deg, rgba(52, 152, 219, 0.1) 0%, ${theme['bg-color']} 100%);
          position: relative;
          overflow: hidden;
        }

        .hero-content {
          position: relative;
          z-index: 2;
          text-align: center;
          max-width: 800px;
          margin: 0 auto;
        }

        .hero-title {
          font-size: 42px;
          font-weight: 800;
          margin-bottom: 20px;
          color: ${theme.secondary};
          line-height: 1.2;
        }

        .hero-subtitle {
          font-size: 18px;
          color: ${theme['dark-gray']};
          margin-bottom: 40px;
          max-width: 600px;
          margin: 0 auto 40px;
        }

        .hero-buttons {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 15px;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          padding: 12px 30px;
          border-radius: 25px;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          border: 2px solid transparent;
        }

        .btn-primary {
          background: ${theme.primary};
          color: white;
        }

        .btn-outline {
          background: transparent;
          color: ${theme.primary};
          border-color: ${theme.primary};
        }

        .btn i {
          margin-right: 8px;
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 28px;
          }

          .hero-subtitle {
            font-size: 16px;
          }

          .btn {
            padding: 10px 20px;
            font-size: 14px;
          }
        }
      `}</style>
    </section>
  );
}
