import { useEffect, useReducer } from 'react';
import './sim.css';

const INITIAL_STATE = {
  online: true,
  seq: 0,
  local: [],
  queue: [],
  cloud: [],
};

// Deterministic illustrative invoice amount — not live ledger telemetry
const illustrativeAmount = (id) => 1200 + ((id * 7919) % 8800);

function reducer(state, action) {
  switch (action.type) {
    case 'toggle':
      return { ...state, online: !state.online };
    case 'add': {
      const id = state.seq + 1;
      const row = {
        id,
        ref: `BILL-${String(id).padStart(3, '0')}`,
        amt: illustrativeAmount(id),
      };
      return {
        ...state,
        seq: id,
        local: [row, ...state.local].slice(0, 6),
        queue: [...state.queue, row],
      };
    }
    case 'drain': {
      if (!state.online || state.queue.length === 0) return state;
      const [head, ...rest] = state.queue;
      return {
        ...state,
        queue: rest,
        cloud: [head, ...state.cloud].slice(0, 6),
      };
    }
    case 'drainAll': {
      if (!state.online || state.queue.length === 0) return state;
      const reversed = [...state.queue].reverse();
      return {
        ...state,
        queue: [],
        cloud: [...reversed, ...state.cloud].slice(0, 6),
      };
    }
    case 'reset':
      return INITIAL_STATE;
    default:
      return state;
  }
}

export default function TradersDeskSim() {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (!state.online || state.queue.length === 0) return undefined;
    if (reduced) {
      dispatch({ type: 'drainAll' });
      return undefined;
    }
    const timer = setTimeout(() => dispatch({ type: 'drain' }), 420);
    return () => clearTimeout(timer);
  }, [state.online, state.queue.length, reduced]);

  return (
    <figure className="sim sim-td" aria-label="TradersDesk offline-first sync simulation">
      <div className="sim-head">
        <div className="sim-title-wrap">
          <figcaption className="sim-label">ILLUSTRATIVE SIMULATION · NOT LIVE DATA</figcaption>
          <p className="sim-subnote">
            Toggle connectivity offline, record bills into local SQLite, then restore network to watch the changelog drain.
          </p>
        </div>

        <div className="sim-controls" data-cursor="Try">
          <button
            type="button"
            className={`sim-btn ${state.online ? 'is-online' : 'is-toggle-offline'}`}
            onClick={() => dispatch({ type: 'toggle' })}
            aria-pressed={!state.online}
          >
            Network: {state.online ? 'ONLINE' : 'OFFLINE'}
          </button>
          <button
            type="button"
            className="sim-btn is-primary"
            onClick={() => dispatch({ type: 'add' })}
          >
            + Record trade
          </button>
          <button
            type="button"
            className="sim-btn"
            onClick={() => dispatch({ type: 'reset' })}
          >
            Reset
          </button>
        </div>
      </div>

      <div className="sim-cols">
        <section className="sim-pane" aria-label="Local SQLite commits">
          <h4>Desktop · SQLite (Local ACID)</h4>
          {state.local.length === 0 ? (
            <p className="sim-empty">No local commits yet. Click &quot;+ Record trade&quot;.</p>
          ) : (
            <ul className="sim-rows">
              {state.local.map((row) => (
                <li key={row.id} className="row is-local">
                  {row.ref} · ₹{row.amt}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section
          className={`sim-wire ${state.online ? 'is-up' : 'is-down'}`}
          aria-label="Mutation sync queue"
        >
          <span className="sim-wire-badge">
            {state.online ? 'HTTPS DELTA SYNC' : 'NO SIGNAL'}
          </span>
          <b className="sim-count">{state.queue.length}</b>
          <span className="sim-subnote">pending</span>
          <svg width="96" height="16" viewBox="0 0 96 16" aria-hidden="true">
            <line
              x1="4"
              y1="8"
              x2="92"
              y2="8"
              stroke={state.online ? '#00e5ff' : '#ff5e3a'}
              strokeWidth="2"
              strokeDasharray={state.online ? 'none' : '5 5'}
              strokeOpacity="0.6"
            />
            {state.online && state.queue.length > 0 && !reduced && (
              <circle r="3.5" cy="8" fill="#bff205">
                <animate attributeName="cx" from="8" to="88" dur="0.42s" repeatCount="indefinite" />
              </circle>
            )}
          </svg>
        </section>

        <section className="sim-pane" aria-label="Supabase PostgreSQL cloud mirror">
          <h4>Supabase · PostgreSQL</h4>
          {state.cloud.length === 0 ? (
            <p className="sim-empty">
              {state.online ? 'Waiting for local mutations…' : 'Cloud sync paused while offline.'}
            </p>
          ) : (
            <ul className="sim-rows">
              {state.cloud.map((row) => (
                <li key={row.id} className="row is-cloud">
                  {row.ref} · synced
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {state.online
          ? `Online. ${state.queue.length} pending sync items.`
          : `Offline. ${state.queue.length} mutations queued locally in SQLite.`}
      </p>
    </figure>
  );
}

