import { useState, useEffect, useMemo, useRef } from 'react';
import { GitCommit, RefreshCw, AlertCircle, CheckCircle2, Clock, ExternalLink } from 'lucide-react';
import { profile } from '../data/portfolio.js';
import { CodingActivityHeader } from './CodingActivityHeader.jsx';
import { useHeatmapRipple } from '../hooks/useHeatmapRipple.js';
import {
  DATA_STATES,
  readCache,
  writeCache,
  formatTimeAgo,
  formatTooltipDate,
  buildAligned52WeekGrid,
  safeNumber,
} from '../utils/codingDataHelpers.js';

const GITHUB_USERNAME = 'neelshingavi';
const CACHE_KEY = `github_contrib_${GITHUB_USERNAME}`;
const CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

export function GitHubActivity() {
  const [data, setData] = useState(null);
  const [dataState, setDataState] = useState(DATA_STATES.LOADING);
  const [cacheTime, setCacheTime] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hoveredDay, setHoveredDay] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const gridContainerRef = useRef(null);
  useHeatmapRipple(gridContainerRef, Boolean(data && dataState !== DATA_STATES.LOADING));

  const fetchContributions = async (abortSignal, forceBypassCache = false) => {
    // 1. Try Cache if not bypassing
    if (!forceBypassCache) {
      const cached = readCache(CACHE_KEY, CACHE_TTL_MS);
      if (cached && !cached.isStale && cached.payload?.contributions?.length > 0) {
        setData(cached.payload);
        setCacheTime(cached.timestamp);
        setDataState(DATA_STATES.CACHED);
        return;
      }
    }

    // 2. Fetch live data from GitHub contributions proxy
    try {
      const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${GITHUB_USERNAME}?y=last`, {
        signal: abortSignal,
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      // Schema validation
      if (
        json &&
        typeof json === 'object' &&
        Array.isArray(json.contributions) &&
        json.contributions.length > 0 &&
        json.total &&
        typeof json.total.lastYear === 'number'
      ) {
        // Optionally fetch public repo count from GitHub user API
        let publicRepos = null;
        try {
          const userRes = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}`, {
            signal: abortSignal,
          });
          if (userRes.ok) {
            const userJson = await userRes.json();
            if (typeof userJson.public_repos === 'number') {
              publicRepos = userJson.public_repos;
            }
          }
        } catch {
          // Non-critical: repo count can remain null
        }

        const payload = {
          ...json,
          publicRepos,
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
      // Network/parse failure: fall through to cache fallback
    }

    // 3. Fallback: Use stale cache if present
    const staleCache = readCache(CACHE_KEY, Infinity);
    if (staleCache && staleCache.payload?.contributions?.length > 0) {
      setData(staleCache.payload);
      setCacheTime(staleCache.timestamp);
      setDataState(DATA_STATES.CACHED);
      return;
    }

    // 4. Truly Unavailable: Do NOT fabricate numbers
    setData(null);
    setDataState(DATA_STATES.UNAVAILABLE);
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchContributions(controller.signal);
    return () => {
      controller.abort();
    };
  }, []);

  const handleManualRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    const controller = new AbortController();
    try {
      await fetchContributions(controller.signal, true);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Build aligned 52-week calendar grid using local timezone date normalization
  const { weeks, totalYearContributions } = useMemo(() => {
    if (!data?.contributions || data.contributions.length === 0) {
      return { weeks: [], totalYearContributions: null };
    }

    const countMap = new Map();
    for (const item of data.contributions) {
      if (item && item.date && typeof item.count === 'number') {
        countMap.set(item.date, item.count);
      }
    }

    const { weeks: alignedWeeks, allDays } = buildAligned52WeekGrid(countMap, (count) => {
      if (count >= 10) return 4;
      if (count >= 5) return 3;
      if (count >= 2) return 2;
      if (count >= 1) return 1;
      return 0;
    });

    // Calculate sum of contributions strictly within the aligned 52-week window
    const windowSum = allDays.reduce((acc, d) => acc + (d.isFuture ? 0 : d.count), 0);

    return {
      weeks: alignedWeeks,
      totalYearContributions: windowSum,
    };
  }, [data]);

  const publicRepos = safeNumber(data?.publicRepos, null);

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
    <div className="github-activity-shell" aria-label="GitHub Developer Activity">
      <CodingActivityHeader
        badgeIcon={GitCommit}
        badgeText="REPOSITORY CADENCE & GIT COMMITS"
        heading="Codebase Velocity & Open Source Signal"
        subtext="Public repository contributions, commit velocity, and open-source cadence recorded on GitHub."
        onRefresh={handleManualRefresh}
        isRefreshing={isRefreshing}
        isLoading={dataState === DATA_STATES.LOADING}
        refreshTitle="Refresh GitHub activity from API"
        refreshAriaLabel="Refresh GitHub contribution data"
        profileUrl={profile.links.github}
        profileTitle="Visit Neel Shingavi on GitHub"
        profileLabel={`github.com/${GITHUB_USERNAME}`}
      />

      {/* GitHub Summary Stat Chips */}
      <div className="gh-stats-row">
        <div className="gh-stat-chip">
          <strong className="gh-stat-val">
            {dataState === DATA_STATES.LOADING
              ? '—'
              : publicRepos !== null
                ? publicRepos
                : 'Verified'}
          </strong>
          <span className="gh-stat-label">
            {publicRepos !== null ? 'Public Repositories' : 'GitHub Profile'}
          </span>
        </div>
        <div className="gh-stat-chip">
          <strong className="gh-stat-val">
            {dataState === DATA_STATES.LOADING
              ? '—'
              : dataState === DATA_STATES.UNAVAILABLE
                ? 'Unavailable'
                : totalYearContributions !== null
                  ? totalYearContributions
                  : '—'}
          </strong>
          <span className="gh-stat-label">
            {dataState === DATA_STATES.UNAVAILABLE
              ? 'Contribution Data'
              : 'Past 52-Week Contributions'}
          </span>
        </div>
        <div className="gh-stat-chip">
          <strong className="gh-stat-val">Python · JS · Java</strong>
          <span className="gh-stat-label">Primary Languages</span>
        </div>
        <div className="gh-stat-chip">
          <div className="gh-data-status">
            {dataState === DATA_STATES.LIVE && (
              <span className="gh-state-pill live">
                <CheckCircle2 size={12} /> Live Sync
              </span>
            )}
            {dataState === DATA_STATES.CACHED && (
              <span className="gh-state-pill cached">
                <Clock size={12} /> Cached ({formatTimeAgo(cacheTime)})
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
          <span className="gh-stat-label">Data Sync Status</span>
        </div>
      </div>

      {/* Contribution Calendar Heatmap or Truthful Unavailable State */}
      {dataState === DATA_STATES.UNAVAILABLE ? (
        <div className="gh-fallback-card" role="region" aria-label="GitHub Data Status">
          <div className="gh-fallback-content">
            <AlertCircle size={28} className="gh-fallback-icon" />
            <h4>Contribution data currently unavailable</h4>
            <p>
              The external GitHub contributions provider is currently unreachable. You can view Neel Shingavi&apos;s verified public repositories and latest commits directly on GitHub.
            </p>
            <a
              href={profile.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="primary-action"
              style={{ marginTop: '12px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <span>View @{GITHUB_USERNAME} on GitHub</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      ) : dataState === DATA_STATES.LOADING && !data ? (
        <div className="gh-loading-card" style={{ padding: '36px', textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>
          <RefreshCw size={24} className="spin-icon" style={{ margin: '0 auto 12px', display: 'block' }} />
          <p>Retrieving verified GitHub contribution activity...</p>
        </div>
      ) : (
        <div className="gh-calendar-wrapper" ref={gridContainerRef}>
          {/* Floating Tooltip */}
          {hoveredDay && !hoveredDay.isFuture && (
            <div
              className="gh-tooltip"
              style={{
                left: `${tooltipPos.x}px`,
                top: `${tooltipPos.y}px`,
                transform: 'translate(-50%, -100%)',
              }}
              role="tooltip"
            >
              <strong>{hoveredDay.count} contribution{hoveredDay.count === 1 ? '' : 's'}</strong>
              <span>{formatTooltipDate(hoveredDay.date)}</span>
            </div>
          )}

          <div
            className="gh-calendar-scroll"
            tabIndex={0}
            role="region"
            aria-label="52-week contribution timeline. Scroll horizontally if needed."
          >
            <div className="gh-calendar-grid" role="grid" aria-label="52-Week GitHub Contribution Calendar">
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
                            : `${day.count} contribution${day.count === 1 ? '' : 's'} on ${day.date}`
                        }
                        className={`gh-cal-cell level-${day.level || 0} ${isHovered ? 'is-hovered' : ''} ${day.isFuture ? 'is-future' : ''}`}
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
              52-Week Activity Window · {totalYearContributions ?? 0} verified contributions
              {dataState === DATA_STATES.CACHED && cacheTime ? ` · Cached ${formatTimeAgo(cacheTime)}` : ''}
            </span>
            <div className="gh-legend" aria-hidden="true">
              <span>Less</span>
              <span className="legend-cell level-0" />
              <span className="legend-cell level-1" />
              <span className="legend-cell level-2" />
              <span className="legend-cell level-3" />
              <span className="legend-cell level-4" />
              <span>More</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
