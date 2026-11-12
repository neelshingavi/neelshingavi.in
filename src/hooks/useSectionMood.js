import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const IDS = ['hero', 'systems', 'experience', 'work', 'cadence', 'wins', 'skills', 'contact'];

export function useSectionMood() {
  useEffect(() => {
    document.body.dataset.section = 'hero';

    const triggers = IDS.map((id) =>
      ScrollTrigger.create({
        trigger: `#${id}`,
        start: 'top 55%',
        end: 'bottom 55%',
        onToggle: (s) => {
          if (s.isActive) {
            document.body.dataset.section = id;
          }
        },
      })
    );

    return () => {
      triggers.forEach((t) => t.kill());
    };
  }, []);
}
