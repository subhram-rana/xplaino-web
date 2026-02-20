import React, { useRef, useState, useEffect } from 'react';
import styles from './ScrollReveal.module.css';

export type ScrollRevealVariant = 'fadeUp' | 'fadeIn' | 'fadeLeft' | 'fadeRight';

interface ScrollRevealProps {
  children: React.ReactNode;
  variant?: ScrollRevealVariant;
  delay?: number;
}

/**
 * ScrollReveal - Wraps content and reveals it with a CSS animation when it enters the viewport.
 * Uses IntersectionObserver; one-shot (stays visible after first reveal).
 */
export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  variant = 'fadeUp',
  delay = 0,
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const variantClass = styles[variant];
  const visibleClass = isVisible ? styles.visible : '';

  return (
    <div
      ref={rootRef}
      className={`${styles.root} ${variantClass} ${visibleClass}`}
      style={delay > 0 ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
};

ScrollReveal.displayName = 'ScrollReveal';
