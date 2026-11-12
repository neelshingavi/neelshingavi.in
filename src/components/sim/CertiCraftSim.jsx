import { useEffect, useState } from 'react';
import './sim.css';

const ROSTER = [
  { id: 'CC-01', name: 'Aarav Mehta', role: 'Finalist' },
  { id: 'CC-02', name: 'Diya Kulkarni', role: 'Winner' },
  { id: 'CC-03', name: 'Rohan Joshi', role: 'Participant' },
  { id: 'CC-04', name: 'Sneha Patil', role: 'Finalist' },
  { id: 'CC-05', name: 'Kabir Sharma', role: 'Participant' },
  { id: 'CC-06', name: 'Ananya Deshmukh', role: 'Winner' },
  { id: 'CC-07', name: 'Vivaan Kulkarni', role: 'Participant' },
  { id: 'CC-08', name: 'Meera Nair', role: 'Finalist' },
  { id: 'CC-09', name: 'Aditya Rao', role: 'Participant' },
  { id: 'CC-10', name: 'Ishita Verma', role: 'Participant' },
  { id: 'CC-11', name: 'Pranav Kale', role: 'Finalist' },
  { id: 'CC-12', name: 'Kavya Iyer', role: 'Winner' },
];

function DecorativeQrStamp() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0 }}>
      <rect x="2" y="2" width="7" height="7" fill="none" stroke="#00e5ff" strokeWidth="1.8" />
      <rect x="4" y="4" width="3" height="3" fill="#00e5ff" />
      <rect x="15" y="2" width="7" height="7" fill="none" stroke="#00e5ff" strokeWidth="1.8" />
      <rect x="17" y="4" width="3" height="3" fill="#00e5ff" />
      <rect x="2" y="15" width="7" height="7" fill="none" stroke="#00e5ff" strokeWidth="1.8" />
      <rect x="4" y="17" width="3" height="3" fill="#00e5ff" />
      <rect x="13" y="13" width="3" height="3" fill="#bff205" />
      <rect x="18" y="15" width="4" height="4" fill="#bff205" />
      <rect x="13" y="19" width="4" height="3" fill="#00e5ff" />
    </svg>
  );
}

export default function CertiCraftSim() {
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const [issuedCount, setIssuedCount] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return undefined;

    if (reduced) {
      setIssuedCount(ROSTER.length);
      setRunning(false);
      return undefined;
    }

    const timer = setInterval(() => {
      setIssuedCount((prev) => {
        const next = prev + 1;
        if (next >= ROSTER.length) {
          clearInterval(timer);
          setRunning(false);
        }
        return next;
      });
    }, 180);

    return () => clearInterval(timer);
  }, [running, reduced]);

  const handleRun = () => {
    setIssuedCount(0);
    setRunning(true);
  };

  const handleReset = () => {
    setRunning(false);
    setIssuedCount(0);
  };

  const scaledTotal = Math.round((issuedCount / ROSTER.length) * 300);

  return (
    <figure className="sim sim-cert" aria-label="CertiCraft batch certificate generation simulation">
      <div className="sim-head">
        <div className="sim-title-wrap">
          <figcaption className="sim-label">ILLUSTRATIVE SIMULATION · NOT LIVE DATA</figcaption>
          <p className="sim-subnote">
            12-row CSV batch preview with decorative QR stamp indicators (scaled representation of a 300-participant queue).
          </p>
        </div>

        <div className="sim-controls" data-cursor="Try">
          <button
            type="button"
            className="sim-btn is-primary"
            onClick={handleRun}
            disabled={running}
          >
            Run batch
          </button>
          <button type="button" className="sim-btn" onClick={handleReset}>
            Reset
          </button>
        </div>
      </div>

      <div className="sim-cert-grid">
        <ul className="sim-roster-list" aria-label="Sample CSV participant roster">
          {ROSTER.map((person, idx) => (
            <li
              key={person.id}
              className={`sim-roster-item ${idx < issuedCount ? 'is-done' : ''}`}
            >
              <span>{person.id}, {person.name}</span>
              <span>{idx < issuedCount ? 'queued' : person.role}</span>
            </li>
          ))}
        </ul>

        <div className="sim-cert-cards" aria-label="Generated certificate cards">
          {issuedCount === 0 ? (
            <p className="sim-empty" style={{ gridColumn: '1 / -1' }}>
              Click &quot;Run batch&quot; to stamp decorative QR certificates from CSV roster.
            </p>
          ) : (
            ROSTER.slice(0, issuedCount).map((person) => (
              <div key={person.id} className="sim-cert-card">
                <DecorativeQrStamp />
                <div>
                  <div style={{ fontWeight: 700, color: '#f4f0df' }}>{person.name}</div>
                  <div style={{ color: '#00e5ff' }}>{person.id} · Queued</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="sim-stat-row" style={{ marginTop: 12 }}>
        <span>Batch counter (scaled): {scaledTotal} / 300</span>
        <span>Headline outcome: 300+ participants · under 4 minutes</span>
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {issuedCount === 0
          ? 'Ready to run batch certificate generation.'
          : `${issuedCount} of ${ROSTER.length} sample certificates stamped; equivalent scaled batch ${scaledTotal} of 300.`}
      </p>
    </figure>
  );
}

