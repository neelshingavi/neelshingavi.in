# Neel Shingavi Portfolio — "Next Level" Animation & Interaction Overhaul
### A deep, implementation-ready plan for `neelshingavi.in`

> Researched against current (2026) Awwwards / Codrops / GSAP-ecosystem practice, then mapped precisely onto your existing codebase (React 19 + Vite 8 + Framer Motion 12 + GSAP 3.15 + Three.js r184). Nothing here asks you to rip anything out — it's a layered upgrade on top of what you already have.

---

## Part 0 — Audit: what you already have (and why it's a good base)

I read through your repo (`App.jsx`, `BackgroundScene.jsx`, `Reveal.jsx`, `styles.css`, `portfolio.js`, hooks, package.json) before writing this. You're closer to "wow" than you think — most portfolios asking for this treatment are starting from a plain Tailwind template. You're not.

**What's already strong:**
- **Real WebGL background** — a hand-rolled Three.js wireframe terrain + particle field (`BackgroundScene.jsx`), not a stock hero image.
- **Custom cursor system** with GSAP `quickTo`, color-swapping based on hover target, and a `prefers-reduced-motion` bail-out.
- **Scroll-linked progress bar** driven by Framer Motion's `useScroll`/`useSpring`.
- **A real design language**: ink/paper duotone, lime/coral/teal/gold accent system, grain overlay via inline SVG turbulence filter, 84px grid background, Bricolage Grotesque type.
- **`Reveal` component** — a clean, reusable `whileInView` wrapper already respecting reduced motion.
- **Good engineering hygiene** — lazy-loaded `BackgroundScene`, `ErrorBoundary`, WebGL capability detection (`useCanRunWebGL`), analytics hooks, dynamic document-title scroll percentage. This tells me whoever built this (you) cares about production quality, not just visual flash.

**What's missing relative to Awwwards-tier sites** — and what this doc fixes:
1. No **smooth/inertia scroll** (Lenis) — GSAP ScrollTrigger and native scroll fighting each other slightly.
2. Text arrives as whole blocks (`opacity`/`y` on the whole `<h1>`) — no **character/word-level kinetic typography**.
3. No **scroll-scrubbed** (`scrub: true`) animation — everything is trigger-once (`whileInView`), so scrolling *feels* the same speed as animation. Award-winning sites tie animation progress directly to scroll position.
4. Project cards are static `Reveal` blocks — no **magnetic hover, 3D tilt, or image distortion**.
5. No **page-load / preloader sequence** — the site just appears.
6. The WebGL scene is **decorative but not reactive** — it doesn't respond to scroll, section, or cursor beyond ambient noise.
7. No **section-to-section transition personality** — background stays static ink; award sites often shift ambient color/mood per section.
8. Hero, timeline, and skills are **fixed vertical stacks** — no horizontal scroll set-piece anywhere (a hallmark of "premium" case-study sections).

Everything below is scoped to fix these eight gaps, roughly in priority order, using the stack you already ship.

---

## Part 1 — Direction: don't redesign, *choreograph*

Your visual identity (ink/paper, lime/coral/teal/gold, grain, grid, Bricolage Grotesque, wireframe terrain) is distinctive and already reads as "engineer who has taste," which is the right positioning for a backend/AI product engineer. The move here is **not** a redesign — it's adding *motion choreography* on top: kinetic type, scroll-scrubbed storytelling, magnetic/tactile interactions, and a background that visibly reacts to the user. That combination — strong static design + generous, physics-feeling motion — is exactly the throughline across current Awwwards Site-of-the-Day winners and the GSAP/Lenis "cinematic scroll" pattern that's dominant right now.

**Reference pattern you're aiming for:** sites like Awwwards-recognized studio portfolios (e.g. the "Nomo Agency"-style cinematic-motion sites) pair three things: (1) inertia-based smooth scroll, (2) scroll-scrubbed reveals instead of one-shot fade-ins, and (3) tactile hover physics (magnetism, distortion, tilt) on every clickable surface. That's the recipe below.

---

## Part 2 — The stack: what to add

Your current dependencies already cover 80% of this. Here's the delta.

