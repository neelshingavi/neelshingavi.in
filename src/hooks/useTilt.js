import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export function useTilt(max = 8, scaleTo = 1.015) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(hover: none)').matches) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const rotX = gsap.quickTo(el, 'rotateX', { duration: 0.4, ease: 'power3.out' });
    const rotY = gsap.quickTo(el, 'rotateY', { duration: 0.4, ease: 'power3.out' });
    const scale = gsap.quickTo(el, 'scale', { duration: 0.4, ease: 'power3.out' });

    gsap.set(el, { transformPerspective: 900 });

    const handleMove = (e) => {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      rotY((px - 0.5) * max * 2);
      rotX(-(py - 0.5) * max * 2);
      el.style.setProperty('--gx', `${px * 100}%`);
      el.style.setProperty('--gy', `${py * 100}%`);
    };

    const enter = () => scale(scaleTo);
    const leave = () => {
      rotX(0);
      rotY(0);
      scale(1);
    };

    el.addEventListener('pointermove', handleMove, { passive: true });
    el.addEventListener('pointerenter', enter);
    el.addEventListener('pointerleave', leave);

    return () => {
      el.removeEventListener('pointermove', handleMove);
      el.removeEventListener('pointerenter', enter);
      el.removeEventListener('pointerleave', leave);
      gsap.set(el, { clearProps: 'transform' });
    };
  }, [max, scaleTo]);

  return ref;
}
