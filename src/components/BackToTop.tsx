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
          width: 54px;
          height: 54px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          opacity: 0;
          visibility: hidden;
          transform: translateY(30px) scale(0.8);
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          z-index: 1000;
          box-shadow: 0 6px 20px rgba(52, 152, 219, 0.3);
          will-change: opacity, transform, box-shadow;
        }

        .back-to-top.visible {
          opacity: 1;
          visibility: visible;
          transform: translateY(0) scale(1);
          animation: bounceIn 0.5s var(--ease-out-back) forwards;
        }

        .back-to-top:hover {
          transform: translateY(-3px) scale(1.08);
          box-shadow: 0 10px 30px rgba(52, 152, 219, 0.5);
        }

        .back-to-top:active {
          transform: translateY(-1px) scale(1.02);
        }

        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: translateY(30px) scale(0.5);
          }
          60% {
            transform: translateY(-5px) scale(1.1);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (max-width: 768px) {
          .back-to-top {
            width: 48px;
            height: 48px;
            bottom: 20px;
            right: 20px;
            font-size: 20px;
          }
        }
      `}</style>
    </button>
  );
}