| Package | Why | Tier |
|---|---|---|
| `lenis` | Inertia-based smooth scroll, syncs with GSAP ScrollTrigger. ~3KB. Industry-standard pairing with GSAP in 2026 (replaces old `@studio-freight/react-lenis`, which is deprecated — use the `lenis/react` import from the main `lenis` package). | **Essential** |
| `gsap/ScrollTrigger` | Already ships inside your `gsap@3.15` install — just needs `gsap.registerPlugin(ScrollTrigger)`. | **Essential** |
| `gsap/SplitText` | **Now free** as of GSAP 3.13 (previously a paid "Club GSAP" plugin) — no license needed. Splits text into chars/words/lines for kinetic typography. | **Essential** |
| `gsap/Flip` | Free. For layout transitions (e.g., project card → full case-study view morph). | **Recommended** |
| `gsap/Observer` | Free. Cleaner cross-device pointer/wheel/touch handling than raw event listeners (useful for the horizontal scroll section). | **Recommended** |
| `@react-three/fiber` + `@react-three/drei` *(optional)* | Only if you want to evolve `BackgroundScene` into something scroll-reactive with less imperative Three.js boilerplate. Not required — your current vanilla Three.js approach is fine and lighter. | **Optional** |
| `ogl` *(optional, advanced tier)* | A ~30KB minimal WebGL library, lighter than three.js, popular for single-purpose shader hover effects (image distortion/RGB-shift on project thumbnails). Use only if you want the Tier-3 shader effects in Part 4.7. | **Optional / Advanced** |

Everything else (Framer Motion for micro-interactions, your existing GSAP install, Three.js) stays exactly as is.

```bash
npm install lenis
# gsap/SplitText, gsap/ScrollTrigger, gsap/Flip, gsap/Observer are already inside your gsap package — no install needed, just import + register.
```

---

## Part 3 — Global systems (build these first — everything else depends on them)

### 3.1 Lenis smooth scroll, synced to GSAP's ticker

This is the single highest-leverage change. It makes *every* existing animation feel more expensive than it is, because scroll itself gains momentum/easing instead of being the browser's default jump-scroll.

Create `src/hooks/useSmoothScroll.js`:

```js
import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useSmoothScroll() {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const lenis = new Lenis({
      duration: prefersReducedMotion ? 0 : 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo out
      smoothWheel: !prefersReducedMotion,
      syncTouch: false, // better mobile perf — let touch scroll natively
      lerp: prefersReducedMotion ? 1 : 0.1,
    });

    // Sync Lenis <-> ScrollTrigger so pinned/scrubbed animations track the smoothed position
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove((time) => lenis.raf(time * 1000));
    };
  }, []);
}
```

