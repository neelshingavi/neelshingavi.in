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
Strong candidates: `.project-slot` sticky stacking (≥1024 px), `.hero-portrait`, `.portrait-scan`, `.portrait-tag`, `.background-scene`. Possible candidates (**[H]**, not individually confirmed): `.timeline-layout`, `.signal-*`, `.system-tile`, `.preloader`/`.pl-*`. Delete only after confirming no markup uses them (`grep -R "<name>" src`).

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

---

## 6. Move B — Proof-by-simulation (≈ 1–1.5 days for the first, ≈ 0.5 day each after)

### 6.1 Why

Recruiters skim; a paragraph about "offline-first sync with eventual consistency" is a claim. A 6-second interaction where the network drops and the queue drains is evidence. The data already exists: `tradersDeskArchitecture.dataFlowSteps`, `queryPilotPipeline.stages`, `projectCaseStudies[*].architecture`.

**Honesty rule (from your own `ABC.md`):** every simulation carries a visible label — `ILLUSTRATIVE SIMULATION · NOT LIVE DATA` — and uses only numbers that already appear in your copy. Never invent throughput figures.

### 6.2 Delivery shape

- New folder `src/components/sim/` with one file per project, each lazy-loaded.
- Surfaced in two places: a compact version in the case-study modal (replacing the stepper-only view in `TradersDeskArchitecture` / `QueryPilotPipeline`), and an optional "▶ Try it" button on the flagship cards.
- Zero new dependencies: React state + SVG + CSS (+ GSAP where timing matters).
- Reduced motion: no timers; drains happen instantly and state changes are announced via `aria-live`.

### 6.3 TradersDesk — offline toggle

Story told: *local commit is instant and works offline; a mutation queue drains to Supabase when the network returns* (matches `local_db`, `sync`, `cloud_db` nodes and data-flow steps 2–4).

```jsx
// sim/TradersDeskSim.jsx
import { useEffect, useReducer } from 'react';

const init = { online: true, seq: 0, local: [], queue: [], cloud: [] };
const amt = (id) => 1200 + ((id * 7919) % 8800);               // deterministic, labelled illustrative

function reducer(s, a) {
  switch (a.type) {
    case 'toggle': return { ...s, online: !s.online };
    case 'add': {
      const id = s.seq + 1;
      const row = { id, ref: `BILL-${String(id).padStart(3, '0')}`, amt: amt(id) };
      return { ...s, seq: id, local: [row, ...s.local].slice(0, 6), queue: [...s.queue, row] };
    }
    case 'drain': {
      if (!s.online || !s.queue.length) return s;
      const [head, ...rest] = s.queue;
      return { ...s, queue: rest, cloud: [head, ...s.cloud].slice(0, 6) };
    }
    default: return s;
  }
}

export default function TradersDeskSim() {
  const [s, dispatch] = useReducer(reducer, init);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (!s.online || !s.queue.length) return;
    if (reduced) { s.queue.forEach(() => dispatch({ type: 'drain' })); return; }
    const t = setTimeout(() => dispatch({ type: 'drain' }), 420);
    return () => clearTimeout(t);
  }, [s.online, s.queue, reduced]);

  return (
    <figure className="sim sim-td" aria-label="TradersDesk offline-first sync simulation">
      <figcaption className="sim-label">ILLUSTRATIVE SIMULATION · NOT LIVE DATA</figcaption>
      <div className="sim-controls">
        <button type="button" onClick={() => dispatch({ type: 'toggle' })} aria-pressed={!s.online}>
          Network: {s.online ? 'ONLINE' : 'OFFLINE'}
        </button>
        <button type="button" onClick={() => dispatch({ type: 'add' })}>+ Record trade</button>
      </div>

      <div className="sim-cols">
        <section><h4>Desktop · SQLite (local ACID)</h4>
          <ul>{s.local.map(r => <li key={r.id} className="row is-local">{r.ref} · ₹{r.amt}</li>)}</ul></section>
        <section className={`sim-wire ${s.online ? 'is-up' : 'is-down'}`}>
          <h4>Sync queue</h4><b className="sim-count">{s.queue.length}</b><span>pending</span></section>
        <section><h4>Supabase · PostgreSQL</h4>
          <ul>{s.cloud.map(r => <li key={r.id} className="row is-cloud">{r.ref}</li>)}</ul></section>
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {s.online ? `Online. ${s.queue.length} pending.` : `Offline. ${s.queue.length} queued locally.`}
      </p>
    </figure>
  );
}
```
Visual spec (CSS): rows enter with `translateY(-8px) → 0` + fade; when offline the wire dashes grey with a "NO SIGNAL" glyph and the queue badge pulses coral; when online, a lime packet (SVG `<circle>` + `offset-path` or a keyed CSS animation per drained row) travels left→right.

