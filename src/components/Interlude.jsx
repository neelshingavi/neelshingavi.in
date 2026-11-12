import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const activeShadeLifts = new Set();

function syncShade() {
  gsap.to(document.documentElement, {
    '--fx-shade': activeShadeLifts.size > 0 ? 0.28 : 1,
    duration: 0.55,
    overwrite: 'auto',
  });
}

function observeShadeTarget(el, key) {
  if (!el) return undefined;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return undefined;

  const io = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) activeShadeLifts.add(key);
      else activeShadeLifts.delete(key);
      syncShade();
    },
    { threshold: 0.22 }
  );

  io.observe(el);
  return () => {
    io.disconnect();
    activeShadeLifts.delete(key);
    syncShade();
  };
}

export function Interlude({ id, children }) {
  const ref = useRef(null);

  useEffect(() => observeShadeTarget(ref.current, id), [id]);

  return (
    <section id={id} ref={ref} className="fx-interlude" aria-hidden="false">
      <p className="fx-interlude-line">{children}</p>
    </section>
  );
}

/**
 * Coordinates shade lift when the closing Contact bookend enters the viewport.
 */
export function useContactShadeLift() {
  useEffect(() => {
    const el = document.getElementById('contact');
    return observeShadeTarget(el, 'contact');
  }, []);
}
