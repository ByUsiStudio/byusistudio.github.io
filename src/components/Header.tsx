import { useState, useEffect } from 'react';
import { useTheme } from '../context/theme';
import { useUiConfig } from '../context/uiConfig';

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

  const navbar = config.layout?.navbar;
  if (!navbar) return null;

  const navLinks = navbar.links || [];

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
      style={
        {
          '--nav-bg': `${theme['card-bg']}cc`,
          '--nav-bg-scrolled': `${theme['card-bg']}ee`,
          '--nav-shadow': `0 4px 30px rgba(0, 0, 0, 0.08)`,
          '--nav-shadow-scrolled': `0 8px 40px rgba(0, 0, 0, 0.12)`,
          '--nav-height': `${navbar.height}px`,
          '--secondary': theme.secondary,
          '--primary': theme.primary,
          '--text-color': theme['text-color'],
          '--card-bg': theme['card-bg'],
          '--shadow': theme.shadow,
        } as React.CSSProperties
      }
    >
      <div className="navbar-container" style={{ height: `${navbar.height}px` }}>
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
          <i
            className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'}`}
            style={{ color: theme.secondary }}
          />
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
    </nav>
  );
}
