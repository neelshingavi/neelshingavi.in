import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ExternalLink, X, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { detailedAchievements } from '../data/architecture.js';
import { lenis } from '../hooks/useSmoothScroll.js';

const getStandingMeta = (title, id) => {
  if (title.includes('1st Position')) return { label: '1st Place Winner', icon: '🥇' };
  if (title.includes('2nd Position')) return { label: '2nd Place', icon: '🥈' };
  if (title.includes('Global') || id === 'meta') return { label: 'Global Finalist', icon: '🌐' };
  return { label: 'Finalist', icon: '🏅' };
};

const getCleanTitle = (title) => {
  return title.replace(/^(1st Position|2nd Position|Finalist)\s*[—–-]\s*/i, '');
};

export function AchievementGallery() {
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const modalCloseBtnRef = useRef(null);
  const modalBoxRef = useRef(null);
  const previousFocusRef = useRef(null);

  // Keyboard navigation for modal: Escape to close, Arrow keys to navigate, focus restoration, Tab focus containment
  useEffect(() => {
    if (!selectedAchievement) {
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        previousFocusRef.current.focus();
        previousFocusRef.current = null;
      }
      return;
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
    // Focus close button on modal open
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

  return (
    <div className="achievement-gallery-shell" aria-label="Competitive Hackathon & Project Achievements">
      {/* Cards Grid */}
      <div className="achievements-cards-grid">
        {detailedAchievements.map((ach, idx) => {
          const standing = getStandingMeta(ach.title, ach.id);
          const cleanTitle = getCleanTitle(ach.title);

          return (
            <button
              key={ach.id}
              type="button"
              className={`achievement-card-interactive tone-${ach.tone}`}
              onClick={() => setSelectedAchievement(ach)}
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
                  <span>View Proof & Details</span>
                  <ExternalLink size={13} aria-hidden="true" />
                </span>
              </div>
            </button>
          );
        })}
      </div>

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
