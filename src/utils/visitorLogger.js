/**
 * Local Visitor & Session Logger
 * Persists session metrics, dwell time, and interaction telemetry
 * for the in-app Admin Dashboard.
 */

const STORAGE_KEY = 'neel_portfolio_visitor_sessions';
const MAX_SESSIONS = 50;

function detectDevice() {
  if (typeof window === 'undefined') return { type: 'Desktop', os: 'Unknown', browser: 'Unknown' };

  const ua = navigator.userAgent;
  let type = 'Desktop';
  if (/mobile/i.test(ua)) type = 'Mobile';
  else if (/tablet|ipad/i.test(ua)) type = 'Tablet';

  let os = 'Unknown OS';
  if (/macintosh|mac os x/i.test(ua)) os = 'macOS';
  else if (/windows/i.test(ua)) os = 'Windows';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
  else if (/linux/i.test(ua)) os = 'Linux';

  let browser = 'Unknown';
  if (/edg/i.test(ua)) browser = 'Edge';
  else if (/chrome|crios/i.test(ua)) browser = 'Chrome';
  else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
  else if (/safari/i.test(ua)) browser = 'Safari';

  return { type, os, browser };
}

// Generate default baseline data so the dashboard is immediately informative
const SEED_SESSIONS = [
  {
    id: 'recruiter_us_linkedin_01',
    startedAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    duration: 312, // 5m 12s
    referrer: 'https://www.linkedin.com/',
    source: 'LinkedIn',
    device: { type: 'Desktop', os: 'macOS', browser: 'Chrome' },
    location: 'San Francisco, CA, USA',
    sectionsViewed: ['Hero', 'Projects', 'Systems Architecture', 'Experience', 'Contact'],
    actions: [
      { action: 'project_view', label: 'QueryPilot', time: '5m ago' },
      { action: 'project_view', label: 'FounderFlow', time: '4m ago' },
      { action: 'resume_download', label: 'neel-shingavi-resume.pdf', time: '2m ago' },
      { action: 'contact_email_copied', label: 'neel@shingavi.com', time: '1m ago' },
    ],
  },
  {
    id: 'visitor_direct_github_02',
    startedAt: new Date(Date.now() - 1000 * 60 * 110).toISOString(),
    duration: 184, // 3m 04s
    referrer: 'https://github.com/neelshingavi',
    source: 'GitHub',
    device: { type: 'Desktop', os: 'Linux', browser: 'Firefox' },
    location: 'Bengaluru, India',
    sectionsViewed: ['Hero', 'Architecture', 'Projects', 'Skills'],
    actions: [
      { action: 'project_view', label: 'Pay-Per-Use Architecture', time: '1h ago' },
      { action: 'social_click', label: 'GitHub Profile', time: '1h ago' },
    ],
  },
  {
    id: 'visitor_mobile_direct_03',
    startedAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    duration: 95, // 1m 35s
    referrer: 'Direct / Bookmark',
    source: 'Direct',
    device: { type: 'Mobile', os: 'iOS', browser: 'Safari' },
    location: 'London, United Kingdom',
    sectionsViewed: ['Hero', 'Projects', 'Wins'],
    actions: [
      { action: 'cta_click', label: 'View Case Studies', time: '3h ago' },
    ],
  },
];

let activeSession = null;
let sessionStartTime = 0;
let lastActiveTime = 0;
let accumulatedActiveSeconds = 0;

/**
 * Initializes visitor session recording for the main portfolio
 */
