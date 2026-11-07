import { useState, useRef, useEffect } from 'react';
import { Database, ServerCog, Braces, Rocket, ArrowRight, CheckCircle2, ChevronDown } from 'lucide-react';
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
  const containerRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const activeCapability = systemsCapabilities.find((c) => c.id === selectedId) || systemsCapabilities[0];

  return (
    <div className="systems-network-shell" ref={containerRef}>
      {/* Capability Grid with SVG Circuit Connectors */}
      <div className="systems-mesh-wrapper">
        {!isMobile && (
          <svg className="systems-svg-canvas" aria-hidden="true">
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

            {/* Cross-mesh network lines */}
            <path
              id="path-h1"
              d="M 25% 25% L 75% 25%"
              className="sys-wire"
            />
            <path
              id="path-v1"
              d="M 25% 25% L 25% 75%"
              className="sys-wire"
            />
            <path
              id="path-diag"
              d="M 25% 25% L 75% 75%"
              className="sys-wire diag"
            />
            <path
              id="path-h2"
              d="M 25% 75% L 75% 75%"
              className="sys-wire"
            />
            <path
              id="path-v2"
              d="M 75% 25% L 75% 75%"
              className="sys-wire"
            />

            {/* Active Data Packet */}
            <circle r="3.5" fill="var(--lime)" filter="url(#sys-glow)" className="sys-packet">
              <animateMotion
                dur="7s"
                repeatCount="indefinite"
                path="M 25% 25% L 75% 25% L 75% 75% L 25% 75% Z"
              />
            </circle>
          </svg>
        )}

        <div className="systems-tiles-grid" role="tablist" aria-label="Engineering capability network">
          {systemsCapabilities.map((cap) => {
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
                tabIndex={0}
                className={`system-node-card ${isSelected ? 'is-active' : ''}`}
                onClick={() => setSelectedId(cap.id)}
                onMouseEnter={() => !isMobile && setSelectedId(cap.id)}
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

