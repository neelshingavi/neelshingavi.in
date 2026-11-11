import { useState, useRef, useEffect } from 'react';
import { Database, ServerCog, Braces, Rocket, ArrowRight, CheckCircle2 } from 'lucide-react';
import { systemsCapabilities } from '../data/architecture.js';

const iconMap = {
  backend: Database,
  llm: ServerCog,
  automation: Braces,
  delivery: Rocket,
};

export function SystemsNetwork() {
  const [selectedId, setSelectedId] = useState(systemsCapabilities[0].id);
  const [isMobile, setIsMobile] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(motionQuery.matches);
    const handleMotionChange = (e) => setPrefersReducedMotion(e.matches);
    if (motionQuery.addEventListener) {
      motionQuery.addEventListener('change', handleMotionChange);
    } else {
      motionQuery.addListener(handleMotionChange);
    }

    return () => {
      window.removeEventListener('resize', checkMobile);
      if (motionQuery.removeEventListener) {
        motionQuery.removeEventListener('change', handleMotionChange);
      } else {
        motionQuery.removeListener(handleMotionChange);
      }
    };
  }, []);

  // Viewport intersection observer to pause animations when off-screen
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const activeCapability = systemsCapabilities.find((c) => c.id === selectedId) || systemsCapabilities[0];

  const handleKeyDown = (e, index) => {
    let nextIndex = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      nextIndex = (index + 1) % systemsCapabilities.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      nextIndex = (index - 1 + systemsCapabilities.length) % systemsCapabilities.length;
    } else if (e.key === 'Home') {
      nextIndex = 0;
    } else if (e.key === 'End') {
      nextIndex = systemsCapabilities.length - 1;
    }

    if (nextIndex !== null) {
      e.preventDefault();
      const target = systemsCapabilities[nextIndex];
      setSelectedId(target.id);
      document.getElementById(`sys-tab-${target.id}`)?.focus();
    }
  };

  return (
    <div className="systems-network-shell" ref={containerRef}>
      {/* Capability Grid with Numeric SVG Coordinate Connectors */}
      <div className="systems-mesh-wrapper">
        {!isMobile && (
          <svg
            className="systems-svg-canvas"
            viewBox="0 0 1000 600"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="sys-line-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--lime)" stopOpacity="0.4" />
                <stop offset="50%" stopColor="var(--violet, #a872ff)" stopOpacity="0.25" />
                <stop offset="100%" stopColor="var(--teal, #00e5ff)" stopOpacity="0.4" />
              </linearGradient>
              <filter id="sys-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Cross-mesh network lines with strict numeric coordinates */}
            {/* Top horizontal connection: Center (250, 150) -> (750, 150) */}
            <path id="path-h1" d="M 250 150 L 750 150" className="sys-wire" />
            {/* Left vertical connection: Center (250, 150) -> (250, 450) */}
            <path id="path-v1" d="M 250 150 L 250 450" className="sys-wire" />
            {/* Diagonal connection: Center (250, 150) -> (750, 450) */}
            <path id="path-diag" d="M 250 150 L 750 450" className="sys-wire diag" />
            {/* Bottom horizontal connection: Center (250, 450) -> (750, 450) */}
            <path id="path-h2" d="M 250 450 L 750 450" className="sys-wire" />
            {/* Right vertical connection: Center (750, 150) -> (750, 450) */}
            <path id="path-v2" d="M 750 150 L 750 450" className="sys-wire" />

            {/* Traveling Data Packet: Rendered only when active in viewport and without reduced motion */}
            {isInView && !prefersReducedMotion ? (
              <circle r="4" fill="var(--lime)" filter="url(#sys-glow)" className="sys-packet">
                <animateMotion
                  dur="7s"
                  repeatCount="indefinite"
                  path="M 250 150 L 750 150 L 750 450 L 250 450 Z"
                />
              </circle>
            ) : (
              <circle cx="250" cy="150" r="3" fill="var(--lime)" opacity="0.6" />
            )}
          </svg>
        )}

        <div className="systems-tiles-grid" role="tablist" aria-label="Engineering capability network">
          {systemsCapabilities.map((cap, index) => {
            const Icon = iconMap[cap.id] || Database;
            const isSelected = selectedId === cap.id;

            return (
              <button
                key={cap.id}
                id={`sys-tab-${cap.id}`}
                role="tab"
                type="button"
                aria-selected={isSelected}
                aria-controls={`sys-panel-${cap.id}`}
                tabIndex={isSelected ? 0 : -1}
                className={`system-node-card ${isSelected ? 'is-active' : ''}`}
                onClick={() => setSelectedId(cap.id)}
                onMouseEnter={() => !isMobile && setSelectedId(cap.id)}
                onKeyDown={(e) => handleKeyDown(e, index)}
              >
                <div className="node-top-bar">
                  <div className="node-icon-wrapper">
                    <Icon size={22} className="node-icon" aria-hidden="true" />
                  </div>
                  <span className="node-indicator" aria-hidden="true" />
                </div>

                <div className="node-content">
                  <span className="node-title">{cap.title}</span>
                  <p className="node-sub">{cap.subtitle}</p>
                </div>

                <div className="node-footer">
                  <span className="node-prompt">
                    {isSelected ? 'Active Focus' : 'Inspect Architecture'}
                  </span>
                  <ArrowRight size={14} className="node-arrow" aria-hidden="true" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Technical Deep Dive Panel */}
      <div
        id={`sys-panel-${activeCapability.id}`}
        role="tabpanel"
        aria-labelledby={`sys-tab-${activeCapability.id}`}
        className="system-detail-drawer"
        tabIndex={0}
      >
        <div className="detail-drawer-header">
          <div className="drawer-header-meta">
            <span className="drawer-kicker">TECHNICAL CAPABILITY SPECIFICATION</span>
            <h3 className="drawer-title">{activeCapability.title}</h3>
            <p className="drawer-subtitle">{activeCapability.subtitle}</p>
          </div>
          <div className="drawer-tags-wrap">
            {activeCapability.tech.map((t) => (
              <span key={t} className="drawer-tech-tag">
                {t}
              </span>
            ))}
          </div>
        </div>

        <p className="drawer-summary">{activeCapability.summary}</p>

        <div className="drawer-specs-grid">
          {activeCapability.details.map((point, index) => (
            <div key={index} className="spec-item">
              <CheckCircle2 size={15} className="spec-icon" aria-hidden="true" />
              <span className="spec-text">{point}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
