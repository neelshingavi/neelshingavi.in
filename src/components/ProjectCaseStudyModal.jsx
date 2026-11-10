import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  ExternalLink,
  FolderGit2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Layers,
  Sparkles,
  Calendar,
  UserCheck,
} from 'lucide-react';
import { TradersDeskArchitecture } from './TradersDeskArchitecture.jsx';
import { QueryPilotPipeline } from './QueryPilotPipeline.jsx';
import { lenis } from '../hooks/useSmoothScroll.js';

export function ProjectCaseStudyModal({ caseStudy, isOpen, onClose }) {
  const closeBtnRef = useRef(null);
  const previousFocusRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !caseStudy) {
      if (previousFocusRef.current && previousFocusRef.current.isConnected && typeof previousFocusRef.current.focus === 'function') {
        previousFocusRef.current.focus();
        previousFocusRef.current = null;
      }
      return;
    }

    previousFocusRef.current = document.activeElement;

    // Prevent body scrolling and pause Lenis while modal is open
    document.body.style.overflow = 'hidden';
    lenis?.stop();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'Tab') {
        const focusable = modalRef.current?.querySelectorAll(
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
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const timer = setTimeout(() => closeBtnRef.current?.focus(), 50);

    return () => {
      document.body.style.overflow = '';
      lenis?.start();
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
      if (previousFocusRef.current && previousFocusRef.current.isConnected && typeof previousFocusRef.current.focus === 'function') {
        previousFocusRef.current.focus();
        previousFocusRef.current = null;
      }
    };
  }, [isOpen, caseStudy, onClose]);

  if (!isOpen || !caseStudy) return null;

  return createPortal(
    <div className="case-study-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="cs-title">
      <div
        className="case-study-dialog"
        data-lenis-prevent="true"
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        {/* Modal Top Bar */}
        <div className="cs-header-bar">
          <div className="cs-header-left">
            <span className="cs-badge" style={{ borderColor: caseStudy.accent, color: caseStudy.accent }}>
              <Layers size={13} aria-hidden="true" />
              <span>{caseStudy.badge}</span>
            </span>
            <span className="cs-period">
              <Calendar size={13} aria-hidden="true" />
              <span>{caseStudy.period}</span>
            </span>
          </div>

          <button
            ref={closeBtnRef}
            type="button"
            className="cs-close-btn"
            onClick={onClose}
            aria-label="Close Case Study"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="cs-body-scroll">
          {/* Title Area */}
          <div className="cs-title-area">
            <h2 id="cs-title" className="cs-main-title">{caseStudy.name}</h2>
            <p className="cs-tagline">{caseStudy.tagline}</p>
            <div className="cs-meta-strip">
              <div className="cs-meta-chip">
                <span className="chip-label">Role:</span>
                <strong className="chip-val">{caseStudy.role}</strong>
              </div>
              <div className="cs-meta-chip">
                <span className="chip-label">Status:</span>
                <strong className="chip-val">{caseStudy.status}</strong>
              </div>
            </div>
          </div>

          {/* Visual Showcase / Blueprint Panel */}
          {caseStudy.blueprint && (
            <div className="cs-visual-panel">
              <img
                src={caseStudy.blueprint}
                alt={`${caseStudy.name} System Architecture Blueprint`}
                className="cs-blueprint-img"
                loading="eager"
              />
            </div>
          )}

          {/* Overview & Problem */}
          <div className="cs-section-block">
            <h3 className="cs-section-heading">1. System Overview &amp; Context</h3>
            <p className="cs-paragraph">{caseStudy.overview}</p>
          </div>

          <div className="cs-section-block">
            <h3 className="cs-section-heading">2. The Core Operational Problem</h3>
            <p className="cs-paragraph">{caseStudy.problem}</p>
          </div>

          <div className="cs-section-block">
            <h3 className="cs-section-heading">3. Shipped Solution &amp; Product Architecture</h3>
            <p className="cs-paragraph">{caseStudy.productDescription}</p>
            {caseStudy.architecture && (
              <ul className="cs-bullet-list">
                {caseStudy.architecture.map((arch, idx) => (
                  <li key={idx} className="cs-bullet-item">
                    <CheckCircle2 size={15} className="cs-bullet-icon" style={{ color: caseStudy.accent }} aria-hidden="true" />
                    <span>{arch}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Embedded Interactive Architecture Explorer for Flagships */}
            {caseStudy.id === 'project-tradersdesk' && (
              <div className="cs-embedded-explorer-shell">
                <TradersDeskArchitecture />
              </div>
            )}

            {caseStudy.id === 'project-querypilot' && (
              <div className="cs-embedded-explorer-shell">
                <QueryPilotPipeline />
              </div>
            )}
          </div>

          {/* Key Technical Decisions */}
          {caseStudy.technicalDecisions && (
            <div className="cs-section-block">
              <h3 className="cs-section-heading">4. Key Architectural Decisions &amp; Trade-offs</h3>
              <div className="cs-decisions-grid">
                {caseStudy.technicalDecisions.map((td, idx) => (
                  <div key={idx} className="cs-decision-card">
                    <h4 className="decision-title">{td.decision}</h4>
                    <p className="decision-rationale">{td.rationale}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Challenges Overcome */}
          {caseStudy.challenges && (
            <div className="cs-section-block">
              <h3 className="cs-section-heading">5. Engineering Challenges Overcome</h3>
              <ul className="cs-bullet-list">
                {caseStudy.challenges.map((ch, idx) => (
                  <li key={idx} className="cs-bullet-item">
                    <ShieldCheck size={15} className="cs-bullet-icon" style={{ color: 'var(--coral, #ff5e3a)' }} aria-hidden="true" />
                    <span>{ch}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Verified Outcomes */}
          {caseStudy.outcomes && (
            <div className="cs-section-block outcomes-block">
              <h3 className="cs-section-heading">6. Verified Outcomes &amp; Measurable Impact</h3>
              <div className="cs-outcomes-grid">
                {caseStudy.outcomes.map((out, idx) => (
                  <div key={idx} className="cs-outcome-card">
                    <Sparkles size={16} className="outcome-icon" style={{ color: caseStudy.accent }} aria-hidden="true" />
                    <span className="outcome-text">{out}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Verified Stack Tags */}
          <div className="cs-section-block">
            <h3 className="cs-section-heading">7. Verified Technology Stack</h3>
            <div className="cs-stack-pills">
              {caseStudy.stack.map((item) => (
                <span key={item} className="cs-stack-pill">
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* External Links Bar */}
          <div className="cs-actions-bar">
            {caseStudy.photosLink && (
              <a
                href={caseStudy.photosLink}
                target="_blank"
                rel="noopener noreferrer"
                className="cs-action-btn primary"
              >
                <FolderGit2 size={15} aria-hidden="true" />
                <span>View Client Deployment Photos</span>
                <ExternalLink size={14} aria-hidden="true" />
              </a>
            )}

            {caseStudy.githubLink && (
              <a
                href={caseStudy.githubLink}
                target="_blank"
                rel="noopener noreferrer"
                className="cs-action-btn secondary"
              >
                <FolderGit2 size={15} aria-hidden="true" />
                <span>View GitHub Profile</span>
                <ExternalLink size={14} aria-hidden="true" />
              </a>
            )}

            <button type="button" className="cs-action-btn tertiary" onClick={onClose}>
              Back to Overview
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

