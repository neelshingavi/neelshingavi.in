import { useState, useEffect } from 'react';

export function useCanRunBackgroundAnimation() {
  const [canRun, setCanRun] = useState(false);

  useEffect(() => {
    // 1. Mobile screen check
    if (window.innerWidth < 768) return;

    // 2. Reduced motion check
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // 3. Canvas 2D check
    const canvas = document.createElement('canvas');
    if (!canvas.getContext || !canvas.getContext('2d')) return;

    // 4. Low capability / connection checks
    // Hardware concurrency: typically 4+ cores for decent performance
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) return;

    // Connection: avoid 2g/3g or if saveData is enabled
    if (navigator.connection) {
      if (navigator.connection.saveData) return;
      if (['slow-2g', '2g', '3g'].includes(navigator.connection.effectiveType)) return;
    }

    setCanRun(true);
  }, []);

  return canRun;
}
