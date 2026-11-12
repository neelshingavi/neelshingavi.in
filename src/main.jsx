import React from 'react';
import { createRoot } from 'react-dom/client';
import { LazyMotion, domAnimation } from 'framer-motion';
import App from './App.jsx';
import { ErrorBoundary } from './components/ErrorBoundary.jsx';
import { FallbackPage } from './components/FallbackPage.jsx';
import { initGA } from './utils/analytics.js';
import { reportWebVitals } from './utils/webVitals.js';
import { profile } from './data/portfolio.js';
import './styles.css';
import './bg-and-perf.css';
import './editorial-design-system.css';
import './motion.css';

// Initialize analytics after page loads (non-blocking)
window.addEventListener('load', () => {
  initGA();
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
        <App />
      </LazyMotion>
    </ErrorBoundary>
  </React.StrictMode>
);
