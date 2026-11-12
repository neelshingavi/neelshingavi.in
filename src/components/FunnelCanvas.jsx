import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CheckCircle2, ExternalLink } from 'lucide-react';
import { detailedAchievements } from '../data/architecture.js';
import { AchievementGallery } from './AchievementGallery.jsx';

gsap.registerPlugin(ScrollTrigger);

function computeGridLayout(total, width, height) {
  const safeW = Math.max(240, width);
  const safeH = Math.max(180, height);
  const cols = Math.max(1, Math.ceil(Math.sqrt(total * (safeW / safeH))));
  const cell = safeW / cols;
  const rows = Math.ceil(total / cols);
  const adjustedCell = Math.min(cell, safeH / Math.max(1, rows));
  const dot = Math.max(1.2, Math.min(adjustedCell * 0.56, 14));
  return { cols, cell: adjustedCell, dot, xOffset: Math.max(0, (safeW - cols * adjustedCell) / 2), yOffset: Math.max(0, (safeH - rows * adjustedCell) / 2) };
}

function paintFunnelFrame(ctx, stage, width, height) {
  const { total, lit, rank, accent } = stage.funnel;
  const { cols, cell, dot, xOffset, yOffset } = computeGridLayout(total, width, height);

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = 'rgba(244, 240, 223, 0.16)';

  for (let i = lit; i < total; i += 1) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    ctx.fillRect(xOffset + col * cell, yOffset + row * cell, dot, dot);
  }

  const litDot = Math.max(dot, Math.min(8, cell * 0.72, total > 5000 ? 3.2 : 6));
  const shift = (litDot - dot) / 2;

  for (let i = 0; i < lit; i += 1) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const isSpecificSecondPlace = rank === 2 && lit === 2 && i === 0;
    ctx.fillStyle = isSpecificSecondPlace ? 'rgba(244, 240, 223, 0.5)' : accent;
    ctx.fillRect(xOffset + col * cell - shift, yOffset + row * cell - shift, litDot, litDot);
  }
}

