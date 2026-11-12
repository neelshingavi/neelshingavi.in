import { Suspense, lazy, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { m, useScroll, useSpring } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import {
  Command,
  Download,
  ExternalLink,
  Mail,
  Trophy,
} from 'lucide-react';
import { Reveal } from './components/Reveal.jsx';
import { SkillBadge } from './components/SkillBadge.jsx';
import { useBackgroundTier } from './hooks/useCanRunBackgroundAnimation.js';
import { useSmoothScroll, lenis } from './hooks/useSmoothScroll.js';
import { useSectionMood } from './hooks/useSectionMood.js';
import { useMagnetic } from './hooks/useMagnetic.js';
import { MobileNav } from './components/MobileNav.jsx';
import { ContactForm } from './components/ContactForm.jsx';
import { ErrorBoundary } from './components/ErrorBoundary.jsx';
import { Preloader } from './components/Preloader.jsx';
import { HeroDepth } from './components/HeroDepth.jsx';
import { useContactShadeLift } from './components/Interlude.jsx';
import { ProjectCard } from './components/ProjectCard.jsx';
import { HeroCapabilities } from './components/HeroCapabilities.jsx';
import { ProjectFilters } from './components/ProjectFilters.jsx';
import { SystemsNetwork } from './components/SystemsNetwork.jsx';
import { CodingActivityShowcase } from './components/CodingActivityShowcase.jsx';
import { ExperienceTimeline } from './components/ExperienceTimeline.jsx';
import { AchievementGallery } from './components/AchievementGallery.jsx';
import { analytics } from './utils/analytics.js';
import { achievements, profile, projects, skills } from './data/portfolio.js';
import { projectCaseStudies } from './data/caseStudies.js';
import { INTERNSHIP_SKILLS, projectsForSkill } from './data/skillGraph.js';
import { DESKTOP_NAV_ITEMS } from './data/navigation.js';

// Lazy-loaded dialogs for performance & critical-path bundle reduction (Phase C - Task J)
const ProjectCaseStudyModal = lazy(() =>
  import('./components/ProjectCaseStudyModal.jsx').then((m) => ({ default: m.ProjectCaseStudyModal }))
);
const CommandPalette = lazy(() =>
  import('./components/CommandPalette.jsx').then((m) => ({ default: m.CommandPalette }))
);
const SkillsConstellation = lazy(() => import('./components/SkillsConstellation.jsx'));

import { ScrubVideoBackground } from './components/ScrubVideoBackground.jsx';

function MagneticNavItem({ item, label, activeSection }) {
  const ref = useMagnetic(0.3);
  return (
    <a
      ref={ref}
      href={`#${item}`}
      className={activeSection === item ? 'active' : ''}
      aria-current={activeSection === item ? 'page' : undefined}
    >
      {label || item}
    </a>
  );
}

function MagneticAction({ href, className, onClick, title, target, rel, children, ariaLabel }) {
  const ref = useMagnetic(0.3);
  return (
    <a ref={ref} href={href} className={className} onClick={onClick} title={title} target={target} rel={rel} aria-label={ariaLabel}>
      {children}
    </a>
  );
}

const seenPreloader = () => {
  try {
    return sessionStorage.getItem('pl') === '1';
  } catch {
    return false;
  }
};

gsap.registerPlugin(ScrollTrigger, SplitText);

function App() {
  useSmoothScroll();
  useSectionMood();
  useContactShadeLift();
  const ringRef = useRef(null);
  const ringLabelRef = useRef(null);
  const dotRef = useRef(null);
  const [activeSection, setActiveSection] = useState('');
  const [preloaderComplete, setPreloaderComplete] = useState(seenPreloader);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCaseStudy, setSelectedCaseStudy] = useState(null);
  const [scrollToSim, setScrollToSim] = useState(false);
  const [highlightedSkill, setHighlightedSkill] = useState(null);
  const [skillsView, setSkillsView] = useState('grid');
  const [isDesktopViewport, setIsDesktopViewport] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 768 : true
  );
  const [isCmdPaletteOpen, setIsCmdPaletteOpen] = useState(false);
  const [scrollPercent, setScrollPercent] = useState(0);
  const visitedSections = useRef(new Set());
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 34, restDelta: 0.001 });
  const bgTier = useBackgroundTier();

  useEffect(() => {
    const onResize = () => setIsDesktopViewport(window.innerWidth >= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleSkillClick = (skillName) => {
    setHighlightedSkill((prev) => (prev === skillName ? null : skillName));
  };

  // URL Hash Deep Linking for Project Case Studies (Task D)
  useEffect(() => {
    const handleHashSync = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash.startsWith('#casestudy-')) {
        const slug = hash.replace('#casestudy-', '');
        const targetId = `project-${slug}`;
        if (projectCaseStudies[targetId]) {
          setSelectedCaseStudy(projectCaseStudies[targetId]);
        }
      } else if (!hash.startsWith('#casestudy-')) {
        setSelectedCaseStudy((current) => (current ? null : current));
      }
    };

    handleHashSync();
    window.addEventListener('hashchange', handleHashSync);
    window.addEventListener('popstate', handleHashSync);
    return () => {
      window.removeEventListener('hashchange', handleHashSync);
      window.removeEventListener('popstate', handleHashSync);
    };
  }, []);

  const handleOpenCaseStudy = (caseStudy, cardEl = null, focusSim = false) => {
    const applyState = () => {
      flushSync(() => {
        setScrollToSim(Boolean(focusSim));
        setSelectedCaseStudy(caseStudy);
      });
    };

    if (caseStudy) {
      const slug = caseStudy.id.replace('project-', '');
      window.history.pushState(null, '', `#casestudy-${slug}`);
    }

    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (cardEl && document.startViewTransition && !reducedMotion) {
      cardEl.style.viewTransitionName = 'cs-surface';
      try {
        const vt = document.startViewTransition(() => {
          cardEl.style.viewTransitionName = '';
          applyState();
        });
        vt.finished.finally(() => {
          if (cardEl) cardEl.style.viewTransitionName = '';
        });
      } catch {
        cardEl.style.viewTransitionName = '';
        applyState();
      }
      return;
    }

    applyState();
  };

  const handleCloseCaseStudy = () => {
    setScrollToSim(false);
    setSelectedCaseStudy(null);
    if (window.location.hash.startsWith('#casestudy-')) {
      window.history.pushState(null, '', window.location.pathname + window.location.search);
    }
  };

  // Keep progressbar aria-valuenow accurately synchronized
  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (v) => {
      setScrollPercent(Math.round(v * 100));
    });
    return unsubscribe;
  }, [scrollYProgress]);

  // Global Cmd+K / Ctrl+K listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.isContentEditable);

      if (isInput) return;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCmdPaletteOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredProjects = useMemo(() => {
    if (selectedCategory === 'All') return projects;
    return projects.filter(
      (p) => Array.isArray(p.categories) && p.categories.includes(selectedCategory)
    );
  }, [selectedCategory]);

  const matchedSkillProjectCount = useMemo(
    () => (highlightedSkill ? projectsForSkill(highlightedSkill).length : 0),
    [highlightedSkill]
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!isFinePointer || prefersReducedMotion) return;

    const heroSection = document.querySelector('.hero-section');
    if (!heroSection) return;

    let rafId = null;
    let clientX = 0;
    let clientY = 0;

    const updateSpotlight = () => {
      const rect = heroSection.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      heroSection.style.setProperty('--hero-mx', `${x}px`);
      heroSection.style.setProperty('--hero-my', `${y}px`);
      rafId = null;
    };

    const handlePointerMove = (e) => {
      clientX = e.clientX;
      clientY = e.clientY;
      if (!rafId) {
        rafId = requestAnimationFrame(updateSpotlight);
      }
    };

    heroSection.addEventListener('pointermove', handlePointerMove, { passive: true });

    return () => {
      heroSection.removeEventListener('pointermove', handlePointerMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  useEffect(() => {
    // Check user's motion preference before setting up GSAP cursor
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return undefined;

    const ring = ringRef.current;
    const ringLabel = ringLabelRef.current;
    const dot = dotRef.current;
    if (!ring || !dot) return undefined;

    const ringX = gsap.quickTo(ring, 'x', { duration: 0.35, ease: 'power2.out' });
    const ringY = gsap.quickTo(ring, 'y', { duration: 0.35, ease: 'power2.out' });
    const dotX = gsap.quickTo(dot, 'x', { duration: 0.08, ease: 'power3.out' });
    const dotY = gsap.quickTo(dot, 'y', { duration: 0.08, ease: 'power3.out' });

    const handleMouseMove = (e) => {
      ringX(e.clientX);
      ringY(e.clientY);
      dotX(e.clientX);
      dotY(e.clientY);
    };

    const handleMouseOver = (e) => {
      const target = e.target.closest('[data-cursor], a, button, [role="button"], .skill-badge, .project-card, .metric-item, .trophy-card');
      if (target) {
        const label = e.target.closest('[data-cursor]')?.dataset.cursor || '';
        let color = '#bff205'; // default lime
        if (target.classList.contains('coral') || target.closest('.coral')) color = '#ff6b6b';
        else if (target.classList.contains('teal') || target.closest('.teal')) color = '#00e5ff';
        else if (target.classList.contains('gold') || target.closest('.gold')) color = '#fbc02d';
        else if (target.getAttribute('style')?.includes('--hover-color')) {
          const match = target.getAttribute('style').match(/--hover-color:\s*([^;]+)/);
          if (match) color = match[1].trim();
        }

        if (ringLabel) ringLabel.textContent = label;
        gsap.to(ring, {
          scale: label ? 2.6 : 1.8,
          borderColor: color,
          backgroundColor: color.startsWith('#') ? `${color}15` : 'rgba(191, 242, 5, 0.08)',
          borderWidth: '2px',
          duration: 0.2,
        });
        gsap.to(dot, {
          scale: label ? 0 : 0.4,
          backgroundColor: color,
          duration: 0.2,
        });
      }
    };

    const handleMouseOut = (e) => {
      const target = e.target.closest('[data-cursor], a, button, [role="button"], .skill-badge, .project-card, .metric-item, .trophy-card');
      if (target) {
        if (ringLabel) ringLabel.textContent = '';
        gsap.to(ring, {
          scale: 1,
          borderColor: 'rgba(191, 242, 5, 0.65)',
          backgroundColor: 'transparent',
          borderWidth: '1px',
          duration: 0.25,
        });
        gsap.to(dot, {
          scale: 1,
          backgroundColor: '#bff205',
          duration: 0.25,
        });
      }
    };

    window.addEventListener('pointermove', handleMouseMove);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      window.removeEventListener('pointermove', handleMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, []);

  // Section tracking: track each section once per session
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            setActiveSection(id);
            if (!visitedSections.current.has(id)) {
              visitedSections.current.add(id);
              analytics.sectionReached(id);
            }
          }
        });
      },
      { rootMargin: '-30% 0px -50% 0px' }
    );

    const sections = document.querySelectorAll('section[id]');
    sections.forEach((sec) => observer.observe(sec));

    return () => {
      sections.forEach((sec) => observer.unobserve(sec));
      observer.disconnect();
    };
  }, []);

  // Track time on page cleanly via document visibilitychange and pagehide
  useEffect(() => {
    const startTime = Date.now();
    let hasLogged = false;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && !hasLogged) {
        hasLogged = true;
        const seconds = Math.round((Date.now() - startTime) / 1000);
        if (seconds > 0) {
          analytics.timeOnPage(seconds);
        }
      }
    };

    const handlePageHide = () => {
      if (!hasLogged) {
        hasLogged = true;
        const seconds = Math.round((Date.now() - startTime) / 1000);
        if (seconds > 0) {
          analytics.timeOnPage(seconds);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const active = document.querySelector(`.nav-links a.active`);
      const indicator = document.querySelector('.nav-indicator');
      if (active && indicator) {
        const { offsetLeft, offsetWidth } = active;
        gsap.to(indicator, { x: offsetLeft, width: offsetWidth, opacity: 1, duration: 0.4, ease: 'power3.out' });
      } else if (indicator) {
        gsap.to(indicator, { opacity: 0, duration: 0.2 });
      }
    });
    return () => ctx.revert();
  }, [activeSection]);

  // Velocity-driven footer marquee + rising footer wordmark (Move D §8.5)
  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    let unsubLenis = null;

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const track = document.querySelector('.footer-marquee-track');
      const marquee = document.querySelector('.footer-marquee');
      let marqueeTween = null;

      if (track) {
        marqueeTween = gsap.to(track, {
          xPercent: -50,
          repeat: -1,
          duration: 22,
          ease: 'none',
        });
      }

      const activeLenis = lenis || (typeof window !== 'undefined' ? window.__lenis : null);
      if (activeLenis && marqueeTween && window.innerWidth >= 768) {
        unsubLenis = activeLenis.on('scroll', ({ velocity }) => {
          const v = gsap.utils.clamp(-30, 30, velocity || 0);
          gsap.to(marqueeTween, {
            timeScale: 1 + Math.abs(v) * 0.35,
            duration: 0.25,
            overwrite: true,
            onComplete: () => {
              gsap.to(marqueeTween, { timeScale: 1, duration: 1.2, ease: 'power2.out' });
            },
          });
          if (marquee) {
            gsap.to(marquee, { skewX: -v * 0.4, duration: 0.3, overwrite: 'auto' });
          }
        });
      }

      const resizer = typeof ResizeObserver !== 'undefined'
        ? (() => {
            let rafId = 0;
            const ro = new ResizeObserver(() => {
              if (rafId) cancelAnimationFrame(rafId);
              rafId = requestAnimationFrame(() => ScrollTrigger.refresh());
            });
            const mainEl = document.getElementById('main-content');
            if (mainEl) ro.observe(mainEl);
            return () => {
              if (rafId) cancelAnimationFrame(rafId);
              ro.disconnect();
            };
          })()
        : null;

      return () => {
        resizer?.();
        if (typeof unsubLenis === 'function') unsubLenis();
        marqueeTween?.kill();
      };
    });

    return () => mm.revert();
  }, []);

  // SplitText line-mask heading reveals (§9.2) & scroll-lit subtext paragraphs (§9.3)
  useEffect(() => {
    let active = true;
    let mm = null;
    const splits = [];
    const subTriggers = [];

    const setupTypographyMotion = async () => {
      try {
        if (document.fonts?.ready) {
          await document.fonts.ready;
        }
      } catch {
        // Proceed if FontLoading API is absent
      }
      if (!active) return;

      mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        document.querySelectorAll('.section-heading h2:not(.sr-only)').forEach((heading) => {
          const split = SplitText.create(heading, {
            type: 'lines',
            mask: 'lines',
            autoSplit: true,
            onSplit: (self) =>
              gsap.from(self.lines, {
                yPercent: 108,
                duration: 0.85,
                stagger: 0.08,
                ease: 'power4.out',
                scrollTrigger: {
                  trigger: self.elements[0],
                  start: 'top 88%',
                  once: true,
                },
              }),
          });
          splits.push(split);
        });

        document.querySelectorAll('.section-subtext').forEach((subEl) => {
          const split = SplitText.create(subEl, { type: 'words' });
          splits.push(split);
          const tween = gsap.fromTo(
            split.words,
            { opacity: 0.2 },
            {
              opacity: 1,
              stagger: 0.04,
              ease: 'none',
              scrollTrigger: {
                trigger: subEl,
                start: 'top 86%',
                end: 'bottom 58%',
                scrub: true,
              },
            }
          );
          if (tween.scrollTrigger) subTriggers.push(tween.scrollTrigger);
        });

        return () => {
          subTriggers.forEach((st) => st.kill());
          splits.forEach((sp) => sp.revert());
          subTriggers.length = 0;
          splits.length = 0;
        };
      });
    };

    setupTypographyMotion();

    return () => {
      active = false;
      mm?.revert();
      subTriggers.forEach((st) => st.kill());
      splits.forEach((sp) => sp.revert());
    };
  }, []);

  return (
    <>
      {/* Skip link MUST be first */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Accessible Scroll Progress Bar with dynamic valuenow */}
      <m.div
        className="progress-bar"
        style={{ scaleX }}
        role="progressbar"
        aria-label="Page scroll progress"
        aria-valuenow={scrollPercent}
        aria-valuemin={0}
        aria-valuemax={100}
      />

      {!preloaderComplete && (
        <Preloader
          onComplete={() => {
            try {
              sessionStorage.setItem('pl', '1');
            } catch {
              /* ignore */
            }
            setPreloaderComplete(true);
          }}
        />
      )}
      <ErrorBoundary fallback={null}>
        <HeroDepth />
        <Suspense fallback={null}>
          {bgTier !== 'poster' && (
            <ScrubVideoBackground
              videoSrc={
                bgTier === 'mobile'
                  ? '/assets/bg/portfolio-scrub-m.v1.mp4'
                  : '/assets/bg/portfolio-scrub.v1.mp4'
              }
            />
          )}
        </Suspense>
      </ErrorBoundary>

      <div ref={ringRef} className="cursor-ring" aria-hidden="true">
        <span ref={ringLabelRef} className="cursor-ring-label" />
      </div>
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />

      <header className="site-header">
        <a className="brand" href="#top" aria-label="Go to top">
          <img
            src="/favicon-96x96.png"
            alt="Neel Shingavi Logo"
            width="24"
            height="24"
            loading="eager"
            decoding="async"
            className="brand-logo"
          />
          <small>Product Engineer</small>
        </a>
        <nav className="nav-links" aria-label="Primary navigation" style={{ position: 'relative' }}>
          <div className="nav-indicator" style={{ position: 'absolute', bottom: -2, left: 0, height: 2, background: 'var(--lime)', borderRadius: 2, opacity: 0 }} />
          {DESKTOP_NAV_ITEMS.map((item) => (
            <MagneticNavItem
              key={item.id}
              item={item.id}
              label={item.label}
              activeSection={activeSection}
            />
          ))}
        </nav>
        <div className="header-actions-group">
          <button
            type="button"
            className="cmd-trigger-btn"
            onClick={() => setIsCmdPaletteOpen(true)}
            title="Open Command Palette (⌘K)"
            aria-label="Open Command Palette"
          >
            <Command size={13} aria-hidden="true" />
            <span className="cmd-label">⌘K</span>
          </button>
          <MagneticAction
            className="header-action"
            href={profile.resume}
            target="_blank"
            rel="noopener noreferrer"
            title="Download Neel Shingavi's Resume"
            onClick={() => analytics.resumeDownloaded()}
          >
            <Download size={17} />
            Resume
          </MagneticAction>
        </div>
        <MobileNav
          activeSection={activeSection}
          onOpenCommandPalette={() => setIsCmdPaletteOpen(true)}
        />
      </header>

      {isCmdPaletteOpen && (
        <Suspense fallback={null}>
          <CommandPalette
            isOpen={isCmdPaletteOpen}
            onClose={() => setIsCmdPaletteOpen(false)}
            onOpenCaseStudy={handleOpenCaseStudy}
          />
        </Suspense>
      )}

      <main id="main-content">
        {/* We use #top and #hero for 'back to top' and hero targeting */}
        <div id="top"></div>
        <section className="hero-section section-shell" id="hero" aria-labelledby="hero-title">
          {/* Reactive pointer spotlight layer for hero */}
          <div className="hero-spotlight-layer" aria-hidden="true" />

          <div className="hero-copy">
            <h1 id="hero-title" className="sr-only">
              Neel Shingavi
            </h1>
            {Boolean(profile.summary) && (
              <m.p
                className="hero-summary"
                initial={{ opacity: 0, y: 16 }}
                animate={preloaderComplete ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
                transition={{ delay: 0.08, duration: 0.5 }}
              >
                {profile.summary}
              </m.p>
            )}
            <m.div
              className="hero-capabilities-dock"
              initial={{ opacity: 0, y: 18 }}
              animate={preloaderComplete ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
              transition={{ delay: 0.12, duration: 0.5 }}
            >
              <HeroCapabilities />
            </m.div>
          </div>
        </section>

        {/* 01 / CORE SYSTEMS & ARCHITECTURE */}
        <section className="about-section section-shell" id="systems" aria-labelledby="systems-heading">
          <Reveal className="section-heading">
            <p className="eyebrow">01 / CORE SYSTEMS &amp; ARCHITECTURE</p>
            <h2 id="systems-heading">Engineering topologies and interactive <em className="fx-accent">deep dives.</em></h2>
            <p className="section-subtext">
              Explore the modular service contracts, local-first transaction lifecycles, and NL-to-SQL analytics execution pipelines that power production operations.
            </p>
          </Reveal>

          <SystemsNetwork />
        </section>

        {/* 02 / EXPERIENCE & LEADERSHIP */}
        <section className="experience-section section-shell" id="experience" aria-labelledby="experience-heading">
          <Reveal className="section-heading split-heading">
            <div>
              <p className="eyebrow">02 / EXPERIENCE &amp; LEADERSHIP</p>
              <h2 id="experience-heading">Professional experience and academic <em className="fx-accent">foundation.</em></h2>
              <p className="section-subtext">
                Engineering internships, technical direction for startup incubators, and student chapter coordination.
              </p>
            </div>
            <MagneticAction
              className="primary-action"
              href={profile.resume}
              target="_blank"
              rel="noopener noreferrer"
              title="Download full resume PDF"
              onClick={() => analytics.resumeDownloaded()}
            >
              Download full resume
              <Download size={17} />
            </MagneticAction>
          </Reveal>

          <ExperienceTimeline />
        </section>

        {/* 03 / SELECTED WORK (ALL 5 PROJECTS IN COMPACT EDITORIAL GRID) */}
        <section className="work-section section-shell" id="work" aria-labelledby="work-heading">
          <Reveal className="section-heading split-heading">
            <div>
              <p className="eyebrow">03 / SELECTED WORK</p>
              <h2 id="work-heading">Production software built for <em className="fx-accent">measurable</em> outcomes.</h2>
            </div>
          </Reveal>

          <ProjectFilters
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            projects={projects}
          />

          {highlightedSkill && (
            <div
              className={`skill-filter-banner ${matchedSkillProjectCount === 0 ? 'is-info' : ''}`}
              role="status"
              aria-live="polite"
            >
              <span className="skill-filter-text">
                {matchedSkillProjectCount > 0 ? (
                  <>
                    Highlighting projects built with <strong>{highlightedSkill}</strong>
                  </>
                ) : INTERNSHIP_SKILLS.has(highlightedSkill) ? (
                  <>
                    No project card uses <strong>{highlightedSkill}</strong> — it appears in internship work.
                  </>
                ) : (
                  <>
                    Not tied to a listed project: <strong>{highlightedSkill}</strong>
                  </>
                )}
              </span>
              <button
                type="button"
                className="clear-skill-btn"
                onClick={() => setHighlightedSkill(null)}
                aria-label="Clear technology filter"
              >
                Clear filter ×
              </button>
            </div>
          )}

          {filteredProjects.length > 0 && (
            <div className={`projects-compact-grid ${selectedCategory !== 'All' ? 'is-filtered' : ''}`}>
              {filteredProjects.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  index={index}
                  onOpenCaseStudy={handleOpenCaseStudy}
                  highlightedSkill={highlightedSkill}
                />
              ))}
            </div>
          )}
        </section>

        {/* 04 / VERIFIED ENGINEERING CADENCE */}
        <section className="cadence-section section-shell" id="cadence" aria-labelledby="cadence-heading">
          <CodingActivityShowcase />
        </section>

        {/* 05 / COMPETITIVE PROOF & RECOGNITIONS */}
        <section className="wins-section section-shell" id="wins" aria-labelledby="wins-heading">
          <div className="wins-pin-inner">
            <Reveal className="section-heading split-heading">
              <div>
                <p className="eyebrow">05 / COMPETITIVE PROOF</p>
                <h2 id="wins-heading">Hackathon signal, <em className="fx-accent">national</em> scale.</h2>
              </div>
              <div className="trophy-pill">
                <Trophy size={18} />
                {achievements.length} major recognitions
              </div>
            </Reveal>

            <AchievementGallery />
          </div>
        </section>

        {/* 06 / STACK ARCHITECTURE */}
        <section className="skills-section section-shell" id="skills" aria-labelledby="skills-heading">
          <Reveal className="section-heading split-heading">
            <div>
              <p className="eyebrow">06 / STACK ARCHITECTURE</p>
              <h2 id="skills-heading">The technical stack behind the <em className="fx-accent">shipped work.</em></h2>
              <p className="section-subtext">
                Verified tools and languages utilized across high-concurrency backends, local persistence engines, and AI analytics pipelines.
              </p>
            </div>
            {isDesktopViewport && (
              <div className="skill-view-toggle" role="tablist" aria-label="Skills visualization mode">
                <button
                  type="button"
                  role="tab"
                  aria-selected={skillsView === 'grid'}
                  className={`funnel-mode-btn ${skillsView === 'grid' ? 'is-active' : ''}`}
                  onClick={() => setSkillsView('grid')}
                >
                  Grid Board
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={skillsView === 'constellation'}
                  className={`funnel-mode-btn ${skillsView === 'constellation' ? 'is-active' : ''}`}
                  onClick={() => setSkillsView('constellation')}
                >
                  Constellation Graph
                </button>
              </div>
            )}
          </Reveal>
          {isDesktopViewport && skillsView === 'constellation' ? (
            <Suspense fallback={<div className="skills-board-loading">Loading skill constellation…</div>}>
              <SkillsConstellation
                highlightedSkill={highlightedSkill}
                onSelectSkill={handleSkillClick}
              />
            </Suspense>
          ) : (
            <div className="skills-board">
              {skills.map((group, index) => (
                <Reveal
                  className="skill-group"
                  delay={index * 0.05}
                  key={group.label}
                >
                  <div className="skill-group-header">
                    <div className="skill-group-meta">
                      <span className="skill-group-index">{String(index + 1).padStart(2, '0')}</span>
                      <span className="skill-group-count">{group.items.length} technologies</span>
                    </div>
                    <h3>{group.label}</h3>
                  </div>
                  <ul className="skills-grid">
                    {(() => {
                      const spans = [];
                      let halfCount = 0;
                      for (let i = 0; i < group.items.length; i += 1) {
                        const item = group.items[i];
                        const isWide = item.length >= 15;
                        const next = group.items[i + 1];
                        const nextIsWide = !next || next.length >= 15;
                        const isUnpairedHalf = !isWide && halfCount % 2 === 0 && nextIsWide;
                        const full = isWide || isUnpairedHalf;
                        if (!full) halfCount += 1;
                        else halfCount = 0;
                        spans.push(full);
                      }
                      return group.items.map((item, itemIdx) => (
                        <li key={item} className={spans[itemIdx] ? 'is-full-span' : undefined}>
                          <SkillBadge
                            name={item}
                            onClick={handleSkillClick}
                            isHighlighted={highlightedSkill === item}
                          />
                        </li>
                      ));
                    })()}
                  </ul>
                </Reveal>
              ))}
            </div>
          )}
        </section>

        {/* 07 / CONTACT & COLLABORATION */}
        <section className="contact-section section-shell" id="contact" aria-labelledby="contact-heading">
          <Reveal className="contact-panel">
            <div className="section-heading">
              <p className="eyebrow">07 / CONTACT &amp; COLLABORATION</p>
              <h2 id="contact-heading">Have something <em className="fx-accent">worth building?</em></h2>
            </div>
            <p className="contact-availability">
              Whether you are architecting distributed backend infrastructure, building high-accuracy data pipelines,
              or seeking a product engineer who delivers client-tested software — let’s connect.
            </p>
            <div className="contact-actions" style={{ marginBottom: '24px' }}>
              <MagneticAction
                className="primary-action"
                href={`mailto:${profile.email}`}
                onClick={() => analytics.emailClicked()}
              >
                <Mail size={18} />
                {profile.email}
              </MagneticAction>
              <MagneticAction
                className="secondary-action"
                href={profile.links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                title="Visit Neel Shingavi's LinkedIn Profile"
                onClick={() => analytics.socialClicked('linkedin')}
                aria-label="LinkedIn profile (opens in new tab)"
              >
                <ExternalLink size={18} />
                LinkedIn
              </MagneticAction>
              <MagneticAction
                className="secondary-action"
                href={profile.links.github}
                target="_blank"
                rel="noopener noreferrer"
                title="Visit Neel Shingavi's GitHub Profile"
                onClick={() => analytics.socialClicked('github')}
                aria-label="GitHub profile (opens in new tab)"
              >
                <ExternalLink size={18} />
                GitHub
              </MagneticAction>
            </div>

            <ContactForm />
          </Reveal>
        </section>
      </main>

      {/* Case Study Modal Mount (Lazy Loaded) */}
      {selectedCaseStudy && (
        <Suspense fallback={null}>
          <ProjectCaseStudyModal
            caseStudy={selectedCaseStudy}
            isOpen={Boolean(selectedCaseStudy)}
            scrollToSim={scrollToSim}
            onClose={handleCloseCaseStudy}
          />
        </Suspense>
      )}

      <div className="footer-marquee" aria-hidden="true">
        <div className="footer-marquee-track">
          <span>PRODUCT ENGINEER · BACKEND SYSTEMS · AI ANALYTICS · LOCAL-FIRST ARCHITECTURE · PRODUCT ENGINEER · BACKEND SYSTEMS · </span>
          <span>PRODUCT ENGINEER · BACKEND SYSTEMS · AI ANALYTICS · LOCAL-FIRST ARCHITECTURE · PRODUCT ENGINEER · BACKEND SYSTEMS · </span>
        </div>
      </div>

      <footer className="site-footer">
        <div className="footer-content">
          <div className="footer-brand-pane">
            <span className="footer-brand-title">Neel Shingavi</span>
            <p className="footer-brand-desc">
              Product Engineer building resilient backend architectures, offline-first systems, and natural-language data pipelines.
            </p>
            <div className="footer-status-pill">
              <span className="footer-status-dot" aria-hidden="true" />
              <span>Pune, India · Product Engineer</span>
            </div>
            <a href={`mailto:${profile.email}`} className="footer-brand-email">
              {profile.email}
            </a>
          </div>

          <div className="footer-nav-col">
            <span className="footer-nav-heading">EXPLORE</span>
            <ul>
              <li><a href="#systems"><span className="footer-nav-num">01 ·</span> Systems &amp; Architecture</a></li>
              <li><a href="#experience"><span className="footer-nav-num">02 ·</span> Experience &amp; Leadership</a></li>
              <li><a href="#work"><span className="footer-nav-num">03 ·</span> Selected Work</a></li>
              <li><a href="#cadence"><span className="footer-nav-num">04 ·</span> Engineering Cadence</a></li>
            </ul>
          </div>

          <div className="footer-nav-col">
            <span className="footer-nav-heading">PROOF &amp; CONNECT</span>
            <ul>
              <li><a href="#wins"><span className="footer-nav-num">05 ·</span> Competitive Proof</a></li>
              <li><a href="#skills"><span className="footer-nav-num">06 ·</span> Stack &amp; Education</a></li>
              <li><a href="#contact"><span className="footer-nav-num">07 ·</span> Contact &amp; Collaboration</a></li>
              <li><a href="#top"><span className="footer-nav-num">↑ ·</span> Back to Hero</a></li>
            </ul>
          </div>

          <div className="footer-nav-col">
            <span className="footer-nav-heading">NETWORK</span>
            <ul>
              <li>
                <a href={profile.links.github} target="_blank" rel="noopener noreferrer">
                  <span>GitHub Profile</span>
                  <ExternalLink size={13} aria-hidden="true" />
                </a>
              </li>
              <li>
                <a href={profile.links.leetcode} target="_blank" rel="noopener noreferrer">
                  <span>LeetCode Profile</span>
                  <ExternalLink size={13} aria-hidden="true" />
                </a>
              </li>
              <li>
                <a href={profile.links.codeforces} target="_blank" rel="noopener noreferrer">
                  <span>Codeforces Profile</span>
                  <ExternalLink size={13} aria-hidden="true" />
                </a>
              </li>
              <li>
                <a href={profile.links.linkedin} target="_blank" rel="noopener noreferrer">
                  <span>LinkedIn Profile</span>
                  <ExternalLink size={13} aria-hidden="true" />
                </a>
              </li>
              <li>
                <a href={`mailto:${profile.email}`}>
                  <span>Direct Email</span>
                  <Mail size={13} aria-hidden="true" />
                </a>
              </li>
              <li>
                <a href={profile.resume} target="_blank" rel="noopener noreferrer">
                  <span>Resume (PDF)</span>
                  <Download size={13} aria-hidden="true" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <span className="footer-copyright">
            © {new Date().getFullYear()} Neel Shingavi. Engineered for production performance, accessibility, and architectural clarity.
          </span>
          <button
            type="button"
            onClick={() => {
              if (lenis) {
                lenis.scrollTo(0, { duration: 1.2 });
              } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="footer-back-to-top"
            aria-label="Scroll back to top"
          >
            <span>Back to top</span>
            <span className="footer-back-arrow" aria-hidden="true">↑</span>
          </button>
        </div>
      </footer>
    </>
  );
}

export default App;
