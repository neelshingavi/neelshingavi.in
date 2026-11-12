import { useEffect, useState } from 'react';
import { queryPilotPipeline } from '../../data/architecture.js';
import { safetyGate } from './safetyGate.js';
import './sim.css';

const SAFE_PRESET = {
  label: 'Ask normally',
  question: queryPilotPipeline.stages[2].sample,
  sql: queryPilotPipeline.stages[5].sample,
  insight: queryPilotPipeline.stages[6].sample,
};

const BREAK_PRESET = {
  label: 'Try to break it',
  question: '"Drop the transactions table after returning rows"',
  sql: 'SELECT 1; DROP TABLE transactions;',
  insight: null,
};

export default function QueryPilotSim() {
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const [mode, setMode] = useState('safe');
  const [customSql, setCustomSql] = useState(SAFE_PRESET.sql);
  const [activeStep, setActiveStep] = useState(0);
  const [typedLen, setTypedLen] = useState(0);
  const [gateResult, setGateResult] = useState(null);
  const [runId, setRunId] = useState(0);

  const stages = queryPilotPipeline.stages;
  const activePreset = mode === 'safe' ? SAFE_PRESET : BREAK_PRESET;

  const launchRun = (nextMode, nextSql) => {
    setMode(nextMode);
    setCustomSql(nextSql);
    setGateResult(null);
    setActiveStep(0);
    setTypedLen(reduced ? nextSql.length : 0);
    setRunId((n) => n + 1);
  };

  // Initial reveal + stepper progression
  useEffect(() => {
    const verdict = safetyGate(customSql);

    if (reduced) {
      setTypedLen(customSql.length);
      setGateResult(verdict);
      setActiveStep(verdict.pass ? stages.length - 1 : 4);
      return undefined;
    }

    let cancelled = false;
    let charTimer = null;
    const stepTimers = [];

    // Type SQL cleanly at ~12ms per character before hitting Stage 5 (index 4)
    let chars = 0;
    charTimer = setInterval(() => {
      if (cancelled) return;
      chars += 3;
      setTypedLen(Math.min(chars, customSql.length));
      if (chars >= customSql.length) {
        clearInterval(charTimer);
      }
    }, 36);

    [0, 1, 2, 3, 4].forEach((stepIdx) => {
      stepTimers.push(
        setTimeout(() => {
          if (cancelled) return;
          setActiveStep(stepIdx);
          if (stepIdx === 4) {
            setGateResult(verdict);
          }
        }, stepIdx * 320)
      );
    });

    if (verdict.pass) {
      [5, 6].forEach((stepIdx) => {
        stepTimers.push(
          setTimeout(() => {
            if (!cancelled) setActiveStep(stepIdx);
          }, stepIdx * 320)
        );
      });
    }

    return () => {
      cancelled = true;
      if (charTimer) clearInterval(charTimer);
      stepTimers.forEach((id) => clearTimeout(id));
    };
  }, [runId, reduced]);

  const blockedAtGate = gateResult && !gateResult.pass;

  return (
    <figure className="sim sim-qp" aria-label="QueryPilot SQL validation and safety gate simulation">
      <div className="sim-head">
        <div className="sim-title-wrap">
          <figcaption className="sim-label">ILLUSTRATIVE SIMULATION · NOT LIVE DATA</figcaption>
          <p className="sim-subnote">
            Runs the real deterministic <code>safetyGate(sql)</code> validator at Stage 5 before PostgreSQL execution.
          </p>
        </div>

        <div className="sim-controls" data-cursor="Try">
          <button
            type="button"
            className={`sim-btn ${mode === 'safe' ? 'is-primary' : ''}`}
            onClick={() => launchRun('safe', SAFE_PRESET.sql)}
          >
            {SAFE_PRESET.label}
          </button>
          <button
            type="button"
            className={`sim-btn ${mode === 'break' ? 'is-danger' : ''}`}
            onClick={() => launchRun('break', BREAK_PRESET.sql)}
          >
            {BREAK_PRESET.label}
          </button>
        </div>
      </div>

      <p className="sim-subnote" style={{ marginBottom: 10 }}>
        Prompt: <strong>{activePreset.question}</strong>
      </p>

      <div className="sim-qp-track" role="list" aria-label="Pipeline execution stages">
        {stages.map((stage, idx) => {
          const isGate = stage.id === 'safety_gate';
          const downstreamDimmed = blockedAtGate && idx > 4;
          const isFailedGate = blockedAtGate && isGate;
          const isPassedGate = gateResult?.pass && isGate && activeStep >= 4;
          const isActive = idx === activeStep && !isFailedGate;
          const isCompleted = !downstreamDimmed && !isFailedGate && idx < activeStep;

          return (
            <div
              key={stage.id}
              role="listitem"
              className={`sim-qp-node ${isActive ? 'is-active' : ''} ${
                isCompleted || isPassedGate ? 'is-pass' : ''
              } ${isFailedGate ? 'is-fail' : ''} ${downstreamDimmed ? 'is-dimmed' : ''}`}
            >
              <div>0{idx + 1}</div>
              <strong>{stage.name}</strong>
            </div>
          );
        })}
      </div>

      <pre className="sim-code-box" aria-label="Generated SQL candidate">
        <code>{customSql.slice(0, typedLen) || ' '}</code>
      </pre>

      {gateResult && (
        <div
          className={`sim-verdict ${blockedAtGate ? 'is-fail' : ''}`}
          role="status"
          aria-live="polite"
        >
          {blockedAtGate ? (
            <>
              <strong>Safety Gate REJECTED at Stage 5:</strong> {gateResult.reason}. Execution blocked before reaching PostgreSQL.
            </>
          ) : activeStep >= 6 ? (
            <>
              <strong>{SAFE_PRESET.insight}</strong>
            </>
          ) : (
            <>
              <strong>Safety Gate PASS:</strong> {gateResult.reason} — forwarding to PostgreSQL execution.
            </>
          )}
        </div>
      )}

      <p className="sim-static-benchmark">
        Static benchmark reference: 250,000+ indexed UPI records · 142ms local PostgreSQL EXPLAIN ANALYZE run.
      </p>
    </figure>
  );
}