### 6.4 QueryPilot — a safety gate that actually runs

Use a **real** validator so the "reject" is genuine behaviour, not a canned animation. Mirror the actual repo logic when you wire it in (I have not seen the Python gate; the token list below is taken from `caseStudies.js`).

```js
// sim/safetyGate.js
const BLOCKED = ['DROP', 'DELETE', 'UPDATE', 'INSERT', 'ALTER', 'TRUNCATE', 'EXEC'];

export function safetyGate(sql) {
  const clean = sql.replace(/--.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '').trim();
  const stmts = clean.split(';').map(x => x.trim()).filter(Boolean);
  if (stmts.length !== 1)            return { pass: false, reason: 'multiple statements' };
  if (!/^select\b/i.test(stmts[0]))  return { pass: false, reason: 'statement is not SELECT' };
  const hit = BLOCKED.find(k => new RegExp(`\\b${k}\\b`, 'i').test(stmts[0]));
  return hit ? { pass: false, reason: `blocked token: ${hit}` }
             : { pass: true,  reason: 'read-only SELECT' };
}
```
Interaction:

1. Two preset chips: **Ask normally** (uses the sample question + SQL already in `stages[].sample`) and **Try to break it** (injects `SELECT 1; DROP TABLE transactions;`).
2. A timeline lights the 7 stages in order (≈ 450 ms each; instant when reduced motion).
3. At stage 5 call `safetyGate(sql)`: pass ⇒ continue to execution and show the existing "Illustrative Insight" string; fail ⇒ stage 5 flashes coral, the downstream stages dim, and the reason is shown.
4. Show the SQL in the existing `code-example-card`; typed with a 12 ms/char reveal.

Do **not** animate any benchmark figure from your case study (latency, record counts). Those are measured claims; show them as static text only.

### 6.5 PayPerUseAI — metered stream

Spec: a monospace stream of fake tokens at ~40 tokens/s; a meter beside it increments `µALGO` per token (label the unit "illustrative"); an escrow bar drains proportionally; on stop, a "settle" animation moves the consumed amount to "provider" and refunds the remainder to "user". If your copy states a latency figure, show it as static text; do not render a live-looking latency number.

### 6.6 CertiCraft — roster → certificates

Spec: 12 roster rows (CSV look) on the left; as the user presses "Run batch", each row spawns a certificate card on the right with a QR glyph stamping on; counter ticks `n / 300` with the headline "300+ participants · under 4 minutes" shown as static text from your outcomes. QR is a decorative SVG pattern — do not claim it is scannable.

### 6.7 FounderFlow — draggable DAG with a real critical path

```js
// sim/criticalPath.js — Kahn topological order + longest path DP
export function criticalPath(tasks) {            // tasks: [{ id, dur, deps: [] }]
  const out = new Map(), indeg = new Map(), dur = new Map();
  tasks.forEach(t => { out.set(t.id, []); indeg.set(t.id, 0); dur.set(t.id, t.dur); });
  tasks.forEach(t => t.deps.forEach(d => { out.get(d).push(t.id); indeg.set(t.id, indeg.get(t.id) + 1); }));

  const q = [...indeg].filter(([, n]) => n === 0).map(([id]) => id);
  const dist = new Map(tasks.map(t => [t.id, t.dur])), prev = new Map(), order = [];
  while (q.length) {
    const u = q.shift(); order.push(u);
    for (const v of out.get(u)) {
      if (dist.get(u) + dur.get(v) > dist.get(v)) { dist.set(v, dist.get(u) + dur.get(v)); prev.set(v, u); }
      indeg.set(v, indeg.get(v) - 1);
      if (indeg.get(v) === 0) q.push(v);
    }
  }
  if (order.length !== tasks.length) return { cycle: true, path: [] };   // circular dependency
  let end = [...dist].sort((a, b) => b[1] - a[1])[0][0];
  const path = [];
  for (let n = end; n; n = prev.get(n)) path.unshift(n);
  return { cycle: false, path, total: dist.get(end) };
}
```
UI: 7–9 nodes in SVG; pointer-drag to move; "add dependency" by dragging from a node port; if `cycle: true` flash the edge coral and reject. Critical-path edges glow lime. This is real behaviour matching your case-study claim (client-side DAG, topological sort, cycle prevention).

### 6.8 Integration notes

- Mount inside `ProjectCaseStudyModal` where `caseStudy.id === ...` already conditionally renders explorers.
- Lazy: `const Sim = lazy(() => import('./sim/TradersDeskSim.jsx'))` inside `<Suspense>`.
- Keep Lenis paused in the modal (already done) and add `data-lenis-prevent` on any internally scrolling sim panel.
- Pointer-drag (FounderFlow) must use `touch-action: none` on the SVG.

