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
      }}
    >
      <i className="fas fa-arrow-up"></i>

      <style>{`
        .back-to-top {
          position: fixed;
          bottom: 30px;
          right: 30px;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          opacity: 0;
          visibility: hidden;
          transform: translateY(20px);
          transition: all 0.3s ease;
          z-index: 1000;
          box-shadow: ${theme.shadow};
        }

        .back-to-top.visible {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        @media (max-width: 768px) {
          .back-to-top {
            width: 45px;
            height: 45px;
            bottom: 20px;
            right: 20px;
            font-size: 18px;
          }
        }
      `}</style>
    </button>
  );
}