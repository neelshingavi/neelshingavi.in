# neelshingavi.in — Creative Upgrade Technical Spec

> Source of truth: `/Users/macbook/Desktop/Portfolio` (React 19 · Vite 8 · GSAP 3.15 · Framer Motion 12 · Lenis 1.3).
> Goal: same content, memorable execution. Every proposal below reuses data that already exists in `src/data/*`.

---

## Table of contents

0. Scope, method, confidence levels
1. System inventory (what actually ships today)
2. Diagnosis: why it reads as "normal" (with evidence)
3. Verified defects and dead code (D1–D12)
4. Phase 0 — foundation (z-scale, `motion.css`, mood, transition conflicts, magnet, tilt)
5. Move A — Hero depth + intro
6. Move B — Proof-by-simulation (project demos)
7. Move C — Wins as a crowd funnel
8. Move D — Rhythm: multi-segment video scrub, interludes, bookend, footer
9. Secondary upgrades (type system, transitions, constellation, heatmap, cursor, palette)
10. Mobile pipeline
11. Performance budget, accessibility, test plan
12. What not to do
13. Roadmap and effort
14. Content flags found while reading
15. Appendix — file change map

---

## 0. Scope, method, confidence levels

**Read:** `package.json`, `index.html`, `vite.config.js`, `vercel.json`, `encode-bg-video.sh`, `src/App.jsx`, `src/main.jsx`, all three stylesheets, every hook, and these components: `ScrubVideoBackground`, `Preloader`, `Reveal`, `HeroCapabilities`, `ProjectCard`, `SystemsNetwork`, `ExperienceTimeline`, `AchievementGallery`, `CodingActivityShowcase`, `QueryPilotPipeline`, `TradersDeskArchitecture`, `ProjectCaseStudyModal`, `CommandPalette`, `SkillBadge`, `AnimatedMetric`, `AnimatedCounter`. Data: `portfolio.js`, `architecture.js`, `caseStudies.js`. Viewed: `poster.v1.webp`, PNG frames 140 and 280.

**Not read:** `GitHubActivity`, `LeetCodeActivity`, `CodeforcesActivity`, `ContactForm`, `MobileNav`, `ProjectFilters`, `navigation.js`, `codingProfiles.js`, `analytics.js`, SVG blueprints, `.env*` (deliberately skipped).

**Not seen:** the rendered page. `web_fetch` on the live URL returns only the `<noscript>` shell. No screenshots were taken.

Confidence tags used below:

| Tag | Meaning |
|---|---|
| **[V]** | Verified directly in source |
| **[C]** | Computed from source values (arithmetic, not observed) |
| **[H]** | Hypothesis; confirm in a browser |

---

## 1. System inventory

### 1.1 Stack **[V]**

| Concern | Implementation |
|---|---|
| UI | React 19.2, `StrictMode`, Framer `LazyMotion` + `domAnimation` |
| Scroll | Lenis 1.3 with `autoRaf: true`, `syncTouch: false`, `lerp: 0.1`, `anchors.offset: -80` |
| Scroll-linked animation | GSAP ScrollTrigger (synced via `lenis.on('scroll', ScrollTrigger.update)`) |
| Text | GSAP SplitText (`type: 'words'`, hero only) |
| Background | Single `<video>` scrubbed by ScrollTrigger + static `<div class="bg-poster">` |
| Dimming | CSS `animation-timeline: scroll(root)` on `.bg-shade::after` |
| Cursor | Two fixed divs driven by `gsap.quickTo` |
| 3D/WebGL | **None** (Three.js removed) |
| Build | Vite 8, manual chunks: framer, react, gsap, lucide |

### 1.2 Layer stack today **[V]**

