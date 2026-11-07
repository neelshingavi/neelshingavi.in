import { useState, useEffect, useRef } from 'react';
import { Trophy, Award, ExternalLink, X, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { detailedAchievements } from '../data/architecture.js';

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

  // Keyboard navigation for modal: Escape to close, Arrow keys to navigate
  useEffect(() => {
    if (!selectedAchievement) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedAchievement(null);
      } else if (e.key === 'ArrowRight') {
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
    setTimeout(() => modalCloseBtnRef.current?.focus(), 50);

    return () => window.removeEventListener('keydown', handleKeyDown);
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

      {/* Accessible Detail Modal */}
      {selectedAchievement && (
        <div
          className="achievement-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ach-modal-title"
          onClick={() => setSelectedAchievement(null)}
        >
          <div
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
        </div>
      )}
    </div>
  );
}

