import { useEffect, useState } from 'react';

export function backgroundTier() {
  if (typeof window === 'undefined') return 'poster';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'poster';

  const canvas = document.createElement('canvas');
  if (!canvas.getContext || !canvas.getContext('2d')) return 'poster';

  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) return 'poster';

  const conn = navigator.connection;
  if (conn) {
    if (conn.saveData) return 'poster';
    if (['slow-2g', '2g', '3g'].includes(conn.effectiveType)) return 'poster';
  }

  return window.innerWidth < 768 ? 'mobile' : 'desktop';
}

export function useBackgroundTier() {
  const [tier, setTier] = useState('poster');

  useEffect(() => {
    const update = () => setTier(backgroundTier());
    update();

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    mq.addEventListener('change', update);
    window.addEventListener('resize', update);
    return () => {
      mq.removeEventListener('change', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return tier;
}

export function useCanRunBackgroundAnimation() {
  return useBackgroundTier() !== 'poster';
}
