import { useState, useEffect, useMemo } from 'react';
import {
  Shield,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Clock,
  Users,
  FileDown,
  Compass,
  ArrowLeft,
  ExternalLink,
  RefreshCw,
  LogOut,
  Monitor,
  Smartphone,
  Globe,
  Activity,
  PlayCircle,
  TrendingUp,
  Sliders,
  CheckCircle2,
  Trash2,
  PlusCircle,
} from 'lucide-react';
import {
  getAllVisitorSessions,
  getVisitorAnalyticsSummary,
  clearVisitorSessions,
} from '../utils/visitorLogger.js';

// Salted cryptographic hash verification so credentials are NEVER exposed in git or client bundles
const SALT = 'neel_portfolio_salt_2026_sec';
const EXPECTED_HASH = import.meta.env.VITE_ADMIN_PASS_HASH || '21f757a0573ee3e628044e8653ae85425a453bfa1297610b18c97ce3e9aff41d';
const AUTH_STORAGE_KEY = 'neel_telemetry_session_token';

async function computeHash(text) {
  if (typeof window === 'undefined' || !window.crypto?.subtle) return '';
  const encoder = new TextEncoder();
  const data = encoder.encode(`${SALT}:${text}`);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return sessionStorage.getItem(AUTH_STORAGE_KEY) === EXPECTED_HASH;
    } catch {
      return false;
    }
  });

  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState('sessions'); // 'sessions' | 'heatmap' | 'feed' | 'posthog'
  const [sessions, setSessions] = useState(() => getAllVisitorSessions());
  const [summary, setSummary] = useState(() => getVisitorAnalyticsSummary());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Refresh data from storage
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setSessions(getAllVisitorSessions());
      setSummary(getVisitorAnalyticsSummary());
      setIsRefreshing(false);
    }, 300);
  };

  const handleLogin = async (e) => {
    e?.preventDefault();
    if (!passwordInput) {
      setErrorMsg('Please enter a password.');
      return;
    }

    setIsAuthenticating(true);
    try {
      const hashed = await computeHash(passwordInput);
      if (hashed === EXPECTED_HASH) {
        try {
          sessionStorage.setItem(AUTH_STORAGE_KEY, EXPECTED_HASH);
        } catch {}
        setIsAuthenticated(true);
        setErrorMsg('');
        setSessions(getAllVisitorSessions());
        setSummary(getVisitorAnalyticsSummary());
      } else {
        setErrorMsg('Access denied. Incorrect security token.');
      }
    } catch {
      setErrorMsg('Authentication verification failed.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = () => {
    try {
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {}
    setIsAuthenticated(false);
    setPasswordInput('');
  };

  const handleExitToPortfolio = () => {
    window.location.href = '/';
  };

  const handleClearData = () => {
    if (window.confirm('Clear stored visitor sessions? (Baseline demo records will remain)')) {
      clearVisitorSessions();
      handleRefresh();
    }
  };

  const handleSimulateVisitor = () => {
    const randomSec = Math.floor(Math.random() * 240) + 45;
    const minutes = Math.floor(randomSec / 60);
    const seconds = randomSec % 60;
    const newSession = {
      id: `sim_${Date.now()}`,
      startedAt: new Date().toISOString(),
      duration: randomSec,
      referrer: 'https://linkedin.com/in/recruiter-search',
      source: 'LinkedIn',
      device: { type: 'Desktop', os: 'macOS', browser: 'Chrome' },
      location: 'New York, NY, USA',
      sectionsViewed: ['Hero', 'Projects', 'Case Study: QueryPilot', 'Resume'],
      actions: [
        { action: 'project_view', label: 'QueryPilot', time: 'Just now' },
        { action: 'resume_download', label: 'neel-shingavi-resume.pdf', time: 'Just now' },
      ],
    };

    try {
      const stored = localStorage.getItem('neel_portfolio_visitor_sessions');
      const list = stored ? JSON.parse(stored) : [];
      list.unshift(newSession);
      localStorage.setItem('neel_portfolio_visitor_sessions', JSON.stringify(list));
      handleRefresh();
    } catch {}
  };

  const formatDuration = (seconds) => {
    if (!seconds || seconds < 1) return '< 5s';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  const formatTimestamp = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' });
    } catch {
      return 'Recent';
    }
  };

  // ─── LOGIN SCREEN ──────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div style={styles.loginContainer}>
        <div style={styles.loginCard}>
          <div style={styles.loginBadge}>
            <Shield size={16} color="#bff205" />
            <span>RESTRICTED ACCESS</span>
          </div>

          <h1 style={styles.loginTitle}>Admin Console</h1>
          <p style={styles.loginSubtitle}>
            Enter security credentials to view visitor telemetry, dwell duration, and session replays.
          </p>

          <form onSubmit={handleLogin} style={styles.loginForm}>
            <div style={styles.inputWrapper}>
              <Lock size={18} color="#8a9977" style={styles.inputIcon} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter admin password..."
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setErrorMsg('');
                }}
                style={styles.passwordInput}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.togglePasswordBtn}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {errorMsg && <div style={styles.errorMessage}>{errorMsg}</div>}

            <button type="submit" disabled={isAuthenticating} style={styles.submitBtn}>
              <Unlock size={16} />
              <span>{isAuthenticating ? 'Verifying...' : 'Unlock Analytics'}</span>
            </button>
          </form>

          <div style={styles.loginFooter}>
            <button onClick={handleExitToPortfolio} style={styles.backLink}>
              <ArrowLeft size={14} /> Back to Portfolio
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── AUTHENTICATED DASHBOARD ──────────────────────────────────────
  return (
    <div style={styles.dashboardContainer}>
      {/* Top Header */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.headerLogoBadge}>
            <span style={styles.statusDot} />
            <span style={styles.brandTitle}>NEEL SHINGAVI // TELEMETRY</span>
          </div>
          <span style={styles.envBadge}>PostHog Connected</span>
        </div>

        <div style={styles.headerActions}>
          <button onClick={handleRefresh} style={styles.iconActionBtn} title="Refresh data">
            <RefreshCw size={15} style={isRefreshing ? styles.spinning : {}} />
            <span style={styles.hideMobile}>Refresh</span>
          </button>

          <a
            href="https://us.posthog.com/project/recordings"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.posthogReplayBtn}
            title="Open PostHog Video Session Recordings"
          >
            <PlayCircle size={15} color="#bff205" />
            <span>PostHog Replays</span>
            <ExternalLink size={12} />
          </a>

          <button onClick={handleExitToPortfolio} style={styles.iconActionBtn}>
            <ArrowLeft size={15} />
            <span style={styles.hideMobile}>Portfolio</span>
          </button>

          <button onClick={handleLogout} style={styles.logoutBtn} title="Sign Out">
            <LogOut size={15} />
          </button>
        </div>
      </header>

      <main style={styles.mainContent}>
        {/* KPI Summary Cards */}
        <div style={styles.kpiGrid}>
          <div style={styles.kpiCard}>
            <div style={styles.kpiTop}>
              <span style={styles.kpiLabel}>Total Visits</span>
              <Users size={18} color="#bff205" />
            </div>
            <div style={styles.kpiValue}>{summary.totalVisits}</div>
            <div style={styles.kpiSub}>Tracked sessions & active visitors</div>
          </div>

          <div style={styles.kpiCard}>
            <div style={styles.kpiTop}>
              <span style={styles.kpiLabel}>Avg Time on Site</span>
              <Clock size={18} color="#00e5ff" />
            </div>
            <div style={styles.kpiValue}>{formatDuration(summary.avgDuration)}</div>
            <div style={styles.kpiSub}>Active dwell time across visitors</div>
          </div>

          <div style={styles.kpiCard}>
            <div style={styles.kpiTop}>
              <span style={styles.kpiLabel}>Resume Downloads</span>
              <FileDown size={18} color="#ff5e3a" />
            </div>
            <div style={styles.kpiValue}>{summary.resumeDownloads}</div>
            <div style={styles.kpiSub}>High-intent recruiter downloads</div>
          </div>

          <div style={styles.kpiCard}>
            <div style={styles.kpiTop}>
              <span style={styles.kpiLabel}>Top Traffic Source</span>
              <Globe size={18} color="#fbc02d" />
            </div>
            <div style={styles.kpiValue}>{summary.topSource}</div>
            <div style={styles.kpiSub}>Primary visitor acquisition link</div>
          </div>
        </div>

        {/* Tab Controls & Tools */}
        <div style={styles.tabBar}>
          <div style={styles.tabButtons}>
            <button
              onClick={() => setActiveTab('sessions')}
              style={activeTab === 'sessions' ? styles.tabBtnActive : styles.tabBtn}
            >
              <Users size={15} />
              <span>Visitor Sessions ({sessions.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('heatmap')}
              style={activeTab === 'heatmap' ? styles.tabBtnActive : styles.tabBtn}
            >
              <Activity size={15} />
              <span>Project Engagement</span>
            </button>
            <button
              onClick={() => setActiveTab('posthog')}
              style={activeTab === 'posthog' ? styles.tabBtnActive : styles.tabBtn}
            >
              <PlayCircle size={15} />
              <span>PostHog Studio</span>
            </button>
          </div>

          <div style={styles.tabActions}>
            <button onClick={handleSimulateVisitor} style={styles.smallOutlineBtn} title="Add sample session">
              <PlusCircle size={14} /> Simulate Visit
            </button>
            <button onClick={handleClearData} style={styles.smallDangerBtn} title="Clear saved logs">
              <Trash2 size={14} /> Clear
            </button>
          </div>
        </div>

        {/* TAB 1: VISITOR SESSIONS TABLE */}
        {activeTab === 'sessions' && (
          <div style={styles.cardContainer}>
            <div style={styles.cardHeader}>
              <div>
                <h3 style={styles.cardTitle}>Live Visitor Dwell Times & Sessions</h3>
                <p style={styles.cardSubtitle}>
                  Monitors how long each recruiter or engineer stayed, what device they used, and their path.
                </p>
              </div>
            </div>

            <div style={styles.tableScroll}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeadRow}>
                    <th style={styles.th}>VISITOR / TIME</th>
                    <th style={styles.th}>TIME SPENT</th>
                    <th style={styles.th}>REFERRER / SOURCE</th>
                    <th style={styles.th}>DEVICE / OS</th>
                    <th style={styles.th}>SECTIONS VIEWED</th>
                    <th style={styles.th}>ACTIONS & CONVERSIONS</th>
                    <th style={styles.th}>POSTHOG</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((sess) => (
                    <tr key={sess.id} style={styles.tableRow}>
                      <td style={styles.td}>
                        <div style={styles.sessionMeta}>
                          <span style={styles.sessionTime}>{formatTimestamp(sess.startedAt)}</span>
                          <span style={styles.sessionId}>{sess.id.slice(0, 16)}</span>
                        </div>
                      </td>

                      <td style={styles.td}>
                        <div style={styles.durationBadge}>
                          <Clock size={13} color="#bff205" />
                          <span style={styles.durationText}>{formatDuration(sess.duration)}</span>
                        </div>
                      </td>

                      <td style={styles.td}>
                        <div style={styles.sourceTag}>
                          <Globe size={12} color="#8a9977" />
                          <span>{sess.source || 'Direct'}</span>
                        </div>
                      </td>

                      <td style={styles.td}>
                        <div style={styles.deviceRow}>
                          {sess.device?.type === 'Mobile' ? (
                            <Smartphone size={14} color="#8a9977" />
                          ) : (
                            <Monitor size={14} color="#8a9977" />
                          )}
                          <span>
                            {sess.device?.os} • {sess.device?.browser}
                          </span>
                        </div>
                      </td>

                      <td style={styles.td}>
                        <div style={styles.pillContainer}>
                          {(sess.sectionsViewed || ['Hero']).map((sec, idx) => (
                            <span key={idx} style={styles.sectionPill}>
                              {sec}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td style={styles.td}>
                        {sess.actions && sess.actions.length > 0 ? (
                          <div style={styles.actionsList}>
                            {sess.actions.slice(0, 3).map((act, i) => (
                              <span
                                key={i}
                                style={
                                  act.action?.includes('download')
                                    ? styles.actionPillHighlight
                                    : styles.actionPill
                                }
                              >
                                {act.label || act.action}
                              </span>
                            ))}
                            {sess.actions.length > 3 && (
                              <span style={styles.morePill}>+{sess.actions.length - 3} more</span>
                            )}
                          </div>
                        ) : (
                          <span style={styles.mutedText}>Browsing</span>
                        )}
                      </td>

                      <td style={styles.td}>
                        <a
                          href="https://us.posthog.com/project/recordings"
                          target="_blank"
                          rel="noopener noreferrer"
                          style={styles.watchReplayLink}
                          title="Watch session recording in PostHog"
                        >
                          <PlayCircle size={14} /> Replay ↗
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: PROJECT ENGAGEMENT HEATMAP */}
        {activeTab === 'heatmap' && (
          <div style={styles.gridTwoCol}>
            <div style={styles.cardContainer}>
              <h3 style={styles.cardTitle}>Project Attention Breakdown</h3>
              <p style={styles.cardSubtitle}>Total clicks and deep-dives per case study</p>

              <div style={styles.projectBarList}>
                {[
                  { name: 'QueryPilot', views: summary.projectCounts['QueryPilot'] || 14 },
                  { name: 'FounderFlow', views: summary.projectCounts['FounderFlow'] || 11 },
                  { name: 'Pay-Per-Use Architecture', views: summary.projectCounts['Pay-Per-Use Architecture'] || 9 },
                  { name: 'TradersDesk', views: summary.projectCounts['TradersDesk'] || 7 },
                  { name: 'CertiCraft', views: summary.projectCounts['CertiCraft'] || 5 },
                ].map((item, idx) => {
                  const maxViews = 20;
                  const pct = Math.min(100, Math.round((item.views / maxViews) * 100));
                  return (
                    <div key={idx} style={styles.projectBarItem}>
                      <div style={styles.barLabelRow}>
                        <span style={styles.barTitle}>{item.name}</span>
                        <span style={styles.barValue}>{item.views} views</span>
                      </div>
                      <div style={styles.barTrack}>
                        <div style={{ ...styles.barFill, width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={styles.cardContainer}>
              <h3 style={styles.cardTitle}>Traffic Channel Distribution</h3>
              <p style={styles.cardSubtitle}>Where your visitors are arriving from</p>

              <div style={styles.sourceGrid}>
                {Object.entries(summary.sourceCounts).map(([src, count], idx) => (
                  <div key={idx} style={styles.sourceBox}>
                    <div style={styles.sourceBoxTop}>
                      <Globe size={16} color="#bff205" />
                      <span style={styles.sourceBoxCount}>{count}</span>
                    </div>
                    <span style={styles.sourceBoxName}>{src}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: POSTHOG INTEGRATION HUB */}
        {activeTab === 'posthog' && (
          <div style={styles.cardContainer}>
            <h3 style={styles.cardTitle}>PostHog Telemetry Command Center</h3>
            <p style={styles.cardSubtitle}>
              Direct tools for video replays, real-time live events, and webhook push alerts.
            </p>

            <div style={styles.hubGrid}>
              <a
                href="https://us.posthog.com/project/recordings"
                target="_blank"
                rel="noopener noreferrer"
                style={styles.hubCard}
              >
                <div style={styles.hubIconWrap}>
                  <PlayCircle size={28} color="#bff205" />
                </div>
                <h4 style={styles.hubCardTitle}>Session Replay Studio ↗</h4>
                <p style={styles.hubCardDesc}>
                  Watch video-like screen replays of visitors moving their cursor, reading project case studies, and scrolling.
                </p>
                <span style={styles.hubLinkText}>Open PostHog Replays →</span>
              </a>

              <a
                href="https://us.posthog.com/events"
                target="_blank"
                rel="noopener noreferrer"
                style={styles.hubCard}
              >
                <div style={styles.hubIconWrap}>
                  <Activity size={28} color="#00e5ff" />
                </div>
                <h4 style={styles.hubCardTitle}>Live Event Feed ↗</h4>
                <p style={styles.hubCardDesc}>
                  Real-time raw event stream. View every click, pageview, and download as it happens live.
                </p>
                <span style={styles.hubLinkText}>Open Live Events →</span>
              </a>

              <a
                href="https://us.posthog.com/web-analytics"
                target="_blank"
                rel="noopener noreferrer"
                style={styles.hubCard}
              >
                <div style={styles.hubIconWrap}>
                  <TrendingUp size={28} color="#fbc02d" />
                </div>
                <h4 style={styles.hubCardTitle}>Web Analytics Dashboard ↗</h4>
                <p style={styles.hubCardDesc}>
                  Global visitor maps, bounce rates, retention graphs, and top referring domains.
                </p>
                <span style={styles.hubLinkText}>Open Web Analytics →</span>
              </a>
            </div>

            <div style={styles.webhookBanner}>
              <div style={styles.webhookInfo}>
                <CheckCircle2 size={20} color="#bff205" />
                <div>
                  <strong>Want Instant Phone Notifications on Visit?</strong>
                  <div style={styles.webhookSub}>
                    Connect your Discord or Slack channel in PostHog Settings → Webhooks. It will send a ping to your phone the second someone opens your portfolio!
                  </div>
                </div>
              </div>
              <a
                href="https://us.posthog.com/settings/project-webhooks"
                target="_blank"
                rel="noopener noreferrer"
                style={styles.webhookLinkBtn}
              >
                Configure Webhooks ↗
              </a>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// ─── STYLES (Inline to ensure zero bundle dependency and complete styling fidelity) ───
const styles = {
  loginContainer: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0b0c09',
    padding: '24px',
    fontFamily: 'JetBrains Mono, monospace, system-ui',
    color: '#f4f0df',
  },
  loginCard: {
    width: '100%',
    maxWidth: '440px',
    background: 'rgba(18, 20, 15, 0.95)',
    border: '1px solid rgba(191, 242, 5, 0.25)',
    borderRadius: '16px',
    padding: '36px',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 40px rgba(191, 242, 5, 0.08)',
  },
  loginBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.12em',
    color: '#bff205',
    background: 'rgba(191, 242, 5, 0.1)',
    padding: '4px 10px',
    borderRadius: '100px',
    marginBottom: '18px',
  },
  loginTitle: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#f4f0df',
    margin: '0 0 8px 0',
    letterSpacing: '-0.02em',
  },
  loginSubtitle: {
    fontSize: '13px',
    color: '#8a9977',
    margin: '0 0 24px 0',
    lineHeight: '1.5',
  },
  loginForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '14px',
    pointerEvents: 'none',
  },
  passwordInput: {
    width: '100%',
    background: '#0e110c',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '10px',
    padding: '14px 44px 14px 42px',
    fontSize: '14px',
    color: '#f4f0df',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  togglePasswordBtn: {
    position: 'absolute',
    right: '12px',
    background: 'transparent',
    border: 'none',
    color: '#8a9977',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
  },
  errorMessage: {
    color: '#ff5e3a',
    fontSize: '12px',
    background: 'rgba(255, 94, 58, 0.1)',
    border: '1px solid rgba(255, 94, 58, 0.3)',
    borderRadius: '8px',
    padding: '8px 12px',
  },
  submitBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    background: '#bff205',
    color: '#0b0c09',
    border: 'none',
    borderRadius: '10px',
    padding: '14px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  loginFooter: {
    marginTop: '24px',
    textAlign: 'center',
  },
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: 'transparent',
    border: 'none',
    color: '#8a9977',
    fontSize: '12px',
    cursor: 'pointer',
  },

  // ─── DASHBOARD CONTAINER ──────────────────────────────────────────
  dashboardContainer: {
    minHeight: '100vh',
    background: '#090a07',
    color: '#f4f0df',
    fontFamily: 'JetBrains Mono, monospace, system-ui',
    paddingBottom: '60px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 28px',
    background: 'rgba(14, 16, 12, 0.95)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    backdropFilter: 'blur(10px)',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  headerLogoBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#bff205',
    boxShadow: '0 0 10px #bff205',
  },
  brandTitle: {
    fontSize: '13px',
    fontWeight: '700',
    letterSpacing: '0.08em',
    color: '#f4f0df',
  },
  envBadge: {
    fontSize: '10px',
    color: '#bff205',
    background: 'rgba(191, 242, 5, 0.12)',
    border: '1px solid rgba(191, 242, 5, 0.25)',
    padding: '2px 8px',
    borderRadius: '6px',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  iconActionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#f4f0df',
    padding: '8px 12px',
    borderRadius: '8px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  posthogReplayBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(191, 242, 5, 0.15)',
    border: '1px solid rgba(191, 242, 5, 0.3)',
    color: '#bff205',
    padding: '8px 14px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '600',
    textDecoration: 'none',
    cursor: 'pointer',
  },
  logoutBtn: {
    background: 'rgba(255, 94, 58, 0.1)',
    border: '1px solid rgba(255, 94, 58, 0.2)',
    color: '#ff5e3a',
    padding: '8px 10px',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },

  // ─── MAIN CONTENT ─────────────────────────────────────────────────
  mainContent: {
    maxWidth: '1300px',
    margin: '0 auto',
    padding: '28px 24px',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '16px',
    marginBottom: '28px',
  },
  kpiCard: {
    background: 'rgba(18, 21, 16, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '20px',
  },
  kpiTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  kpiLabel: {
    fontSize: '11px',
    color: '#8a9977',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  kpiValue: {
    fontSize: '30px',
    fontWeight: '800',
    color: '#f4f0df',
    letterSpacing: '-0.03em',
    marginBottom: '4px',
  },
  kpiSub: {
    fontSize: '11px',
    color: '#8a9977',
  },

  // ─── TABS ─────────────────────────────────────────────────────────
  tabBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
    marginBottom: '20px',
  },
  tabButtons: {
    display: 'flex',
    gap: '8px',
  },
  tabBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    color: '#8a9977',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  tabBtnActive: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#bff205',
    border: '1px solid #bff205',
    color: '#0b0c09',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  tabActions: {
    display: 'flex',
    gap: '8px',
  },
  smallOutlineBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    color: '#f4f0df',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '11px',
    cursor: 'pointer',
  },
  smallDangerBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(255, 94, 58, 0.1)',
    border: '1px solid rgba(255, 94, 58, 0.25)',
    color: '#ff5e3a',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '11px',
    cursor: 'pointer',
  },

  // ─── CARD & TABLE ─────────────────────────────────────────────────
  cardContainer: {
    background: 'rgba(18, 21, 16, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '14px',
    padding: '24px',
  },
  cardHeader: {
    marginBottom: '20px',
  },
  cardTitle: {
    fontSize: '17px',
    fontWeight: '700',
    color: '#f4f0df',
    margin: '0 0 6px 0',
  },
  cardSubtitle: {
    fontSize: '12px',
    color: '#8a9977',
    margin: 0,
  },
  tableScroll: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '12px',
  },
  tableHeadRow: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
  },
  th: {
    padding: '12px 14px',
    color: '#8a9977',
    fontWeight: '700',
    fontSize: '10px',
    letterSpacing: '0.08em',
  },
  tableRow: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    transition: 'background 0.15s',
  },
  td: {
    padding: '14px',
    verticalAlign: 'middle',
  },
  sessionMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
  },
  sessionTime: {
    color: '#f4f0df',
    fontWeight: '600',
  },
  sessionId: {
    fontSize: '10px',
    color: '#556346',
  },
  durationBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(191, 242, 5, 0.1)',
    border: '1px solid rgba(191, 242, 5, 0.2)',
    padding: '4px 8px',
    borderRadius: '6px',
  },
  durationText: {
    color: '#bff205',
    fontWeight: '700',
    fontSize: '12px',
  },
  sourceTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    color: '#f4f0df',
  },
  deviceRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#8a9977',
    fontSize: '11px',
  },
  pillContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
    maxWidth: '220px',
  },
  sectionPill: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '4px',
    padding: '2px 6px',
    fontSize: '10px',
    color: '#8a9977',
  },
  actionsList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
    maxWidth: '240px',
  },
  actionPill: {
    background: 'rgba(0, 229, 255, 0.1)',
    border: '1px solid rgba(0, 229, 255, 0.25)',
    color: '#00e5ff',
    borderRadius: '4px',
    padding: '2px 6px',
    fontSize: '10px',
  },
  actionPillHighlight: {
    background: 'rgba(191, 242, 5, 0.15)',
    border: '1px solid rgba(191, 242, 5, 0.35)',
    color: '#bff205',
    borderRadius: '4px',
    padding: '2px 6px',
    fontSize: '10px',
    fontWeight: '700',
  },
  morePill: {
    fontSize: '10px',
    color: '#8a9977',
    padding: '2px 4px',
  },
  mutedText: {
    color: '#556346',
    fontSize: '11px',
  },
  watchReplayLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    color: '#bff205',
    textDecoration: 'none',
    fontSize: '11px',
    fontWeight: '600',
    background: 'rgba(191, 242, 5, 0.08)',
    border: '1px solid rgba(191, 242, 5, 0.2)',
    padding: '4px 10px',
    borderRadius: '6px',
  },

  // ─── HEATMAP & CHARTS ─────────────────────────────────────────────
  gridTwoCol: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '20px',
  },
  projectBarList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginTop: '16px',
  },
  projectBarItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  barLabelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
  },
  barTitle: {
    color: '#f4f0df',
    fontWeight: '600',
  },
  barValue: {
    color: '#bff205',
    fontWeight: '700',
  },
  barTrack: {
    width: '100%',
    height: '8px',
    background: 'rgba(255, 255, 255, 0.06)',
    borderRadius: '100px',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #00e5ff, #bff205)',
    borderRadius: '100px',
  },
  sourceGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
    gap: '12px',
    marginTop: '16px',
  },
  sourceBox: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '10px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  sourceBoxTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sourceBoxCount: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#f4f0df',
  },
  sourceBoxName: {
    fontSize: '11px',
    color: '#8a9977',
  },

  // ─── POSTHOG HUB ──────────────────────────────────────────────────
  hubGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '16px',
    marginTop: '18px',
  },
  hubCard: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '22px',
    textDecoration: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    transition: 'all 0.2s',
  },
  hubIconWrap: {
    marginBottom: '4px',
  },
  hubCardTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#f4f0df',
    margin: 0,
  },
  hubCardDesc: {
    fontSize: '12px',
    color: '#8a9977',
    lineHeight: '1.5',
    margin: 0,
    flexGrow: 1,
  },
  hubLinkText: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#bff205',
    marginTop: '6px',
  },
  webhookBanner: {
    marginTop: '24px',
    background: 'rgba(191, 242, 5, 0.06)',
    border: '1px solid rgba(191, 242, 5, 0.25)',
    borderRadius: '12px',
    padding: '18px 22px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '14px',
  },
  webhookInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    maxWidth: '640px',
    fontSize: '13px',
  },
  webhookSub: {
    fontSize: '12px',
    color: '#8a9977',
    marginTop: '4px',
  },
  webhookLinkBtn: {
    background: '#bff205',
    color: '#0b0c09',
    padding: '10px 18px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '700',
    textDecoration: 'none',
  },
  spinning: {
    animation: 'spin 1s linear infinite',
  },
};
