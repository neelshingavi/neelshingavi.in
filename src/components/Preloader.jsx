import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

export function Preloader({ onComplete }) {
  const ref = useRef(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) { setDone(true); onComplete?.(); return; }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => { setDone(true); onComplete?.(); },
      });
      tl.fromTo('.preloader-mark', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' })
        .to('.preloader-bar-fill', { scaleX: 1, duration: 0.7, ease: 'power2.inOut' }, '-=0.1')
        .to('.preloader-mark', { opacity: 0, duration: 0.25 }, '+=0.1')
        .to(ref.current, { yPercent: -100, duration: 0.6, ease: 'power4.inOut' }, '-=0.1');
    });

    return () => ctx.revert();
  }, []);

  if (done) return null;
  return (
    <div ref={ref} className="preloader" aria-hidden="true">
      <span className="preloader-mark">NS</span>
      <div className="preloader-bar"><div className="preloader-bar-fill" /></div>
    </div>
  );
}
