import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const moodBySection = {
  systems: '#00a6a6',
  work: '#ff5e3a',
  wins: '#e1b92f',
  contact: '#bff205',
};

export function useSectionMood() {
  useEffect(() => {
    const triggers = Object.entries(moodBySection).map(([id, color]) =>
      ScrollTrigger.create({
        trigger: `#${id}`,
        start: 'top center',
        end: 'bottom center',
        onEnter: () => {
          document.body.setAttribute('data-section', id);
          window.dispatchEvent(new CustomEvent('section-mood', { detail: { color } }));
        },
        onEnterBack: () => {
          document.body.setAttribute('data-section', id);
          window.dispatchEvent(new CustomEvent('section-mood', { detail: { color } }));
        },
      })
    );
    return () => triggers.forEach((t) => t.kill());
  }, []);
}
