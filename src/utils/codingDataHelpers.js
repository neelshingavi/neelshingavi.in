/**
 * Shared Coding Data Utilities
 * Handles cache persistence, timestamp provenance, timezone-safe date normalization,
 * and standard data states across GitHub, LeetCode, and Codeforces widgets.
 */

export const DATA_STATES = {
  LOADING: 'LOADING',
  LIVE: 'LIVE',
  CACHED: 'CACHED',
  SNAPSHOT: 'SNAPSHOT',
  UNAVAILABLE: 'UNAVAILABLE',
  ERROR: 'ERROR',
};

/**
 * Timezone-safe local YYYY-MM-DD string representation.
 * Prevents UTC conversion boundary shifts in Asia/Kolkata (UTC+5:30) and other offsets.
 */
export function formatLocalDateKey(date) {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Converts a Unix timestamp (seconds or milliseconds) to a local YYYY-MM-DD key.
 */
export function timestampToLocalDateKey(timestamp) {
  if (!timestamp) return '';
  const num = Number(timestamp);
  if (isNaN(num)) return '';
  const ms = num > 1e11 ? num : num * 1000;
  return formatLocalDateKey(new Date(ms));
}

/**
 * Relative time ago formatter for cache timestamps
 */
export function formatTimeAgo(timestamp) {
  if (!timestamp) return 'recently';
  const diffMs = Date.now() - Number(timestamp);
  if (diffMs < 0) return 'just now';
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

/**
 * Format a calendar date string (YYYY-MM-DD) for user-facing tooltips
 */
export function formatTooltipDate(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Reads data from localStorage with TTL validation and stale provenance
 */
export function readCache(key, ttlMs = 12 * 60 * 60 * 1000) {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || !parsed.timestamp || !parsed.payload) {
      return null;
    }
    const age = Date.now() - parsed.timestamp;
    const isStale = age >= ttlMs;
    return {
      payload: parsed.payload,
      timestamp: parsed.timestamp,
      isStale,
    };
  } catch {
    return null;
  }
}

/**
 * Writes data with exact epoch timestamp to localStorage
 */
export function writeCache(key, payload) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const record = {
      timestamp: Date.now(),
      payload,
    };
    localStorage.setItem(key, JSON.stringify(record));
  } catch {
    // QuotaExceededError or private browsing restriction - silently ignore
  }
}

/**
 * Builds an aligned 52-week calendar grid (364 to 371 days) grouped into 7-day columns.
 * Aligns the grid to real calendar weekdays (Sunday = 0 to Saturday = 6).
 *
 * @param {Map<string, number>|Object} countMap - Map or object of 'YYYY-MM-DD' -> count
 * @param {Function} levelThresholdFn - Function returning 0..4 given count
 * @returns {Array<Array<Object>>} 52-53 weeks of 7 day objects
 */
export function buildAligned52WeekGrid(countMapInput, levelThresholdFn) {
  const countMap = countMapInput instanceof Map 
    ? countMapInput 
    : new Map(Object.entries(countMapInput || {}));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Align end date to Saturday of current week to ensure full 7-day column
  const dayOfWeek = today.getDay(); // 0 is Sunday, 6 is Saturday
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + (6 - dayOfWeek));

  // 52 full weeks back from end of current week = 52 * 7 = 364 days
  const totalDays = 52 * 7;
  const startDate = new Date(endDate);
  startDate.setDate(endDate.getDate() - (totalDays - 1));

  const allDays = [];
  const cur = new Date(startDate);

  for (let i = 0; i < totalDays; i++) {
    const key = formatLocalDateKey(cur);
    const count = Number(countMap.get(key) || 0);
    const level = levelThresholdFn ? levelThresholdFn(count) : (count > 0 ? 1 : 0);
    const isFuture = cur > today;

    allDays.push({
      date: key,
      count: isFuture ? 0 : count,
      level: isFuture ? 0 : level,
      isFuture,
      dayOfWeek: cur.getDay(),
    });

    cur.setDate(cur.getDate() + 1);
  }

  // Group into columns of 7 days (Sunday to Saturday)
  const weeks = [];
  for (let i = 0; i < allDays.length; i += 7) {
    weeks.push(allDays.slice(i, i + 7));
  }

  return { weeks, allDays };
}

/**
 * Validates nullish numerical values, strictly preserving 0 as a valid quantity.
 */
export function safeNumber(val, defaultVal = null) {
  if (typeof val === 'number' && !isNaN(val)) return val;
  if (typeof val === 'string' && val.trim() !== '') {
    const parsed = Number(val);
    if (!isNaN(parsed)) return parsed;
  }
  return defaultVal;
}