export default function FunnelCanvas() {
  const stages = useMemo(
    () =>
      [...detailedAchievements]
        .filter((a) => Boolean(a.funnel))
        .sort((a, b) => b.funnel.total - a.funnel.total || a.funnel.lit - b.funnel.lit),
    []
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [showAllCards, setShowAllCards] = useState(false);
  const [isDesktopAnimated, setIsDesktopAnimated] = useState(() => {
    if (typeof window === 'undefined') return true;
    return (
      window.innerWidth >= 768 &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  });

  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const currentDrawnRef = useRef(-1);
  const cacheRef = useRef(new Map());

  useEffect(() => {
    const checkMode = () => {
      const mobile = window.innerWidth < 768;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      setIsDesktopAnimated(!mobile && !reduced);
    };
    checkMode();
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    mq.addEventListener('change', checkMode);
    window.addEventListener('resize', checkMode);
    return () => {
      mq.removeEventListener('change', checkMode);
      window.removeEventListener('resize', checkMode);
    };
  }, []);

  const drawStageToCanvas = (idx, animateFade = true) => {
    const canvas = canvasRef.current;
    const wrap = canvas?.parentElement;
    if (!canvas || !wrap) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = wrap.clientWidth;
    const H = wrap.clientHeight;
    if (W <= 0 || H <= 0) return;

    if (canvas.width !== Math.round(W * dpr) || canvas.height !== Math.round(H * dpr)) {
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
    }

    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const stage = stages[idx];
    if (!stage) return;

    const cacheKey = `${stage.id}-${W}x${H}-${dpr}`;
    const renderBits = () => {
      let cached = cacheRef.current.get(cacheKey);
      if (!cached) {
        const offscreen = document.createElement('canvas');
        offscreen.width = canvas.width;
        offscreen.height = canvas.height;
        const offCtx = offscreen.getContext('2d');
        offCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
        paintFunnelFrame(offCtx, stage, W, H);
        cached = offscreen;
        cacheRef.current.set(cacheKey, cached);
      }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(cached, 0, 0);
    };

    if (!animateFade) {
      renderBits();
      return;
    }

    gsap.killTweensOf(canvas);
    gsap.to(canvas, {
      opacity: 0,
      duration: 0.14,
      onComplete: () => {
        renderBits();
        gsap.to(canvas, { opacity: 1, duration: 0.28 });
      },
    });
  };

  useLayoutEffect(() => {
    if (!isDesktopAnimated || showAllCards) return undefined;
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return undefined;

    const showStage = (idx, animate = true) => {
      if (idx === currentDrawnRef.current) return;
      currentDrawnRef.current = idx;
      setActiveIndex(idx);
      drawStageToCanvas(idx, animate);
    };

    currentDrawnRef.current = -1;
    showStage(0, false);

    const mm = gsap.matchMedia();
    mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
      const pinTrigger = ScrollTrigger.create({
        trigger: wrap,
        pin: true,
        start: 'top top',
        end: `+=${stages.length * 60}%`,
        onUpdate: (self) => {
          const idx = Math.min(stages.length - 1, Math.floor(self.progress * stages.length));
          showStage(idx, true);
        },
      });

      const visTrigger = ScrollTrigger.create({
        trigger: wrap,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (self) => {
          canvas.style.visibility = self.isActive ? 'visible' : 'hidden';
        },
      });

      return () => {
        visTrigger.kill();
        pinTrigger.kill(true);
        ScrollTrigger.refresh();
      };
    });

    ScrollTrigger.refresh();
    return () => mm.revert();
  }, [isDesktopAnimated, showAllCards, stages]);

  const handleManualStageSelect = (idx) => {
    currentDrawnRef.current = idx;
    setActiveIndex(idx);
    drawStageToCanvas(idx, true);
  };

  const activeStage = stages[activeIndex] || stages[0];

  // Fallback for mobile & reduced-motion: static proportional mini dot-field list + AchievementGallery
  if (!isDesktopAnimated) {
    return (
      <div className="funnel-fallback-wrap">
        <div className="funnel-mini-grid" aria-label="Competition scale comparison">
          {stages.map((s) => {
            const isScaledDown = s.funnel.total > 1200;
            const totalDots = Math.min(180, isScaledDown ? 180 : Math.max(40, Math.round(s.funnel.total / 4)));
            const litDots = Math.max(1, Math.round((s.funnel.lit / s.funnel.total) * totalDots));
            return (
              <div key={s.id} className="funnel-mini-card">
                <div className="funnel-mini-top">
                  <strong>{s.organization}</strong>
                  <span>{s.scale}</span>
                </div>
                <div className="funnel-mini-dots" aria-hidden="true">
                  {Array.from({ length: totalDots }, (_, idx) => (
                    <span
                      key={idx}
                      style={{
                        background: idx < litDots ? s.funnel.accent : 'rgba(244,240,223,0.16)',
                      }}
                    />
                  ))}
                </div>
                <small className="funnel-mini-note">
                  {s.funnel.lit} of {s.funnel.total.toLocaleString()}+ teams{isScaledDown ? ' · not to scale' : ''}
                </small>
              </div>
            );
          })}
        </div>
        <AchievementGallery />
      </div>
    );
  }

  return (
    <div className="funnel-shell">
      <div className="funnel-mode-bar">
        <button
          type="button"
          className={`funnel-mode-btn ${!showAllCards ? 'is-active' : ''}`}
          onClick={() => setShowAllCards(false)}
        >
          Crowd Funnel View
        </button>
        <button
          type="button"
          className={`funnel-mode-btn ${showAllCards ? 'is-active' : ''}`}
          onClick={() => setShowAllCards(true)}
        >
          All 6 Recognition Cards
        </button>
      </div>

      {showAllCards ? (
        <AchievementGallery />
      ) : (
        <div className="fx-funnel-pin-guard">
          <div ref={wrapRef} className="fx-funnel" aria-label="Competitive scale crowd funnel">
            <div className="fx-funnel-grid">
            <div className="fx-funnel-canvas-box">
              <div className="fx-funnel-canvas-header">
                <span className="fx-funnel-kicker">
                  CROWD SCALE · {String(activeIndex + 1).padStart(2, '0')} / {String(stages.length).padStart(2, '0')}
                </span>
                <span className="fx-funnel-ratio" style={{ color: activeStage.funnel.accent }}>
                  {activeStage.funnel.lit.toLocaleString()} lit / {activeStage.funnel.total.toLocaleString()}+ stated teams
                </span>
              </div>

              <div className="fx-funnel-canvas-wrap">
                <canvas ref={canvasRef} aria-hidden="true" />
              </div>

              <p className="fx-funnel-footnote">
                *Dot count = stated minimum number of competing teams ({activeStage.funnel.total.toLocaleString()} dots rendered).
              </p>
            </div>

            <div className="fx-funnel-detail-card">
              <div className="fx-funnel-stage-pills" role="tablist" aria-label="Recognition funnel stages">
                {stages.map((s, idx) => (
                  <button
                    key={s.id}
                    type="button"
                    role="tab"
                    aria-selected={idx === activeIndex}
                    className={`fx-funnel-pill ${idx === activeIndex ? 'is-active' : ''}`}
                    style={idx === activeIndex ? { borderColor: s.funnel.accent, color: s.funnel.accent } : undefined}
                    onClick={() => handleManualStageSelect(idx)}
                  >
                    {s.funnel.total >= 1000 ? `${s.funnel.total / 1000}k+` : `${s.funnel.total}+`}
                  </button>
                ))}
              </div>

              <div className="fx-funnel-meta">
                <span>{activeStage.organization} · {activeStage.year}</span>
                <span style={{ color: activeStage.funnel.accent }}>{activeStage.scale}</span>
              </div>

              <h3 className="fx-funnel-title">{activeStage.title}</h3>
              <p className="fx-funnel-summary">{activeStage.summary}</p>

              <ul className="fx-funnel-impact">
                {activeStage.impact.map((point) => (
                  <li key={point}>
                    <CheckCircle2 size={14} style={{ color: activeStage.funnel.accent, flexShrink: 0 }} aria-hidden="true" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>

              <div className="fx-funnel-footer">
                <span className="fx-funnel-role">Role: {activeStage.role} · {activeStage.project}</span>
                {activeStage.projectAnchor && (
                  <a href={activeStage.projectAnchor} className="fx-funnel-link" style={{ color: activeStage.funnel.accent }}>
                    <span>{activeStage.linkText}</span>
                    <ExternalLink size={13} aria-hidden="true" />
                  </a>
                )}
              </div>
            </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
