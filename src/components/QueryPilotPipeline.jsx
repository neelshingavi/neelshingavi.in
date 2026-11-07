import { useState, useId } from 'react';
import {
  BrainCircuit,
  Database,
  FileCode,
  ShieldCheck,
  Sparkles,
  BarChart3,
  Layers,
  ArrowRight,
  Terminal,
} from 'lucide-react';
import { queryPilotPipeline } from '../data/architecture.js';

const stageIcons = {
  ingestion: Database,
  schema: Layers,
  nl_query: Terminal,
  llm_reasoning: BrainCircuit,
  safety_gate: ShieldCheck,
  execution: FileCode,
  insights: BarChart3,
};

export function QueryPilotPipeline() {
  const [selectedStageId, setSelectedStageId] = useState('execution');
  const baseId = useId();

  const { title, summary, stages } = queryPilotPipeline;
  const activeStage = stages.find((s) => s.id === selectedStageId) || stages[0];

  return (
    <div className="querypilot-pipeline-shell" aria-label="QueryPilot NL-to-SQL Pipeline Explorer">
      {/* Header */}
      <div className="pipeline-header">
        <div className="pipeline-badge">
          <BrainCircuit size={14} aria-hidden="true" />
          <span>NL-TO-SQL ANALYTICAL PIPELINE</span>
        </div>
        <h3 className="pipeline-title">{title}</h3>
        <p className="pipeline-summary">{summary}</p>
      </div>

      {/* Interactive Stages Stepper & SVG Backbone */}
      <div className="pipeline-flow-container">
        <svg className="pipeline-svg-backbone" aria-hidden="true">
          <defs>
            <linearGradient id={`${baseId}-pipe-grad`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--lime)" stopOpacity="0.4" />
              <stop offset="50%" stopColor="var(--violet, #a872ff)" stopOpacity="0.5" />
              <stop offset="100%" stopColor="var(--teal, #00e5ff)" stopOpacity="0.6" />
            </linearGradient>
            <filter id={`${baseId}-pipe-glow`}>
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Continuous connection line */}
          <line x1="5%" y1="50%" x2="95%" y2="50%" className="pipe-wire" />

          {/* Traveling illuminated data pulse */}
          <circle r="4" fill="var(--teal, #00e5ff)" filter={`url(#${baseId}-pipe-glow)`} className="pipe-pulse">
            <animate
              attributeName="cx"
              from="5%"
              to="95%"
              dur="5s"
              repeatCount="indefinite"
            />
          </circle>
        </svg>

        <div className="pipeline-stages-list" role="tablist" aria-label="Pipeline processing stages">
          {stages.map((stage, idx) => {
            const Icon = stageIcons[stage.id] || Sparkles;
            const isSelected = selectedStageId === stage.id;

            return (
              <button
                key={stage.id}
                id={`qp-stage-tab-${stage.id}`}
                role="tab"
                type="button"
                aria-selected={isSelected}
                aria-controls={`qp-stage-panel-${stage.id}`}
                tabIndex={0}
                className={`pipeline-stage-node ${isSelected ? 'is-active-stage' : ''}`}
                onClick={() => setSelectedStageId(stage.id)}
              >
                <div className="stage-num-badge">0{idx + 1}</div>
                <div className="stage-icon-circle">
                  <Icon size={18} aria-hidden="true" />
                </div>
                <strong className="stage-node-name">{stage.name}</strong>
                <span className="stage-node-cat">{stage.category}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Stage Detail & Code/Data Example */}
      <div
        id={`qp-stage-panel-${activeStage.id}`}
        role="tabpanel"
        aria-labelledby={`qp-stage-tab-${activeStage.id}`}
        className="pipeline-inspect-drawer"
      >
        <div className="inspect-drawer-left">
          <div className="stage-category-pill">{activeStage.category}</div>
          <h4 className="stage-detail-heading">{activeStage.name}</h4>
          <div className="stage-tech-row">
            <span className="stage-tech-label">Stack Component:</span>
            <span className="stage-tech-val">{activeStage.tech}</span>
          </div>
          <p className="stage-detail-desc">{activeStage.description}</p>
        </div>

        <div className="inspect-drawer-right">
          <div className="code-example-card">
            <div className="code-card-header">
              <span className="code-dot red" aria-hidden="true" />
              <span className="code-dot yellow" aria-hidden="true" />
              <span className="code-dot green" aria-hidden="true" />
              <span className="code-card-title">VERIFIED PIPELINE PAYLOAD</span>
            </div>
            <pre className="code-card-body">
              <code>{activeStage.sample}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

