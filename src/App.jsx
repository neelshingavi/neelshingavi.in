import { Suspense, lazy, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { m, useScroll, useSpring } from 'framer-motion';
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import {
  ArrowUpRight,
  Braces,
  Code2,
  Database,
  Download,
  ExternalLink,
  Mail,
  MapPin,
  Phone,
  Rocket,
  Send,
  ServerCog,
  Trophy,
} from 'lucide-react';
import { AnimatedCounter } from './components/AnimatedCounter.jsx';
import { Reveal } from './components/Reveal.jsx';
import { SkillBadge } from './components/SkillBadge.jsx';
import { useTypeCycle } from './hooks/useTypeCycle.js';
import { useCanRunBackgroundAnimation } from './hooks/useCanRunBackgroundAnimation.js';
import { useSmoothScroll } from './hooks/useSmoothScroll.js';
import { useSectionMood } from './hooks/useSectionMood.js';
import { useMagnetic } from './hooks/useMagnetic.js';
import { useTilt } from './hooks/useTilt.js';
import { useScrambleText } from './hooks/useScrambleText.js';
import { MobileNav } from './components/MobileNav.jsx';
import { ContactForm } from './components/ContactForm.jsx';
import { ErrorBoundary } from './components/ErrorBoundary.jsx';
import { Preloader } from './components/Preloader.jsx';
import { ProjectCard } from './components/ProjectCard.jsx';
import { analytics } from './utils/analytics.js';
import { achievements, clubs, education, experience, heroRoles, profile, projects, skills, stats } from './data/portfolio.js';

const navItems = ['work', 'systems', 'wins', 'contact'];
const iconMap = [Database, ServerCog, Braces, Rocket];

gsap.registerPlugin(SplitText);

import { ImageSequenceBackground } from './components/ImageSequenceBackground.jsx';

function MagneticNavItem({ item, activeSection }) {
  const ref = useMagnetic(0.3);
  return (
    <a
      ref={ref}
      href={`#${item}`}
      className={activeSection === item ? 'active' : ''}
      aria-current={activeSection === item ? 'page' : undefined}
    >
      {item}
    </a>
  );
}

function HeroName({ play }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    if (!play) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    let split;
    const ctx = gsap.context(() => {
      split = new SplitText(ref.current, { type: 'words', wordsClass: 'word' });
      if (prefersReducedMotion) { 
        gsap.set(split.words, { opacity: 1, y: 0 }); 
        return; 
      }

      gsap.fromTo(split.words,
        { y: 15, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.85, stagger: 0.04, ease: 'power3.out', delay: 0.1 }
      );
    }, ref);

    return () => {
      if (split) split.revert();
      ctx.revert();
    };
  }, [play]);
  return (
    <h1 id="hero-title">
      <span ref={ref} aria-hidden="true">Neel<br/>Shingavi</span>
      <span className="sr-only">Neel Shingavi</span>
    </h1>
  );
}

