import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

export function BackToTop() {
  const { theme } = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      className={`back-to-top ${isVisible ? 'visible' : ''}`}
      onClick={scrollToTop}
      aria-label="回到顶部"
      style={{
        backgroundColor: theme.primary,
        color: 'white',
        '--primary-rgb': theme.primary.replace(/[rgb()]/g, ''),
      } as React.CSSProperties}
    >
      <i className="fas fa-arrow-up"></i>
    </button>
  );
}