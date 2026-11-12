import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Triggers a staggered reveal ripple across calendar week columns
 * only after asynchronous activity data has resolved.
 */
export function useHeatmapRipple(containerRef, dataReady) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !dataReady) return undefined;

    const cols = container.querySelectorAll('.gh-cal-col');
    if (!cols.length) return undefined;

    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const tween = gsap.from(cols, {
        opacity: 0,
        scale: 0.65,
        stagger: 0.012,
        duration: 0.35,
        ease: 'power2.out',
        clearProps: 'opacity,transform',
        scrollTrigger: {
          trigger: container,
          start: 'top 86%',
          once: true,
        },
      });

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    });

    return () => mm.revert();
  }, [containerRef, dataReady]);
}

