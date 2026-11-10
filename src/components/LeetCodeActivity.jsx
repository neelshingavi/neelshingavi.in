import { useState, useEffect, useMemo, useRef } from 'react';
import { Code2, ExternalLink, RefreshCw, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { leetcodeConfig } from '../data/codingProfiles.js';
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

const CACHE_KEY = `leetcode_contrib_${leetcodeConfig.username}`;
const CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

export function LeetCodeActivity() {
  const [data, setData] = useState(null);
  const [dataState, setDataState] = useState(DATA_STATES.LOADING);
  const [cacheTime, setCacheTime] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hoveredDay, setHoveredDay] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const gridContainerRef = useRef(null);

  const fetchLeetCodeData = async (abortSignal, forceBypassCache = false) => {
    // 1. Check local cache if not forcing refresh
    if (!forceBypassCache) {
      const cached = readCache(CACHE_KEY, CACHE_TTL_MS);
      if (cached && !cached.isStale && typeof cached.payload?.totalSolved === 'number') {
        setData(cached.payload);
        setCacheTime(cached.timestamp);
        setDataState(DATA_STATES.CACHED);
        return;
      }
    }

    // 2. Fetch live data from Alfa LeetCode API proxy
    try {
      const res = await fetch(leetcodeConfig.apiProxyUrl, {
        signal: abortSignal,
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      // Schema validation
      if (
        json &&
        typeof json === 'object' &&
        typeof json.totalSolved === 'number' &&
        json.totalSolved >= 0
      ) {
        const payload = {
          totalSolved: json.totalSolved,
          easySolved: safeNumber(json.easySolved, 0),
          mediumSolved: safeNumber(json.mediumSolved, 0),
          hardSolved: safeNumber(json.hardSolved, 0),
          ranking: safeNumber(json.ranking, null),
          submissionCalendar: json.submissionCalendar || {},
        };

        const now = Date.now();
        setData(payload);
        setCacheTime(now);
        setDataState(DATA_STATES.LIVE);
        writeCache(CACHE_KEY, payload);
        return;
      }
    } catch (err) {
      if (err.name === 'AbortError') return;
      // Fetch failed, fall through to stale cache or documented snapshot
    }

    // 3. Check for stale cache
    const staleCache = readCache(CACHE_KEY, Infinity);
    if (staleCache && typeof staleCache.payload?.totalSolved === 'number') {
      setData(staleCache.payload);
      setCacheTime(staleCache.timestamp);
      setDataState(DATA_STATES.CACHED);
      return;
    }

    // 4. Use documented snapshot with clear provenance
    if (leetcodeConfig.staticSnapshot && typeof leetcodeConfig.staticSnapshot.totalSolved === 'number') {
      setData(leetcodeConfig.staticSnapshot);
      setDataState(DATA_STATES.SNAPSHOT);
      return;
    }

    // 5. Unavailable
    setData(null);
    setDataState(DATA_STATES.UNAVAILABLE);
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchLeetCodeData(controller.signal);
    return () => {
      controller.abort();
    };
  }, []);

  const handleManualRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    const controller = new AbortController();
    try {
      await fetchLeetCodeData(controller.signal, true);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Convert submission calendar map to timezone-safe aligned 52-week calendar grid
  const { weeks, windowSubmissionCount } = useMemo(() => {
    if (!data?.submissionCalendar) {
      return { weeks: [], windowSubmissionCount: 0 };
    }

    let raw = data.submissionCalendar;
    if (typeof raw === 'string') {
      try {
        raw = JSON.parse(raw);
      } catch {
        raw = {};
      }
    }

    const countMap = new Map();
    if (raw && typeof raw === 'object') {
      for (const [key, val] of Object.entries(raw)) {
        const localKey = timestampToLocalDateKey(key);
        if (localKey) {
          countMap.set(localKey, (countMap.get(localKey) || 0) + Number(val || 0));
        }
      }
    }

    const { weeks: alignedWeeks, allDays } = buildAligned52WeekGrid(countMap, (count) => {
      if (count >= 10) return 4;
      if (count >= 5) return 3;
      if (count >= 2) return 2;
      if (count >= 1) return 1;
      return 0;
    });

    const windowCount = allDays.reduce((acc, d) => acc + (d.isFuture ? 0 : d.count), 0);

    return {
      weeks: alignedWeeks,
      windowSubmissionCount: windowCount,
    };
  }, [data]);

  const totalSolved = safeNumber(data?.totalSolved, null);
  const easySolved = safeNumber(data?.easySolved, null);
  const mediumSolved = safeNumber(data?.mediumSolved, null);
  const hardSolved = safeNumber(data?.hardSolved, null);
  const ranking = safeNumber(data?.ranking, null);

  const formatRankingDisplay = (rankNum) => {
    if (rankNum === null || rankNum === undefined || rankNum <= 0) return '—';
    return `#${rankNum.toLocaleString('en-US')}`;
  };

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
    <div className="github-activity-shell leetcode-activity-shell" aria-label="LeetCode Algorithmic Activity">
      <div className="gh-header">
        <div className="gh-title-group">
          <div className="gh-badge lc-badge">
            <Code2 size={14} aria-hidden="true" />
            <span>DATA STRUCTURES & ALGORITHMIC SOLVING</span>
          </div>
          <h3 className="gh-heading">Algorithmic Precision & Problem Solving</h3>
          <p className="gh-sub">
            Verified algorithmic problems solved across dynamic programming, graph algorithms, and data structures.
          </p>
        </div>

        <div className="gh-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            className="gh-refresh-btn lc-refresh-btn"
            onClick={handleManualRefresh}
            disabled={isRefreshing || dataState === DATA_STATES.LOADING}
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
          <strong className="gh-stat-val lc-val">
            {dataState === DATA_STATES.LOADING ? '—' : totalSolved !== null ? totalSolved : '—'}
          </strong>
          <span className="gh-stat-label">Unique Problems Solved</span>
        </div>
        <div className="gh-stat-chip">
          <strong className="gh-stat-val lc-val">
            {dataState === DATA_STATES.LOADING
              ? '—'
              : easySolved !== null && mediumSolved !== null && hardSolved !== null
                ? `${easySolved}E · ${mediumSolved}M · ${hardSolved}H`
                : '—'}
          </strong>
          <span className="gh-stat-label">Easy · Medium · Hard</span>
        </div>
        <div className="gh-stat-chip">
          <strong className="gh-stat-val lc-val">
            {dataState === DATA_STATES.LOADING ? '—' : formatRankingDisplay(ranking)}
          </strong>
          <span className="gh-stat-label">Global LeetCode Rank</span>
        </div>
        <div className="gh-stat-chip">
          <div className="gh-data-status">
            {dataState === DATA_STATES.LIVE && (
              <span className="gh-state-pill live">
                <CheckCircle2 size={12} /> Live Sync
              </span>
            )}
            {dataState === DATA_STATES.CACHED && (
              <span className="gh-state-pill cached lc-cached">
                <Clock size={12} /> Cached ({formatTimeAgo(cacheTime)})
              </span>
            )}
            {dataState === DATA_STATES.SNAPSHOT && (
              <span className="gh-state-pill unavailable">
                <AlertCircle size={12} /> Snapshot ({leetcodeConfig.staticSnapshot.capturedAt})
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
        <div className="gh-fallback-card" role="region" aria-label="LeetCode Data Status">
          <div className="gh-fallback-content">
            <AlertCircle size={28} className="gh-fallback-icon" />
            <h4>LeetCode activity data currently unavailable</h4>
            <p>
              The community LeetCode proxy is currently unreachable. You can inspect Neel Shingavi&apos;s verified algorithmic submissions and problem count directly on LeetCode.
            </p>
            <a
              href={leetcodeConfig.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="primary-action"
              style={{ marginTop: '12px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <span>View @{leetcodeConfig.username} on LeetCode</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      ) : dataState === DATA_STATES.LOADING && !data ? (
        <div className="gh-loading-card" style={{ padding: '36px', textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>
          <RefreshCw size={24} className="spin-icon" style={{ margin: '0 auto 12px', display: 'block' }} />
          <p>Retrieving verified LeetCode algorithmic progress...</p>
        </div>
      ) : (
        <div className="gh-calendar-wrapper" ref={gridContainerRef}>
          {hoveredDay && !hoveredDay.isFuture && (
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
              <span>{formatTooltipDate(hoveredDay.date)}</span>
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
                      <span
                        key={day.date}
                        role="gridcell"
                        aria-label={
                          day.isFuture
                            ? undefined
                            : `${day.count} submission${day.count === 1 ? '' : 's'} on ${day.date}`
                        }
                        className={`gh-cal-cell lc-cal-cell level-${day.level || 0} ${isHovered ? 'is-hovered' : ''} ${day.isFuture ? 'is-future' : ''}`}
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

          {/* Legend & Verification Attribution */}
          <div className="gh-cal-footer">
            <span className="gh-footer-caption">
              52-Week Activity Window · {totalSolved ?? 0} solved problems ({windowSubmissionCount} submissions in window)
              {dataState === DATA_STATES.CACHED && cacheTime ? ` · Cached ${formatTimeAgo(cacheTime)}` : ''}
              {dataState === DATA_STATES.SNAPSHOT ? ` · Documented snapshot from ${leetcodeConfig.staticSnapshot.capturedAt}` : ''}
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
      )}
    </div>
  );
}