| z-index | Element | Notes |
|---|---|---|
| (canvas) | `html`/`body` background: ink + 84px grid | Hidden under poster/video |
| −3 | `body::before` gradients | Invisible per your own comment in `bg-and-perf.css` |
| 0 | `.bg-poster` | In `index.html`, paints before JS |
| 0 | `.bg-video` | Rendered inside `#root`, fades in after load |
| 0 | `.bg-shade` | In `index.html` **after** `#root`; vignette + dim `::after` |
| 1 | `main`, `footer` | Content |
| 80 | `.site-header` | Fixed |
| 10 | `body::after` | Noise, `opacity: 0.16` |
| 120 | `.progress-bar` | |
| 999 / 1000 | `.cursor-ring` / `.cursor-dot` | `mix-blend-mode: difference` |
| 9999–99999 | Modals, palette, preloader veil | |

The three `z-index: 0` background layers are ordered by DOM position, not by an explicit scale. Anything new that must sit **between** video and shade (the hero depth layer) cannot be inserted cleanly until this is made explicit. That is Phase 0.

### 1.3 Background video pipeline **[V]**

- Source: 280 PNG frames, 1280×720, encoded all-intra (`-g 1`) H.264, `FPS = 24` (≈ 11.67 s).
- `ScrubVideoBackground` downloads the whole file as a Blob up front, sets `video.src = objectURL`, then seeks to `(idx + 0.5) / FPS`.
- One ScrollTrigger: `start: 0`, `end: innerHeight * 3.5`; progress maps linearly to frame `0 → frames−1`.
- Easing: `shownFrame += (targetFrame − shownFrame) * 0.3` per rAF, one seek in flight at a time.
- After 3.5 screens the last frame (frame 280, facing camera) is held for the rest of the page.
- Gate (`useCanRunBackgroundAnimation`): disabled when `innerWidth < 768`, reduced motion, no Canvas 2D, `hardwareConcurrency < 4`, `saveData`, or `slow-2g/2g/3g`. Disabled users keep only the poster.

### 1.4 Dimming **[V]**

```css
.bg-shade::after { background:#07050b; opacity:.58; }           /* fallback */
@supports (animation-timeline: scroll()) {
  .bg-shade::after { opacity:0; animation: bg-dim-in 1ms linear both;
                     animation-timeline: scroll(root); animation-range: 0px 140vh; }
  @keyframes bg-dim-in { to { opacity:.66 } }
}
```

So in supporting browsers the portrait is undimmed at scroll 0 and 66% dimmed from 140vh onward.

### 1.5 CSS cascade **[V]**

| File | Size | Role |
|---|---|---|
| `styles.css` | ~37 KB | Base tokens, header, legacy card classes |
| `bg-and-perf.css` | ~85 KB | Background layers **plus** all Phase-02/03 component CSS (name is misleading) |
| `editorial-design-system.css` | ~34 KB | Phase-B overrides, compact project grid, modal |

Imported in that order in `main.jsx`. Several rules use `!important` (hero CTAs, skill badges, nav active). New effects will lose specificity fights unless isolated (Phase 0).

---

## 2. Diagnosis: why it reads as "normal"

| # | Observation | Evidence | Effect |
|---|---|---|---|
| 1 | Effects set to near-invisible magnitudes | `useTilt(3)` → `rotY(px*3)`, `px ∈ [−0.5, 0.5]` → **±1.5°** **[C]**. Hero reveal `y: 15`. `Reveal` `y: 36`. `--grid-tint` alpha `0.05`. Magnetic strength `0.2–0.3`. | 20 quiet effects, 0 memorable ones |
| 2 | Signature asset under-used | Scrub range = 3.5 screens; then held + dimmed 0.66 + covered by opaque cards (`#11130e`) | Portrait is a hero-only feature |
| 3 | Mobile gets none of it | `innerWidth < 768` ⇒ poster only | Likely a large share of recruiter views |
| 4 | Single repeating section template | `Reveal(eyebrow + h2 + subtext)` → grid of bordered rounded cards, mono labels, lime hover border | No change of scale or density across 7 sections |
| 5 | No type-scale contrast | `.section-heading h2 { font-size: clamp(2rem,3.8vw,3rem); font-family: sans; weight 700 }` ⇒ max 48 px. Serif only on `h1`, one title, footer brand. | Editorial intent lost |
| 6 | Hero is a UI dashboard | 5 stacked blocks, 12 clickable elements (5 capability pills + 2 CTAs + 5 social pills) | Competes with the portrait |
| 7 | Hero copy overlaps the face | At 1440×900, content-left = (1440−1240)/2 + 64 ≈ 164 px; summary `max-width: 780px` ⇒ x ≈ 164–944. Video cover-fit: 900/720 × 1280 = 1600 px wide, crop 80 px each side; face centre ≈ 0.51×1600 − 80 ≈ 736 px, width ≈ 275 px ⇒ x ≈ 600–875. **[C][H]** | Text across jaw/neck + a 95% left scrim to compensate |
| 8 | Content told, not shown | Strongest material (sync, safety gate, 52,000-team funnel) is paragraphs/pills | Claims, not proof |

