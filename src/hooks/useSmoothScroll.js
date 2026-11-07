import { useEffect } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export let lenis = null;

export function useSmoothScroll() {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const instance = new Lenis({
      duration: prefersReducedMotion ? 0 : 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo out
      smoothWheel: !prefersReducedMotion,
      syncTouch: false, // better mobile perf — let touch scroll natively
      lerp: prefersReducedMotion ? 1 : 0.1,
      anchors: true,
    });
    lenis = instance;
    if (typeof window !== 'undefined') {
      window.__lenis = instance;
    }

    // Sync Lenis <-> ScrollTrigger so pinned/scrubbed animations track the smoothed position
    instance.on('scroll', ScrollTrigger.update);
    
    const updateLenis = (time) => {
      instance.raf(time * 1000);
    };
    
    gsap.ticker.add(updateLenis);
    gsap.ticker.lagSmoothing(0);

    return () => {
      instance.destroy();
      lenis = null;
      gsap.ticker.remove(updateLenis);
    };
  }, []);
}
