import { useState, useMemo, useRef, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Briefcase,
  GraduationCap,
  Users,
  ChevronDown,
  Calendar,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import { experience, clubs, education } from '../data/portfolio.js';

gsap.registerPlugin(ScrollTrigger);

export function ExperienceTimeline() {
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'work' | 'leadership' | 'education'
  const [expandedIds, setExpandedIds] = useState({});
  const [reducedMotion, setReducedMotion] = useState(() =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  const streamRef = useRef(null);
  const trackRef = useRef(null);
  const laserFillRef = useRef(null);
  const laserTipRef = useRef(null);

  const toggleExpand = (id) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Live reduced-motion preference listener
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e) => setReducedMotion(e.matches);
    setReducedMotion(mq.matches);
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', onChange);
      return () => mq.removeEventListener('change', onChange);
    }
    mq.addListener(onChange);
    return () => mq.removeListener(onChange);
  }, []);

  // Compile timeline items with standardized structured date model and chronological sorting
  const allItems = useMemo(() => {
    const list = [
      ...experience.map((item) => ({
        ...item,
        type: 'work',
        typeLabel: 'Industry Internship',
        icon: Briefcase,
        isCurrent: item.status === 'ongoing',
      })),
      ...clubs.map((item) => ({
        ...item,
        type: 'leadership',
        typeLabel: 'Leadership & Strategy',
        icon: Users,
        isCurrent: item.status === 'ongoing',
      })),
      ...education.map((item) => ({
        ...item,
        company: item.school,
        role: item.course,
        location: 'Pune',
        points: [item.result],
        type: 'education',
        typeLabel: 'Academic Foundation',
        icon: GraduationCap,
        isCurrent: item.status === 'ongoing',
      })),
    ];

    // Sort chronologically by startDate descending (most recent first)
    return list.sort((a, b) => {
      const aDate = a.startDate || '';
      const bDate = b.startDate || '';
      return bDate.localeCompare(aDate);
    });
  }, []);

  const filteredItems = useMemo(() => {
    if (activeFilter === 'all') return allItems;
    return allItems.filter((item) => item.type === activeFilter);
  }, [allItems, activeFilter]);

  // Scroll-driven vertical laser progression & per-milestone illumination
  useEffect(() => {
    const streamEl = streamRef.current;
    const trackEl = trackRef.current;
    const fillEl = laserFillRef.current;
    const tipEl = laserTipRef.current;
    if (!streamEl || !fillEl || !trackEl) return undefined;

    const nodes = Array.from(streamEl.querySelectorAll('.timeline-node-entry'));

    if (reducedMotion) {
      fillEl.style.transform = 'scaleY(1)';
      if (tipEl) tipEl.style.opacity = '0';
      nodes.forEach((node) => {
        node.classList.add('is-reached');
        gsap.set(node, { clearProps: 'transform,opacity' });
      });
      return undefined;
    }

    const syncRail = (progress) => {
      const clamped = Math.max(0, Math.min(1, progress));
      fillEl.style.transform = `scaleY(${clamped})`;
      if (tipEl) {
        const trackH = trackEl.clientHeight || 0;
        tipEl.style.transform = `translate3d(-50%, ${clamped * trackH}px, 0)`;
        tipEl.style.opacity = clamped > 0.01 && clamped < 0.995 ? '1' : '0';
      }
    };

    const ctx = gsap.context(() => {
      const mainSt = ScrollTrigger.create({
        trigger: streamEl,
        start: 'top 72%',
        end: 'bottom 58%',
        scrub: 0.25,
        onUpdate: (self) => syncRail(self.progress),
        onRefresh: (self) => syncRail(self.progress),
      });
      syncRail(mainSt.progress);

      nodes.forEach((node) => {
        const card = node.querySelector('.timeline-node-card');
        const alreadyPastViewport = node.getBoundingClientRect().top < window.innerHeight * 0.85;

        if (!alreadyPastViewport && card) {
          gsap.fromTo(
            card,
            { y: 18, opacity: 0.5 },
            {
              y: 0,
              opacity: 1,
              duration: 0.5,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: node,
                start: 'top 86%',
                once: true,
              },
            }
          );
        } else if (card) {
          gsap.set(card, { y: 0, opacity: 1 });
        }

        ScrollTrigger.create({
          trigger: node,
          start: 'top 70%',
          end: 'bottom top',
          onEnter: () => node.classList.add('is-reached'),
          onEnterBack: () => node.classList.add('is-reached'),
          onLeaveBack: () => node.classList.remove('is-reached'),
          onRefresh: (self) => {
            if (self.progress > 0 || node.getBoundingClientRect().top <= window.innerHeight * 0.7) {
              node.classList.add('is-reached');
            } else {
              node.classList.remove('is-reached');
            }
          },
        });
      });
    }, streamRef);

    // Keep ScrollTrigger bounds synced when accordions expand/collapse or fonts settle
    let rafId = null;
    const ro =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => {
            if (rafId) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => ScrollTrigger.refresh());
          })
        : null;
    if (ro) ro.observe(streamEl);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (ro) ro.disconnect();
      ctx.revert();
    };
  }, [activeFilter, reducedMotion]);

  const filterTabs = [
    { id: 'all', label: 'All Milestones' },
    { id: 'work', label: 'Industry Work' },
    { id: 'leadership', label: 'Leadership & Clubs' },
    { id: 'education', label: 'Education' },
  ];

  return (
    <div className="experience-timeline-shell" aria-label="Professional Experience and Foundation Timeline">
      {/* Category Filter Pills (Button Group with aria-pressed) */}
      <div className="timeline-filter-bar" role="group" aria-label="Filter timeline by category">
        {filterTabs.map((tab) => {
          const isPressed = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              aria-pressed={isPressed}
              className={`timeline-tab-pill ${isPressed ? 'is-active' : ''}`}
              onClick={() => setActiveFilter(tab.id)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Vertical Interactive Scroll-Tracked Timeline */}
      <div className="unified-timeline-stream" ref={streamRef}>
        {/* Base Rail + Scroll-Scrubbed Active Laser Line + Moving Beacon */}
        <div className="timeline-rail-track" ref={trackRef} aria-hidden="true">
          <div className="timeline-laser-line" ref={laserFillRef} />
          <span className="timeline-laser-tip" ref={laserTipRef} />
        </div>

        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isExpanded = !!expandedIds[item.id];
          const drawerId = `timeline-drawer-${item.id}`;

          return (
            <div
              key={item.id}
              className={`timeline-node-entry ${item.isCurrent ? 'is-current-role' : ''}`}
            >
              {/* Milestone Indicator on Line */}
              <div className="timeline-node-dot" aria-hidden="true">
                <span className="dot-inner" />
                {item.isCurrent && !reducedMotion && <span className="dot-pulse-ring" />}
              </div>

              {/* Card Surface */}
              <div className="timeline-node-card">
                {/* Expandable Header as Native Button */}
                <button
                  type="button"
                  className="timeline-card-header"
                  onClick={() => toggleExpand(item.id)}
                  aria-expanded={isExpanded}
                  aria-controls={drawerId}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    background: 'transparent',
                    border: 'none',
                    font: 'inherit',
                    color: 'inherit',
                  }}
                >
                  <div className="card-header-main">
                    <div className="card-type-row">
                      <span className={`card-type-badge type-${item.type}`}>
                        <Icon size={12} aria-hidden="true" />
                        {item.typeLabel}
                      </span>
                      {item.isCurrent && (
                        <span className="current-badge">
                          <span className="live-dot" /> ACTIVE ROLE
                        </span>
                      )}
                    </div>
                    <h3 className="card-company-name">{item.company}</h3>
                    <p className="card-role-title">{item.role}</p>
                  </div>

                  <div className="card-header-meta">
                    <div className="period-chip">
                      <Calendar size={13} aria-hidden="true" />
                      <span>{item.period}</span>
                    </div>
                    {item.location && (
                      <div className="location-chip">
                        <MapPin size={13} aria-hidden="true" />
                        <span>{item.location}</span>
                      </div>
                    )}
                    <ChevronDown
                      size={18}
                      className={`expand-chevron ${isExpanded ? 'is-rotated' : ''}`}
                      aria-hidden="true"
                    />
                  </div>
                </button>

                {/* Collapsible Content */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <m.div
                      id={drawerId}
                      className="timeline-card-drawer"
                      initial={reducedMotion ? false : { opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={reducedMotion ? undefined : { opacity: 0, height: 0 }}
                      transition={{ duration: reducedMotion ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] }}
                      style={{ overflow: 'hidden' }}
                    >
                      {item.type === 'education' ? (
                        <div className="education-highlight">
                          <span className="result-label">Academic Achievement:</span>
                          <strong className="result-val">{item.result}</strong>
                        </div>
                      ) : (
                        <ul className="timeline-points-list">
                          {item.points.map((pt, pIdx) => (
                            <li key={pIdx} className="timeline-point-item">
                              <CheckCircle2 size={15} className="point-icon" aria-hidden="true" />
                              <span>{pt}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </m.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
