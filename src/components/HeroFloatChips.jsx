import { useEffect, useRef } from 'react';

/**
 * Floating glass chips with ambient float and pointer parallax.
 * Ported from Portfolio_series Hero.tsx (Sushmita Dasari, 196★).
 * Desktop only, respects prefers-reduced-motion.
 */
const CHIPS = [
  {
    title: 'PICT Pune',
    sub: 'B.Tech E&TE · 2025–Present',
    className: 'hero-chip-top-left',
    depth: 1.2,
    href: '#skills',
  },
  {
    title: 'Script Lanes',
    sub: 'Full Stack Engineer Intern',
    className: 'hero-chip-mid-left',
    depth: 0.8,
    href: '#experience',
  },
  {
    title: 'Flagship Systems',
    sub: 'TradersDesk · QueryPilot · PayPerUseAI',
    className: 'hero-chip-top-right',
    depth: -1.0,
    href: '#work',
  },
  {
    title: 'Primary Stack',
    sub: 'Java · Python · React · PostgreSQL',
    className: 'hero-chip-mid-right',
    depth: -0.7,
    href: '#skills',
  },
];

export function HeroFloatChips() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isFine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!isFine || reduced) return;

    const container = containerRef.current;
    if (!container) return;

    let raf = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const onPointerMove = (e) => {
      const dx = (e.clientX / window.innerWidth - 0.5) * 24;
      const dy = (e.clientY / window.innerHeight - 0.5) * 16;
      targetX = dx;
      targetY = dy;
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const tick = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      container.style.setProperty('--chip-px', `${currentX.toFixed(2)}px`);
      container.style.setProperty('--chip-py', `${currentY.toFixed(2)}px`);
      if (Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = 0;
      }
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={containerRef} className="hero-chips-container" aria-hidden="true">
      {CHIPS.map((chip, i) => (
        <a
          key={chip.title}
          href={chip.href}
          className={`hero-float-chip ${chip.className}`}
          style={{
            '--chip-depth': chip.depth,
            '--chip-delay': `${i * 0.15}s`,
            animationDelay: `${i * 1.2}s`,
          }}
          tabIndex={-1}
        >
          <span className="hero-chip-dot" />
          <div className="hero-chip-text">
            <span className="hero-chip-title">{chip.title}</span>
            <span className="hero-chip-sub">{chip.sub}</span>
          </div>
        </a>
      ))}
    </div>
  );
}

