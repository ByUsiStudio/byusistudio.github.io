import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useUiConfig } from '../context/UiConfigContext';

export function Header() {
  const { theme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { config } = useUiConfig();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!config) return null;

  const { navbar } = config.layout;
  const navLinks = navbar.links;

  const scrollToSection = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <nav
      className={`navbar ${scrolled ? 'scrolled' : ''}`}
      style={{
        '--nav-bg': `${theme['card-bg']}cc`,
        '--nav-bg-scrolled': `${theme['card-bg']}ee`,
        '--nav-shadow': `0 4px 30px rgba(0, 0, 0, 0.08)`,
        '--nav-shadow-scrolled': `0 8px 40px rgba(0, 0, 0, 0.12)`,
      } as React.CSSProperties}
    >
      <div className="navbar-container">
        <a
          href="#"
          className="navbar-brand"
          onClick={(e) => {
            e.preventDefault();
            scrollToSection('#home');
          }}
        >
          {navbar.showLogo && navbar.logoImage && (
            <img src={navbar.logoImage} alt={navbar.logoText} />
          )}
          {navbar.logoText}
        </a>

        <button
          className="mobile-menu-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? '关闭菜单' : '打开菜单'}
        >
          <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'}`} style={{ color: theme.secondary }} />
        </button>

        <div className={`nav-links ${isMobileMenuOpen ? 'active' : ''}`}>
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noopener noreferrer' : undefined}
              onClick={(e) => {
                if (!link.external) {
                  e.preventDefault();
                  scrollToSection(link.href);
                }
              }}
            >
              <i className={link.icon}></i>
              {link.label}
            </a>
          ))}
        </div>
      </div>

      <style>{`
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 1000;
          background: var(--nav-bg);
          box-shadow: var(--nav-shadow);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.4s var(--ease-out-cubic);
          will-change: background, box-shadow, height;
        }

        .navbar.scrolled {
          background: var(--nav-bg-scrolled);
          box-shadow: var(--nav-shadow-scrolled);
          height: calc(${navbar.height}px - 8px);
        }

        .navbar-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 15px;
          height: ${navbar.height}px;
          max-width: 1200px;
          margin: 0 auto;
          transition: height 0.4s var(--ease-out-cubic);
        }

        .navbar.scrolled .navbar-container {
          height: calc(${navbar.height}px - 8px);
        }

        .navbar-brand {
          display: flex;
          align-items: center;
          font-weight: 700;
          font-size: 20px;
          color: ${theme.secondary};
          transition: transform 0.3s ease;
        }

        .navbar.scrolled .navbar-brand {
          transform: scale(0.95);
        }

        .navbar-brand img {
          height: 36px;
          margin-right: 10px;
          transition: height 0.3s ease;
        }

        .navbar.scrolled .navbar-brand img {
          height: 32px;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .nav-links a {
          padding: 10px 16px;
          color: ${theme['text-color']};
          font-weight: 500;
          border-radius: 8px;
          display: flex;
          align-items: center;
          transition: all 0.3s var(--ease-out-back);
          position: relative;
          overflow: hidden;
        }

        .nav-links a::before {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 2px;
          background: ${theme.primary};
          transition: width 0.3s ease;
        }

        .nav-links a:hover {
          background: rgba(52, 152, 219, 0.1);
          color: ${theme.primary};
          transform: translateY(-2px);
        }

        .nav-links a:hover::before {
          width: 100%;
        }

        .nav-links a i {
          margin-right: 8px;
          font-size: 16px;
          transition: transform 0.3s ease;
        }

        .nav-links a:hover i {
          transform: translateY(-1px);
        }

        .mobile-menu-btn {
          display: none;
          background: none;
          border: none;
          font-size: 28px;
          cursor: pointer;
          padding: 10px 12px;
          z-index: 1001;
          color: ${theme.secondary};
          min-width: 44px;
          min-height: 44px;
          position: absolute;
          right: 15px;
          top: 50%;
          transform: translateY(-50%);
          transition: transform 0.3s ease;
        }

        .mobile-menu-btn:hover {
          transform: translateY(-50%) scale(1.1);
        }

        .mobile-menu-btn:focus {
          outline: 2px solid ${theme.primary};
          outline-offset: 2px;
          border-radius: 4px;
        }

        @media (max-width: 768px) {
          .mobile-menu-btn {
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .nav-links {
            position: fixed;
            top: ${navbar.height}px;
            left: 0;
            width: 100%;
            background: ${theme['card-bg']}dd;
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            flex-direction: column;
            padding: 20px;
            box-shadow: ${theme.shadow};
            transform: translateY(-150%);
            opacity: 0;
            transition: transform 0.4s var(--ease-out-back), opacity 0.3s ease;
          }

          .nav-links.active {
            transform: translateY(0);
            opacity: 1;
          }

          .nav-links a {
            width: 100%;
            margin: 8px 0;
            padding: 14px 15px;
            transform: translateX(-20px);
            opacity: 0;
            transition: all 0.3s ease;
          }

          .nav-links.active a {
            transform: translateX(0);
            opacity: 1;
          }

          .nav-links.active a:nth-child(1) { transition-delay: 0.1s; }
          .nav-links.active a:nth-child(2) { transition-delay: 0.15s; }
          .nav-links.active a:nth-child(3) { transition-delay: 0.2s; }
          .nav-links.active a:nth-child(4) { transition-delay: 0.25s; }
          .nav-links.active a:nth-child(5) { transition-delay: 0.3s; }
        }
      `}</style>
    </nav>
  );
}
