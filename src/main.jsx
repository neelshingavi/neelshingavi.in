import React, { Suspense, lazy, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { LazyMotion, domAnimation } from 'framer-motion';
import App from './App.jsx';
import { ErrorBoundary } from './components/ErrorBoundary.jsx';
import { FallbackPage } from './components/FallbackPage.jsx';
import { initGA } from './utils/analytics.js';
import { initPostHog } from './utils/posthog.js';
import { initVisitorSession } from './utils/visitorLogger.js';
import { reportWebVitals } from './utils/webVitals.js';
import { profile } from './data/portfolio.js';
import './styles.css';
import './bg-and-perf.css';
import './editorial-design-system.css';
import './motion.css';

const AdminDashboard = lazy(() =>
  import('./components/AdminDashboard.jsx').then((m) => ({ default: m.AdminDashboard }))
);

const ADMIN_PATH = import.meta.env.VITE_ADMIN_PATH || '/admin-4123';

function RootRouter() {
  const [pathname, setPathname] = useState(() =>
    typeof window !== 'undefined' ? window.location.pathname.replace(/\/$/, '') : '/'
  );

  useEffect(() => {
    const handlePopState = () => setPathname(window.location.pathname.replace(/\/$/, ''));
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const isAdminRoute = /^\/admin-[a-zA-Z0-9_-]+$/.test(pathname) || pathname === ADMIN_PATH;

  if (isAdminRoute) {
    return (
      <Suspense fallback={<div style={{ minHeight: '100vh', background: '#090a07' }} />}>
        <AdminDashboard />
      </Suspense>
    );
  }

  return <App />;
}

// Initialize analytics after page loads (non-blocking)
window.addEventListener('load', () => {
  initGA();
  initPostHog();
  initVisitorSession();
  reportWebVitals();
  if (typeof console !== 'undefined') {
    console.log(
      `%cHiring? ${profile.email}  ·  Try Cmd+K → whoami / git log / sudo hire neel`,
      'font:700 13px monospace;color:#bff205'
    );
  }
}, { once: true });

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary fallback={<FallbackPage />}>
      <LazyMotion features={domAnimation}>
        <RootRouter />
      </LazyMotion>
    </ErrorBoundary>
  </React.StrictMode>
);
