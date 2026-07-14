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
          height: 3px;
          background: transparent;
          z-index: 9999;
        }

        .scroll-progress-bar {
          height: 100%;
          transition: width 0.2s ease-out;
          border-radius: 0 2px 2px 0;
        }
      `}</style>
    </div>
  );
}