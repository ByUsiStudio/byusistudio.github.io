import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

export function ScrollProgress() {
  const { theme } = useTheme();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setProgress(Math.min(scrollPercent, 100));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="scroll-progress">
      <div
        className="scroll-progress-bar"
        style={{
          width: `${progress}%`,
          backgroundColor: theme.primary,
        }}
      />

      <style>{`
        .scroll-progress {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background: rgba(0, 0, 0, 0.05);
          z-index: 9999;
        }

        .scroll-progress-bar {
          height: 100%;
          transition: width 0.15s cubic-bezier(0.215, 0.61, 0.355, 1);
          border-radius: 0 4px 4px 0;
          box-shadow: 0 0 10px currentColor;
          position: relative;
        }

        .scroll-progress-bar::after {
          content: '';
          position: absolute;
          right: 0;
          top: 0;
          width: 12px;
          height: 100%;
          background: inherit;
          border-radius: 50%;
          transform: scale(0);
          transition: transform 0.2s ease;
        }

        .scroll-progress-bar:hover::after {
          transform: scale(1);
        }
      `}</style>
    </div>
  );
}