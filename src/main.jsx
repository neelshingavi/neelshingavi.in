import React from 'react';
import { createRoot } from 'react-dom/client';
import { LazyMotion, domAnimation } from 'framer-motion';
import smoothscroll from 'smoothscroll-polyfill';
import { SpeedInsights } from '@vercel/speed-insights/react';
import App from './App.jsx';
import { ErrorBoundary } from './components/ErrorBoundary.jsx';
import { FallbackPage } from './components/FallbackPage.jsx';
import { initGA } from './utils/analytics.js';
import { reportWebVitals } from './utils/webVitals.js';
import './styles.css';

// Polyfill smooth scrolling
smoothscroll.polyfill();

// Initialize analytics after page loads (non-blocking)
window.addEventListener('load', () => {
  initGA();
  reportWebVitals();
}, { once: true });

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary fallback={<FallbackPage />}>
      <LazyMotion features={domAnimation}>
        <App />
        <SpeedInsights />
      </LazyMotion>
    </ErrorBoundary>
  </React.StrictMode>
);
