import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';

export function Preloader({ onComplete }) {
  const root = useRef(null);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useLayoutEffect(() => {
    const finish = () => {
      if (completedRef.current) return;
      completedRef.current = true;
      onCompleteRef.current?.();
    };

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      finish();
      return undefined;
    }

    const nameLines = document.querySelectorAll('.fx-name-line > span');
    const lights = document.querySelector('.fx-lights');

    const tl = gsap.timeline({ onComplete: finish });

    if (nameLines.length) {
      gsap.set(nameLines, { yPercent: 110 });
    }
    if (lights) {
      gsap.set(lights, { opacity: 1 });
    }

    tl.to(
      root.current,
      { clipPath: 'inset(0 0 100% 0)', duration: 0.65, ease: 'power4.inOut' },
      0
    );

    if (lights) {
      tl.to(lights, { opacity: 0, duration: 0.9, ease: 'power2.out' }, 0.08);
    }

    if (nameLines.length) {
      tl.to(
        nameLines,
        { yPercent: 0, duration: 0.82, stagger: 0.08, ease: 'power4.out' },
        0.2
      );
    }

    const skip = () => {
      tl.progress(1);
    };

    window.addEventListener('keydown', skip, { once: true });
    window.addEventListener('pointerdown', skip, { once: true });

    return () => {
      window.removeEventListener('keydown', skip);
      window.removeEventListener('pointerdown', skip);
      tl.kill();
      if (lights) gsap.set(lights, { opacity: 0 });
      if (nameLines.length) gsap.set(nameLines, { yPercent: 0 });
    };
  }, []);

  return <div ref={root} className="fx-curtain" aria-hidden="true" />;
}
