import { useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function HeroDepth() {
  useLayoutEffect(() => {
    const heroEl = document.getElementById('hero');
    if (!heroEl) return undefined;

    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap
        .timeline({
          scrollTrigger: {
            trigger: heroEl,
            start: 'top top',
            end: '+=70%',
            scrub: true,
          },
        })
        .to('.fx-cutout', { opacity: 0, ease: 'none', duration: 0.35 }, 0)
        .to('.fx-name', { yPercent: -16, opacity: 0, ease: 'none', duration: 0.8 }, 0.1);
    });

    mm.add('(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)', () => {
      const rootStyle = document.documentElement.style;
      const state = { px: 0, py: 0, nx: 0 };
      const apply = () => {
        rootStyle.setProperty('--fx-px', `${state.px.toFixed(2)}px`);
        rootStyle.setProperty('--fx-py', `${state.py.toFixed(2)}px`);
        rootStyle.setProperty('--fx-nx', `${state.nx.toFixed(2)}px`);
      };
      const qPx = gsap.quickTo(state, 'px', { duration: 1.1, ease: 'power3.out', onUpdate: apply });
      const qPy = gsap.quickTo(state, 'py', { duration: 1.1, ease: 'power3.out', onUpdate: apply });
      const qNx = gsap.quickTo(state, 'nx', { duration: 1.4, ease: 'power3.out', onUpdate: apply });

      const onMove = (e) => {
        const dx = (e.clientX / window.innerWidth - 0.5) * 16;
        const dy = (e.clientY / window.innerHeight - 0.5) * 10;
        qPx(dx);
        qPy(dy);
        qNx(-dx * 0.6); // opposite direction deepens depth separation
      };

      window.addEventListener('pointermove', onMove, { passive: true });
      return () => {
        window.removeEventListener('pointermove', onMove);
        gsap.killTweensOf(state);
        rootStyle.removeProperty('--fx-px');
        rootStyle.removeProperty('--fx-py');
        rootStyle.removeProperty('--fx-nx');
      };
    });

    mm.add('(prefers-reduced-motion: reduce)', () => {
      const updateVisibility = (visible) => {
        document.querySelectorAll('.fx-name, .fx-cutout').forEach((node) => {
          node.style.opacity = visible ? '1' : '0';
        });
      };

      const io = new IntersectionObserver(([entry]) => {
        updateVisibility(entry.isIntersecting);
      });
      io.observe(heroEl);

      return () => {
        io.disconnect();
        updateVisibility(true);
      };
    });

    return () => mm.revert();
  }, []);

  const host = typeof document !== 'undefined' ? document.getElementById('fx-depth') : null;
  if (!host) return null;

  return createPortal(
    <>
      <div className="fx-name" aria-hidden="true">
        <span className="fx-name-line">
          <span>NEEL</span>
        </span>
        <span className="fx-name-line">
          <span>SHINGAVI</span>
        </span>
      </div>
      <img
        className="fx-cutout"
        src="/assets/bg/cutout.v1.webp"
        alt=""
        width="1280"
        height="720"
        decoding="async"
        fetchPriority="high"
      />
      <div className="fx-lights" aria-hidden="true" />
    </>,
    host
  );
}

