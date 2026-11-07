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
      autoRaf: true,
      duration: prefersReducedMotion ? 0 : 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo out
      smoothWheel: !prefersReducedMotion,
      syncTouch: false, // better mobile perf — let touch scroll natively
      lerp: prefersReducedMotion ? 1 : 0.1,
      anchors: { offset: -80 },
      allowNestedScroll: true,
      prevent: (node) => {
        if (!node || typeof node.closest !== 'function') return false;
        return (
          !!node.closest('[data-lenis-prevent]') ||
          !!node.closest('.cmd-list-container') ||
          !!node.closest('.cmd-palette-modal') ||
          !!node.closest('.mobile-nav-drawer') ||
          !!node.closest('.gh-calendar-wrapper')
        );
      },
    });
    lenis = instance;
    if (typeof window !== 'undefined') {
      window.__lenis = instance;
    }

    // Sync Lenis <-> ScrollTrigger so pinned/scrubbed animations track the smoothed position
    instance.on('scroll', ScrollTrigger.update);

    return () => {
      instance.destroy();
      lenis = null;
    };
  }, []);
}
