import { useState, useEffect, useMemo, useRef } from 'react';
import { Trophy, ExternalLink, RefreshCw, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { codeforcesConfig } from '../data/codingProfiles.js';
import { CodingActivityHeader } from './CodingActivityHeader.jsx';
import { useHeatmapRipple } from '../hooks/useHeatmapRipple.js';

gsap.registerPlugin(ScrollTrigger);
import {
  DATA_STATES,
  readCache,
  writeCache,
  formatTimeAgo,
  formatTooltipDate,
  timestampToLocalDateKey,
  buildAligned52WeekGrid,
  safeNumber,
} from '../utils/codingDataHelpers.js';

const CACHE_KEY = `codeforces_contrib_${codeforcesConfig.username}`;
const CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

export function CodeforcesActivity() {
  const [data, setData] = useState(null);
  const [dataState, setDataState] = useState(DATA_STATES.LOADING);
  const [cacheTime, setCacheTime] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hoveredDay, setHoveredDay] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const gridContainerRef = useRef(null);
  const sparkPathRef = useRef(null);
  useHeatmapRipple(gridContainerRef, Boolean(data && dataState !== DATA_STATES.LOADING));

  const fetchCodeforcesData = async (abortSignal, forceBypassCache = false) => {
    // 1. Check local cache
    if (!forceBypassCache) {
      const cached = readCache(CACHE_KEY, CACHE_TTL_MS);
      if (cached && !cached.isStale && typeof cached.payload?.rating === 'number') {
        setData(cached.payload);
        setCacheTime(cached.timestamp);
        setDataState(DATA_STATES.CACHED);
        return;
      }
    }

    // 2. Fetch live endpoints sequentially or with controlled spacing to prevent rate limiting
    try {
      // Step A: user.info (Mandatory)
      const resUser = await fetch(codeforcesConfig.apiUrlInfo, { signal: abortSignal });
      if (!resUser.ok) throw new Error(`user.info HTTP ${resUser.status}`);
      const jsonUser = await resUser.json();
      if (jsonUser.status !== 'OK' || !Array.isArray(jsonUser.result) || !jsonUser.result[0]) {
        throw new Error('user.info payload invalid');
      }
      const u = jsonUser.result[0];

      // Step B: user.rating (Rated contest history)
      let ratedContestsCount = null;
      let bestContestRank = null;
      let ratingHistory = [];
      try {
        const resRating = await fetch(codeforcesConfig.apiUrlRating, { signal: abortSignal });
        if (resRating.ok) {
          const jsonRating = await resRating.json();
          if (jsonRating.status === 'OK' && Array.isArray(jsonRating.result)) {
            ratedContestsCount = jsonRating.result.length;
            ratingHistory = jsonRating.result
              .map((r) => r.newRating)
              .filter((val) => typeof val === 'number');
            if (jsonRating.result.length > 0) {
              const ranks = jsonRating.result
                .map((r) => r.rank)
                .filter((rn) => typeof rn === 'number' && rn > 0);
              if (ranks.length > 0) {
                bestContestRank = Math.min(...ranks);
              }
            }
          }
        }
      } catch {
        // user.rating failure is handled gracefully
      }

      // Step C: user.status (Sample of submissions for calendar)
      let dayCounts = {};
      let recentUniqueSolved = 0;
      let totalSubmissionsSample = 0;
      try {
        const resStatus = await fetch(codeforcesConfig.apiUrlStatus, { signal: abortSignal });
        if (resStatus.ok) {
          const jsonStatus = await resStatus.json();
          if (jsonStatus.status === 'OK' && Array.isArray(jsonStatus.result)) {
            totalSubmissionsSample = jsonStatus.result.length;
            const uniqueSolvedSet = new Set();

            for (const sub of jsonStatus.result) {
              if (sub && sub.creationTimeSeconds) {
                const localDate = timestampToLocalDateKey(sub.creationTimeSeconds);
                if (localDate) {
                  dayCounts[localDate] = (dayCounts[localDate] || 0) + 1;
                }
                if (sub.verdict === 'OK' && sub.problem) {
                  const probKey = `${sub.problem.contestId || ''}-${sub.problem.index || ''}`;
                  uniqueSolvedSet.add(probKey);
                }
              }
            }
            recentUniqueSolved = uniqueSolvedSet.size;
          }
        }
      } catch {
        // status failure is handled gracefully
      }

      const payload = {
        rating: safeNumber(u.rating, 0),
        maxRating: safeNumber(u.maxRating, safeNumber(u.rating, 0)),
        rank: u.rank || 'unrated',
        maxRank: u.maxRank || u.rank || 'unrated',
        ratedContestsCount,
        bestContestRank,
        ratingHistory,
        recentUniqueSolved,
        totalSubmissionsSample,
        dayCounts,
      };

      const now = Date.now();
      setData(payload);
      setCacheTime(now);
      setDataState(DATA_STATES.LIVE);
      writeCache(CACHE_KEY, payload);
      return;
    } catch (err) {
      if (err.name === 'AbortError') return;
      // Network/parse failure: check stale cache or documented snapshot
    }

    // 3. Fallback: Stale cache
    const staleCache = readCache(CACHE_KEY, Infinity);
    if (staleCache && typeof staleCache.payload?.rating === 'number') {
      setData(staleCache.payload);
      setCacheTime(staleCache.timestamp);
      setDataState(DATA_STATES.CACHED);
      return;
    }

    // 4. Fallback: Documented snapshot
    if (codeforcesConfig.staticSnapshot && typeof codeforcesConfig.staticSnapshot.rating === 'number') {
      setData(codeforcesConfig.staticSnapshot);
      setDataState(DATA_STATES.SNAPSHOT);
      return;
    }

    // 5. Unavailable
    setData(null);
    setDataState(DATA_STATES.UNAVAILABLE);
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchCodeforcesData(controller.signal);
    return () => {
      controller.abort();
    };
  }, []);

  const handleManualRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    const controller = new AbortController();
    try {
      await fetchCodeforcesData(controller.signal, true);
    } finally {
      setIsRefreshing(false);
    }
  };

  const sparklinePath = useMemo(() => {
    const pts = data?.ratingHistory;
    if (!Array.isArray(pts) || pts.length < 2) return '';
    const min = Math.min(...pts);
    const max = Math.max(...pts);
    const span = Math.max(1, max - min);
    return pts
      .map((val, idx) => {
        const x = (idx / (pts.length - 1)) * 220;
        const y = 34 - ((val - min) / span) * 26;
        return `${idx === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }, [data?.ratingHistory]);

  useEffect(() => {
    const pathEl = sparkPathRef.current;
    if (!pathEl || !sparklinePath) return undefined;
    const len = pathEl.getTotalLength();
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.set(pathEl, { strokeDasharray: len, strokeDashoffset: len });
      const tw = gsap.to(pathEl, {
        strokeDashoffset: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: pathEl,
          start: 'top 90%',
          end: 'top 55%',
          scrub: true,
        },
      });
      return () => {
        tw.scrollTrigger?.kill();
        tw.kill();
      };
    });
    return () => mm.revert();
  }, [sparklinePath]);

  const { weeks, sampleWindowSubmissionCount } = useMemo(() => {
    const countMap = new Map();
    if (data?.dayCounts && typeof data.dayCounts === 'object') {
      for (const [key, val] of Object.entries(data.dayCounts)) {
        countMap.set(key, Number(val || 0));
      }
    }

    const { weeks: alignedWeeks, allDays } = buildAligned52WeekGrid(countMap, (count) => {
      if (count >= 6) return 4;
      if (count >= 4) return 3;
      if (count >= 2) return 2;
      if (count >= 1) return 1;
      return 0;
    });

    const windowCount = allDays.reduce((acc, d) => acc + (d.isFuture ? 0 : d.count), 0);

    return {
      weeks: alignedWeeks,
      sampleWindowSubmissionCount: windowCount,
    };
  }, [data]);

  const rating = safeNumber(data?.rating, null);
  const rank = data?.rank || '—';
  const ratedContestsCount = safeNumber(data?.ratedContestsCount, null);
  const recentUniqueSolved = safeNumber(data?.recentUniqueSolved, null);
  const totalSubmissionsSample = safeNumber(data?.totalSubmissionsSample, null);
  const bestContestRank = safeNumber(data?.bestContestRank, null);

  const handleCellHover = (e, day) => {
    if (!gridContainerRef.current || day.isFuture) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const parentRect = gridContainerRef.current.getBoundingClientRect();
    setTooltipPos({
      x: rect.left - parentRect.left + rect.width / 2,
      y: rect.top - parentRect.top - 8,
    });
    setHoveredDay(day);
  };

  const handleCellLeave = () => {
    setHoveredDay(null);
  };

  return (
    <div className="github-activity-shell codeforces-activity-shell" aria-label="Codeforces Competitive Programming Activity">
      <CodingActivityHeader
        badgeIcon={Trophy}
        badgeClassName="cf-badge"
        badgeText="COMPETITIVE PROGRAMMING & TIMED CONTESTS"
        heading="Contest Performance & Div. 2 Velocity"
        subtext="Verified competitive programming ratings, timed contest rounds, and submissions recorded on Codeforces."
        onRefresh={handleManualRefresh}
        isRefreshing={isRefreshing}
        isLoading={dataState === DATA_STATES.LOADING}
        refreshClassName="cf-refresh-btn"
        refreshTitle="Refresh Codeforces activity from API"
        refreshAriaLabel="Refresh Codeforces activity data"
        profileUrl={codeforcesConfig.profileUrl}
        profileClassName="cf-profile-btn"
        profileTitle="Visit Neel Shingavi on Codeforces"
        profileLabel={`codeforces.com/profile/${codeforcesConfig.username}`}
      />

      {/* Codeforces Summary Stat Chips */}
      <div className="gh-stats-row cf-stats-row">
        <div className="gh-stat-chip">
          <strong className="gh-stat-val cf-val">
            {dataState === DATA_STATES.LOADING ? '—' : rating !== null ? rating : '—'}
          </strong>
          <span className="gh-stat-label">Rating · {rank.toUpperCase()}</span>
        </div>
        <div className="gh-stat-chip">
          <strong className="gh-stat-val cf-val">
            {dataState === DATA_STATES.LOADING
              ? '—'
              : bestContestRank !== null
                ? `Rank #${bestContestRank}`
                : ratedContestsCount !== null
                  ? `${ratedContestsCount} Rated Rounds`
                  : '—'}
          </strong>
          <span className="gh-stat-label">
            {bestContestRank !== null ? 'Best Contest Placement' : 'Contest Participation'}
          </span>
        </div>
        <div className="gh-stat-chip">
          <strong className="gh-stat-val cf-val">
            {dataState === DATA_STATES.LOADING
              ? '—'
              : recentUniqueSolved !== null
                ? `${recentUniqueSolved} Solved`
                : '—'}
          </strong>
          <span className="gh-stat-label">
            {totalSubmissionsSample !== null
              ? `Sample (${totalSubmissionsSample} Submissions)`
              : 'Recent Submissions'}
          </span>
        </div>
        <div className="gh-stat-chip">
          <div className="gh-data-status">
            {dataState === DATA_STATES.LIVE && (
              <span className="gh-state-pill live">
                <CheckCircle2 size={12} /> Live Sync
              </span>
            )}
            {dataState === DATA_STATES.CACHED && (
              <span className="gh-state-pill cached cf-cached">
                <Clock size={12} /> Cached ({formatTimeAgo(cacheTime)})
              </span>
            )}
            {dataState === DATA_STATES.SNAPSHOT && (
              <span className="gh-state-pill unavailable">
                <AlertCircle size={12} /> Snapshot ({codeforcesConfig.staticSnapshot.capturedAt})
              </span>
            )}
            {dataState === DATA_STATES.UNAVAILABLE && (
              <span className="gh-state-pill unavailable">
                <AlertCircle size={12} /> Unavailable
              </span>
            )}
            {dataState === DATA_STATES.LOADING && (
              <span className="gh-state-pill loading">
                <RefreshCw size={12} className="spin-icon" /> Fetching...
              </span>
            )}
          </div>
          <span className="gh-stat-label">Platform Sync Status</span>
        </div>
      </div>

      {/* Submission Calendar Heatmap */}
      {dataState === DATA_STATES.UNAVAILABLE ? (
        <div className="gh-fallback-card" role="region" aria-label="Codeforces Data Status">
          <div className="gh-fallback-content">
            <AlertCircle size={28} className="gh-fallback-icon" />
            <h4>Codeforces data currently unavailable</h4>
            <p>
              Codeforces public API is temporarily unreachable or rate-limited. You can inspect Neel Shingavi&apos;s verified contest rating history and submissions directly on Codeforces.
            </p>
            <a
              href={codeforcesConfig.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="primary-action"
              style={{ marginTop: '12px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <span>View @{codeforcesConfig.username} on Codeforces</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      ) : dataState === DATA_STATES.LOADING && !data ? (
        <div className="gh-loading-card" style={{ padding: '36px', textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>
          <RefreshCw size={24} className="spin-icon" style={{ margin: '0 auto 12px', display: 'block' }} />
          <p>Retrieving verified Codeforces rating and submissions...</p>
        </div>
      ) : (
        <div className="gh-calendar-wrapper" ref={gridContainerRef}>
          {hoveredDay && !hoveredDay.isFuture && (
            <div
              className="gh-tooltip cf-tooltip"
              style={{
                left: `${tooltipPos.x}px`,
                top: `${tooltipPos.y}px`,
                transform: 'translate(-50%, -100%)',
              }}
              role="tooltip"
            >
              <strong>{hoveredDay.count} submission{hoveredDay.count === 1 ? '' : 's'}</strong>
              <span>{formatTooltipDate(hoveredDay.date)}</span>
            </div>
          )}

          <div
            className="gh-calendar-scroll"
            tabIndex={0}
            role="region"
            aria-label="52-week Codeforces activity timeline. Scroll horizontally if needed."
          >
            <div className="gh-calendar-grid cf-grid" role="grid" aria-label="52-Week Codeforces Submission Calendar">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="gh-cal-col" role="row">
                  {week.map((day) => {
                    const isHovered = hoveredDay?.date === day.date;
                    return (
                      <span
                        key={day.date}
                        role="gridcell"
                        aria-label={
                          day.isFuture
                            ? undefined
                            : `${day.count} submission${day.count === 1 ? '' : 's'} on ${day.date}`
                        }
                        className={`gh-cal-cell cf-cal-cell level-${day.level || 0} ${isHovered ? 'is-hovered' : ''} ${day.isFuture ? 'is-future' : ''}`}
                        onMouseEnter={(e) => handleCellHover(e, day)}
                        onMouseLeave={handleCellLeave}
                        tabIndex={-1}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Optional Live Rating History Trend Line */}
          {sparklinePath && (
            <div className="cf-rating-sparkline" aria-label="Verified Codeforces rating trajectory">
              <span>Contest Rating Trend ({data.ratingHistory.length} rated contests)</span>
              <svg width="220" height="40" viewBox="0 0 220 40" aria-hidden="true">
                <path
                  ref={sparkPathRef}
                  d={sparklinePath}
                  fill="none"
                  stroke="#00e5ff"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          )}

          {/* Legend & Verification Attribution */}
          <div className="gh-cal-footer">
            <span className="gh-footer-caption">
              52-Week Contest Timeline · Rating: {rating ?? '—'} ({rank}) · {sampleWindowSubmissionCount} recent submissions sampled
              {dataState === DATA_STATES.CACHED && cacheTime ? ` · Cached ${formatTimeAgo(cacheTime)}` : ''}
              {dataState === DATA_STATES.SNAPSHOT ? ` · Documented snapshot from ${codeforcesConfig.staticSnapshot.capturedAt}` : ''}
            </span>
            <div className="gh-legend cf-legend" aria-hidden="true">
              <span>Less</span>
              <span className="legend-cell cf-legend-cell level-0" />
              <span className="legend-cell cf-legend-cell level-1" />
              <span className="legend-cell cf-legend-cell level-2" />
              <span className="legend-cell cf-legend-cell level-3" />
              <span className="legend-cell cf-legend-cell level-4" />
              <span>More</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
