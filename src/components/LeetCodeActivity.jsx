import { useState, useEffect, useMemo, useRef } from 'react';
import { Code2, ExternalLink, RefreshCw, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { leetcodeConfig } from '../data/codingProfiles.js';

const CACHE_KEY = `leetcode_contrib_${leetcodeConfig.username}`;
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

// Generates an aligned 52-week (364-day) grid array from a timestamp map
function build52WeekGrid(submissionCalendar) {
  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Normalize timestamp calendar map (keys may be unix seconds or ms)
  const countMap = new Map();
  if (submissionCalendar) {
    const raw = typeof submissionCalendar === 'string' ? JSON.parse(submissionCalendar) : submissionCalendar;
    for (const [key, val] of Object.entries(raw)) {
      const ts = Number(key);
      const d = new Date(ts > 1e11 ? ts : ts * 1000);
      d.setHours(0, 0, 0, 0);
      const iso = d.toISOString().split('T')[0];
      countMap.set(iso, (countMap.get(iso) || 0) + Number(val));
    }
  }

  // 364 days (52 full weeks)
  for (let i = 363; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().split('T')[0];
    const count = countMap.get(iso) || 0;

    let level = 0;
    if (count >= 10) level = 4;
    else if (count >= 5) level = 3;
    else if (count >= 2) level = 2;
    else if (count >= 1) level = 1;

    days.push({ date: iso, count, level });
  }

  return days;
}

export function LeetCodeActivity() {
  const [data, setData] = useState(leetcodeConfig.staticSnapshot);
  const [dataState, setDataState] = useState('CACHED'); // 'LIVE' | 'CACHED' | 'UNAVAILABLE'
  const [cacheTime, setCacheTime] = useState(Date.now() - 3600000);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hoveredDay, setHoveredDay] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const gridContainerRef = useRef(null);

  const fetchLeetCodeData = async (forceBypassCache = false) => {
    if (!forceBypassCache) {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Date.now() - parsed.timestamp < CACHE_TTL_MS && parsed.payload?.totalSolved) {
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
      const res = await fetch(leetcodeConfig.apiProxyUrl, {
        signal: AbortSignal.timeout(6000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      if (json && json.totalSolved) {
        setData(json);
        const now = Date.now();
        setCacheTime(now);
        setDataState('LIVE');
        try {
          localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({ timestamp: now, payload: json })
          );
        } catch {
          // ignore
        }
        return;
      }
    } catch {
      // Fetch failed, use stale cache or static snapshot
    }

    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.payload?.totalSolved) {
          setData(parsed.payload);
          setCacheTime(parsed.timestamp);
          setDataState('CACHED');
          return;
        }
      }
    } catch {
      // ignore
    }

    // Verified fallback snapshot
    setData(leetcodeConfig.staticSnapshot);
    setDataState('CACHED');
  };

  useEffect(() => {
    let isMounted = true;
    fetchLeetCodeData().then(() => {
      if (!isMounted) return;
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchLeetCodeData(true);
    setIsRefreshing(false);
  };

  const yearDays = useMemo(() => {
    return build52WeekGrid(data?.submissionCalendar || leetcodeConfig.staticSnapshot.submissionCalendar);
  }, [data]);

  const weeks = useMemo(() => {
    const list = [];
    for (let i = 0; i < yearDays.length; i += 7) {
      list.push(yearDays.slice(i, i + 7));
    }
    return list;
  }, [yearDays]);

  const totalSolved = data?.totalSolved || leetcodeConfig.staticSnapshot.totalSolved;
  const easySolved = data?.easySolved || leetcodeConfig.staticSnapshot.easySolved;
  const mediumSolved = data?.mediumSolved || leetcodeConfig.staticSnapshot.mediumSolved;
  const hardSolved = data?.hardSolved || leetcodeConfig.staticSnapshot.hardSolved;
  const ranking = data?.ranking || leetcodeConfig.staticSnapshot.ranking;

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
    <div className="github-activity-shell leetcode-activity-shell" aria-label="LeetCode Algorithmic Activity">
      <div className="gh-header">
        <div className="gh-title-group">
          <div className="gh-badge lc-badge">
            <Code2 size={14} aria-hidden="true" />
            <span>ALGORITHMIC MASTERY & DATA STRUCTURES</span>
          </div>
          <h3 className="gh-heading">Algorithmic Precision & Problem Solving</h3>
          <p className="gh-sub">
            Verified solutions across dynamic programming, graph algorithms, and data structures with 169+ accepted submissions.
          </p>
        </div>

        <div className="gh-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            className="gh-refresh-btn lc-refresh-btn"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            title="Refresh LeetCode activity from API"
            aria-label="Refresh LeetCode activity data"
          >
            <RefreshCw size={13} className={isRefreshing ? 'spin-icon' : ''} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          <a
            href={leetcodeConfig.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="gh-profile-btn lc-profile-btn"
            title="Visit Neel Shingavi on LeetCode"
          >
            <span>leetcode.com/u/{leetcodeConfig.username}</span>
            <ExternalLink size={14} aria-hidden="true" />
          </a>
        </div>
      </div>

      {/* LeetCode Summary Stat Chips */}
      <div className="gh-stats-row lc-stats-row">
        <div className="gh-stat-chip">
          <strong className="gh-stat-val lc-val">{totalSolved}</strong>
          <span className="gh-stat-label">Total Problems Solved</span>
        </div>
        <div className="gh-stat-chip">
          <strong className="gh-stat-val lc-val">
            {easySolved}E · {mediumSolved}M · {hardSolved}H
          </strong>
          <span className="gh-stat-label">Easy · Medium · Hard</span>
        </div>
        <div className="gh-stat-chip">
          <strong className="gh-stat-val lc-val">
            Top {ranking ? Math.round(ranking / 1000) + 'K' : '1M'}
          </strong>
          <span className="gh-stat-label">Global LeetCode Rank</span>
        </div>
        <div className="gh-stat-chip">
          <div className="gh-data-status">
            {dataState === 'LIVE' && (
              <span className="gh-state-pill live">
                <CheckCircle2 size={12} /> Live Sync
              </span>
            )}
            {dataState === 'CACHED' && (
              <span className="gh-state-pill cached lc-cached">
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
            className="gh-tooltip lc-tooltip"
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
          aria-label="52-week LeetCode activity timeline. Scroll horizontally if needed."
        >
          <div className="gh-calendar-grid lc-grid" role="grid" aria-label="52-Week LeetCode Submission Calendar">
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
                      className={`gh-cal-cell lc-cal-cell level-${day.level || 0} ${isHovered ? 'is-hovered' : ''}`}
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
            52-Week Activity Window · {totalSolved} verified solutions ({easySolved} Easy, {mediumSolved} Med, {hardSolved} Hard)
            {dataState === 'CACHED' && cacheTime ? ` · Last refreshed ${formatTimeAgo(cacheTime)}` : ''}
          </span>
          <div className="gh-legend lc-legend" aria-hidden="true">
            <span>Less</span>
            <span className="legend-cell lc-legend-cell level-0" />
            <span className="legend-cell lc-legend-cell level-1" />
            <span className="legend-cell lc-legend-cell level-2" />
            <span className="legend-cell lc-legend-cell level-3" />
            <span className="legend-cell lc-legend-cell level-4" />
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
}

