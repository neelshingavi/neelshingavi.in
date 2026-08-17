import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export function useMagnetic(strength = 0.35) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || window.matchMedia('(hover: none)').matches) return undefined; // skip on touch

    const xTo = gsap.quickTo(el, 'x', { duration: 0.55, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.55, ease: 'power3.out' });

    const handleMove = (e) => {
      const { left, top, width, height } = el.getBoundingClientRect();
      const relX = e.clientX - (left + width / 2);
      const relY = e.clientY - (top + height / 2);
      xTo(relX * strength);
      yTo(relY * strength);
    };
    const reset = () => { xTo(0); yTo(0); };

    el.addEventListener('mousemove', handleMove);
    el.addEventListener('mouseleave', reset);
    return () => {
      el.removeEventListener('mousemove', handleMove);
      el.removeEventListener('mouseleave', reset);
    };
  }, [strength]);

  return ref;
}