function SystemTile({ item, Icon }) {
  const tiltRef = useTilt(8);
  return (
    <div ref={tiltRef} className="system-tile">
      <Icon size={24} />
      <span>{item}</span>
    </div>
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

function App() {
  useSmoothScroll();
  useSectionMood();
  const ringRef = useRef(null);
  const dotRef = useRef(null);
  const [activeSection, setActiveSection] = useState('');
  const [preloaderComplete, setPreloaderComplete] = useState(false);
  const heroText = useTypeCycle(heroRoles);
  const scrambledHeroText = useScrambleText(heroText);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 34, restDelta: 0.001 });
  const canRunBackground = useCanRunBackgroundAnimation();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to('.hero-portrait', {
        yPercent: 14,
        ease: 'none',
        scrollTrigger: { trigger: '.hero-section', start: 'top top', end: 'bottom top', scrub: 0.6 },
      });

      gsap.from('.project-card', {
        y: 60, opacity: 0, rotateX: 8,
        stagger: 0.09, ease: 'power3.out',
        scrollTrigger: { trigger: '.project-grid', start: 'top 80%', end: 'top 30%', scrub: 0.5 },
      });

      gsap.fromTo('.timeline-progress-line',
        { scaleY: 0 },
        { scaleY: 1, ease: 'none', transformOrigin: 'top',
          scrollTrigger: { trigger: '.timeline-layout', start: 'top center', end: 'bottom center', scrub: true } }
      );

      gsap.utils.toArray('.timeline-block').forEach((block) => {
        gsap.fromTo(block, 
          { opacity: 0.2 }, 
          { opacity: 1, 
            scrollTrigger: { 
              trigger: block, 
              start: 'top center', 
              end: 'center center', 
              scrub: true 
            } 
          });
      });

      gsap.from('.signal-node', {
        scale: 0.85, opacity: 0,
        stagger: { each: 0.08, from: 'random' },
        ease: 'back.out(1.6)',
        scrollTrigger: { trigger: '.signal-map', start: 'top 75%' },
      });

      gsap.from('.system-tile', {
        rotateY: -25, opacity: 0, y: 30,
        stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: '.system-grid', start: 'top 80%' },
      });
    });
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    // Check user's motion preference before setting up GSAP cursor
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return; // Skip cursor animations entirely

    const ring = ringRef.current;
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
      const target = e.target.closest('a, button, [role="button"], .skill-badge, .project-card, .metric-item, .trophy-card');
      if (target) {
        let color = '#bff205'; // default lime
        if (target.classList.contains('coral') || target.closest('.coral')) color = '#ff6b6b';
        else if (target.classList.contains('teal') || target.closest('.teal')) color = '#00e5ff';
        else if (target.classList.contains('gold') || target.closest('.gold')) color = '#fbc02d';
        else if (target.getAttribute('style')?.includes('--hover-color')) {
          const match = target.getAttribute('style').match(/--hover-color:\s*([^;]+)/);
          if (match) color = match[1].trim();
        }

        gsap.to(ring, {
          scale: 1.8,
          borderColor: color,
          backgroundColor: color.startsWith('#') ? `${color}15` : 'rgba(191, 242, 5, 0.08)',
          borderWidth: '2px',
          duration: 0.2,
        });
        gsap.to(dot, {
          scale: 0.4,
          backgroundColor: color,
          duration: 0.2,
        });
      }
    };

    const handleMouseOut = (e) => {
      const target = e.target.closest('a, button, [role="button"], .skill-badge, .project-card, .metric-item, .trophy-card');
      if (target) {
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

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
            analytics.sectionReached(entry.target.id);
          }
        });
      },
      { rootMargin: '-30% 0px -50% 0px' }
    );

    const sections = document.querySelectorAll('section[id]');
    sections.forEach((sec) => observer.observe(sec));

    return () => {
      sections.forEach((sec) => observer.unobserve(sec));
    };
  }, []);

  // Title progress %
  useEffect(() => {
    const originalTitle = document.title;
    const unsubscribe = scrollYProgress.on('change', (v) => {
      const percent = Math.round(v * 100);
      if (percent > 2 && percent < 98) {
        document.title = `${percent}% | Neel Shingavi`;
      } else {
        document.title = originalTitle;
      }
    });
    return unsubscribe;
  }, [scrollYProgress]);

  // Track time on page
  useEffect(() => {
    const startTime = Date.now();
    const handleUnload = () => {
      const seconds = Math.round((Date.now() - startTime) / 1000);
      analytics.timeOnPage(seconds);
    };
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') handleUnload();
    });
    return () => handleUnload();
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const active = document.querySelector(`.nav-links a.active`);
      const indicator = document.querySelector('.nav-indicator');
      if (active && indicator) {
        const { offsetLeft, offsetWidth } = active;
        gsap.to(indicator, { x: offsetLeft, width: offsetWidth, duration: 0.45, ease: 'power3.out' });
      }
    });
    return () => ctx.revert();
  }, [activeSection]);

  return (
    <>
      {/* Skip link MUST be first */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <m.div
        className="progress-bar"
        style={{ scaleX }}
        role="progressbar"
        aria-label="Page scroll progress"
        aria-valuemin={0}
        aria-valuemax={100}
      />

      <Preloader onComplete={() => setPreloaderComplete(true)} />
      <ErrorBoundary fallback={null}>
        <Suspense fallback={null}>
          {canRunBackground && <ImageSequenceBackground />}
        </Suspense>
      </ErrorBoundary>

      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />

      <header className="site-header">
        <a className="brand" href="#top" aria-label="Go to top">
          <img src="/favicon-96x96.png" alt="Logo" className="brand-logo" />
          <small>Product Engineer</small>
        </a>
        <nav className="nav-links" aria-label="Primary navigation" style={{ position: 'relative' }}>
          <div className="nav-indicator" style={{ position: 'absolute', bottom: -6, left: 0, height: 2, background: 'var(--lime)', borderRadius: 2 }} />
          {navItems.map((item) => (
            <MagneticNavItem key={item} item={item} activeSection={activeSection} />
          ))}
        </nav>
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
        <MobileNav activeSection={activeSection} />
      </header>

      <main id="main-content">
        {/* We use #top for 'back to top' targeting */}
        <div id="top"></div>
        <section className="hero-section section-shell" aria-labelledby="hero-title">
          <div className="hero-copy">
            <m.p
              className="eyebrow"
              initial={{ opacity: 0, y: 20 }}
              animate={preloaderComplete ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.7 }}
            >
              {profile.title}
            </m.p>
            <HeroName play={preloaderComplete} />
            <m.p
              className="hero-summary"
              initial={{ opacity: 0, y: 24 }}
              animate={preloaderComplete ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
              transition={{ delay: 0.5, duration: 0.75 }}
            >
              {profile.summary}
            </m.p>
            <m.div
              className="hero-actions"
              initial={{ opacity: 0, y: 22 }}
              animate={preloaderComplete ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }}
              transition={{ delay: 0.65, duration: 0.7 }}
            >
              <a
                className="secondary-action"
                href="#contact"
                onClick={() => analytics.ctaClicked('hero_contact')}
              >
                <Mail size={18} />
                Let's connect
              </a>
              <a
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
              </a>
              <a
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
              </a>
            </m.div>
          </div>




        </section>

        <section className="metric-strip" aria-label="Portfolio metrics">
          {stats.map((stat) => (
            <div className={`metric-item ${stat.accent}`} key={stat.label}>
              <strong>
                <AnimatedCounter value={stat.value} suffix={stat.suffix} decimals={stat.decimals} />
              </strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </section>

        <section className="about-section section-shell" id="systems" aria-labelledby="systems-heading">
          <Reveal className="section-heading">
            <p className="eyebrow">Builder profile</p>
            <h2 id="systems-heading">Software that moves from idea to production.</h2>
          </Reveal>
          <div className="about-grid">
            <Reveal className="about-copy">
              <p>
                I work closest to backend systems, data products, and practical AI. The pattern across my projects is
                simple: understand the workflow, design the architecture, ship the product, and make sure real users can
                depend on it.
              </p>
              <p>
                That shows up in QueryPilot analyzing large transaction datasets, TradersDesk running daily broker
                workflows, and CertiCraft automating event operations with QR validation and email distribution.
              </p>
            </Reveal>

            <div className="system-grid">
              {['Backend Architecture', 'LLM Analytics', 'Workflow Automation', 'Client Delivery'].map((item, index) => {
                const Icon = iconMap[index];
                return <SystemTile key={item} item={item} Icon={Icon} />;
              })}
            </div>
          </div>
        </section>

        <section className="experience-section section-shell" aria-labelledby="experience-heading">
          <Reveal className="section-heading split-heading">
            <div>
              <p className="eyebrow">Background</p>
              <h2 id="experience-heading">Professional experience and academic foundation.</h2>
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

          <div className="timeline-layout">
            <div className="timeline-progress-line"></div>
            <div className="timeline-column">
              <h3 className="timeline-title">Experience</h3>
              {experience.map((item) => (
                <div className="timeline-block" key={item.company}>
                  <span>{item.period}</span>
                  <h3>{item.company}</h3>
                  <p>{item.role}</p>
                  <ul>
                    {item.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="education-column">
              <h3 className="timeline-title">Education</h3>
              {education.map((item, index) => (
                <Reveal className="education-item" delay={index * 0.08} key={item.school}>
                  <span>{item.period}</span>
                  <h3>{item.school}</h3>
                  <p>{item.course}</p>
                  <strong>{item.result}</strong>
                </Reveal>
              ))}
            </div>
            <div className="timeline-column">
              <h3 className="timeline-title">Clubs & Leadership</h3>
              {clubs.map((item) => (
                <Reveal className="timeline-block" key={item.company}>
                  <span>{item.period}</span>
                  <h3>{item.company}</h3>
                  <p>{item.role}</p>
                  <ul>
                    {item.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="work-section section-shell" id="work" aria-labelledby="work-heading">
          <Reveal className="section-heading">
            <p className="eyebrow">Selected work</p>
            <h2 id="work-heading">Projects built around measurable outcomes.</h2>
          </Reveal>

          {projects.length > 0 ? (
            <div className="project-grid">
              {projects.map((project, index) => (
                <ProjectCard key={project.name} project={project} index={index} />
              ))}
            </div>
          ) : null}
        </section>

        <section className="skills-section section-shell" aria-labelledby="skills-heading">
          <Reveal className="section-heading">
            <p className="eyebrow">Stack architecture</p>
            <h2 id="skills-heading">The tools behind the shipped work.</h2>
          </Reveal>
          <div className="skills-board">
            {skills.map((group, index) => (
              <Reveal className="skill-group" delay={index * 0.06} key={group.label}>
                <h3>{group.label}</h3>
                <ul className="skills-grid" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {group.items.map((item) => (
                    <li key={item}>
                      <SkillBadge name={item} />
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="wins-section section-shell" id="wins" aria-labelledby="wins-heading">
          <Reveal className="section-heading split-heading">
            <div>
              <p className="eyebrow">Competitive proof</p>
              <h2 id="wins-heading">Hackathon signal, national scale.</h2>
            </div>
            <div className="trophy-pill">
              <Trophy size={18} />
              {achievements.length} major recognitions
            </div>
          </Reveal>

          <div className="signal-map">
            {achievements.map((achievement, index) => (
              <div className={`signal-node ${achievement.tone}`} key={achievement.title}>
                <span>0{index + 1}</span>
                <h3>{achievement.title}</h3>
                <p>{achievement.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="contact-section section-shell" id="contact" aria-labelledby="contact-heading">
          <Reveal className="contact-panel">
            <p className="eyebrow">Contact</p>
            <h2 id="contact-heading">Have a problem, a product idea, or a team that ships?</h2>
            <p>{profile.availability}</p>
            <div className="contact-actions" style={{marginBottom: '20px'}}>
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
                href={`tel:${profile.phone.replaceAll(' ', '')}`}
                onClick={() => analytics.phoneClicked()}
              >
                <Phone size={18} />
                {profile.phone}
              </MagneticAction>
            </div>

            <ContactForm />
          </Reveal>
        </section>
      </main>

      <div className="footer-marquee">
        <span>PRODUCT ENGINEER · BACKEND SYSTEMS · AI ANALYTICS · PRODUCT ENGINEER · BACKEND SYSTEMS · AI ANALYTICS · </span>
        <span>PRODUCT ENGINEER · BACKEND SYSTEMS · AI ANALYTICS · PRODUCT ENGINEER · BACKEND SYSTEMS · AI ANALYTICS · </span>
      </div>
      <footer>
        <span>Designed and built for Neel Shingavi.</span>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="back-to-top underline-draw"
          aria-label="Scroll back to top"
          style={{ background: 'none', border: 'none', color: 'var(--paper)', textDecoration: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}
        >
          Back to top ↑
        </button>
      </footer>
    </>
  );
}

export default App;
