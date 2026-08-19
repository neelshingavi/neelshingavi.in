import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

const decodePhrases = [
  'INITIALIZING SYSTEM',
  'LOADING ASSETS',
  'ESTABLISHING CONNECTION',
  'NEEL SHINGAVI'
];

export function Preloader({ onComplete }) {
  const ref = useRef(null);
  const counterRef = useRef(null);
  const textRef = useRef(null);
  const svgRef = useRef(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) { setDone(true); onComplete?.(); return; }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => { setDone(true); onComplete?.(); },
      });

      // SVG Draw Animation
      tl.fromTo(
        '.pl-geo-path',
        { strokeDasharray: 800, strokeDashoffset: 800 },
        { strokeDashoffset: 0, duration: 1.5, ease: 'power3.inOut' },
        0
      );

      // Pulse and rotate SVG
      tl.to(
        svgRef.current,
        { rotation: 180, duration: 2, ease: 'power2.inOut' },
        0
      );

      // Decoding Text Effect
      let textObj = { step: 0 };
      tl.to(textObj, {
        step: decodePhrases.length - 1,
        duration: 1.5,
        ease: 'steps(' + (decodePhrases.length - 1) + ')',
        onUpdate: () => {
          if (textRef.current) {
            textRef.current.innerText = `[ ${decodePhrases[Math.round(textObj.step)]} ]`;
          }
        }
      }, 0);

      // Counter Animation
      let counterObj = { val: 0 };
      tl.to(counterObj, {
        val: 100,
        duration: 1.5,
        ease: 'power3.inOut',
        onUpdate: () => {
          if (counterRef.current) {
            let num = Math.round(counterObj.val);
            counterRef.current.innerText = num.toString().padStart(2, '0');
          }
        }
      }, 0);

      // Exit Sequence
      tl.to('.pl-text-wrapper', { opacity: 0, y: 20, duration: 0.4, ease: 'power2.in' }, '+=0.2')
        .to(svgRef.current, {
          scale: 50, // Massive scale up
          opacity: 0,
          duration: 0.8,
          ease: 'power4.in'
        }, '-=0.2')
        .to(ref.current, { opacity: 0, duration: 0.4, ease: 'power2.inOut' }, '-=0.4');
    });

    return () => ctx.revert();
  }, []);

  if (done) return null;
  return (
    <div ref={ref} className="preloader" aria-hidden="true">
      <div className="pl-container">
        {/* Geometric Centerpiece */}
        <div className="pl-svg-wrapper" ref={svgRef}>
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polygon className="pl-geo-path" points="50,5 95,25 95,75 50,95 5,75 5,25" stroke="var(--lime)" strokeWidth="1" />
            <polygon className="pl-geo-path" points="50,25 75,37 75,62 50,75 25,62 25,37" stroke="var(--coral)" strokeWidth="0.5" />
          </svg>
        </div>

        {/* Typographic Layout */}
        <div className="pl-text-wrapper">
          <div className="pl-counter">
            <span ref={counterRef}>00</span><span className="pl-percent">%</span>
          </div>
          <div className="pl-terminal" ref={textRef}>[ BOOT SEQUENCE ]</div>
        </div>
      </div>
    </div>
  );
}
