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
          <h1 className="hero-title animate-slide-up">{hero.title}</h1>
          <p className="hero-subtitle animate-slide-up delay-200">{hero.subtitle}</p>
          <div className="hero-buttons">
            {hero.buttons.map((btn, idx) =>
              btn.action === 'scrollToProjects' ? (
                <button
                  key={idx}
                  className={`btn ${btn.primary ? 'btn-primary' : 'btn-outline'} animate-slide-up`}
                  style={{ animationDelay: `${300 + idx * 100}ms` }}
                  onClick={scrollToProjects}
                >
                  <i className={btn.icon}></i>
                  {btn.label}
                </button>
              ) : (
                <a
                  key={idx}
                  href={btn.href}
                  className={`btn ${btn.primary ? 'btn-primary' : 'btn-outline'} animate-slide-up`}
                  style={{ animationDelay: `${300 + idx * 100}ms` }}
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

        .hero::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(52, 152, 219, 0.05) 0%, transparent 50%);
          animation: float 10s ease-in-out infinite;
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
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s ease;
        }

        .btn:hover::before {
          left: 100%;
        }

        .btn-primary {
          background: ${theme.primary};
          color: white;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(52, 152, 219, 0.4);
        }

        .btn-outline {
          background: transparent;
          color: ${theme.primary};
          border-color: ${theme.primary};
        }

        .btn-outline:hover {
          background: ${theme.primary};
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(52, 152, 219, 0.4);
        }

        .btn i {
          margin-right: 8px;
          transition: transform 0.3s ease;
        }

        .btn:hover i {
          transform: translateX(3px);
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(2deg);
          }
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