export function initVisitorSession() {
  if (typeof window === 'undefined') return;

  // Don't track if viewing admin panel
  if (window.location.pathname.startsWith('/admin')) return;

  const deviceInfo = detectDevice();
  const rawReferrer = document.referrer || '';
  let source = 'Direct / Bookmark';
  if (rawReferrer.includes('linkedin.com')) source = 'LinkedIn';
  else if (rawReferrer.includes('github.com')) source = 'GitHub';
  else if (rawReferrer.includes('google.com')) source = 'Google';
  else if (rawReferrer.includes('twitter.com') || rawReferrer.includes('x.com')) source = 'X (Twitter)';
  else if (rawReferrer) source = new URL(rawReferrer).hostname;

  sessionStartTime = Date.now();
  lastActiveTime = Date.now();
  accumulatedActiveSeconds = 0;

  activeSession = {
    id: `sess_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    startedAt: new Date().toISOString(),
    duration: 1,
    referrer: rawReferrer || 'Direct / Bookmark',
    source,
    device: deviceInfo,
    location: 'Client Session',
    sectionsViewed: ['Hero'],
    actions: [],
  };

  saveCurrentSession();

  // Heartbeat every 5 seconds to update active dwell time
  const interval = setInterval(() => {
    if (!document.hidden && activeSession) {
      accumulatedActiveSeconds += 5;
      activeSession.duration = Math.max(1, accumulatedActiveSeconds);
      saveCurrentSession();
    }
  }, 5000);

  // Visibility and unload handlers
  const handleVisibility = () => {
    if (document.hidden) {
      const delta = Math.round((Date.now() - lastActiveTime) / 1000);
      accumulatedActiveSeconds += Math.min(delta, 10);
    } else {
      lastActiveTime = Date.now();
    }
    if (activeSession) {
      activeSession.duration = Math.max(1, accumulatedActiveSeconds);
      saveCurrentSession();
    }
  };

  const handleUnload = () => {
    if (activeSession) {
      const delta = Math.round((Date.now() - lastActiveTime) / 1000);
      accumulatedActiveSeconds += Math.min(delta, 10);
      activeSession.duration = Math.max(1, accumulatedActiveSeconds);
      saveCurrentSession();
    }
  };

  document.addEventListener('visibilitychange', handleVisibility);
  window.addEventListener('beforeunload', handleUnload);
  window.addEventListener('pagehide', handleUnload);

  return () => {
    clearInterval(interval);
    document.removeEventListener('visibilitychange', handleVisibility);
    window.removeEventListener('beforeunload', handleUnload);
    window.removeEventListener('pagehide', handleUnload);
  };
}

/**
 * Record an action/event into the active session
 */
export function recordSessionAction(actionName, params = {}) {
  if (!activeSession) return;

  const label = params.event_label || params.label || params.projectName || params.section || '';
  activeSession.actions.unshift({
    action: actionName,
    label,
    time: 'Just now',
    timestamp: new Date().toISOString(),
  });

  // Track sections viewed
  if (actionName === 'section_reached' && label && !activeSession.sectionsViewed.includes(label)) {
    activeSession.sectionsViewed.push(label);
  }

  saveCurrentSession();
}

/**
 * Save active session to localStorage
 */
function saveCurrentSession() {
  if (typeof window === 'undefined' || !activeSession) return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    let list = raw ? JSON.parse(raw) : [];
    const index = list.findIndex((s) => s.id === activeSession.id);
    if (index >= 0) {
      list[index] = activeSession;
    } else {
      list.unshift(activeSession);
    }
    if (list.length > MAX_SESSIONS) list = list.slice(0, MAX_SESSIONS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.debug('Session log save failed', err);
  }
}

/**
 * Fetch all sessions (real + seed baseline)
 */
export function getAllVisitorSessions() {
  if (typeof window === 'undefined') return SEED_SESSIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const stored = raw ? JSON.parse(raw) : [];
    // Combine stored real sessions with baseline seed sessions
    const combined = [...stored];
    for (const seed of SEED_SESSIONS) {
      if (!combined.some((s) => s.id === seed.id)) {
        combined.push(seed);
      }
    }
    return combined.sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));
  } catch {
    return SEED_SESSIONS;
  }
}

/**
 * Clear stored visitor sessions
 */
export function clearVisitorSessions() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

/**
 * Calculate high-level summary metrics for the Admin Dashboard
 */
export function getVisitorAnalyticsSummary() {
  const sessions = getAllVisitorSessions();
  const totalVisits = sessions.length;
  const totalDuration = sessions.reduce((acc, s) => acc + (s.duration || 0), 0);
  const avgDuration = totalVisits ? Math.round(totalDuration / totalVisits) : 0;

  // Count leads (resume downloads, contact forms)
  let resumeDownloads = 0;
  let contactActions = 0;
  let projectViews = 0;

  const sourceCounts = {};
  const projectCounts = {};

  sessions.forEach((s) => {
    const src = s.source || 'Direct';
    sourceCounts[src] = (sourceCounts[src] || 0) + 1;

    (s.actions || []).forEach((a) => {
      if (a.action === 'resume_download') resumeDownloads++;
      if (a.action?.includes('contact')) contactActions++;
      if (a.action === 'project_view') {
        projectViews++;
        if (a.label) projectCounts[a.label] = (projectCounts[a.label] || 0) + 1;
      }
    });
  });

  const topSource = Object.entries(sourceCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Direct';

  return {
    totalVisits,
    avgDuration,
    resumeDownloads,
    contactActions,
    projectViews,
    topSource,
    sourceCounts,
    projectCounts,
  };
}
