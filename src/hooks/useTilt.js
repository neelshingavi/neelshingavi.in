import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export function useTilt(max = 8) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(hover: none)').matches) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const rotX = gsap.quickTo(el, 'rotateX', { duration: 0.4, ease: 'power3.out' });
    const rotY = gsap.quickTo(el, 'rotateY', { duration: 0.4, ease: 'power3.out' });
    const scale = gsap.quickTo(el, 'scale', { duration: 0.4, ease: 'power3.out' });

    const handleMove = (e) => {
      const { left, top, width, height } = el.getBoundingClientRect();
      const px = (e.clientX - left) / width - 0.5;
      const py = (e.clientY - top) / height - 0.5;
      rotY(px * max);
      rotX(-py * max);
    };
    const enter = () => scale(1.02);
    const leave = () => { rotX(0); rotY(0); scale(1); };

    gsap.set(el, { transformPerspective: 800 });
    el.addEventListener('mousemove', handleMove);
    el.addEventListener('mouseenter', enter);
    el.addEventListener('mouseleave', leave);
    return () => {
      el.removeEventListener('mousemove', handleMove);
      el.removeEventListener('mouseenter', enter);
      el.removeEventListener('mouseleave', leave);
    };
  }, [max]);
  return ref;
}
