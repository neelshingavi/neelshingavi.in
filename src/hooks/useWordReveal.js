import { useEffect, useRef } from 'react';

/**
 * Wraps each word in a section heading with .fx-word-wrap > .fx-word-inner
 * and triggers reveal via IntersectionObserver.
 * Usage: const ref = useWordReveal(); <h2 ref={ref}>Section Title</h2>
 */
export function useWordReveal(options = {}) {
  const ref = useRef(null);
  const { threshold = 0.3, rootMargin = '-4% 0px', staggerMs = 65 } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Split text into word spans
    const original = el.innerHTML;
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words
      .map(
        (word, i) =>
          `<span class="fx-word-wrap" style="transition-delay:${i * staggerMs}ms"><span class="fx-word-inner" style="transition-delay:${i * staggerMs}ms">${word}</span></span>`
      )
      .join(' ');

    const wraps = el.querySelectorAll('.fx-word-wrap');

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          wraps.forEach((w) => w.classList.add('is-visible'));
          io.disconnect();
        }
      },
      { threshold, rootMargin }
    );
    io.observe(el);

    return () => {
      io.disconnect();
      el.innerHTML = original;
    };
  }, [threshold, rootMargin, staggerMs]);

  return ref;
}