---

## 7. Move C — Wins as a crowd funnel (≈ 1 day)

### 7.1 Why

"Top 800 of 52,000+" is a *spatial* fact: rank within a crowd. A dot-field makes it legible in under a second, and every number comes from `detailedAchievements`.

### 7.2 Data (derive from existing; do not retype numbers)

| Stage | Total (stated) | Lit | Meaning |
|---|---|---|---|
| Meta × PyTorch | 52,000 | 800 | Finalist (top 800) |
| InsightX, IIT Bombay | 1,700 | 2 | 2nd place (lit dots = ranks 1–2; rank 2 accented) |
| GDG Cloud Pune | 1,000 | 20 | Finalist (top 20) |
| Algorand HackSeries 3.0 | 800 | 30 | Finalist (top 30) |
| TechSprint'26 | 250 | 1 | 1st place |
| Indradhanu'25 | 250 | 2 | 2nd place |

Totals use the lower bound as written ("1,700+", "52,000+", "1,000+", "800+", "250+"). Add a footnote: *dot count = stated minimum number of teams*.

Add a `funnel` field to `detailedAchievements` (`{ total, lit, rank }`) so the component reads from one place.

### 7.3 Canvas implementation

Cost model: 52,000 `fillRect` calls ≈ low single-digit ms; draw **once per stage** to an offscreen canvas, not per scroll tick.

```jsx
// components/FunnelCanvas.jsx
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

function layout(total, W, H) {
  const cols = Math.ceil(Math.sqrt(total * (W / H)));
  const cell = W / cols;
  return { cols, cell, dot: Math.max(1.2, cell * .55) };
}

function paintBase(ctx, total, lit, rank, W, H, accent) {
  const { cols, cell, dot } = layout(total, W, H);
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(244,240,223,.16)';
  for (let i = lit; i < total; i++) {
    ctx.fillRect((i % cols) * cell, Math.floor(i / cols) * cell, dot, dot);
  }
  ctx.fillStyle = accent;
  const litDot = Math.max(dot, 3);
  for (let i = 0; i < lit; i++) {
    const x = (i % cols) * cell, y = Math.floor(i / cols) * cell;
    ctx.fillRect(x - (litDot - dot) / 2, y - (litDot - dot) / 2, litDot, litDot);
  }
}

export function FunnelCanvas({ stages }) {
  const wrap = useRef(null), a = useRef(null);
  useEffect(() => {
    const canvas = a.current, ctx = canvas.getContext('2d');
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const W = wrap.current.clientWidth, H = wrap.current.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr; ctx.scale(dpr, dpr);

    let current = -1;
    const show = (i) => {
      if (i === current) return; current = i;
      const s = stages[i];
      gsap.to(canvas, { opacity: 0, duration: .15, onComplete: () => {
        paintBase(ctx, s.total, s.lit, s.rank, W, H, s.accent);
        gsap.to(canvas, { opacity: 1, duration: .3 });
        wrap.current.dispatchEvent(new CustomEvent('funnel-stage', { detail: i }));
      }});
    };

    const st = ScrollTrigger.create({
      trigger: wrap.current, pin: true, start: 'top top', end: `+=${stages.length * 70}%`,
      onUpdate: self => show(Math.min(stages.length - 1, Math.floor(self.progress * stages.length))),
      onToggle: self => { canvas.style.visibility = self.isActive ? 'visible' : 'hidden'; }
    });
    show(0);
    return () => st.kill();
  }, [stages]);

  return <div ref={wrap} className="fx-funnel"><canvas ref={a} /></div>;
}
```
Details:

- Pinned section height `≈ stages × 70vh`; Lenis + ScrollTrigger sync (`lenis.on('scroll', ScrollTrigger.update)`) already supports `pin`.
- Beside the canvas render the existing achievement card text for the active stage (title, org, scale, summary) — this keeps the content and gives screen readers the same information.
- Reduced motion / `< 768px`: skip the pin; render a stacked list with a **static** mini dot-field (e.g. 1,200 dots, `lit` scaled proportionally and labelled "not to scale") or just the existing card grid.
- Keep `AchievementGallery` as the accessible fallback and for the "View proof & details" modal.
- Pause: `visibility: hidden` when not active; no per-frame work (the draw happens only on stage change).

Wording fix to make while here (see §14): the section subtext says "Top podium finishes at … Meta, and Algorand"; both were finalist placements.

---

## 8. Move D — Rhythm, multi-segment scrub, bookend, footer (≈ 1 day)

### 8.1 Why

All seven sections have the same density. Rhythm comes from **rest**: a full-bleed pause between dense sections. And the video should keep working after the hero, because it is your only unique asset.

