import { useRef, useCallback } from 'react';

/**
 * Enhanced tilt hook — sets CSS vars for glare (--gx/--gy),
 * 3D rotation (--rx/--ry), and scale (--tilt-scale).
 * Desktop/fine-pointer only. Respects prefers-reduced-motion.
 * Ported/enhanced from Portfolio_series Tilt component (Sushmita Dasari, 196★).
 */
export function useTilt(maxDeg = 5) {
  const ref = useRef(null);
  const rafRef = useRef(null);

  const onPointerMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    if (rafRef.current) return; // already scheduled
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      if (!ref.current) return;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;  // 0→1
      const py = (e.clientY - r.top) / r.height;   // 0→1
      const rx = (py - 0.5) * -maxDeg * 2;         // rotateX
      const ry = (px - 0.5) * maxDeg * 2;          // rotateY
      el.style.setProperty('--gx', `${(px * 100).toFixed(1)}%`);
      el.style.setProperty('--gy', `${(py * 100).toFixed(1)}%`);
      el.style.setProperty('--rx', `${rx.toFixed(2)}deg`);
      el.style.setProperty('--ry', `${ry.toFixed(2)}deg`);
      el.style.setProperty('--tilt-scale', '1.018');
    });
  }, [maxDeg]);

  const onPointerLeave = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
    el.style.setProperty('--tilt-scale', '1');
  }, []);

  // Only attach if fine pointer & motion OK
  const getHandlers = useCallback(() => {
    if (typeof window === 'undefined') return {};
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return {};
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return {};
    return { onPointerMove, onPointerLeave };
  }, [onPointerMove, onPointerLeave]);

  return { ref, ...getHandlers() };
}
