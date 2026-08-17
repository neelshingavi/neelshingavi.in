import { useEffect, useRef, useState } from 'react';

const GLYPHS = '!<>-_\\/[]{}—=+*^?#________';

export function useScrambleText(target) {
  const [display, setDisplay] = useState(target);
  const frame = useRef(0);
  const raf = useRef(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) { setDisplay(target); return; }

    let queue = target.split('').map((ch, i) => ({
      to: ch, start: Math.floor(i * 1.4), end: Math.floor(i * 1.4) + 12,
    }));
    frame.current = 0;

    const tick = () => {
      let output = '';
      let complete = 0;
      for (const q of queue) {
        if (frame.current >= q.end) { output += q.to; complete += 1; }
        else if (frame.current >= q.start) { output += GLYPHS[Math.floor(Math.random() * GLYPHS.length)]; }
        else { output += ' '; }
      }
      setDisplay(output);
      if (complete < queue.length) { frame.current += 1; raf.current = requestAnimationFrame(tick); }
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target]);

  return display;
}