### 8.2 Multi-segment scrub (replaces the single trigger in `ScrubVideoBackground`)

Frame references (from the extracted frames): 1 = facing camera, ~140 = head turned (looking off to screen-right), 280 = facing camera again.

```js
const SEGMENTS = [
  { trigger: '#hero',           start: 'top top',     end: '+=350%',       from: 0,   to: 120 },
  { trigger: '#interlude-work', start: 'top bottom',  end: 'bottom top',   from: 120, to: 200 },
  { trigger: '#contact',        start: 'top bottom',  end: 'center center',from: 200, to: 279 },
];

const progress = new Array(SEGMENTS.length).fill(0);
const recompute = () => {
  let f = 0;
  SEGMENTS.forEach((s, i) => { if (progress[i] > 0) f = s.from + progress[i] * (s.to - s.from); });
  targetFrame = Math.min(f, frames - 1);
  kick();
};
const triggers = SEGMENTS.map((s, i) => ScrollTrigger.create({
  trigger: s.trigger, start: s.start, end: s.end,
  onUpdate: self => { progress[i] = self.progress; recompute(); },
  onRefresh: self => { progress[i] = self.progress; recompute(); },
}));
// cleanup: triggers.forEach(t => t.kill())
```
Why "last segment with progress > 0 wins": scrolling back above a segment resets its progress to 0, so the value falls back to the previous segment's end frame. Choose frame numbers by scrubbing the PNG folder; tune so the head is turned **toward** content when a section is read.

### 8.3 Interludes

Reuse existing copy; no new content. Candidates: "Production software built for measurable outcomes." (Work heading), "Hackathon signal, national scale." (Wins), "Have something worth building?" (Contact).

```jsx
export const Interlude = ({ id, children }) => (
  <section id={id} className="fx-interlude" aria-hidden="false">
    <p className="fx-interlude-line">{children}</p>
  </section>
);
```
```css
.fx-interlude { min-height: 100svh; display: grid; place-items: center; padding: 0 var(--gutter); }
.fx-interlude-line {
  font-family: 'Instrument Serif', serif; font-style: italic; font-weight: 400;
  font-size: clamp(2.6rem, 9vw, 10rem); line-height: .95; letter-spacing: -.03em; max-width: 14ch; text-align: center;
  text-shadow: 0 2px 40px rgba(0,0,0,.6);   /* legibility over a brighter video */
}
```
Lift the shade while an interlude is on screen so the video shows:

```js
ScrollTrigger.create({
  trigger: '.fx-interlude', start: 'top 70%', end: 'bottom 30%',
  onToggle: s => gsap.to(document.documentElement, { '--fx-shade': s.isActive ? .28 : 1, duration: .6, overwrite: 'auto' })
});
```
(`.bg-shade { opacity: var(--fx-shade) }` scales both vignette and dim; the CSS scroll-timeline dim lives *inside* `.bg-shade::after`, so they multiply.)

If an interlude duplicates a section's existing H2, hide that section's H2 visually to avoid saying it twice (keep it in DOM for a11y).

### 8.4 Bookend at Contact

- Segment 3 above scrubs frames 200→279 as the contact section approaches, ending on the camera-facing frame.
- Add an interlude-style shade lift at `#contact`.
- Make `.contact-panel` translucent: `background: rgba(11,12,9,.55); backdrop-filter: none;` (one element, so the compositing cost is fine). Add a hairline border to keep structure.

### 8.5 Footer: velocity-driven marquee + wordmark

```js
// FooterMarquee effect
const tween = gsap.to('.footer-marquee span', { xPercent: -50, repeat: -1, duration: 22, ease: 'none' });
let base = 1;
lenis.on('scroll', ({ velocity }) => {
  const v = gsap.utils.clamp(-30, 30, velocity);
  gsap.to(tween, { timeScale: base + Math.abs(v) * .35, duration: .25, overwrite: true })
      .then?.(() => gsap.to(tween, { timeScale: base, duration: 1.2 }));
  gsap.to('.footer-marquee', { skewX: -v * .4, duration: .3, overwrite: 'auto' });
});
```
Also raise `.footer-marquee` opacity from `0.06` to ~`0.16` and enlarge to `clamp(4rem, 14vw, 12rem)`. Add a giant cropped "NEEL SHINGAVI" wordmark (`font-size: 22vw`, bottom-aligned, half cut off by `overflow: hidden`), letters rising on first view.

(Keep `transform` writes on the marquee spans GSAP-only — same rule as §4.4.)

---

## 9. Secondary upgrades

### 9.1 Type system (CSS first, highest ratio of impact to cost)

Why: you already download Instrument Serif **italic** (`ital@0;1` in the font URL). One serif-italic word per H2 against a bold sans gives the editorial contrast the CSS claims but doesn't deliver.