Principle for the redesign: **pick three loud moments, keep everything else quiet, and make every effect carry existing content.**

---

## 3. Verified defects and dead code

### D1 — Section mood is invisible **[V]**
`useSectionMood` sets `body[data-section]`, which changes `--grid-tint`. That variable is consumed only by the **body background grid**, which sits underneath the fixed poster/video. Additionally `transition: --grid-tint 0.8s` does nothing because the property is not registered with `@property`. The `section-mood` `CustomEvent` is dispatched but nothing listens (the WebGL scene that did was removed).
**Fix:** §4.3.

### D2 — Skill filter dims every project for 28 of 40 skills **[V][C]**
`ProjectCard` matches with exact lowercase equality:
```js
project.stack?.some(s => s.toLowerCase() === highlightedSkill.toLowerCase())
```
Skills list: 40 items. Project `stack` arrays (from `portfolio.js`) match only 12: Java, Python, SQL, FastAPI, Hibernate ORM, PostgreSQL, SQLite, Supabase, React.js, LangChain, LLM APIs, Data Analytics. Near-misses: skill `Java Swing` vs stack `Swing`; skill `REST APIs` vs stack `HTTP APIs`. Clicking any of the other 28 (Docker, Git, Redis, Node.js, …) sets `isSkillDimmed = true` on **all five** cards (opacity 0.45) under a banner saying "Highlighting projects built with Docker".
**Fix:** §9.5 (single source of truth + alias map + empty state).

### D3 — Two divergent stack lists per project **[V]**
`portfolio.js` vs `caseStudies.js`:

| Project | `portfolio.js` | `caseStudies.js` adds/changes |
|---|---|---|
| TradersDesk | `HTTP APIs` | `REST APIs` |
| QueryPilot | — | `Pandas` |
| CertiCraft | `QR Systems`, `Email Automation` | `QR Cryptographic Systems`, `Email Queues`, `Node.js` |
| FounderFlow | — | `React.js`, `State Management` |

**Fix:** derive card stacks from `caseStudies.js` (or the reverse); never maintain two.

### D4 — Card spotlight variables are orphaned **[V]**
`ProjectCard.handleMouseMove` sets `--card-mx/--card-my`. The only CSS that reads them targets `.project-card::before` (the legacy class). `.project-compact-card` has no consumer.

### D5 — Tilt is mushy and nearly invisible **[V]**
`.project-compact-card { transition: border-color, transform 0.25s, box-shadow }` re-smooths every GSAP `quickTo` write. You fixed this for `.project-card`/`.system-tile` (`bg-and-perf.css` §4) but the live class is different. Max tilt is ±1.5°.

### D6 — Magnetic buttons have the same transition conflict **[V]**
- `.hero-cta-secondary { transition: all 0.2s ease !important }` while being a `MagneticAction`.
- `.header-action { transition: transform 180ms ease, … }` while being a `MagneticAction`.
- `.primary-action:hover { transform: translate(-3px,-3px) }` is overridden by GSAP's inline `transform` once the element has been pulled, so the offset-shadow hover silently stops translating.
**Fix:** §4.4 (use the individual `translate` property for CSS hover; drop `transform` from transitions).

### D7 — Magnet only reacts inside the element **[V]**
`useMagnetic` listens for `mousemove` on the element itself, so there is no "pull" as the pointer approaches. It is a hover parallax, not magnetism.
**Fix:** §4.5 (shared proximity registry).