Call `useSmoothScroll()` once at the top of `App.jsx`. Two details that matter:
- **`autoRaf` is implicitly off** here because we drive Lenis from `gsap.ticker` instead — this avoids two competing `requestAnimationFrame` loops (a common source of scroll jank you'll see mentioned everywhere in 2026 Lenis writeups).
- Your existing `html { scroll-behavior: smooth }` in `styles.css` should be **removed** once Lenis is in — the two smooth-scroll systems will otherwise conflict on anchor-link jumps (`#work`, `#contact`, etc.).

### 3.2 Cursor 2.0 — extend, don't replace

Your GSAP `quickTo` cursor is already good. Two additions:

1. **`mix-blend-mode: difference`** on the cursor ring so it inverts over any background color automatically — removes the need to hand-maintain the `--hover-color` per-section logic for contrast, only keep it for the *accent* swap you already do.
2. **Magnetic snap** on primary buttons/nav items (see Part 5.1) — the cursor should visibly get "pulled" toward interactive elements, not just change color.

```css
.cursor-ring {
  mix-blend-mode: difference;
  background: transparent;
}
```

### 3.3 Scroll-reactive background scene

Right now `BackgroundScene.jsx` animates on an internal clock only. Make it *read* scroll progress so the terrain/particles feel connected to where the user is on the page — this is a cheap, high-impact change (a few lines) that makes the WebGL layer feel intentional rather than decorative.

```js
// inside BackgroundScene.jsx, add:
import { useMotionValueEvent, useScroll } from 'framer-motion';

// inside the component, before the effect that builds the scene:
const { scrollYProgress } = useScroll();
const scrollRef = useRef(0);
useMotionValueEvent(scrollYProgress, 'change', (v) => { scrollRef.current = v; });

// inside animate(time), replace the wave displacement line with:
const scrollBoost = scrollRef.current * 6; // terrain rises/reacts as user scrolls
verts[i + 2] = original[i + 2]
  + Math.sin(x * 0.08 + seconds) * 1.7
  + Math.cos(y * 0.12 + seconds * 1.25) * 1.2
  + scrollBoost;

// also drift camera height with scroll for a subtle parallax descent:
camera.position.y = 20 - scrollRef.current * 14;
camera.lookAt(0, -4, 0);
```

Also swap the particle color per section (lime → coral → teal → gold) using `ScrollTrigger`-driven callbacks — see 3.4.

### 3.4 Section-mood shifts (ambient color morphing)

Register one `ScrollTrigger` per `<section>` that:
- Toggles a `data-section` attribute on `<body>` (used for subtle CSS variable shifts — e.g., grain opacity, grid line tint).
- Tweens the WebGL particle material color toward that section's accent.

```js
// src/hooks/useSectionMood.js
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
        onEnter: () => document.body.setAttribute('data-section', id),
        onEnterBack: () => document.body.setAttribute('data-section', id),
      })
    );
    return () => triggers.forEach((t) => t.kill());
  }, []);
}
```

```css
/* styles.css — subtle, not garish */
body[data-section='work'] { --grid-tint: rgba(255, 94, 58, 0.05); }
body[data-section='systems'] { --grid-tint: rgba(0, 166, 166, 0.05); }
body[data-section='wins'] { --grid-tint: rgba(225, 185, 47, 0.05); }
body[data-section='contact'] { --grid-tint: rgba(191, 242, 5, 0.05); }
```

### 3.5 Load sequence (preloader → hero handoff)

A one-time entrance sequence sells production quality more than almost anything else. Keep it **short** (900ms–1.3s max — long preloaders are a top complaint in 2026 UX critiques of over-engineered portfolios).

```jsx
// src/components/Preloader.jsx
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

export function Preloader({ onComplete }) {
  const ref = useRef(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) { setDone(true); onComplete?.(); return; }

    const tl = gsap.timeline({
      onComplete: () => { setDone(true); onComplete?.(); },
    });
    tl.fromTo('.preloader-mark', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' })
      .to('.preloader-bar-fill', { scaleX: 1, duration: 0.7, ease: 'power2.inOut' }, '-=0.1')
      .to('.preloader-mark', { opacity: 0, duration: 0.25 }, '+=0.1')
      .to(ref.current, { yPercent: -100, duration: 0.6, ease: 'power4.inOut' }, '-=0.1');
  }, []);

  if (done) return null;
  return (
    <div ref={ref} className="preloader" aria-hidden="true">
      <span className="preloader-mark">NS</span>
      <div className="preloader-bar"><div className="preloader-bar-fill" /></div>
    </div>
  );
}
```

```css
.preloader {
  position: fixed; inset: 0; z-index: 999;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 18px;
  background: var(--ink);
}
.preloader-mark { font-size: 14px; letter-spacing: 0.3em; color: var(--lime); }
.preloader-bar { width: 160px; height: 2px; background: var(--line); overflow: hidden; }
.preloader-bar-fill { width: 100%; height: 100%; background: var(--lime); transform: scaleX(0); transform-origin: 0 50%; }
```

Gate the hero's own entrance animations (your existing `initial`/`animate` blocks) behind `onComplete` so they fire the instant the preloader clears, not before — otherwise you get two disconnected entrance beats.

---

## Part 4 — Section-by-section plan

### 4.1 Navigation

- Add a **magnetic pull** to nav links and the "Resume" pill (code in Part 5.1).
- Replace the plain `active` class swap with a **sliding underline/pill indicator** that GSAP-morphs its `x`/`width` to the active link's bounding box — feels alive instead of a hard class toggle.

```js
useEffect(() => {
  const active = document.querySelector(`.nav-links a.active`);
  const indicator = indicatorRef.current;
  if (active && indicator) {
    const { offsetLeft, offsetWidth } = active;
    gsap.to(indicator, { x: offsetLeft, width: offsetWidth, duration: 0.45, ease: 'power3.out' });
  }
}, [activeSection]);
```

### 4.2 Hero — the highest-value section to upgrade

Right now `<h1>Neel Shingavi</h1>` fades/slides as one block. Split it to characters for a proper kinetic-type reveal, and make the type-cycle line (`heroText`) scramble-decode on change instead of just cross-fading.

**Name reveal with SplitText** (replace the existing `m.h1` initial/animate block):

```jsx
import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
gsap.registerPlugin(SplitText);

function HeroName() {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const split = new SplitText(ref.current, { type: 'chars', charsClass: 'char' });
    if (prefersReducedMotion) { gsap.set(split.chars, { opacity: 1, y: 0 }); return () => split.revert(); }

    gsap.fromTo(split.chars,
      { yPercent: 130, opacity: 0, rotateZ: 6 },
      { yPercent: 0, opacity: 1, rotateZ: 0, duration: 1.05, stagger: 0.028, ease: 'power4.out', delay: 0.15 }
    );
    return () => split.revert();
  }, []);
  return <h1 id="hero-title" ref={ref}>Neel Shingavi</h1>;
}
```

```css
.char { display: inline-block; will-change: transform, opacity; }
```

**Scramble-decode on the rotating role text** (`heroText` from `useTypeCycle`) — swap the plain text swap for a per-character glyph-scramble that resolves to the real word, the "sci-fi terminal" pattern that reads as premium on developer portfolios specifically:

```js
// src/hooks/useScrambleText.js
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
```

Use it as `const scrambled = useScrambleText(heroText);` and render `{scrambled}` in place of `{heroText}` inside your existing `.type-line`.

**Portrait**: add a subtle scroll-scrubbed parallax (portrait moves slower than page scroll) instead of only the one-shot entrance you have now:

```js
gsap.to('.hero-portrait', {
  yPercent: 14,
  ease: 'none',
  scrollTrigger: { trigger: '.hero-section', start: 'top top', end: 'bottom top', scrub: 0.6 },
});
```

### 4.3 Metric strip

Keep `AnimatedCounter` as-is (it's already doing the right thing). Add: pin the strip briefly and scrub each stat's counter to scroll position instead of viewport-entry, so scrubbing back up visibly de-counts — small detail, disproportionately satisfying.

### 4.4 About / Systems section

Your `system-grid` (Backend Architecture / LLM Analytics / Workflow Automation / Client Delivery) is a perfect candidate for **staggered 3D tilt tiles**: on scroll into view, tiles rotate in from a slight Y-axis flip (`rotateY: -25 → 0`) with `stagger`, then on hover, tilt toward the cursor (see Part 5.2 tilt hook) — reinforcing "systems/architecture" thematically with literal 3D structure.

### 4.5 Experience timeline

This is your best candidate for a **scroll-scrubbed drawing line**: replace the static timeline with a vertical SVG line whose `stroke-dashoffset` scrubs from 0→100% as the user scrolls through the `experience-section`, with each `timeline-block` lighting up (`opacity`/accent color) as the line passes it.

```js
gsap.fromTo('.timeline-progress-line',
  { scaleY: 0 },
  { scaleY: 1, ease: 'none', transformOrigin: 'top',
    scrollTrigger: { trigger: '.timeline-layout', start: 'top center', end: 'bottom center', scrub: true } }
);
```

```css
.timeline-progress-line {
  position: absolute; left: 0; top: 0; width: 2px; height: 100%;
  background: linear-gradient(var(--lime), var(--coral));
  transform: scaleY(0); transform-origin: top;
}
```

### 4.6 Work / Projects — the centerpiece

This section carries the most weight for a "product engineer" portfolio and deserves the most investment. Three layered upgrades, in order of effort:

**Tier 1 (do this, ~1 hour): Magnetic 3D tilt cards.** Every `.project-card` tilts toward the cursor on hover with a light spring, and the `.project-index` number counter-rotates for depth (see Part 5.2 for the reusable hook).

**Tier 2 (do this, ~2–3 hours): Scroll-scrubbed horizontal reveal for the project index numbers + stack tags** — instead of all cards fading in together, pin the section briefly and let cards enter with a slight X-axis offset staggered to scroll, so the grid "assembles" as you scroll rather than snapping in.

```js
gsap.from('.project-card', {
  y: 60, opacity: 0, rotateX: 8,
  stagger: 0.09, ease: 'power3.out',
  scrollTrigger: { trigger: '.project-grid', start: 'top 80%', end: 'top 30%', scrub: 0.5 },
});
```

**Tier 3 (advanced/optional, ~half day): WebGL image-distortion hover** on project thumbnails, if you add a representative screenshot/mockup image per project. This is the single most "how did they do that" effect in the current Codrops/Awwwards catalogue: a plane rendered via WebGL (using the lightweight `ogl` library or raw Three.js) with a fragment shader that displaces pixels toward the cursor on hover — an RGB-shift/lens-bulge look rather than a flat CSS `scale()`.

Minimal `ogl`-based version (only pursue this if you add project screenshots — right now your cards are text-only, so Tier 1+2 give you 90% of the payoff for a fraction of the effort):

```js
// Simplified fragment shader concept — displacement based on distance to pointer
const fragment = `
  precision highp float;
  uniform sampler2D tMap;
  uniform vec2 uMouse;
  uniform float uHover;
  varying vec2 vUv;
  void main() {
    vec2 uv = vUv;
    float dist = distance(uv, uMouse);
    float strength = smoothstep(0.4, 0.0, dist) * uHover * 0.06;
    uv += (uv - uMouse) * strength;
    gl_FragColor = texture2D(tMap, uv);
  }
`;
```

If this feels like too much for now, **park it explicitly as a v2 item** — it needs real project imagery to look right, and text-only cards with Tier 1+2 already outperform most template portfolios.

**Also worth adding:** a case-study "expand" using **GSAP Flip** — clicking a project card morphs it (via `Flip.from`) into a full-width detail panel instead of navigating away, keeping the user in flow:

```js
import { Flip } from 'gsap/Flip';
gsap.registerPlugin(Flip);

function expandCard(card) {
  const state = Flip.getState(card);
  card.classList.add('project-card--expanded');
  Flip.from(state, { duration: 0.6, ease: 'power3.inOut', absolute: true });
}
```

### 4.7 Skills section

Turn the flat `skills-board` grid into a **constellation/orbit layout** on desktop (each `SkillBadge` magnetically drifts on cursor proximity, like iron filings near a magnet) while keeping the current grid as the mobile fallback. This is a nice-to-have — don't let it block shipping the higher-priority sections first.

Simpler, still-effective alternative: give each `SkillBadge` the same magnetic-hover treatment as your buttons (Part 5.1), plus a per-badge `rotate` micro-tilt on hover. Consistent tactility across the whole page matters more than any single flashy section.

### 4.8 Wins / Achievements

Your `signal-map` achievement grid is a good fit for a **shockwave-on-scroll-enter** pattern: as each `signal-node` enters, it "pops" with a slight overshoot (`ease: 'back.out(1.7)'`) and briefly flashes its accent color as a radial glow, echoing the "detonate/settle" tile-wall pattern currently trending in the GSAP hover-effect catalogues — but triggered by scroll instead of click, since these are trophies, not buttons.

```js
gsap.from('.signal-node', {
  scale: 0.85, opacity: 0,
  stagger: { each: 0.08, from: 'random' },
  ease: 'back.out(1.6)',
  scrollTrigger: { trigger: '.signal-map', start: 'top 75%' },
});
```

### 4.9 Contact

- Give the primary email/phone actions the magnetic treatment.
- Add a **liquid/morph submit button** on `ContactForm`: idle state is a pill labeled "Send message"; on submit, it morphs to a circular spinner, then to a checkmark on success — all via one GSAP timeline animating `border-radius`/`width`, no separate icon components needed.
- Micro-interaction: focused form fields get an animated underline that draws left-to-right (`scaleX: 0 → 1`), matching the timeline-line motif from 4.5 for visual rhyme across the page.

### 4.10 Footer

Add a large, slow horizontal **marquee** of your name/role or a repeated phrase ("PRODUCT ENGINEER · BACKEND SYSTEMS · AI ANALYTICS ·") behind or above the footer text — cheap to build with a CSS `@keyframes translateX` infinite loop (no JS needed), and it's a strong closing beat that most template portfolios skip entirely.

```css
.footer-marquee {
  display: flex; white-space: nowrap; overflow: hidden;
  font-size: clamp(2.5rem, 8vw, 5rem); font-weight: 700; opacity: 0.06;
}
.footer-marquee span { display: inline-block; padding-right: 2rem; animation: marquee 22s linear infinite; }
@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
```

(Duplicate the text node once inside so the 50% loop point is seamless.)

---

## Part 5 — Reusable micro-interaction primitives

### 5.1 Magnetic hover hook (use on: nav links, primary/secondary buttons, resume pill, contact links, skill badges)

```js
// src/hooks/useMagnetic.js
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export function useMagnetic(strength = 0.35) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || window.matchMedia('(hover: none)').matches) return undefined; // skip on touch

    const xTo = gsap.quickTo(el, 'x', { duration: 0.55, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.55, ease: 'power3.out' });

    const handleMove = (e) => {
      const { left, top, width, height } = el.getBoundingClientRect();
      const relX = e.clientX - (left + width / 2);
      const relY = e.clientY - (top + height / 2);
      xTo(relX * strength);
      yTo(relY * strength);
    };
    const reset = () => { xTo(0); yTo(0); };

    el.addEventListener('mousemove', handleMove);
    el.addEventListener('mouseleave', reset);
    return () => {
      el.removeEventListener('mousemove', handleMove);
      el.removeEventListener('mouseleave', reset);
    };
  }, [strength]);

  return ref;
}
```

Usage: `const magneticRef = useMagnetic(0.3); <a ref={magneticRef} className="primary-action">…</a>`

### 5.2 3D tilt-on-hover hook (use on: project cards, system tiles)

```js
// src/hooks/useTilt.js
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export function useTilt(max = 8) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(hover: none)').matches) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const rotX = gsap.quickTo(el, 'rotateX', { duration: 0.4, ease: 'power3.out' });
    const rotY = gsap.quickTo(el, 'rotateY', { duration: 0.4, ease: 'power3.out' });
    const scale = gsap.quickTo(el, 'scale', { duration: 0.4, ease: 'power3.out' });

    const handleMove = (e) => {
      const { left, top, width, height } = el.getBoundingClientRect();
      const px = (e.clientX - left) / width - 0.5;
      const py = (e.clientY - top) / height - 0.5;
      rotY(px * max);
      rotX(-py * max);
    };
    const enter = () => scale(1.02);
    const leave = () => { rotX(0); rotY(0); scale(1); };

    gsap.set(el, { transformPerspective: 800 });
    el.addEventListener('mousemove', handleMove);
    el.addEventListener('mouseenter', enter);
    el.addEventListener('mouseleave', leave);
    return () => {
      el.removeEventListener('mousemove', handleMove);
      el.removeEventListener('mouseenter', enter);
      el.removeEventListener('mouseleave', leave);
    };
  }, [max]);
  return ref;
}
```

### 5.3 Line-draw underline (use on: links inside body copy, active nav state, form field focus)

```css
.underline-draw { position: relative; }
.underline-draw::after {
  content: ''; position: absolute; left: 0; bottom: -2px; width: 100%; height: 1px;
  background: currentColor; transform: scaleX(0); transform-origin: left;
  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}
.underline-draw:hover::after { transform: scaleX(1); }
```

---

## Part 6 — Performance, accessibility, and mobile strategy (non-negotiable)

You've already built the right instincts here (`useCanRunWebGL`, `ErrorBoundary`, reduced-motion checks) — extend the same discipline to everything new:

1. **`prefers-reduced-motion` everywhere.** Every hook above already checks it — keep that pattern strict for anything you add. Skip ScrollTrigger setup entirely (not just shorten durations) when it's set.
2. **`(hover: none)` guard on all hover-only effects** (magnetic, tilt) — touch devices should get the resting state, not a half-triggered hover.
3. **Kill Lenis smooth scroll on touch** (`syncTouch: false`) — native touch scroll is faster and more predictable than simulated inertia on mobile; Lenis is primarily a desktop-feel upgrade.
4. **Budget your `scrub` triggers.** Scroll-scrubbed animations (timeline line, hero portrait parallax, project grid assembly) run on every scroll frame — keep them to `transform`/`opacity` only (GPU-accelerated), never animate `width`/`top`/`left` in a scrubbed trigger.
5. **`will-change` sparingly** — only on elements mid-interaction (add via JS on `mouseenter`, remove on `mouseleave`), not applied statically in CSS, to avoid memory bloat.
6. **SplitText cleanup** — always call `split.revert()` in the effect's cleanup function (shown in 4.2) or you'll leak DOM nodes on re-render/HMR.
7. **Keep the Tier-3 shader effects (4.6) fully optional and lazy-loaded** the same way you already lazy-load `BackgroundScene` — gate behind `useCanRunWebGL` and a viewport/pointer capability check, and never let it block first paint.
8. **Re-run Lighthouse after each phase.** The single biggest risk with this plan is accumulating enough simultaneous scroll-linked animation that mid-range Android devices start dropping frames. Ship in phases (Part 7) and profile after each one.

---

## Part 7 — Implementation roadmap (suggested order)

| Phase | Scope | Effort | Payoff |
|---|---|---|---|
| **1** | Lenis smooth scroll (3.1) + magnetic hook (5.1) applied to all buttons/nav + cursor blend-mode (3.2) | ~2–3 hrs | Immediately makes the whole site *feel* more expensive |
| **2** | Hero SplitText name reveal + scramble type-cycle (4.2) + preloader (3.5) | ~3–4 hrs | Biggest first-impression jump |
| **3** | Project card tilt (5.2) + scroll-scrubbed grid assembly (4.6 Tier 1–2) | ~2–3 hrs | Your most important section, now your strongest |
| **4** | Timeline scroll-line (4.5) + wins shockwave stagger (4.8) + about tilt tiles (4.4) | ~3 hrs | Fills out the mid-page rhythm |
| **5** | Section mood-morphing (3.4) + scroll-reactive WebGL terrain (3.3) | ~2 hrs | Ties the whole page together |
| **6** | Contact liquid-button + underline draws (4.9, 5.3) + footer marquee (4.10) | ~1–2 hrs | Polished closing beat |
| **7 (optional)** | Project image-distortion shader (4.6 Tier 3) + skills constellation (4.7) | ~half day+ | High "wow," only worth it once you have project screenshots |

Ship phases 1–3 first and get feedback (yours and others') before committing to 4–7 — that's where most of the perceived "crazy animation" jump happens, and it de-risks the rest.

---

## Further reading (for implementation reference, not reproduced here)

- GSAP + Lenis official integration pattern — gsap.com community docs and the Lenis (darkroom.engineering) README.
- GSAP SplitText docs — confirms free-tier availability as of GSAP 3.13.
- Codrops (tympanus.net) — "How to Animate WebGL Shaders with GSAP" (Oct 2025) for the Tier-3 image-distortion approach if you pursue it.
- GSAP Vault's hover/text-animation effect catalogues — good for browsing additional micro-interaction ideas beyond what's scoped here.

---

### TL;DR
Your foundation (WebGL scene, GSAP cursor, Framer Motion reveals, a genuinely distinctive design system) is already better than most portfolios asking for this. The gap to "crazy/extraordinary" is entirely about **motion choreography**, not a redesign: add Lenis for physics-based scroll, scrub animations to scroll position instead of triggering once, split your hero text into characters, make every clickable thing magnetic, and let your existing WebGL background actually react to the user. Ship it in the seven phases above.
