import { useEffect, useRef } from 'react';

/**
 * Canvas-based floating particle field.
 * Ported & adapted from Portfolio_series fx.tsx (Sushmita Dasari, 196★).
 * Pauses when off-screen via IntersectionObserver.
 * Respects prefers-reduced-motion.
 */
export function FxParticles({
  count = 40,
  color = '191,242,5',
  color2 = '255,94,58',
  className = '',
}) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0;

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const dots = Array.from({ length: count }, (_, i) => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.8 + 0.4,
      vx: (Math.random() - 0.5) * 0.00010,
      vy: -Math.random() * 0.00022 - 0.00005,
      a: Math.random() * 0.55 + 0.12,
      tw: Math.random() * Math.PI * 2,
      col: i % 3 === 0 ? color2 : color,
    }));

    let raf = 0, running = false, last = performance.now();

    const tick = (now) => {
      const dt = Math.min(50, now - last);
      last = now;
      ctx.clearRect(0, 0, w, h);

      for (const d of dots) {
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        d.tw += dt * 0.0018;

        if (d.y < -0.02) { d.y = 1.02; d.x = Math.random(); }
        if (d.x < -0.02) d.x = 1.02;
        if (d.x > 1.02) d.x = -0.02;

        const alpha = d.a * (0.55 + 0.45 * Math.sin(d.tw));
        ctx.beginPath();
        ctx.fillStyle = `rgba(${d.col},${alpha.toFixed(2)})`;
        ctx.arc(d.x * w, d.y * h, d.r, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !running) {
        running = true;
        last = performance.now();
        raf = requestAnimationFrame(tick);
      } else if (!entry.isIntersecting && running) {
        running = false;
        cancelAnimationFrame(raf);
      }
    });
    io.observe(canvas);

    return () => {
      io.disconnect();
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [count, color, color2]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  );
}
