import { useEffect, useRef } from 'react';

/**
 * Word-by-word blur-to-focus reveal for section headings.
 * Ported from Portfolio_series fx.tsx (Sushmita Dasari, 196★).
 * Each word slides up from behind a clip mask with blur clearing.
 */
export function RevealHeading({ children, as: Tag = 'h2', className = '', staggerMs = 60, delay = 0 }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // We work on text nodes only — split by spaces, preserve HTML if any
    const text = el.textContent?.trim() || '';
    const words = text.split(/\s+/).filter(Boolean);
    if (!words.length) return;

    el.innerHTML = words
      .map(
        (word, i) =>
          `<span style="display:inline-block;overflow:hidden;vertical-align:bottom;padding-bottom:0.05em"><span class="rv-word" style="display:inline-block;transform:translateY(110%) rotate(1.5deg);opacity:0;filter:blur(5px);transition:transform 0.78s cubic-bezier(0.22,1,0.36,1) ${delay + i * staggerMs}ms,opacity 0.78s cubic-bezier(0.22,1,0.36,1) ${delay + i * staggerMs}ms,filter 0.6s cubic-bezier(0.22,1,0.36,1) ${delay + i * staggerMs}ms;will-change:transform,opacity,filter">${word}</span></span>`
      )
      .join(' ');

    const wordEls = el.querySelectorAll('.rv-word');

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          wordEls.forEach((w) => {
            w.style.transform = 'translateY(0) rotate(0deg)';
            w.style.opacity = '1';
            w.style.filter = 'blur(0px)';
          });
          io.disconnect();
        }
      },
      { threshold: 0.2, rootMargin: '-5% 0px' }
    );
    io.observe(el);

    return () => io.disconnect();
  }, [children, staggerMs, delay]);

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
