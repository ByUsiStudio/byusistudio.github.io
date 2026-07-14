import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

export function MouseFollower() {
  const { theme } = useTheme();
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const rippleIdRef = useRef(0);
  const rafRef = useRef<number>();
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseDown = () => {
      setIsPressed(true);
      const newRipple = {
        id: rippleIdRef.current++,
        x: targetRef.current.x,
        y: targetRef.current.y,
      };
      setRipples((prev) => [...prev, newRipple]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
      }, 600);
    };

    const handleMouseUp = () => {
      setIsPressed(false);
    };

    const animate = () => {
      currentRef.current.x += (targetRef.current.x - currentRef.current.x) * 0.15;
      currentRef.current.y += (targetRef.current.y - currentRef.current.y) * 0.15;
      setPosition({ ...currentRef.current });
      rafRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    <>
      <div
        className={`mouse-follower ${isPressed ? 'pressed' : ''}`}
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          '--primary': theme.primary,
          '--primary-rgb': theme.primary.replace(/[rgb()]/g, ''),
        } as React.CSSProperties}
      >
        <div className="mouse-follower-ring mouse-follower-ring-1"></div>
        <div className="mouse-follower-ring mouse-follower-ring-2"></div>
        <div className="mouse-follower-dot"></div>
      </div>
      {ripples.map((ripple) => (
        <div
          key={ripple.id}
          className="mouse-ripple"
          style={{
            left: ripple.x,
            top: ripple.y,
            '--primary': theme.primary,
            '--primary-rgb': theme.primary.replace(/[rgb()]/g, ''),
          } as React.CSSProperties}
        />
      ))}
    </>
  );
}