### D8 — Preloader is a no-op **[V]**
`Preloader` calls `onComplete()` immediately and removes a 60 ms black veil. There is no entrance sequence.

### D9 — Unplugged code **[V for App.jsx; H for the rest]**
Not referenced in `App.jsx` or any component I opened: `heroRoles`, `stats`, `useTypeCycle`, `useScrambleText`, `AnimatedCounter`, `AnimatedMetric`. Verify against the three activity components before deleting.

### D10 — Orphaned CSS **[V]**
`.project-slot` sticky stacking (≥1024 px), `.hero-portrait`, `.portrait-scan`, `.portrait-tag`, `.background-scene`, `.timeline-layout`, `.signal-*`, `.system-tile`, `.preloader`/`.pl-*` (old counter loader). Delete after confirming no markup uses them (`grep -R "className=.*<name>" src`).

### D11 — Footer marquee is invisible **[V]**
`.footer-marquee { opacity: 0.06 }`, 22 s linear, not tied to scroll.

### D12 — Skill badge icon fallbacks **[V]**
`LOGO_MAP` keys (`React`, `DBMS`, `Data Modeling`, `System Design Basics`, `HTTP API Integration`, `JavaFX`, `VS Code`) don't match actual skill names (`React.js`, `DBMS & Indexing`, `System Design`, `REST APIs`, …). Those badges use the generic grey `Code2` icon.

---

## 4. Phase 0 — foundation (do this first, ~3–4 h)

Rationale: every move below adds layers, transforms, or CSS variables that currently fight an implicit z-order and three overlapping stylesheets. Fix the substrate once.

### 4.1 Explicit z-scale

`src/motion.css` (import **last** in `main.jsx`):

```css
:root {
  --z-poster: 0;
  --z-video: 1;
  --z-name: 2;      /* giant name (Move A) */
  --z-cutout: 3;    /* alpha cutout (Move A) */
  --z-shade: 4;     /* vignette + dim + tint */
  --z-content: 5;   /* main, footer */
  /* header stays 80, noise 10, cursor 999/1000, modals 9999+ */
}

.bg-poster { z-index: var(--z-poster); }
.bg-video  { z-index: var(--z-video); }
.bg-shade  { z-index: var(--z-shade); opacity: var(--fx-shade, 1); }
main, footer { z-index: var(--z-content); }
```

`index.html`: add a mount node **between** poster and `#root`:

```html
<div class="bg-poster" aria-hidden="true"></div>
<div id="fx-depth" aria-hidden="true"></div>   <!-- NOT positioned; see note -->
<div id="root"></div>
<div class="bg-shade" aria-hidden="true"></div>
```

> **Gotcha:** `position: fixed` always creates a stacking context. If `#fx-depth` itself were fixed, its children could not interleave with the video (z 1) and shade (z 4). Leave `#fx-depth` static; make each child `position: fixed` with its own z-index.

### 4.2 Registered custom properties

```css
@property --fx-tint  { syntax: '<color>';  inherits: true; initial-value: rgba(0,0,0,0); }
@property --fx-shade { syntax: '<number>'; inherits: true; initial-value: 1; }
```

### 4.3 Make section mood visible (fixes D1)

Tint the **shade layer** (above the video), not the body grid.

```css
.bg-shade::before {
  content: ''; position: absolute; inset: 0; pointer-events: none;
  background: radial-gradient(90% 70% at 50% 110%, var(--fx-tint), transparent 70%);
  mix-blend-mode: screen;
  transition: --fx-tint .9s ease;
}
body[data-section='hero']       { --fx-tint: rgba(168,114,255,.00); }
body[data-section='systems']    { --fx-tint: rgba(0,229,255,.14); }
body[data-section='experience'] { --fx-tint: rgba(191,242,5,.10); }
body[data-section='work']       { --fx-tint: rgba(255,94,58,.16); }
body[data-section='cadence']    { --fx-tint: rgba(255,161,22,.12); }
body[data-section='wins']       { --fx-tint: rgba(251,192,45,.16); }
body[data-section='skills']     { --fx-tint: rgba(168,114,255,.14); }
body[data-section='contact']    { --fx-tint: rgba(191,242,5,.16); }
```

