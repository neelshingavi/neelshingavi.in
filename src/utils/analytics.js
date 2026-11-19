import { posthog } from './posthog.js';
import { recordSessionAction } from './visitorLogger.js';

// Measurement ID — configured via environment variable
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

// Load GA4 script dynamically (don't block render)
export function initGA() {
  if (!GA_MEASUREMENT_ID || import.meta.env.DEV) return;

  const script = document.createElement('script');
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  script.async = true;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    storage: 'none',
    client_storage: 'none',
    anonymize_ip: true,
    send_page_view: true,
  });
}

// ─── Custom Event Tracking ────────────────────────────────────────

export function trackEvent(eventName, params = {}) {
  // Google Analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }

  // PostHog
  try {
    if (typeof window !== 'undefined' && posthog?.__loaded) {
      posthog.capture(eventName, params);
    }
  } catch {
    // Fail silently so user interactions are never interrupted
  }

  // Local Admin Telemetry
  try {
    recordSessionAction(eventName, params);
  } catch {
    // Fail silently
  }
}

// Specific event helpers:
export const analytics = {
  // Resume downloaded
  resumeDownloaded: () => trackEvent('resume_download', {
    event_category: 'engagement',
    event_label: 'resume_pdf',
  }),

  // CTA clicks
  ctaClicked: (label) => trackEvent('cta_click', {
    event_category: 'engagement',
    event_label: label,
  }),

  // Email clicked
  emailClicked: () => trackEvent('contact_email_click', {
    event_category: 'contact',
    event_label: 'email',
  }),

  // Phone clicked
  phoneClicked: () => trackEvent('contact_phone_click', {
    event_category: 'contact',
    event_label: 'phone',
  }),

  // Social link clicked
  socialClicked: (platform) => trackEvent('social_click', {
    event_category: 'external_link',
    event_label: platform,
  }),

  // Project card viewed (intersection)
  projectViewed: (projectName) => trackEvent('project_view', {
    event_category: 'portfolio',
    event_label: projectName,
  }),

  // Section reached (tracked once per page session)
  sectionReached: (section) => trackEvent('section_reached', {
    event_category: 'scroll',
    event_label: section,
  }),

  // Contact form submitted via API
  contactApiSubmitted: () => trackEvent('contact_api_success', {
    event_category: 'lead',
    event_label: 'web3forms',
  }),

  // Mailto fallback initiated
  contactMailtoInitiated: () => trackEvent('contact_mailto_initiated', {
    event_category: 'lead',
    event_label: 'mailto_fallback',
  }),

  // Email address copied
  emailCopied: () => trackEvent('contact_email_copied', {
    event_category: 'contact',
    event_label: 'clipboard',
  }),

  // Legacy alias for compatibility
  contactFormSubmitted: () => trackEvent('contact_form_submit', {
    event_category: 'lead',
    event_label: 'contact_form',
  }),

  // Time on page
  timeOnPage: (seconds) => trackEvent('time_on_page', {
    event_category: 'engagement',
    value: seconds,
  }),
};
