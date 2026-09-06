import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/theme';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

export function MouseFollower() {
  const { theme } = useTheme();
  const [particles, setParticles] = useState<Particle[]>([]);
  const particleIdRef = useRef(0);
  const rafRef = useRef<number>();

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      // 用户系统偏好减少动态效果时不生成粒子
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const newParticles: Particle[] = [];
      const particleCount = 12;

      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.3;
        const speed = 3 + Math.random() * 5;
        newParticles.push({
          id: particleIdRef.current++,
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0,
          maxLife: 60 + Math.random() * 20,
          size: 3 + Math.random() * 4,
        });
      }

      setParticles((prev) => [...prev, ...newParticles]);
    };

    const animate = () => {
      setParticles((prev) => {
        return prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.1,
            vx: p.vx * 0.96,
            life: p.life + 1,
          }))
          .filter((p) => p.life < p.maxLife);
      });

      rafRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousedown', handleMouseDown);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    <>
      {particles.map((particle) => {
        const progress = particle.life / particle.maxLife;
        const opacity = 1 - progress;
        const scale = 1 - progress * 0.5;

        return (
          <div
            key={particle.id}
            className="mouse-particle"
            style={
              {
                left: particle.x,
                top: particle.y,
                width: particle.size,
                height: particle.size,
                opacity,
                transform: `scale(${scale})`,
                '--primary': theme.primary,
                '--primary-rgb': theme.primary.replace(/[rgb()]/g, ''),
              } as React.CSSProperties
            }
          />
        );
      })}
    </>
  );
}
