import { useState, useEffect, useRef } from 'react';

interface TypewriterProps {
  text: string;
  speed?: number;
  delay?: number;
  onComplete?: () => void;
}

export function Typewriter({ text, speed = 150, delay = 500, onComplete }: TypewriterProps) {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const indexRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const startTyping = () => {
      if (indexRef.current < text.length) {
        setDisplayText(text.slice(0, indexRef.current + 1));
        indexRef.current++;
        timeoutRef.current = setTimeout(startTyping, speed);
      } else {
        setIsComplete(true);
        onComplete?.();
      }
    };

    const initialDelay = setTimeout(() => {
      startTyping();
    }, delay);

    return () => {
      clearTimeout(initialDelay);
      clearTimeout(timeoutRef.current);
    };
  }, [text, speed, delay, onComplete]);

  return (
    <span className="typewriter-text">
      {displayText}
      {!isComplete && <span className="typewriter-cursor">|</span>}
    </span>
  );
}
