import { useState, useId } from 'react';
import {
  Layers,
  Database,
  Cloud,
  RefreshCw,
  Cpu,
  MonitorSmartphone,
  CheckCircle,
} from 'lucide-react';
import { tradersDeskArchitecture } from '../data/architecture.js';

const nodeIcons = {
  client: MonitorSmartphone,
  logic: Cpu,
  local_db: Database,
  sync: RefreshCw,
  cloud_db: Cloud,
};

export function TradersDeskArchitecture() {
  const [activeNodeId, setActiveNodeId] = useState('local_db');
  const [viewMode, setViewMode] = useState('architecture'); // 'architecture' | 'dataflow'
  const [activeFlowStep, setActiveFlowStep] = useState(1);
  const baseId = useId();

  const { title, summary, nodes, dataFlowSteps } = tradersDeskArchitecture;
  const activeNode = nodes.find((n) => n.id === activeNodeId) || nodes[0];

  const handleStepClick = (step) => {
    setActiveFlowStep(step.step);
    setActiveNodeId(step.nodeId);
  };

  return (
    <div id="tradersdesk" className="architecture-explorer-shell" aria-label="TradersDesk Architecture Explorer">
      {/* Explorer Top Bar & View Mode Toggle */}
      <div className="explorer-header">
        <div className="explorer-title-area">
          <div className="explorer-badge">
            <Layers size={14} aria-hidden="true" />
            <span>INTERACTIVE SYSTEM TOPOLOGY</span>
          </div>
          <h3 className="explorer-heading">{title}</h3>
          <p className="explorer-summary">{summary}</p>
        </div>

        <div className="explorer-mode-switch" role="tablist" aria-label="Architecture view mode">
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'architecture'}
            className={`mode-btn ${viewMode === 'architecture' ? 'is-active' : ''}`}
            onClick={() => setViewMode('architecture')}
          >
            Architecture View
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'dataflow'}
            className={`mode-btn ${viewMode === 'dataflow' ? 'is-active' : ''}`}
            onClick={() => setViewMode('dataflow')}
          >
            Data Flow View
          </button>
        </div>
      </div>

      {/* Main Interactive Diagram Canvas */}
      <div className="explorer-body">
        {viewMode === 'architecture' ? (
          <div className="architecture-diagram-wrap">
            {/* SVG Connecting Flow Lines */}
            <svg
              className="architecture-svg"
              viewBox="0 0 1000 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id={`${baseId}-line-grad`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="var(--coral, #ff6b6b)" stopOpacity="0.4" />
                  <stop offset="50%" stopColor="var(--lime)" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="var(--teal, #00e5ff)" stopOpacity="0.4" />
                </linearGradient>
                <filter id={`${baseId}-glow`}>
                  <feGaussianBlur stdDeviation="2.5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Connecting path between sequential nodes */}
              <line
                x1="100"
                y1="50"
                x2="900"
                y2="50"
                className="arch-backbone-line"
              />

              {/* Data packet pulse */}
              <circle r="4" fill="var(--lime)" filter={`url(#${baseId}-glow)`} className="arch-packet">
                <animate
                  attributeName="cx"
                  from="100"
                  to="900"
                  dur="4.5s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="cy"
                  values="50; 50; 50"
                  dur="4.5s"
                  repeatCount="indefinite"
                />
              </circle>
            </svg>

            {/* Nodes Row */}
            <div className="architecture-nodes-row" role="tablist" aria-label="System architecture nodes">
              {nodes.map((node, index) => {
                const Icon = nodeIcons[node.id] || Database;
                const isSelected = activeNodeId === node.id;

                return (
                  <button
                    key={node.id}
                    id={`td-node-tab-${node.id}`}
                    role="tab"
                    type="button"
                    aria-selected={isSelected}
                    aria-controls={`td-node-panel-${node.id}`}
                    tabIndex={isSelected ? 0 : -1}
                    className={`arch-node-box ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => setActiveNodeId(node.id)}
                  >
                    <div className="node-step-index">0{index + 1}</div>
                    <div className="node-icon-pill">
                      <Icon size={20} className="node-icon-svg" aria-hidden="true" />
                    </div>
                    <strong className="node-box-label">{node.label}</strong>
                    <span className="node-box-role">{node.role}</span>
                    <span className="node-select-hint">
                      {isSelected ? 'Selected' : 'Inspect'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* Data Flow Sequence View */
          <div className="dataflow-steps-wrap">
            <div className="dataflow-stepper">
              {dataFlowSteps.map((s) => {
                const isStepActive = activeFlowStep === s.step;
                return (
                  <button
                    key={s.step}
                    type="button"
                    className={`flow-step-pill ${isStepActive ? 'is-step-active' : ''}`}
                    onClick={() => handleStepClick(s)}
                  >
                    <span className="step-num">{s.step}.</span>
                    <span className="step-title">{s.title}</span>
                  </button>
                );
              })}
            </div>

            <div className="dataflow-narrative-card">
              <span className="narrative-tag">TRANSACTION LIFECYCLE STAGE</span>
              <h4>
                {(() => {
                  const activeItem = dataFlowSteps.find((s) => s.step === activeFlowStep);
                  return activeItem ? `${activeItem.step}. ${activeItem.title}` : '';
                })()}
              </h4>
              <p>{dataFlowSteps.find((s) => s.step === activeFlowStep)?.desc}</p>
            </div>
          </div>
        )}

        {/* Selected Node Technical Details Drawer */}
        <div
          id={`td-node-panel-${activeNode.id}`}
          role="tabpanel"
          aria-labelledby={`td-node-tab-${activeNode.id}`}
          className="node-inspect-card"
          tabIndex={0}
        >
          <div className="inspect-header">
            <div>
              <span className="inspect-role">{activeNode.role}</span>
              <h4 className="inspect-name">{activeNode.label}</h4>
            </div>
            <div className="inspect-metric-badge">
              <span className="metric-val">{activeNode.metrics}</span>
            </div>
          </div>

          <div className="inspect-tech-chip">
            <span className="tech-chip-label">Verified Tech Stack:</span>
            <code className="tech-chip-code">{activeNode.tech}</code>
          </div>

          <p className="inspect-description">{activeNode.description}</p>

          <div className="inspect-verification-footer">
            <div className="verify-item">
              <CheckCircle size={14} className="verify-check" aria-hidden="true" />
              <span>Resilient offline execution</span>
            </div>
            <div className="verify-item">
              <CheckCircle size={14} className="verify-check" aria-hidden="true" />
              <span>Local transactional SQLite persistence</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