```css
.section-heading h2 { font-size: clamp(2.4rem, 6vw, 5.5rem); line-height: 1.02; letter-spacing: -.035em; }
.fx-accent { font-family: 'Instrument Serif', serif; font-style: italic; font-weight: 400; font-size: 1.12em; letter-spacing: -.02em; color: var(--paper); }
```
Markup edit (content unchanged): `Production software built for <em class="fx-accent">measurable</em> outcomes.`
Remove `text-align: justify` from `.hero-summary` and `.about-intro-split .about-copy p` (rivers at narrow measures).

### 9.2 Line-mask reveals (SplitText 3.13+)

```js
SplitText.create('.section-heading h2', {
  type: 'lines', mask: 'lines', autoSplit: true,             // re-splits on resize / font load
  onSplit: (self) => gsap.from(self.lines, {
    yPercent: 110, duration: .9, stagger: .08, ease: 'power4.out',
    scrollTrigger: { trigger: self.elements[0], start: 'top 85%', once: true },
  }),
});
```
Replace `Reveal` on headings only; keep `Reveal` for blocks. Wait for `document.fonts.ready` before the first split if you don't use `autoSplit`.

### 9.3 Scroll-lit paragraph

```js
const s = SplitText.create('.section-subtext', { type: 'words' });
gsap.fromTo(s.words, { opacity: .15 }, { opacity: 1, stagger: .04, ease: 'none',
  scrollTrigger: { trigger: '.section-subtext', start: 'top 80%', end: 'bottom 55%', scrub: true } });
```
Opacity only; never animate color in a scrubbed trigger.

### 9.4 Card → case study morph

Prefer the View Transitions API as progressive enhancement (feature-detect, fall back to current behaviour):

```js
function openCaseStudy(cs, cardEl) {
  const swap = () => flushSync(() => setSelectedCaseStudy(cs));
  if (!document.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) return swap();
  cardEl.style.viewTransitionName = 'cs-surface';
  const vt = document.startViewTransition(() => { cardEl.style.viewTransitionName = ''; swap(); });
  vt.finished.finally(() => { /* modal root keeps view-transition-name: cs-surface only while mounted */ });
}
```
```css
.case-study-dialog { view-transition-name: cs-surface; }   /* the name must be unique at any one time */
::view-transition-group(cs-surface) { animation-duration: .5s; animation-timing-function: cubic-bezier(.22,1,.36,1); }
```
Alternative with broader support: GSAP **Flip** (`Flip.getState(card)` → render modal → `Flip.from`). Either way, also address the flagged modal UX: consider a full-screen takeover (`max-height: 100svh`, no inner scroll box) so the page's Lenis scroll is the only scroller.

### 9.5 Skills → constellation (and fix D2/D3)

**Step 1 – single source of truth.** Build one map and derive both card stacks and filters from it:

```js
// data/skillGraph.js
export const skillEdges = {                     // skill → project ids (only claims supported by your data)
  'Java': ['project-tradersdesk'], 'Java Swing': ['project-tradersdesk'], 'Flutter': ['project-tradersdesk'],
  'SQLite': ['project-tradersdesk'], 'Hibernate ORM': ['project-tradersdesk'], 'Supabase': ['project-tradersdesk'],
  'PostgreSQL': ['project-tradersdesk','project-querypilot'],
  'Python': ['project-querypilot','project-payperuseai'], 'LangChain': ['project-querypilot'],
  'LLM APIs': ['project-querypilot'], 'SQL': ['project-querypilot'], 'Pandas': ['project-querypilot'],
  'Data Analytics': ['project-querypilot'],
  'FastAPI': ['project-payperuseai'], 'React.js': ['project-payperuseai','project-founderflow'],
  'Node.js': ['project-certicraft'],
  'REST APIs': ['project-tradersdesk'],          // 'HTTP APIs' in portfolio.js
};
export const projectsForSkill = (skill) => skillEdges[skill] ?? [];
```
Replace the equality check in `ProjectCard` with `projectsForSkill(highlightedSkill).includes(project.id)`. For skills with no project edge (Docker, Git, Redis, …) **do not dim cards**; show the banner: *"No project card uses X — it appears in internship work."* only if that is true; otherwise just a neutral "Not tied to a listed project".

**Step 2 – constellation view.** 5 project nodes in a ring, 40 skill nodes placed by a lightweight spring layout (hand-rolled ~40 lines or `d3-force` as a dev dependency). Hover a project → its skills attract and brighten; others fade to 12%. Click a skill → existing `handleSkillClick`. Render on `<canvas>` or SVG (≤ 45 nodes, SVG is fine and accessible). Fall back to the current badge board on mobile and reduced motion.