`useSectionMood.js`:

```js
const IDS = ['hero','systems','experience','work','cadence','wins','skills','contact'];
export function useSectionMood() {
  useEffect(() => {
    const st = IDS.map(id => ScrollTrigger.create({
      trigger: `#${id}`, start: 'top 55%', end: 'bottom 55%',
      onToggle: s => s.isActive && (document.body.dataset.section = id),
    }));
    return () => st.forEach(t => t.kill());
  }, []);
}
```
(Delete the `CustomEvent` dispatch and the `moodBySection` color map.)

### 4.4 Transition/transform conflicts (fixes D5, D6)

Rule: **GSAP owns `transform`. CSS must never transition or set `transform` on the same element.** Use the individual `translate` / `scale` / `rotate` properties in CSS; they compose with `transform` instead of replacing it.

```css
/* motion.css — overrides */
.project-compact-card { transition: border-color .25s ease, box-shadow .25s ease; }
.header-action        { transition: background 180ms ease, box-shadow 180ms ease; }
.hero-cta-secondary   { transition: background .2s ease, border-color .2s ease !important; }

.primary-action:hover { transform: none; translate: -3px -3px; }       /* was transform */
.primary-action:active{ translate: 0 0; }
.hero-cta-primary:hover { transform: none; translate: 0 -2px; }
```

### 4.5 Real magnetism: shared proximity registry (fixes D7)

Why: one `pointermove` listener + cached centers beats 45 element-scoped listeners, and enables an attraction radius.

```js
// hooks/useMagnetic.js
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const entries = new Set();
let raf = 0, px = -9999, py = -9999, bound = false;

function frame() {
  raf = 0;
  for (const e of entries) {
    if (!e.visible) continue;
    const r = e.el.getBoundingClientRect();
    const cx = r.left + r.width / 2 - e.curX();   // remove our own translation
    const cy = r.top + r.height / 2 - e.curY();
    const dx = px - cx, dy = py - cy;
    const dist = Math.hypot(dx, dy);
    if (dist < e.radius) { e.x(dx * e.strength); e.y(dy * e.strength); e.active = true; }
    else if (e.active)   { e.x(0); e.y(0); e.active = false; }
  }
}
function onMove(ev) { px = ev.clientX; py = ev.clientY; if (!raf) raf = requestAnimationFrame(frame); }
function bind() {
  if (bound) return; bound = true;
  window.addEventListener('pointermove', onMove, { passive: true });
}

