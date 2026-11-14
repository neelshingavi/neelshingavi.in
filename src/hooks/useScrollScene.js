import { useEffect } from 'react';

/**
 * Applies CSS-based scroll entrance animation to all .scroll-scene elements.
 * Call once in App.jsx or main.jsx.
 * Respects prefers-reduced-motion.
 */
export function useScrollScene() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll('.scroll-scene').forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      return;
    }

    const els = document.querySelectorAll('.scroll-scene');
    if (!els.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('scene-visible');
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.08, rootMargin: '-3% 0px' }
    );

    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
}
