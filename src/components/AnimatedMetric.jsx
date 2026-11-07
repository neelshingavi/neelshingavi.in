import { useEffect, useRef, useState } from 'react';

/**
 * Parses a string to check if it contains a leading metric count, e.g.:
 * "250,000+ transactions processed" -> prefix: "", value: 250000, suffix: "+", rest: " transactions processed"
 * "80% manual effort reduction" -> prefix: "", value: 80, suffix: "%", rest: " manual effort reduction"
 * "Sub-200ms real-time streaming" -> prefix: "Sub-", value: 200, suffix: "ms", rest: " real-time streaming"
 */
function parseMetric(text) {
  if (typeof text !== 'string') return null;
  const match = text.match(/^([^\d]*)(\d[\d,]*)([%+a-zA-Z]*)(\s+.*)?$/);
  if (!match) return null;

  const [, prefix, numStr, suffix, rest = ''] = match;
  const cleanNum = parseInt(numStr.replace(/,/g, ''), 10);
  if (Number.isNaN(cleanNum)) return null;

  const useCommas = numStr.includes(',');
  return {
    prefix,
    target: cleanNum,
    suffix,
    rest,
    useCommas,
  };
}

export function AnimatedMetric({ text, className = '' }) {
  const metric = parseMetric(text);
  const containerRef = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [currentVal, setCurrentVal] = useState(0);

  useEffect(() => {
    if (!metric) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setCurrentVal(metric.target);
      setHasAnimated(true);
      return;
    }

    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          observer.disconnect();

          const duration = 1200; // ms
          const startTime = performance.now();
          const target = metric.target;

          const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

          const frame = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = easeOutExpo(progress);
            const val = Math.floor(eased * target);

            setCurrentVal(val);

            if (progress < 1) {
              requestAnimationFrame(frame);
            } else {
              setCurrentVal(target);
            }
          };

          requestAnimationFrame(frame);
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, [metric, hasAnimated]);

  if (!metric) {
    return <strong className={className}>{text}</strong>;
  }

  const formattedNum = hasAnimated
    ? (metric.useCommas ? currentVal.toLocaleString() : currentVal)
    : (metric.useCommas ? metric.target.toLocaleString() : metric.target);

  return (
    <strong ref={containerRef} className={`metric-impact-item ${className}`} aria-label={text}>
      <span className="metric-animated-value" aria-hidden="true">
        {metric.prefix}
        {hasAnimated ? formattedNum : (metric.useCommas ? metric.target.toLocaleString() : metric.target)}
        {metric.suffix}
      </span>
      <span className="metric-rest-text" aria-hidden="true">
        {metric.rest}
      </span>
      <span className="sr-only">{text}</span>
    </strong>
  );
}