export function useMagnetic(strength = 0.3, radius = 90) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (matchMedia('(hover: none)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const entry = {
      el, strength, radius: radius + Math.max(el.offsetWidth, el.offsetHeight) / 2,
      x: gsap.quickTo(el, 'x', { duration: .6, ease: 'power3.out' }),
      y: gsap.quickTo(el, 'y', { duration: .6, ease: 'power3.out' }),
      curX: () => gsap.getProperty(el, 'x') || 0,
      curY: () => gsap.getProperty(el, 'y') || 0,
      visible: false, active: false,
    };
    const io = new IntersectionObserver(([i]) => { entry.visible = i.isIntersecting; }, { rootMargin: '120px' });
    io.observe(el); entries.add(entry); bind();
    return () => { io.disconnect(); entries.delete(entry); gsap.set(el, { x: 0, y: 0 }); };
  }, [strength, radius]);
  return ref;
}
```

Notes: only visible entries are measured; reads happen once per rAF; magnetic target is also the element's un-translated center so it never feeds back on itself.

### 4.6 Tilt that is actually visible (fixes D5, D4)

```js
// hooks/useTilt.js — change signature + add glare vars
export function useTilt(max = 8, scaleTo = 1.015) {
  /* …same guards… */
  gsap.set(el, { transformPerspective: 900 });
  const handleMove = (e) => {
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    rotY((px - .5) * max * 2);          // ±max degrees
    rotX(-(py - .5) * max * 2);
    el.style.setProperty('--gx', `${px * 100}%`);
    el.style.setProperty('--gy', `${py * 100}%`);
  };
  /* …enter/leave same, scale(scaleTo)… */
}
```
`ProjectCard`: `useTilt(7)`. Consume the existing `--card-mx/--card-my` (D4) or switch to `--gx/--gy`:

```css
.project-compact-card { position: relative; overflow: hidden; }
.project-compact-card::after {
  content:''; position:absolute; inset:0; pointer-events:none; opacity:0; transition:opacity .3s;
  background: radial-gradient(420px circle at var(--gx,50%) var(--gy,50%), var(--card-accent, rgba(191,242,5,.75)) 0%, transparent 60%);
  mix-blend-mode: soft-light;
}
.project-compact-card:hover::after { opacity:.5; }
```

### 4.7 Dead-code pass (1 h)

1. `grep -R` each orphaned selector from D10; delete matches with zero markup usage.
2. Remove `.background-scene` and old `.preloader` CSS.
3. Move non-background CSS out of `bg-and-perf.css` over time; for now just stop adding to it.
4. Fix D3: derive `projects[].stack` from `projectCaseStudies[id].stack`.

---

## 5. Move A — Hero depth + intro (≈ 1 day)

### 5.1 Why

A flat video hero with text on top reads as a template. Putting the name **between** the background and the subject (head occludes the type) is the cheapest convincing depth cue. It also works on the **static poster**, so phones get it too (§10).

Layer order (bottom → top):

```
poster/video (z1)  →  giant name (z2)  →  alpha cutout of frame 1 (z3)  →  shade (z4)  →  content (z5)
```
The cutout re-paints the head over the name; the name shows only outside the matte.

### 5.2 Cutout pipeline

Frame 1 must match the poster/video first frame pixel-for-pixel; `ezgif-frame-001.png` is that frame (`encode-bg-video.sh` also builds the poster from it).

```bash
# 1. matte (pick the best model on your Mac; test 2)
pip install "rembg[cli]"
rembg i -m birefnet-portrait ezgif-2011b9ceb9b186d2-png-split/ezgif-frame-001.png /tmp/cut.png
#   fallback: -m isnet-general-use

# 2. clean the edge: erode 1px, feather 1px, remove red/purple rim-light fringe
magick /tmp/cut.png \
  \( +clone -alpha extract -morphology Erode Diamond:1 -blur 0x0.8 \) \
  -alpha off -compose CopyOpacity -composite /tmp/cut2.png

# 3. export
cwebp -q 88 -alpha_q 100 -m 6 /tmp/cut2.png -o public/assets/bg/cutout.v1.webp
```
Budget: **< 250 KB**. QA: toggle the cutout over the poster in DevTools at 50% opacity and look for double edges; hair strands and the dark jacket edge are where mattes fail. Version the filename (`/assets/*` is `immutable`).

### 5.3 DOM + CSS

`index.html`: add `<link rel="preload" as="image" href="/assets/bg/cutout.v1.webp" type="image/webp">`.

```jsx
// components/HeroDepth.jsx
import { createPortal } from 'react-dom';
export function HeroDepth() {
  const host = document.getElementById('fx-depth');
  if (!host) return null;
  return createPortal(
    <>
      <div className="fx-name" aria-hidden="true">
        <span className="fx-name-line"><span>NEEL</span></span>
        <span className="fx-name-line"><span>SHINGAVI</span></span>
      </div>
      <img className="fx-cutout" src="/assets/bg/cutout.v1.webp" alt=""
           width="1280" height="720" decoding="async" fetchPriority="high" />
    </>, host);
}
```
Keep the existing `<h1>` for semantics but make it `sr-only`; the visual name is `aria-hidden`.

```css
.fx-name, .fx-cutout { position: fixed; inset: 0; pointer-events: none; }
.fx-name {
  z-index: var(--z-name);
  display: flex; flex-direction: column; justify-content: center;
  padding-left: clamp(16px, 4vw, 64px);
  font-family: 'Instrument Serif', serif; text-transform: uppercase;
  font-size: clamp(4.5rem, 21vw, 22rem); line-height: .82; letter-spacing: -.04em;
  color: rgba(244,240,223,.94);
}
.fx-name-line { display: block; overflow: hidden; }
.fx-name-line > span { display: block; will-change: transform; }

.fx-cutout {
  z-index: var(--z-cutout);
  width: 100%; height: 100%;
  object-fit: cover; object-position: 50% 30%;   /* IDENTICAL to .bg-video / .bg-poster */
}
```
**Alignment invariant:** `.fx-cutout`, `.bg-video`, `.bg-poster` must share `object-fit`, `object-position` and any transform (see §9.7 parallax).

Hero layout after the cut (all existing content, relocated):

| Element | New position |
|---|---|
| Eyebrow | top-left, above name (small) |
| Summary | bottom-left, `max-width: 36ch`, left-aligned (remove `justify`) |
| Primary/secondary CTA | bottom-right |
| Socials (5) | vertical rail, right edge |
| Capability pills + tagline | move to a strip directly below the hero (or into `#systems`) |
| `.hero-section::before` 95% scrim | **delete** |

