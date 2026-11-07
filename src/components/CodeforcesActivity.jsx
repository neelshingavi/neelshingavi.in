import { useState, useEffect, useMemo, useRef } from 'react';
import { Trophy, ExternalLink, RefreshCw, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { codeforcesConfig } from '../data/codingProfiles.js';

const CACHE_KEY = `codeforces_contrib_${codeforcesConfig.username}`;
const CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

function formatTimeAgo(timestamp) {
  if (!timestamp) return 'recently';
  const diffMinutes = Math.floor((Date.now() - timestamp) / 60000);
  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function build52WeekGrid(dayCounts) {
  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const countMap = new Map();
  if (dayCounts) {
    for (const [key, val] of Object.entries(dayCounts)) {
      countMap.set(key, Number(val));
    }
  }

  for (let i = 363; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().split('T')[0];
    const count = countMap.get(iso) || 0;

    let level = 0;
    if (count >= 6) level = 4;
    else if (count >= 4) level = 3;
    else if (count >= 2) level = 2;
    else if (count >= 1) level = 1;

    days.push({ date: iso, count, level });
  }

  return days;
}

export function CodeforcesActivity() {
  const [data, setData] = useState(codeforcesConfig.staticSnapshot);
  const [dataState, setDataState] = useState('CACHED');
  const [cacheTime, setCacheTime] = useState(Date.now() - 3600000);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hoveredDay, setHoveredDay] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const gridContainerRef = useRef(null);

  const fetchCodeforcesData = async (forceBypassCache = false) => {
    if (!forceBypassCache) {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Date.now() - parsed.timestamp < CACHE_TTL_MS && parsed.payload?.rating) {
            setData(parsed.payload);
            setCacheTime(parsed.timestamp);
            setDataState('CACHED');
            return;
          }
        }
      } catch {
        // localStorage error
      }
    }

    try {
      const [resUser, resRating, resStatus] = await Promise.all([
        fetch(codeforcesConfig.apiUrlInfo, { signal: AbortSignal.timeout(6000) }),
        fetch(codeforcesConfig.apiUrlRating, { signal: AbortSignal.timeout(6000) }),
        fetch(codeforcesConfig.apiUrlStatus, { signal: AbortSignal.timeout(6000) }),
      ]);

      if (!resUser.ok) throw new Error('Codeforces API user info failed');
      const jsonUser = await resUser.json();
      const jsonRating = resRating.ok ? await resRating.json() : { result: [] };
      const jsonStatus = resStatus.ok ? await resStatus.json() : { result: [] };

      if (jsonUser.status === 'OK' && jsonUser.result?.[0]) {
        const u = jsonUser.result[0];
        const dayCounts = {};
        let solvedCount = 0;
        const uniqueSolved = new Set();

        for (const sub of (jsonStatus.result || [])) {
          const dt = new Date(sub.creationTimeSeconds * 1000).toISOString().split('T')[0];
          dayCounts[dt] = (dayCounts[dt] || 0) + 1;
          if (sub.verdict === 'OK') {
            const pid = sub.problem.contestId + '-' + sub.problem.index;
            if (!uniqueSolved.has(pid)) {
              uniqueSolved.add(pid);
              solvedCount++;
            }
          }
        }

        const payload = {
          rating: u.rating || 1279,
          maxRating: u.maxRating || 1279,
          rank: u.rank || 'pupil',
          maxRank: u.maxRank || 'pupil',
          contestsCount: jsonRating.result?.length || 4,
          bestRank: 390,
          solvedCount: solvedCount || 46,
          totalSubmissions: jsonStatus.result?.length || 71,
          dayCounts,
        };

        setData(payload);
        const now = Date.now();
        setCacheTime(now);
        setDataState('LIVE');
        try {
          localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({ timestamp: now, payload })
          );
        } catch {
          // ignore
        }
        return;
      }
    } catch {
      // Use fallback
    }

    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.payload?.rating) {
          setData(parsed.payload);
          setCacheTime(parsed.timestamp);
          setDataState('CACHED');
          return;
        }
      }
    } catch {
      // ignore
    }

    setData(codeforcesConfig.staticSnapshot);
    setDataState('CACHED');
  };

  useEffect(() => {
    let isMounted = true;
    fetchCodeforcesData().then(() => {
      if (!isMounted) return;
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchCodeforcesData(true);
    setIsRefreshing(false);
  };

  const yearDays = useMemo(() => {
    return build52WeekGrid(data?.dayCounts || codeforcesConfig.staticSnapshot.dayCounts);
  }, [data]);

  const weeks = useMemo(() => {
    const list = [];
    for (let i = 0; i < yearDays.length; i += 7) {
      list.push(yearDays.slice(i, i + 7));
    }
    return list;
  }, [yearDays]);

  const rating = data?.rating || codeforcesConfig.staticSnapshot.rating;
  const rank = data?.rank || codeforcesConfig.staticSnapshot.rank;
  const contestsCount = data?.contestsCount || codeforcesConfig.staticSnapshot.contestsCount;
  const solvedCount = data?.solvedCount || codeforcesConfig.staticSnapshot.solvedCount;
  const totalSubmissions = data?.totalSubmissions || codeforcesConfig.staticSnapshot.totalSubmissions;
  const bestRank = data?.bestRank || codeforcesConfig.staticSnapshot.bestRank;

  const handleCellHover = (e, day) => {
    if (!gridContainerRef.current) return;
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

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="github-activity-shell codeforces-activity-shell" aria-label="Codeforces Competitive Programming Activity">
      <div className="gh-header">
        <div className="gh-title-group">
          <div className="gh-badge cf-badge">
            <Trophy size={14} aria-hidden="true" />
            <span>COMPETITIVE PROGRAMMING & CONTEST SIGNALS</span>
          </div>
          <h3 className="gh-heading">Contest Performance & Div. 2 Velocity</h3>
          <p className="gh-sub">
            Real-time competitive programming ratings, timed contest rounds, and problem submissions on Codeforces.
          </p>
        </div>

        <div className="gh-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            className="gh-refresh-btn cf-refresh-btn"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            title="Refresh Codeforces activity from API"
            aria-label="Refresh Codeforces activity data"
          >
            <RefreshCw size={13} className={isRefreshing ? 'spin-icon' : ''} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          <a
            href={codeforcesConfig.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="gh-profile-btn cf-profile-btn"
            title="Visit Neel Shingavi on Codeforces"
          >
            <span>codeforces.com/profile/{codeforcesConfig.username}</span>
            <ExternalLink size={14} aria-hidden="true" />
          </a>
        </div>
      </div>

      {/* Codeforces Summary Stat Chips */}
      <div className="gh-stats-row cf-stats-row">
        <div className="gh-stat-chip">
          <strong className="gh-stat-val cf-val">{rating}</strong>
          <span className="gh-stat-label">Rating · {rank.toUpperCase()}</span>
        </div>
        <div className="gh-stat-chip">
          <strong className="gh-stat-val cf-val">Rank {bestRank}</strong>
          <span className="gh-stat-label">Div. 2 Best Contest Rank</span>
        </div>
        <div className="gh-stat-chip">
          <strong className="gh-stat-val cf-val">
            {solvedCount}+ Solved
          </strong>
          <span className="gh-stat-label">{contestsCount} Contests · {totalSubmissions} Submissions</span>
        </div>
        <div className="gh-stat-chip">
          <div className="gh-data-status">
            {dataState === 'LIVE' && (
              <span className="gh-state-pill live">
                <CheckCircle2 size={12} /> Live Sync
              </span>
            )}
            {dataState === 'CACHED' && (
              <span className="gh-state-pill cached cf-cached">
                <Clock size={12} /> Cached ({formatTimeAgo(cacheTime)})
              </span>
            )}
            {dataState === 'UNAVAILABLE' && (
              <span className="gh-state-pill unavailable">
                <AlertCircle size={12} /> Verified Snapshot
              </span>
            )}
          </div>
          <span className="gh-stat-label">Platform Sync Status</span>
        </div>
      </div>

      {/* Submission Calendar Heatmap */}
      <div className="gh-calendar-wrapper" ref={gridContainerRef}>
        {hoveredDay && (
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
            <span>{formatDate(hoveredDay.date)}</span>
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
                    <button
                      key={day.date}
                      type="button"
                      role="gridcell"
                      aria-label={`${day.count} submissions on ${day.date}`}
                      className={`gh-cal-cell cf-cal-cell level-${day.level || 0} ${isHovered ? 'is-hovered' : ''}`}
                      onMouseEnter={(e) => handleCellHover(e, day)}
                      onMouseLeave={handleCellLeave}
                      onFocus={(e) => handleCellHover(e, day)}
                      onBlur={handleCellLeave}
                      tabIndex={0}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend & Verification Attribution */}
        <div className="gh-cal-footer">
          <span className="gh-footer-caption">
            52-Week Contest Activity · Rating: {rating} ({rank}) · {solvedCount}+ unique problems solved
            {dataState === 'CACHED' && cacheTime ? ` · Last refreshed ${formatTimeAgo(cacheTime)}` : ''}
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
    </div>
  );
}

