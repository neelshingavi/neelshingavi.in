import { useEffect, useState } from 'react';
import './sim.css';

const SAMPLE_OUTPUT_TOKENS = [
  'Streaming ', 'non-custodial ', 'inference ', 'chunks ', 'over ', 'FastAPI ', 'SSE ', 'while ',
  'metering ', 'token ', 'receipts ', 'against ', 'Algorand ', 'PyTeal ', 'escrow ', 'state ',
  'proofs ', 'so ', 'users ', 'pay ', 'only ', 'for ', 'consumed ', 'generation.'
];

const INITIAL_ESCROW = 1000;
const COST_PER_TOKEN = 24;

export default function PayPerUseSim() {
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const [status, setStatus] = useState('idle'); // idle | streaming | settled
  const [tokenCount, setTokenCount] = useState(0);

  const consumed = Math.min(INITIAL_ESCROW, tokenCount * COST_PER_TOKEN);
  const remaining = Math.max(0, INITIAL_ESCROW - consumed);
  const escrowPct = Math.round((remaining / INITIAL_ESCROW) * 100);

  useEffect(() => {
    if (status !== 'streaming') return undefined;

    if (reduced) {
      setTokenCount(SAMPLE_OUTPUT_TOKENS.length);
      setStatus('settled');
      return undefined;
    }

    const timer = setInterval(() => {
      setTokenCount((prev) => {
        const next = prev + 1;
        if (next >= SAMPLE_OUTPUT_TOKENS.length || next * COST_PER_TOKEN >= INITIAL_ESCROW) {
          clearInterval(timer);
          setStatus('settled');
          return Math.min(next, SAMPLE_OUTPUT_TOKENS.length);
        }
        return next;
      });
    }, 50);

    return () => clearInterval(timer);
  }, [status, reduced]);

  const handleStart = () => {
    setTokenCount(0);
    setStatus('streaming');
  };

  const handleStopAndSettle = () => {
    if (status === 'streaming') {
      setStatus('settled');
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setTokenCount(0);
  };

  return (
    <figure className="sim sim-ppu" aria-label="PayPerUseAI metered stream and escrow settlement simulation">
      <div className="sim-head">
        <div className="sim-title-wrap">
          <figcaption className="sim-label">ILLUSTRATIVE SIMULATION · NOT LIVE DATA</figcaption>
          <p className="sim-subnote">
            Stream tokens from the SSE proxy, meter illustrative µALGO units per token, and settle unused escrow back to the user.
          </p>
        </div>

        <div className="sim-controls" data-cursor="Try">
          <button
            type="button"
            className="sim-btn is-primary"
            onClick={handleStart}
            disabled={status === 'streaming'}
          >
            Start SSE Stream
          </button>
          <button
            type="button"
            className="sim-btn is-danger"
            onClick={handleStopAndSettle}
            disabled={status !== 'streaming'}
          >
            Stop &amp; Settle Escrow
          </button>
          <button type="button" className="sim-btn" onClick={handleReset}>
            Reset
          </button>
        </div>
      </div>

      <div className="sim-ppu-grid">
        <div className="sim-stream-box" aria-label="Streamed token output">
          {tokenCount === 0 ? (
            <span className="sim-empty">Press &quot;Start SSE Stream&quot; to meter inference tokens…</span>
          ) : (
            <span>{SAMPLE_OUTPUT_TOKENS.slice(0, tokenCount).join('')}</span>
          )}
        </div>

        <div className="sim-escrow-panel">
          <div className="sim-stat-row">
            <span>Escrow Locked (illustrative)</span>
            <strong>{remaining} / {INITIAL_ESCROW} µALGO</strong>
          </div>
          <div className="sim-meter-track" aria-hidden="true">
            <div className="sim-meter-fill" style={{ width: `${escrowPct}%` }} />
          </div>
          <div className="sim-stat-row">
            <span>Tokens metered</span>
            <strong>{tokenCount}</strong>
          </div>
          <div className="sim-stat-row">
            <span>Consumed (→ Provider)</span>
            <strong style={{ color: '#bff205' }}>{consumed} µALGO</strong>
          </div>
          <div className="sim-stat-row">
            <span>{status === 'settled' ? 'Refunded (→ User)' : 'Escrow Balance'}</span>
            <strong style={{ color: '#00e5ff' }}>{remaining} µALGO</strong>
          </div>
        </div>
      </div>

      <p className="sim-static-benchmark">
        Architecture note: sub-200ms SSE streaming · PyTeal L1 escrow settlement on Algorand testnet.
      </p>

      <p className="sr-only" role="status" aria-live="polite">
        {status === 'idle' && 'PayPerUseAI escrow locked at 1000 micro ALGO.'}
        {status === 'streaming' && `Streaming tokens: ${tokenCount} tokens metered, ${consumed} micro ALGO consumed.`}
        {status === 'settled' && `Settled: ${consumed} micro ALGO released to provider, ${remaining} micro ALGO refunded to user.`}
      </p>
    </figure>
  );
}

