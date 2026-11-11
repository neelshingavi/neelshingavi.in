import { useEffect, useState } from 'react';

/**
 * Lightweight, non-blocking initial page transition.
 * Immediately reveals the hero without artificial delays or fake percentage counters.
 */
export function Preloader({ onComplete }) {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Reveal meaningful hero content immediately without blocking or delay
    onComplete?.();
    const timer = setTimeout(() => {
      setFading(true);
    }, 60);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (fading) return null;

  return (
    <div
      className="preloader-quick-veil"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: '#0b0c09',
        pointerEvents: 'none',
        opacity: fading ? 0 : 1,
        transition: 'opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      aria-hidden="true"
    />
  );
}