### 5.4 Scroll-out timeline

```js
// inside a HeroScroll effect
useLayoutEffect(() => {
  const mm = gsap.matchMedia();
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    gsap.timeline({ scrollTrigger: { trigger: '#hero', start: 'top top', end: '+=70%', scrub: true } })
      .to('.fx-cutout', { opacity: 0, ease: 'none', duration: .35 }, 0)           // reveal the head turn
      .to('.fx-name',   { yPercent: -16, opacity: 0, ease: 'none', duration: .8 }, .1);
  });
  mm.add('(prefers-reduced-motion: reduce)', () => {
    const io = new IntersectionObserver(([e]) => {
      document.querySelectorAll('.fx-name,.fx-cutout').forEach(n => n.style.opacity = e.isIntersecting ? 1 : 0);
    });
    io.observe(document.getElementById('hero')); return () => io.disconnect();
  });
  return () => mm.revert();
}, []);
```
Scrub math: progress 0→0.35 of `+=70%` = first ≈ 0.25 screens ⇒ video frame ≈ `0.25/3.5 × 279 ≈ 20`; the head has barely moved, so the swap from cutout → video is invisible.

### 5.5 Intro (replaces D8)

Constraints: ≤ 1.1 s, first visit per session only (you already store `sessionStorage.pl`), must not delay LCP (poster is preloaded), skippable on any key/click.

```js
// Preloader.jsx
export function Preloader({ onComplete }) {
  const root = useRef(null);
  useLayoutEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { onComplete(); return; }
    const tl = gsap.timeline({ onComplete });
    gsap.set('.fx-name-line > span', { yPercent: 110 });
    gsap.set('.fx-lights', { opacity: 1 });                         // dark overlay above the video
    tl.to(root.current, { clipPath: 'inset(0 0 100% 0)', duration: .7, ease: 'power4.inOut' }, 0)
      .to('.fx-lights', { opacity: 0, duration: 1, ease: 'power2.out' }, .1)          // "lights on"
      .to('.fx-name-line > span', { yPercent: 0, duration: .9, stagger: .08, ease: 'power4.out' }, .25);
    const skip = () => tl.progress(1);
    addEventListener('keydown', skip, { once: true }); addEventListener('pointerdown', skip, { once: true });
    return () => { tl.kill(); };
  }, []);
  return <div ref={root} className="fx-curtain" aria-hidden="true" />;
}
```
```css
.fx-curtain { position: fixed; inset: 0; z-index: 99999; background: #0b0c09; clip-path: inset(0); }
```
`.fx-lights` is a plain fixed overlay mounted in `#fx-depth` (not the shade, whose `opacity` is capped at 1, so it cannot be made "darker than default"):

```css
.fx-lights { position: fixed; inset: 0; z-index: var(--z-cutout); background: #07050b; opacity: 0; pointer-events: none; }
```
It sits above name and cutout but below the shade, so the whole hero fades up from black while the name masks in. Tune durations in the browser; total should stay under ~1.1 s.