### 9.6 Activity section micro-effects

- GitHub/LeetCode/Codeforces heatmaps: after data resolves, `gsap.from('.gh-cal-col', { opacity: 0, scale: .6, stagger: .012, duration: .35, ease: 'power2.out' })` triggered once on view.
- Codeforces: if you plot a rating line, draw it with `stroke-dasharray` / `stroke-dashoffset` scrubbed to scroll.
- Gate behind a `dataReady` effect dependency so you never animate the skeleton/fallback state.

### 9.7 Cursor and pointer parallax

Context labels (cheap, effective):

```js
// in the mouseover handler
const label = e.target.closest('[data-cursor]')?.dataset.cursor;
gsap.to(ring, { scale: label ? 2.6 : 1.8, duration: .2 });
ringLabel.textContent = label || '';
```
Add `data-cursor="Open"` on project cards, `"Drag"` on sims, `"Play"` on demo buttons.

Pointer parallax on the portrait — **must be mirrored on every aligned layer**:

```js
const layers = ['.bg-poster', '.bg-video', '.fx-cutout'];
const nx = layers.map(l => gsap.quickTo(l, 'x', { duration: 1.1, ease: 'power3.out' }));
const ny = layers.map(l => gsap.quickTo(l, 'y', { duration: 1.1, ease: 'power3.out' }));
const nameX = gsap.quickTo('.fx-name', 'x', { duration: 1.4, ease: 'power3.out' });
addEventListener('pointermove', e => {
  const dx = (e.clientX / innerWidth - .5) * 20, dy = (e.clientY / innerHeight - .5) * 12;
  nx.forEach(f => f(dx)); ny.forEach(f => f(dy)); nameX(-dx * .6);        // name opposes ⇒ depth
}, { passive: true });
gsap.set(layers, { scale: 1.04 });                                          // hides edge exposure
```
Transforms on the `<video>` are independent of `currentTime` seeking, so scrubbing is unaffected. Disable on touch and reduced motion.

### 9.8 Command palette easter eggs

Extend `commands` with a free-text mode: if the query starts with `>` (or matches a known token), run a handler.

| Input | Result |
|---|---|
| `whoami` | Overlay prints name · role · location from `profile` |
| `git log` | Prints experience entries as commit lines (`hash · date · company — role`) |
| `sudo hire neel` | Confetti burst (canvas, ≤ 150 particles, 1.2 s) and scrolls to contact |
| `cat stats` | Prints the (currently unrendered) `stats` array |

Plus a console banner on load: `console.log('%cHiring? neel@…', 'font:700 14px monospace;color:#bff205')` (read from `profile.email`; avoid hardcoding).

---

## 10. Mobile pipeline

### 10.1 Why

Currently `innerWidth < 768` ⇒ poster only. Two changes: (a) the **depth effect (Move A) works on the static poster** so phones get it for free; (b) offer a lighter scrub video on capable phones.

### 10.2 Portrait-cropped, low-res all-intra encode

Frames are 1280×720; the face is around x ≈ 51% (≈ 650 px) and reaches ≈ 780 px at the turned pose, so a 405 px-wide window starting at x ≈ 449 keeps it in frame.

```bash
ffmpeg -framerate 24 -i ezgif-2011b9ceb9b186d2-png-split/ezgif-frame-%03d.png \
  -vf "crop=405:720:449:0,scale=540:960:flags=lanczos" \
  -c:v libx264 -profile:v high -preset slow -crf 28 -g 1 -keyint_min 1 \
  -pix_fmt yuv420p -movflags +faststart -an public/assets/bg/portfolio-scrub-m.v1.mp4

# matching portrait poster + cutout (same crop!)
ffmpeg -y -i ezgif-frame-001.png -vf "crop=405:720:449:0,scale=540:960" -c:v libwebp -quality 80 public/assets/bg/poster-m.v1.webp
```
If you crop the video, **crop the cutout identically**, or keep the 16:9 assets and rely on `object-fit: cover` (simpler; the crop is then done by CSS and alignment is automatic). Measure file sizes before choosing.

### 10.3 Tiering logic (replaces the width gate)

```js
export function backgroundTier() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return 'poster';
  const c = navigator.connection;
  if (c?.saveData || ['slow-2g','2g','3g'].includes(c?.effectiveType)) return 'poster';
  if ((navigator.hardwareConcurrency ?? 8) < 4) return 'poster';
  return innerWidth < 768 ? 'mobile' : 'desktop';
}
```
`ScrubVideoBackground` takes `src` from the tier. Keep the whole-file Blob preload for the small mobile file only if it stays within a few MB; otherwise rely on `preload="auto"` + range requests (all-intra seeks are cheap, but the first scrub may stutter on slow links).

