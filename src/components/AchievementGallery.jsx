import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ExternalLink, X, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { detailedAchievements } from '../data/architecture.js';
import { lenis } from '../hooks/useSmoothScroll.js';

gsap.registerPlugin(ScrollTrigger);

const getStandingMeta = (title, id) => {
  if (title.includes('1st Position')) return { label: '1st Place Winner', icon: '🥇' };
  if (title.includes('2nd Position')) return { label: '2nd Place', icon: '🥈' };
  if (title.includes('Global') || id === 'meta') return { label: 'Global Finalist', icon: '🌐' };
  return { label: 'Finalist', icon: '🏅' };
};

const getCleanTitle = (title) => {
  return title.replace(/^(1st Position|2nd Position|Finalist)\s*[—–-]\s*/i, '');
};

function AchievementCard({ ach, idx, onSelect }) {
  const standing = getStandingMeta(ach.title, ach.id);
  const cleanTitle = getCleanTitle(ach.title);

  return (
    <button
      type="button"
      data-cursor="Inspect"
      className={`achievement-card-interactive tone-${ach.tone}`}
      onClick={() => onSelect(ach)}
    >
      <div className="ach-card-top">
        <div className="ach-badge-group">
          <span className="ach-index">0{idx + 1}</span>
          <span className={`ach-standing-pill tone-${ach.tone}`}>
            <span className="ach-standing-icon" aria-hidden="true">{standing.icon}</span>
            <span>{standing.label}</span>
          </span>
        </div>
        <span className="ach-scale-chip">{ach.scale}</span>
      </div>

      <div className="ach-card-body">
        <h3 className="ach-card-title">{cleanTitle}</h3>
        <p className="ach-card-org">{ach.organization} · {ach.year}</p>
        <p className="ach-card-summary">{ach.summary}</p>
      </div>

      <div className="ach-card-footer">
        <span className="ach-project-tag">
          <span className="ach-project-label">Project:</span>{' '}
          <span className="ach-project-val">{ach.project}</span>
        </span>
        <span className={`ach-inspect-link tone-${ach.tone}`}>
          <span>View Proof &amp; Details</span>
          <ExternalLink size={13} aria-hidden="true" />
        </span>
      </div>
    </button>
  );
}

