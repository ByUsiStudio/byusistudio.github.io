import { useEffect, useRef, useCallback } from 'react';

export function useScrollAnimation(options: {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
} = {}) {
  const {
    threshold = 0.1,
    rootMargin = '0px 0px -50px 0px',
    once = true,
  } = options;

  const observerRef = useRef<IntersectionObserver | null>(null);

  const observe = useCallback((elements: HTMLElement[]) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animated');
            if (once) {
              observerRef.current?.unobserve(entry.target);
            }
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    elements.forEach((element) => {
      observerRef.current?.observe(element);
    });
  }, [threshold, rootMargin, once]);

  const unobserve = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
  }, []);

  useEffect(() => {
    return () => {
      unobserve();
    };
  }, [unobserve]);

  return { observe, unobserve };
}