### 10.4 Mobile behaviour of other moves

| Move | Mobile |
|---|---|
| A | Poster + cutout + name; no scroll-fade of the cutout needed beyond the same ScrollTrigger |
| B | Sims stack vertically; tap targets ≥ 44 px; no drag-only interactions |
| C | No pin; list + static mini field |
| D | Interludes OK (shorter `min-height: 70svh`); no velocity marquee skew |
| 9.7 | Disabled (no pointer) |

---

## 11. Performance budget, accessibility, test plan

### 11.1 Budget

| Item | Budget |
|---|---|
| Fixed video layers | 1 (plus poster) |
| `backdrop-filter` elements | Header + at most 1 other |
| Animated properties in scrubbed triggers | `transform`, `opacity` only |
| Canvas | 2D only; draw on state change, not per frame; pause when off-screen |
| New JS | Sims and funnel lazy-loaded; no new runtime deps |
| Cutout | < 250 KB |
| CLS | Keep 0.00 (reserve sim/funnel heights with `aspect-ratio` / `min-height`) |
| Main-thread long frames during scroll | None > 50 ms in Chrome's Performance panel on a mid-range Android profile |

### 11.2 Accessibility

- `prefers-reduced-motion`: use `gsap.matchMedia()` so *no* ScrollTrigger is created in the reduce branch (don't merely shorten durations). You already handle reduce in most hooks; carry the pattern to every new one.
- Decorative layers (`fx-name`, `fx-cutout`, canvas) are `aria-hidden`; real heading stays as `sr-only` `<h1>`.
- Sims: native `<button>`s, visible focus (your `:focus-visible` is already lime), `aria-pressed` for toggles, `role="status"` live region for state changes, never convey state by colour alone.
- Funnel: the active achievement card is real text; canvas is supplementary.
- Cursor: you hide the native cursor globally on fine pointers (`cursor: none`). Keep a fallback `cursor: auto` for `(pointer: coarse)` (already) and for `:focus-within` modals if the custom cursor ever fails to track.
- Modals/palette already trap focus and pause Lenis; any new overlay must do the same (`lenis.stop()`, restore focus, `Esc`).

### 11.3 Test plan

1. **Per phase:** Lighthouse mobile (LCP, CLS, TBT), then Chrome Performance recording during a full-page scroll; check for dropped frames while the video seeks.
2. **Alignment test (Move A):** screenshot at 1440×900, 1366×768, 1024×768, 768×1024, 390×844, 360×800; overlay cutout/poster at 50% to confirm no ghosting at each aspect ratio (cover-fit math differs per ratio).
3. **Reduced motion matrix:** OS setting on/off, reload and live-toggle (your `useSmoothScroll` already listens for live changes).
4. **Keyboard-only pass:** Tab through hero → sims → funnel → modal → palette; confirm no trap and visible focus.
5. **Network throttling:** Fast 3G + 4× CPU slowdown; confirm poster-only fallback and no blank hero.
6. **Browser matrix:** Safari 17/18 (video seeking, `animation-timeline`, `@property`), Chrome, Firefox. `@property` has broad support now; keep a fallback where tint simply snaps.
7. **Regression guard:** automate screenshots at fixed scroll offsets (e.g. Playwright: `page.evaluate(y => window.__lenis.scrollTo(y,{immediate:true}), y)` then `page.screenshot`) and diff between phases.

---

## 12. What not to do

| Idea | Why not |
|---|---|
| Re-add Three.js / WebGL scene | You removed it for good reasons (memory, mobile); the video carries the visual identity now |
| Shader/distortion hover on project images | Every `visual.previewImage` is `null`; the images are SVG blueprints, which distort badly and imply screenshots (your own `ABC.md` forbids that) |
| Sound | Autoplay is blocked; in a recruiter context it reads as annoying |
| Long preloader/percentage counter | Delays first meaningful view; you already removed one |
| Trail/ink cursors, heavy particles | Competes with the portrait and costs frames |
| Animating numbers you present as measured (142 ms, 5,000+ records) | Moving counters imply live measurement; show static, or animate only the reveal |
| Re-executing `portfolio-animation-upgrade-plan.md` as written | It targets `BackgroundScene`/Three.js which no longer exists; most of phases 1–3 are shipped |

---

## 13. Roadmap and effort

| Phase | Scope | Est. | Risk | Acceptance check |
|---|---|---|---|---|
| 0 | z-scale, `motion.css`, mood fix, transition fixes, magnet, tilt, dead-CSS removal, D2/D3 fixes | 3–4 h (+1 h cleanup) | Low | Mood tint visible; tilt ≥ ±6°; skill filter never dims all cards |
| 1 | Move A: cutout, name layer, hero relayout, scroll-out, intro | 1 day | Medium (matte quality) | No ghosting at 6 viewports; LCP unchanged |
| 2 | Move B: TradersDesk sim + modal integration | 1–1.5 days | Medium | Works with keyboard; labelled; reduced-motion path |
| 3 | Move C: funnel | 1 day | Medium (pin + canvas) | 60 fps scroll; static fallback on mobile |
| 4 | Move D: segments, interludes, bookend, footer | 1 day | Low–medium | Video keeps moving past hero; contact shows face |
| 5 | Type system, line masks, scroll-lit text | 0.5 day | Low | CLS 0; fonts split correctly after load |
| 6 | QueryPilot sim, then PayPerUseAI / CertiCraft / FounderFlow | 0.5 day each | Low | Real `safetyGate` / `criticalPath` unit-tested |
| 7 | Constellation, heatmap ripple, cursor labels, parallax, palette eggs, View Transitions | 1–1.5 days | Low | Mirrored-layer parallax doesn't misalign cutout |
| 8 | Mobile video tier | 0.5 day | Low–medium | Smaller file; no jank on mid-range Android |

Total ≈ 8–10 focused days. If you only have two: **Phase 0 + Phase 1 + Move C** gives the largest perceived jump.

---

## 14. Content flags found while reading

1. **Wins subtext overclaims.** `App.jsx`: "Top podium finishes at IIT Bombay, PICT ACM, Meta, and Algorand hackathons…". Meta and Algorand were finalist placements (top 800 of 52,000+, top 30 of 800+). Suggested: "Podium finishes at IIT Bombay and PICT ACM; finalist at Meta, Algorand and GDG Cloud."
2. **Title mismatch.** Brand/title say "Product Engineer"; `profile.summary` begins "Full-Stack Software Engineer…".
3. **`stats` is not rendered** in `App.jsx` (the array exists in `portfolio.js`). If you want a big-number strip, wire it before the Work section; animate only the *reveal* (see §12 re: measured claims).
4. **No-JS / structured data (unverified):** the live URL returned only the `<noscript>` shell when fetched. Check whether the `<noscript>` block and any JSON-LD list all five projects and current experience; update if they lag the page.
5. **Duplicate stack lists** (D3) will silently drift again unless derived from one object.
6. **Justified paragraphs** at narrow measure produce uneven word spacing (§9.1).
7. **Bug log scope:** `Bugs.md` in this folder audits the *PICT ACM Learning Platform*, not this site; consider moving it out of the portfolio repo.

---

## 15. Appendix — file change map

| File | Change |
|---|---|
| `index.html` | Add `#fx-depth` mount, cutout preload; keep poster preload |
| `src/main.jsx` | Import `motion.css` **last** |
| `src/motion.css` | **New:** z-scale, `@property`, mood tint, transition fixes, `.fx-*` classes |
| `src/hooks/useSectionMood.js` | Rewrite (§4.3) |
| `src/hooks/useMagnetic.js` | Rewrite as proximity registry (§4.5) |
| `src/hooks/useTilt.js` | New signature + glare vars (§4.6) |
| `src/components/Preloader.jsx` | Curtain + lights-on (§5.5) |
| `src/components/HeroDepth.jsx` | **New** (§5.3) |
| `src/components/ScrubVideoBackground.jsx` | Multi-segment triggers + tier-based `src` (§8.2, §10.3) |
| `src/components/ProjectCard.jsx` | `useTilt(7)`, `projectsForSkill`, `data-cursor` |
| `src/components/sim/*` | **New:** TradersDeskSim, QueryPilotSim (+`safetyGate.js`), PayPerUseSim, CertiCraftSim, FounderFlowSim (+`criticalPath.js`) |
| `src/components/FunnelCanvas.jsx` | **New** (§7.3); `AchievementGallery` kept as fallback/modal |
| `src/components/Interlude.jsx` | **New** (§8.3) |
| `src/components/CommandPalette.jsx` | Free-text command mode (§9.8) |
| `src/data/skillGraph.js` | **New** single source for skill↔project (§9.5) |
| `src/data/architecture.js` | Add `funnel: { total, lit, rank }` to `detailedAchievements` |
| `src/data/portfolio.js` | Derive `projects[].stack` from `caseStudies.js`; fix wins wording |
| `src/App.jsx` | Mount `HeroDepth`, `Interlude`s, `FunnelCanvas`; relayout hero; new cursor labels; remove `HeroName` word split |
| `src/styles.css`, `bg-and-perf.css`, `editorial-design-system.css` | Delete orphaned rules (D10); stop adding to them |
| `public/assets/bg/` | **New:** `cutout.v1.webp`, optional `portfolio-scrub-m.v1.mp4`, `poster-m.v1.webp` |

---

*End of spec.*
