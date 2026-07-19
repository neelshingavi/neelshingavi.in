import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { m, useScroll, useSpring } from 'framer-motion';
import { gsap } from 'gsap';
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
import { useCanRunWebGL } from './hooks/useCanRunWebGL.js';
import { MobileNav } from './components/MobileNav.jsx';
import { ContactForm } from './components/ContactForm.jsx';
import { ErrorBoundary } from './components/ErrorBoundary.jsx';
import { analytics } from './utils/analytics.js';
import { achievements, education, experience, heroRoles, profile, projects, skills, stats } from './data/portfolio.js';

const navItems = ['work', 'systems', 'wins', 'contact'];
const iconMap = [Database, ServerCog, Braces, Rocket];
const BackgroundScene = lazy(() =>
  import('./components/BackgroundScene.jsx').then((module) => ({ default: module.BackgroundScene })),
);

function App() {
  const ringRef = useRef(null);
  const dotRef = useRef(null);
  const [activeSection, setActiveSection] = useState('');
  const heroText = useTypeCycle(heroRoles);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 34, restDelta: 0.001 });
  const canRunWebGL = useCanRunWebGL();

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

      <ErrorBoundary fallback={null}>
        <Suspense fallback={null}>
          {canRunWebGL && <BackgroundScene />}
        </Suspense>
      </ErrorBoundary>

      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />

      <header className="site-header">
        <a className="brand" href="#top" aria-label="Go to top">
          <img src="/favicon-96x96.png" alt="Logo" className="brand-logo" />
          <small>Product Engineer</small>
        </a>
        <nav className="nav-links" aria-label="Primary navigation">
          {navItems.map((item) => (
            <a
              key={item}
              href={`#${item}`}
              className={activeSection === item ? 'active' : ''}
              aria-current={activeSection === item ? 'page' : undefined}
            >
              {item}
            </a>
          ))}
        </nav>
        <a
          className="header-action"
          href={profile.resume}
          target="_blank"
          rel="noopener noreferrer"
          title="Download Neel Shingavi's Resume"
          onClick={() => analytics.resumeDownloaded()}
        >
          <Download size={17} />
          Resume
        </a>
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
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              {profile.title}
            </m.p>
            <m.h1
              id="hero-title"
              initial={{ opacity: 0, y: 44 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            >
              Neel Shingavi
            </m.h1>
            <m.div
              className="type-line"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55, duration: 0.7 }}
              aria-live="polite"
              aria-atomic="true"
            >
              <Code2 size={19} aria-hidden="true" />
              <span>{heroText}</span>
              <i aria-hidden="true" />
            </m.div>
            <m.p
              className="hero-summary"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.75 }}
            >
              {profile.summary}
            </m.p>
            <m.div
              className="hero-actions"
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.7 }}
            >
              <a
                className="primary-action"
                href="#work"
                onClick={() => analytics.ctaClicked('hero_view_work')}
              >
                View shipped work
                <ArrowUpRight size={18} />
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

          <m.div
            className="hero-portrait"
            initial={{ opacity: 0, scale: 0.96, y: 34 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.28, duration: 1.05, ease: [0.22, 1, 0.36, 1] }}
          >
            <picture>
              <source srcSet="/assets/neel-shingavi.avif" type="image/avif" />
              <source srcSet="/assets/neel-shingavi.webp" type="image/webp" />
              <img src="/assets/neel-shingavi.jpg" alt="Portrait of Neel Shingavi, Product Engineer specializing in Backend Systems and AI Analytics" loading="eager" fetchPriority="high" />
            </picture>
            <div className="portrait-scan" />
            <div className="portrait-tag tag-one">LLM + SQL</div>
            <div className="portrait-tag tag-two">Java Systems</div>
            <div className="portrait-tag tag-three">Client Delivery</div>
          </m.div>


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
                return (
                  <Reveal className="system-tile" delay={index * 0.08} key={item}>
                    <Icon size={24} />
                    <span>{item}</span>
                  </Reveal>
                );
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
            <a
              href={profile.resume}
              target="_blank"
              rel="noopener noreferrer"
              title="Download full resume PDF"
              onClick={() => analytics.resumeDownloaded()}
            >
              Download full resume
              <Download size={17} />
            </a>
          </Reveal>

          <div className="timeline-layout">
            <div className="timeline-column">
              <h3 className="timeline-title">Experience</h3>
              {experience.map((item) => (
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
                <Reveal className={`project-card ${project.color}`} delay={index * 0.07} key={project.name}>
                  <div className="project-index">0{index + 1}</div>
                  <div>
                    <span>{project.type}</span>
                    <h3>{project.name}</h3>
                    <p>{project.description}</p>
                  </div>
                  <div className="impact-list">
                    {project.impact.map((item) => (
                      <strong key={item}>{item}</strong>
                    ))}
                  </div>
                  <div className="stack-list">
                    {project.stack.map((item) => (
                      <em key={item}>{item}</em>
                    ))}
                  </div>
                </Reveal>
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
                <div>
                  {group.items.map((item) => (
                    <SkillBadge key={item} name={item} />
                  ))}
                </div>
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
              6 major recognitions
            </div>
          </Reveal>

          <div className="signal-map">
            {achievements.map((achievement, index) => (
              <Reveal className={`signal-node ${achievement.tone}`} delay={index * 0.08} key={achievement.title}>
                <span>0{index + 1}</span>
                <h3>{achievement.title}</h3>
                <p>{achievement.detail}</p>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="contact-section section-shell" id="contact" aria-labelledby="contact-heading">
          <Reveal className="contact-panel">
            <p className="eyebrow">Contact</p>
            <h2 id="contact-heading">Have a problem, a product idea, or a team that ships?</h2>
            <p>{profile.availability}</p>
            <div className="contact-actions" style={{marginBottom: '20px'}}>
              <a
                className="primary-action"
                href={`mailto:${profile.email}`}
                onClick={() => analytics.emailClicked()}
              >
                <Mail size={18} />
                {profile.email}
              </a>
              <a
                className="secondary-action"
                href={`tel:${profile.phone.replaceAll(' ', '')}`}
                onClick={() => analytics.phoneClicked()}
              >
                <Phone size={18} />
                {profile.phone}
              </a>
            </div>

            <ContactForm />
          </Reveal>
        </section>
      </main>

      <footer>
        <span>Designed and built for Neel Shingavi.</span>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="back-to-top"
          aria-label="Scroll back to top"
          style={{ background: 'none', border: 'none', color: 'var(--paper)', textDecoration: 'underline', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}
        >
          Back to top ↑
        </button>
      </footer>
    </>
  );
}

export default App;
