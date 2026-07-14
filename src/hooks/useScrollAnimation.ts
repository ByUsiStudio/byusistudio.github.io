import { useEffect, useRef, useCallback } from 'react';

type AnimationType = 
  | 'slide-up'
  | 'slide-down'
  | 'slide-left'
  | 'slide-right'
  | 'fade'
  | 'scale'
  | 'fade-up'
  | 'fade-down'
  | 'fade-left'
  | 'fade-right';

interface UseScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
  animationClass?: string;
  animationType?: AnimationType;
  staggerDelay?: number;
  onEnter?: (element: HTMLElement) => void;
  onLeave?: (element: HTMLElement) => void;
}

const animationTypeMap: Record<AnimationType, string> = {
  'slide-up': 'scroll-animate',
  'slide-down': 'scroll-animate-up',
  'slide-left': 'scroll-animate-right',
  'slide-right': 'scroll-animate-left',
  'fade': 'scroll-animate-fade',
  'scale': 'scroll-animate-scale',
  'fade-up': 'scroll-animate',
  'fade-down': 'scroll-animate-up',
  'fade-left': 'scroll-animate-right',
  'fade-right': 'scroll-animate-left',
};

export function useScrollAnimation(options: UseScrollAnimationOptions = {}) {
  const {
    threshold = 0.1,
    rootMargin = '0px 0px -50px 0px',
    once = true,
    animationClass = 'animated',
    animationType = 'slide-up',
    staggerDelay = 0,
    onEnter,
    onLeave,
  } = options;

  const observerRef = useRef<IntersectionObserver | null>(null);
  const observedElementsRef = useRef<Map<HTMLElement, number>>(new Map());
  const indexCounterRef = useRef(0);

  const observe = useCallback((elements: HTMLElement[]) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const baseAnimationClass = animationTypeMap[animationType] || 'scroll-animate';

    elements.forEach((element, index) => {
      element.classList.add(baseAnimationClass);
      observedElementsRef.current.set(element, indexCounterRef.current + index);
    });
    indexCounterRef.current += elements.length;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const element = entry.target as HTMLElement;
          const elementIndex = observedElementsRef.current.get(element) || 0;
          const delay = staggerDelay * elementIndex;

          if (entry.isIntersecting) {
            if (delay > 0) {
              element.style.transitionDelay = `${delay}ms`;
            }
            element.classList.add(animationClass);
            onEnter?.(element);

            if (once) {
              observerRef.current?.unobserve(element);
            }
          } else {
            if (!once) {
              element.classList.remove(animationClass);
              element.style.transitionDelay = '';
              onLeave?.(element);
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
  }, [threshold, rootMargin, once, animationClass, animationType, staggerDelay, onEnter, onLeave]);

  const observeSingle = useCallback((element: HTMLElement) => {
    if (!observerRef.current) {
      observe([]);
    }

    const baseAnimationClass = animationTypeMap[animationType] || 'scroll-animate';
    element.classList.add(baseAnimationClass);
    observedElementsRef.current.set(element, indexCounterRef.current++);

    observerRef.current?.observe(element);
  }, [animationType, observe]);

  const unobserve = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    observedElementsRef.current.clear();
    indexCounterRef.current = 0;
  }, []);

  useEffect(() => {
    return () => {
      unobserve();
    };
  }, [unobserve]);

  return { observe, observeSingle, unobserve };
}

export function useStaggeredAnimation(
  containerRef: React.RefObject<HTMLElement | null>,
  options: Omit<UseScrollAnimationOptions, 'animationClass'> & {
    selector?: string;
  } = {}
) {
  const { selector = '> *', ...scrollOptions } = options;

  useEffect(() => {
    if (!containerRef.current) return;

    const elements = Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(selector)
    );

    const { observe, unobserve } = useScrollAnimation({
      ...scrollOptions,
      staggerDelay: scrollOptions.staggerDelay || 100,
    });

    observe(elements);

    return () => {
      unobserve();
    };
  }, [containerRef, selector, scrollOptions]);
}
