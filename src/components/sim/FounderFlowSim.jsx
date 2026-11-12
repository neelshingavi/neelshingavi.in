import { useMemo, useRef, useState } from 'react';
import { criticalPath } from './criticalPath.js';
import './sim.css';

const INITIAL_TASKS = [
  { id: 'T1', label: 'Problem Brief', dur: 2, x: 75, y: 125, deps: [] },
  { id: 'T2', label: 'Schema Model', dur: 3, x: 205, y: 65, deps: ['T1'] },
  { id: 'T3', label: 'Landing Wire', dur: 2, x: 205, y: 185, deps: ['T1'] },
  { id: 'T4', label: 'Core API', dur: 4, x: 350, y: 65, deps: ['T2'] },
  { id: 'T5', label: 'MVP Build', dur: 5, x: 495, y: 125, deps: ['T3', 'T4'] },
  { id: 'T6', label: 'PilotQA', dur: 2, x: 635, y: 125, deps: ['T5'] },
  { id: 'T7', label: 'Launch', dur: 1, x: 745, y: 125, deps: ['T6'] },
];

export default function FounderFlowSim() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [draggingId, setDraggingId] = useState(null);
  const [fromId, setFromId] = useState('T3');
  const [toId, setToId] = useState('T4');
  const [statusMsg, setStatusMsg] = useState(
    'Drag nodes or connect dependencies to recalculate the live critical path.'
  );
  const [rejectedEdge, setRejectedEdge] = useState(null);
  const svgRef = useRef(null);

  const result = useMemo(() => criticalPath(tasks), [tasks]);
  const criticalNodeSet = useMemo(() => new Set(result.path), [result.path]);

  const toSvgCoords = (clientX, clientY) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const x = Math.max(55, Math.min(765, ((clientX - rect.left) / rect.width) * 820));
    const y = Math.max(36, Math.min(214, ((clientY - rect.top) / rect.height) * 250));
    return { x, y };
  };

  const handlePointerMove = (e) => {
    if (!draggingId) return;
    const pt = toSvgCoords(e.clientX, e.clientY);
    if (!pt) return;
    setTasks((prev) =>
      prev.map((task) => (task.id === draggingId ? { ...task, x: pt.x, y: pt.y } : task))
    );
  };

  const handleConnect = () => {
    if (fromId === toId) {
      setStatusMsg('Self-dependency rejected: select two distinct milestones.');
      return;
    }

    const target = tasks.find((t) => t.id === toId);
    if (!target) return;

    if (target.deps.includes(fromId)) {
      setStatusMsg(`Edge ${fromId} → ${toId} already exists.`);
      return;
    }

    const candidateTasks = tasks.map((t) =>
      t.id === toId ? { ...t, deps: [...t.deps, fromId] } : t
    );

    const check = criticalPath(candidateTasks);
    if (check.cycle) {
      setRejectedEdge({ from: fromId, to: toId });
      setStatusMsg(`Cycle rejected (${fromId} → ${toId}): circular dependencies are blocked.`);
      setTimeout(() => setRejectedEdge(null), 900);
      return;
    }

    setRejectedEdge(null);
    setTasks(candidateTasks);
    setStatusMsg(
      `Added ${fromId} → ${toId}. Critical path updated: ${check.path.join(' → ')} (${check.total} illustrative days).`
    );
  };

  const handleReset = () => {
    setTasks(INITIAL_TASKS);
    setRejectedEdge(null);
    setStatusMsg('Reset milestone DAG to initial topology.');
  };

  return (
    <figure className="sim sim-ff" aria-label="FounderFlow interactive milestone DAG and critical path simulation">
      <div className="sim-head">
        <div className="sim-title-wrap">
          <figcaption className="sim-label">ILLUSTRATIVE SIMULATION · NOT LIVE DATA</figcaption>
          <p className="sim-subnote">
            Drag milestone nodes or add a dependency edge; Kahn topological sort blocks circular dependencies live.
          </p>
        </div>

        <div className="sim-controls" data-cursor="Drag">
          <select
            aria-label="Source milestone"
            className="sim-dag-select"
            value={fromId}
            onChange={(e) => setFromId(e.target.value)}
          >
            {tasks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.id} ({t.label})
              </option>
            ))}
          </select>
          <span aria-hidden="true">→</span>
          <select
            aria-label="Target milestone"
            className="sim-dag-select"
            value={toId}
            onChange={(e) => setToId(e.target.value)}
          >
            {tasks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.id} ({t.label})
              </option>
            ))}
          </select>
          <button type="button" className="sim-btn is-primary" onClick={handleConnect}>
            Add Dependency
          </button>
          <button type="button" className="sim-btn" onClick={handleReset}>
            Reset DAG
          </button>
        </div>
      </div>

      <div className="sim-dag-wrap" data-cursor="Drag">
        <svg
          ref={svgRef}
          className="sim-dag-svg"
          viewBox="0 0 820 250"
          onPointerMove={handlePointerMove}
          onPointerUp={() => setDraggingId(null)}
          onPointerCancel={() => setDraggingId(null)}
          onPointerLeave={() => setDraggingId(null)}
        >
          {/* Existing dependency edges */}
          {tasks.flatMap((task) =>
            task.deps.map((depId) => {
              const source = tasks.find((t) => t.id === depId);
              if (!source) return null;
              const isCritical =
                criticalNodeSet.has(source.id) &&
                criticalNodeSet.has(task.id) &&
                result.path.indexOf(task.id) === result.path.indexOf(source.id) + 1;

              return (
                <line
                  key={`${source.id}-${task.id}`}
                  x1={source.x}
                  y1={source.y}
                  x2={task.x}
                  y2={task.y}
                  stroke={isCritical ? '#bff205' : 'rgba(244,240,223,0.28)'}
                  strokeWidth={isCritical ? 2.6 : 1.5}
                />
              );
            })
          )}

          {/* Rejected cycle edge flash */}
          {rejectedEdge && (() => {
            const s = tasks.find((t) => t.id === rejectedEdge.from);
            const d = tasks.find((t) => t.id === rejectedEdge.to);
            if (!s || !d) return null;
            return (
              <line
                x1={s.x}
                y1={s.y}
                x2={d.x}
                y2={d.y}
                stroke="#ff5e3a"
                strokeWidth="3"
                strokeDasharray="6 4"
              />
            );
          })()}

          {/* Draggable milestone nodes */}
          {tasks.map((task) => {
            const isCritical = criticalNodeSet.has(task.id);
            return (
              <g
                key={task.id}
                transform={`translate(${task.x}, ${task.y})`}
                style={{ cursor: 'grab' }}
                onPointerDown={(e) => {
                  e.preventDefault();
                  setDraggingId(task.id);
                }}
              >
                <rect
                  x="-48"
                  y="-22"
                  width="96"
                  height="44"
                  rx="6"
                  fill={isCritical ? 'rgba(191,242,5,0.16)' : '#121410'}
                  stroke={isCritical ? '#bff205' : 'rgba(244,240,223,0.28)'}
                  strokeWidth={isCritical ? 1.8 : 1.2}
                />
                <text
                  textAnchor="middle"
                  y="-2"
                  fill="#f4f0df"
                  fontSize="10.5"
                  fontWeight="700"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {task.id} · {task.label}
                </text>
                <text
                  textAnchor="middle"
                  y="13"
                  fill={isCritical ? '#bff205' : '#aaa28a'}
                  fontSize="9.5"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {task.dur}d (illustrative)
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="sim-dag-bar">
        <span style={{ color: rejectedEdge ? '#ff8e72' : '#bff205' }} role="status" aria-live="polite">
          {statusMsg}
        </span>
        <span>
          Critical Path: <strong>{result.path.join(' → ')}</strong> ({result.total}d)
        </span>
      </div>
    </figure>
  );
}

