import posthog from 'posthog-js';

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY;
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com';

/**
 * Initialize PostHog client for visitor analytics, time-on-site, and session recordings.
 */
export function initPostHog() {
  if (!POSTHOG_KEY || typeof window === 'undefined') return;

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    person_profiles: 'identified_only',
    capture_pageview: true,
    capture_pageleave: true, // Automatically captures time spent on page upon leaving
    autocapture: true,       // Automatically captures clicks and navigation
    session_recording: {
      maskAllInputs: false,
    },
  });
}

export { posthog };
