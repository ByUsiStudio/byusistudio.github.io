import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useUiConfig } from '../context/UiConfigContext';

export function Header() {
  const { theme, mode, toggleMode } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { config } = useUiConfig();

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
      className="navbar"
      style={{
        backgroundColor: `${theme['card-bg']}dd`,
        boxShadow: theme.shadow,
      }}
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
          <button
            className="theme-toggle-btn"
            onClick={toggleMode}
            title={mode === 'light' ? '切换到暗色模式' : '切换到亮色模式'}
          >
            <i className={mode === 'light' ? 'fas fa-moon' : 'fas fa-sun'}></i>
          </button>
        </div>
      </div>

      <style>{`
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 1000;
          backdrop-filter: blur(5px);
        }

        .navbar-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 15px;
          height: ${navbar.height}px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .navbar-brand {
          display: flex;
          align-items: center;
          font-weight: 700;
          font-size: 20px;
          color: ${theme.secondary};
        }

        .navbar-brand img {
          height: 36px;
          margin-right: 10px;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .nav-links a {
          padding: 8px 15px;
          color: ${theme['text-color']};
          font-weight: 500;
          border-radius: 4px;
          display: flex;
          align-items: center;
        }

        .nav-links a i {
          margin-right: 8px;
          font-size: 16px;
        }

        .theme-toggle-btn {
          background: none;
          border: none;
          padding: 8px 15px;
          color: ${theme['text-color']};
          font-size: 16px;
          cursor: pointer;
          border-radius: 4px;
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
            background: ${theme['card-bg']};
            flex-direction: column;
            padding: 20px;
            box-shadow: ${theme.shadow};
            transform: translateY(-150%);
            transition: transform 0.4s ease;
          }

          .nav-links.active {
            transform: translateY(0);
          }

          .nav-links a {
            width: 100%;
            margin: 5px 0;
            padding: 12px 15px;
          }

          .theme-toggle-btn {
            width: 100%;
            text-align: left;
            padding: 12px 15px;
          }
        }
      `}</style>
    </nav>
  );
}
