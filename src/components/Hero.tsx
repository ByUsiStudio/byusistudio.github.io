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
      <div className="hero-particles">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 5}s`,
              size: `${4 + Math.random() * 8}px`,
            }}
          />
        ))}
      </div>

      <div className="hero-glow"></div>

      <div className="layui-container">
        <div className="hero-content">
          <h1 className="hero-title animate-blur-in">{hero.title}</h1>
          <p className="hero-subtitle animate-fade-in-up delay-300">{hero.subtitle}</p>
          <div className="hero-buttons">
            {hero.buttons.map((btn, idx) =>
              btn.action === 'scrollToProjects' ? (
                <button
                  key={idx}
                  className={`btn ${btn.primary ? 'btn-primary' : 'btn-outline'} animate-scale-in-up`}
                  style={{ animationDelay: `${500 + idx * 150}ms` }}
                  onClick={scrollToProjects}
                >
                  <i className={btn.icon}></i>
                  {btn.label}
                </button>
              ) : (
                <a
                  key={idx}
                  href={btn.href}
                  className={`btn ${btn.primary ? 'btn-primary' : 'btn-outline'} animate-scale-in-up`}
                  style={{ animationDelay: `${500 + idx * 150}ms` }}
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

        <div className="hero-scroll-indicator animate-float-slow">
          <i className="fas fa-chevron-down"></i>
        </div>
      </div>

      <style>{`
        .hero {
          padding: 160px 0 100px;
          background: linear-gradient(135deg, rgba(52, 152, 219, 0.1) 0%, ${theme['bg-color']} 100%);
          position: relative;
          overflow: hidden;
          min-height: 100vh;
          display: flex;
          align-items: center;
        }

        .hero-particles {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          overflow: hidden;
          z-index: 1;
        }

        .particle {
          position: absolute;
          background: radial-gradient(circle, ${theme.primary} 0%, transparent 70%);
          border-radius: 50%;
          opacity: 0.3;
          animation: particleFloat linear infinite;
        }

        .particle::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: ${theme.primary};
          border-radius: 50%;
          filter: blur(2px);
          opacity: 0.5;
        }

        @keyframes particleFloat {
          0% {
            transform: translateY(100vh) translateX(0) scale(0);
            opacity: 0;
          }
          10% {
            opacity: 0.4;
            transform: translateY(80vh) translateX(10px) scale(1);
          }
          50% {
            opacity: 0.3;
            transform: translateY(50vh) translateX(-15px) scale(0.8);
          }
          90% {
            opacity: 0.2;
            transform: translateY(10vh) translateX(5px) scale(0.6);
          }
          100% {
            transform: translateY(-10vh) translateX(0) scale(0);
            opacity: 0;
          }
        }

        .hero-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(52, 152, 219, 0.08) 0%, transparent 60%);
          border-radius: 50%;
          animation: glowPulse 4s ease-in-out infinite;
          z-index: 0;
        }

        @keyframes glowPulse {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.5;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 0.8;
          }
        }

        .hero-content {
          position: relative;
          z-index: 2;
          text-align: center;
          max-width: 800px;
          margin: 0 auto;
        }

        .hero-title {
          font-size: 48px;
          font-weight: 800;
          margin-bottom: 20px;
          color: ${theme.secondary};
          line-height: 1.2;
          letter-spacing: -0.5px;
        }

        .hero-subtitle {
          font-size: 18px;
          color: ${theme['dark-gray']};
          margin-bottom: 50px;
          max-width: 600px;
          margin: 0 auto 50px;
          line-height: 1.8;
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
          padding: 14px 32px;
          border-radius: 30px;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          border: 2px solid transparent;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          position: relative;
          overflow: hidden;
          will-change: transform, box-shadow;
        }

        .btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transition: left 0.6s ease;
        }

        .btn:hover::before {
          left: 100%;
        }

        .btn-primary {
          background: ${theme.primary};
          color: white;
          box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
        }

        .btn-primary:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 12px 35px rgba(52, 152, 219, 0.5);
        }

        .btn-outline {
          background: transparent;
          color: ${theme.primary};
          border-color: ${theme.primary};
        }

        .btn-outline:hover {
          background: ${theme.primary};
          color: white;
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 12px 35px rgba(52, 152, 219, 0.5);
        }

        .btn i {
          margin-right: 8px;
          transition: transform 0.3s ease;
        }

        .btn:hover i {
          transform: translateX(5px);
        }

        .hero-scroll-indicator {
          position: absolute;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          color: ${theme.primary};
          font-size: 24px;
          z-index: 2;
          opacity: 0.6;
        }

        .hero-scroll-indicator:hover {
          opacity: 1;
        }

        @media (max-width: 768px) {
          .hero {
            padding: 120px 0 80px;
          }

          .hero-title {
            font-size: 32px;
          }

          .hero-subtitle {
            font-size: 16px;
          }

          .btn {
            padding: 12px 24px;
            font-size: 14px;
          }

          .hero-glow {
            width: 400px;
            height: 400px;
          }
        }
      `}</style>
    </section>
  );
}
