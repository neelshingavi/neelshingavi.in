import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

/**
 * Section wrapper that fades in + scales up as it enters the viewport.
 * Ported from Portfolio_series Scene.tsx (Sushmita Dasari, 196★).
 * Drop-in: wrap any <section> content with <ScrollScene id="...">
 */
export function ScrollScene({ id, children, className = '' }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'start 0.52'],
  });

  const opacity = useTransform(scrollYProgress, [0, 1], [0.08, 1]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.965, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [32, 0]);

  return (
    <motion.section
      id={id}
      ref={ref}
      style={{ opacity, scale, y }}
      className={`relative scroll-mt-16 ${className}`}
    >
      {children}
    </motion.section>
  );
}
