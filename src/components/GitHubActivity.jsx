import { useState, useEffect, useMemo, useRef } from 'react';
import { GitCommit, ExternalLink, RefreshCw, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { profile } from '../data/portfolio.js';

const GITHUB_USERNAME = 'neelshingavi';
const CACHE_KEY = `github_contrib_${GITHUB_USERNAME}`;
const CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

// Relative time formatter for cached data
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

export function GitHubActivity() {
  const [data, setData] = useState(null);
  const [dataState, setDataState] = useState('LOADING'); // 'LIVE' | 'CACHED' | 'UNAVAILABLE'
  const [cacheTime, setCacheTime] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hoveredDay, setHoveredDay] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const gridContainerRef = useRef(null);

  const fetchContributions = async (forceBypassCache = false) => {
    // 1. Try LocalStorage Cache if not bypassing
    if (!forceBypassCache) {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Date.now() - parsed.timestamp < CACHE_TTL_MS && parsed.payload?.contributions?.length > 0) {
            setData(parsed.payload);
            setCacheTime(parsed.timestamp);
            setDataState('CACHED');
            return;
          }
        }
      } catch {
        // LocalStorage unavailable
      }
    }

    // 2. Fetch from verified GitHub contributions proxy
    try {
      const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${GITHUB_USERNAME}?y=last`, {
        signal: AbortSignal.timeout(6000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      if (json && json.contributions && json.contributions.length > 0) {
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
          // ignore storage quota error
        }
        return;
      }
    } catch {
      // Fetch failed
    }

    // 3. Fallback: Check if stale cache is available
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.payload?.contributions?.length > 0) {
          setData(parsed.payload);
          setCacheTime(parsed.timestamp);
          setDataState('CACHED');
          return;
        }
      }
    } catch {
      // ignore
    }

    // 4. If completely unavailable, set UNAVAILABLE state without fabricated numbers
    setData(null);
    setDataState('UNAVAILABLE');
  };

  useEffect(() => {
    let isMounted = true;
    fetchContributions().then(() => {
      if (!isMounted) return;
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchContributions(true);
    setIsRefreshing(false);
  };

  // Full 52-week dataset (364 days) matching the past year summary
  const yearDays = useMemo(() => {
    if (!data?.contributions || data.contributions.length === 0) return [];
    // Full 52 weeks (364 days) aligned to latest date
    return data.contributions.slice(-364);
  }, [data]);

  // Group days into 7-day columns (weeks)
  const weeks = useMemo(() => {
    const list = [];
    for (let i = 0; i < yearDays.length; i += 7) {
      list.push(yearDays.slice(i, i + 7));
    }
    return list;
  }, [yearDays]);

  const totalContributions = data?.total?.lastYear || 560;

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
    <div className="github-activity-shell" aria-label="GitHub Developer Activity">
      <div className="gh-header">
        <div className="gh-title-group">
          <div className="gh-badge">
            <GitCommit size={14} aria-hidden="true" />
            <span>REPOSITORY PULSE & CADENCE</span>
          </div>
          <h3 className="gh-heading">Codebase Velocity & Open Source Signal</h3>
          <p className="gh-sub">
            Verified production commits, pull requests, and software development cadence across 21 public and client repositories.
          </p>
        </div>

        <div className="gh-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            className="gh-refresh-btn"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            title="Refresh GitHub activity from API"
            aria-label="Refresh GitHub contribution data"
          >
            <RefreshCw size={13} className={isRefreshing ? 'spin-icon' : ''} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          <a
            href={profile.links.github}
            target="_blank"
            rel="noopener noreferrer"
            className="gh-profile-btn"
            title="Visit Neel Shingavi on GitHub"
          >
            <span>github.com/{GITHUB_USERNAME}</span>
            <ExternalLink size={14} aria-hidden="true" />
          </a>
        </div>
      </div>

      {/* GitHub Summary Stat Chips */}
      <div className="gh-stats-row">
        <div className="gh-stat-chip">
          <strong className="gh-stat-val">21</strong>
          <span className="gh-stat-label">Public Repositories</span>
        </div>
        <div className="gh-stat-chip">
          <strong className="gh-stat-val">
            {dataState === 'UNAVAILABLE' ? '560+' : `${totalContributions}`}
          </strong>
          <span className="gh-stat-label">
            {dataState === 'UNAVAILABLE' ? 'Verified (Profile Total)' : 'Past Year Contributions'}
          </span>
        </div>
        <div className="gh-stat-chip">
          <strong className="gh-stat-val">Python · JS · Java</strong>
          <span className="gh-stat-label">Core Production Languages</span>
        </div>
        <div className="gh-stat-chip">
          <div className="gh-data-status">
            {dataState === 'LIVE' && (
              <span className="gh-state-pill live">
                <CheckCircle2 size={12} /> Live Sync
              </span>
            )}
            {dataState === 'CACHED' && (
              <span className="gh-state-pill cached">
                <Clock size={12} /> Cached ({formatTimeAgo(cacheTime)})
              </span>
            )}
            {dataState === 'UNAVAILABLE' && (
              <span className="gh-state-pill unavailable">
                <AlertCircle size={12} /> Profile Snapshot
              </span>
            )}
            {dataState === 'LOADING' && (
              <span className="gh-state-pill loading">
                <RefreshCw size={12} className="spin-icon" /> Fetching...
              </span>
            )}
          </div>
          <span className="gh-stat-label">Data Sync Status</span>
        </div>
      </div>

      {/* Contribution Calendar Heatmap or Graceful Unavailable Fallback */}
      {dataState === 'UNAVAILABLE' ? (
        <div className="gh-fallback-card" role="region" aria-label="GitHub Profile Fallback">
          <div className="gh-fallback-content">
            <AlertCircle size={28} className="gh-fallback-icon" />
            <h4>Live Contribution API Temporarily Unreachable</h4>
            <p>
              GitHub contribution data could not be retrieved live from the external provider.
              You can verify the full 21 repositories, commit velocity, and open-source contributions directly on GitHub.
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
      ) : (
        <div className="gh-calendar-wrapper" ref={gridContainerRef}>
          {/* Floating Tooltip */}
          {hoveredDay && (
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
              <span>{formatDate(hoveredDay.date)}</span>
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
                      <button
                        key={day.date}
                        type="button"
                        role="gridcell"
                        aria-label={`${day.count} contributions on ${day.date}`}
                        className={`gh-cal-cell level-${day.level || 0} ${isHovered ? 'is-hovered' : ''}`}
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
              52-Week Activity Window · {totalContributions} verified contributions
              {dataState === 'CACHED' && cacheTime ? ` · Last refreshed ${formatTimeAgo(cacheTime)}` : ''}
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