export function AchievementGallery() {
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [scrollRatio, setScrollRatio] = useState(0);
  const [isPinnedDesktop, setIsPinnedDesktop] = useState(() => {
    if (typeof window === 'undefined') return true;
    return (
      window.innerWidth >= 768 &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  });

  const pinStageRef = useRef(null);
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const triggerRef = useRef(null);
  const mobileRailRef = useRef(null);
  const modalCloseBtnRef = useRef(null);
  const modalBoxRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    const updateMode = () => {
      const mobile = window.innerWidth < 768;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      setIsPinnedDesktop(!mobile && !reduced);
    };
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    mq.addEventListener('change', updateMode);
    window.addEventListener('resize', updateMode);
    return () => {
      mq.removeEventListener('change', updateMode);
      window.removeEventListener('resize', updateMode);
    };
  }, []);

  useLayoutEffect(() => {
    if (!isPinnedDesktop) return undefined;
    const stage = pinStageRef.current;
    const pinTarget = stage?.closest('.wins-pin-inner') || stage;
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!pinTarget || !viewport || !track) return undefined;

    const getTravel = () => Math.max(0, track.scrollWidth - viewport.clientWidth);

    const mm = gsap.matchMedia();
    mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
      gsap.set(track, { x: 0 });
      const tween = gsap.to(track, {
        x: () => -getTravel(),
        ease: 'none',
        scrollTrigger: {
          trigger: pinTarget,
          pin: true,
          scrub: 0.45,
          invalidateOnRefresh: true,
          start: 'top 86px',
          end: () => `+=${Math.min(720, Math.max(460, getTravel() * 0.72))}`,
          onUpdate: (self) => {
            setScrollRatio(self.progress);
          },
        },
      });

      triggerRef.current = tween.scrollTrigger;
      ScrollTrigger.refresh();

      return () => {
        triggerRef.current = null;
        tween.scrollTrigger?.kill(true);
        tween.kill();
        gsap.set(track, { clearProps: 'transform' });
        ScrollTrigger.refresh();
      };
    });

    return () => mm.revert();
  }, [isPinnedDesktop]);

  // Keyboard navigation for modal: Escape to close, Arrow keys to navigate, focus restoration, Tab focus containment
  useEffect(() => {
    if (!selectedAchievement) {
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        previousFocusRef.current.focus();
        previousFocusRef.current = null;
      }
      return undefined;
    }

    previousFocusRef.current = document.activeElement;
    document.body.style.overflow = 'hidden';
    lenis?.stop();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedAchievement(null);
        return;
      }
      if (e.key === 'Tab') {
        const focusable = modalBoxRef.current?.querySelectorAll(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
        return;
      }
      if (e.key === 'ArrowRight') {
        const currIdx = detailedAchievements.findIndex((a) => a.id === selectedAchievement.id);
        const nextIdx = (currIdx + 1) % detailedAchievements.length;
        setSelectedAchievement(detailedAchievements[nextIdx]);
      } else if (e.key === 'ArrowLeft') {
        const currIdx = detailedAchievements.findIndex((a) => a.id === selectedAchievement.id);
        const prevIdx = (currIdx - 1 + detailedAchievements.length) % detailedAchievements.length;
        setSelectedAchievement(detailedAchievements[prevIdx]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const timer = setTimeout(() => modalCloseBtnRef.current?.focus(), 50);

    return () => {
      if (!window.location.hash.toLowerCase().startsWith('#casestudy-')) {
        document.body.style.overflow = '';
        lenis?.start();
      }
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [selectedAchievement]);

  const jumpToProgress = (targetProgress) => {
    const st = triggerRef.current;
    if (!st) return;
    const clamped = Math.max(0, Math.min(1, targetProgress));
    const y = st.start + clamped * (st.end - st.start);
    const activeLenis = lenis || (typeof window !== 'undefined' ? window.__lenis : null);
    if (activeLenis) {
      activeLenis.scrollTo(y, { duration: 0.7, force: true });
    } else {
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const scrollFallbackRail = (dir) => {
    const rail = mobileRailRef.current;
    if (!rail) return;
    const step = Math.max(260, rail.clientWidth * 0.85);
    rail.scrollBy({ left: dir * step, behavior: 'smooth' });
  };

  const firstVisible = Math.min(4, Math.round(scrollRatio * 3) + 1);
  const lastVisible = Math.min(6, firstVisible + 2);

  return (
    <div className="achievement-gallery-shell" aria-label="Competitive Hackathon & Project Achievements">
      {isPinnedDesktop ? (
        <div className="ach-pin-host">
          <div ref={pinStageRef} className="ach-scroll-stage">
            <div className="ach-batch-bar">
              <div className="ach-batch-tabs">
                <button
                  type="button"
                  className="ach-nav-arrow"
                  aria-label="Scroll earlier recognitions into view"
                  onClick={() => jumpToProgress(Math.max(0, scrollRatio - 0.34))}
                  disabled={scrollRatio <= 0.04}
                >
                  <ChevronLeft size={15} aria-hidden="true" />
                </button>
                <span className="ach-progress-track" aria-hidden="true">
                  <span
                    className="ach-progress-fill"
                    style={{ width: `${Math.round(scrollRatio * 100)}%` }}
                  />
                </span>
                <button
                  type="button"
                  className="ach-nav-arrow"
                  aria-label="Scroll next recognitions into view"
                  onClick={() => jumpToProgress(Math.min(1, scrollRatio + 0.34))}
                  disabled={scrollRatio >= 0.96}
                >
                  <ChevronRight size={15} aria-hidden="true" />
                </button>
              </div>
              <span className="ach-scroll-hint">
                Showing 0{firstVisible} — 0{lastVisible} of 0{detailedAchievements.length} · Scroll for horizontal glide
              </span>
            </div>

            <div ref={viewportRef} className="ach-hscroll-viewport">
              <div ref={trackRef} className="ach-hscroll-track">
                {detailedAchievements.map((ach, idx) => (
                  <AchievementCard
                    key={ach.id}
                    ach={ach}
                    idx={idx}
                    onSelect={setSelectedAchievement}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="ach-fallback-carousel">
          <div className="ach-batch-bar">
            <span className="ach-scroll-hint">Swipe or scroll horizontally (01 — 06)</span>
            <div className="ach-batch-tabs">
              <button
                type="button"
                className="ach-nav-arrow"
                aria-label="Scroll recognitions left"
                onClick={() => scrollFallbackRail(-1)}
              >
                <ChevronLeft size={15} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="ach-nav-arrow"
                aria-label="Scroll recognitions right"
                onClick={() => scrollFallbackRail(1)}
              >
                <ChevronRight size={15} aria-hidden="true" />
              </button>
            </div>
          </div>
          <div
            ref={mobileRailRef}
            className="ach-hscroll-fallback-rail"
            data-lenis-prevent="true"
            tabIndex={0}
            aria-label="Horizontally scrollable recognitions list"
          >
            {detailedAchievements.map((ach, idx) => (
              <AchievementCard key={ach.id} ach={ach} idx={idx} onSelect={setSelectedAchievement} />
            ))}
          </div>
        </div>
      )}

      {/* Accessible Detail Modal Portaled to Document Body */}
      {selectedAchievement && typeof document !== 'undefined' && createPortal(
        <div
          className="achievement-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ach-modal-title"
          onClick={() => setSelectedAchievement(null)}
        >
          <div
            ref={modalBoxRef}
            className={`achievement-modal-box tone-${selectedAchievement.tone}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-kicker-group">
                <span className="modal-kicker">VERIFIED COMPETITIVE RECOGNITION</span>
                <span className="modal-year-badge">{selectedAchievement.year}</span>
              </div>
              <button
                ref={modalCloseBtnRef}
                type="button"
                className="modal-close-btn"
                aria-label="Close details"
                onClick={() => setSelectedAchievement(null)}
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <div className="modal-body">
              <h3 id="ach-modal-title" className="modal-title">
                {selectedAchievement.title}
              </h3>
              <div className="modal-meta-row">
                <span className="modal-meta-item">
                  <strong>Organization:</strong> {selectedAchievement.organization}
                </span>
                <span className="modal-meta-item">
                  <strong>Scale:</strong> {selectedAchievement.scale}
                </span>
                <span className="modal-meta-item">
                  <strong>Role:</strong> {selectedAchievement.role}
                </span>
              </div>

              <p className="modal-summary">{selectedAchievement.summary}</p>

              <div className="modal-impact-section">
                <span className="modal-section-title">Verified Technical Outcomes:</span>
                <ul className="modal-impact-list">
                  {selectedAchievement.impact.map((pt, i) => (
                    <li key={i}>
                      <CheckCircle2 size={15} className="modal-check" aria-hidden="true" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="modal-footer">
              <div className="modal-nav-group">
                <button
                  type="button"
                  className="modal-arrow-btn"
                  aria-label="Previous achievement"
                  onClick={() => {
                    const currIdx = detailedAchievements.findIndex(
                      (a) => a.id === selectedAchievement.id
                    );
                    const prevIdx =
                      (currIdx - 1 + detailedAchievements.length) % detailedAchievements.length;
                    setSelectedAchievement(detailedAchievements[prevIdx]);
                  }}
                >
                  <ChevronLeft size={16} aria-hidden="true" />
                  <span>Prev</span>
                </button>
                <button
                  type="button"
                  className="modal-arrow-btn"
                  aria-label="Next achievement"
                  onClick={() => {
                    const currIdx = detailedAchievements.findIndex(
                      (a) => a.id === selectedAchievement.id
                    );
                    const nextIdx = (currIdx + 1) % detailedAchievements.length;
                    setSelectedAchievement(detailedAchievements[nextIdx]);
                  }}
                >
                  <span>Next</span>
                  <ChevronRight size={16} aria-hidden="true" />
                </button>
              </div>

              {selectedAchievement.projectAnchor && (
                <a
                  href={selectedAchievement.projectAnchor}
                  className="modal-project-link"
                  onClick={() => setSelectedAchievement(null)}
                >
                  <span>{selectedAchievement.linkText}</span>
                  <ExternalLink size={14} aria-hidden="true" />
                </a>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
