import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const entries = new Set();
let raf = 0;
let px = -9999;
let py = -9999;
let bound = false;

function frame() {
  raf = 0;
  for (const e of entries) {
    if (!e.visible) continue;
    const r = e.el.getBoundingClientRect();
    const cx = r.left + r.width / 2 - e.curX();
    const cy = r.top + r.height / 2 - e.curY();
    const dx = px - cx;
    const dy = py - cy;
    const dist = Math.hypot(dx, dy);
    if (dist < e.radius) {
      e.x(dx * e.strength);
      e.y(dy * e.strength);
      e.active = true;
    } else if (e.active) {
      e.x(0);
      e.y(0);
      e.active = false;
    }
  }
}

function onMove(ev) {
  px = ev.clientX;
  py = ev.clientY;
  if (!raf) raf = requestAnimationFrame(frame);
}

function onLeaveViewport() {
  px = -9999;
  py = -9999;
  if (!raf) raf = requestAnimationFrame(frame);
}

function bind() {
  if (bound) return;
  bound = true;
  window.addEventListener('pointermove', onMove, { passive: true });
  document.addEventListener('pointerleave', onLeaveViewport, { passive: true });
}

export function useMagnetic(strength = 0.3, radius = 90) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (
      window.matchMedia('(hover: none)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return undefined;
    }

    const entry = {
      el,
      strength,
      radius: radius + Math.max(el.offsetWidth, el.offsetHeight) / 2,
      x: gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' }),
      y: gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' }),
      curX: () => Number(gsap.getProperty(el, 'x')) || 0,
      curY: () => Number(gsap.getProperty(el, 'y')) || 0,
      visible: false,
      active: false,
    };

    const io = new IntersectionObserver(
      ([info]) => {
        entry.visible = info.isIntersecting;
      },
      { rootMargin: '120px' }
    );

    io.observe(el);
    entries.add(entry);
    bind();

    return () => {
      io.disconnect();
      entries.delete(entry);
      gsap.set(el, { x: 0, y: 0 });
    };
  }, [strength, radius]);

  return ref;
}
