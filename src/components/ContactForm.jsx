import { useState, useRef, useEffect } from 'react';
import { Send, CheckCircle, AlertCircle, Copy, Check, Mail, ExternalLink, RefreshCw } from 'lucide-react';
import { analytics } from '../utils/analytics.js';
import { profile } from '../data/portfolio.js';

export function ContactForm() {
  const [status, setStatus] = useState('idle'); // 'idle' | 'submitting' | 'success' | 'api_failed' | 'fallback_opened'
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    honeypot: '',
  });
  const [errors, setErrors] = useState({});
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const [apiErrorMessage, setApiErrorMessage] = useState('');
  const abortControllerRef = useRef(null);

  // Clean up abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleCopyEmail = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(profile.email);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = profile.email;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textarea);
        if (!successful) throw new Error('execCommand failed');
      }
      setCopied(true);
      setCopyFailed(false);
      analytics.emailCopied();
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopyFailed(true);
      setCopied(false);
    }
  };

  const triggerMailtoFallback = (name, email, subject, message) => {
    const subjectLine = subject.trim() || `Inquiry from ${name.trim() || 'Portfolio Visitor'}`;
    const bodyText = `Hi Neel,\n\n${message.trim()}\n\nBest regards,\n${name.trim()}\n${email.trim()}`;
    const mailtoUrl = `mailto:${profile.email}?subject=${encodeURIComponent(subjectLine)}&body=${encodeURIComponent(bodyText)}`;

    // Open user's default email client
    window.location.href = mailtoUrl;
    setStatus('fallback_opened');
    analytics.contactMailtoInitiated();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status === 'submitting') return;

    // Honeypot bot protection: silently abort without false success claim
    if (form.honeypot && form.honeypot.trim() !== '') {
      return;
    }

    // Input validation
    const newErrors = {};
    if (form.name.trim().length < 2) {
      newErrors.name = 'Please provide your name (at least 2 characters).';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email.trim())) {
      newErrors.email = 'Please provide a valid email address.';
    }
    if (form.message.trim().length < 15) {
      newErrors.message = 'Please provide a message outline (at least 15 characters).';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || import.meta.env.VITE_WEB3FORMS_KEY;

    // If Web3Forms public access key is not configured, direct the visitor honestly to their mail client
    if (!accessKey) {
      triggerMailtoFallback(form.name, form.email, form.subject, form.message);
      return;
    }

    setStatus('submitting');
    setApiErrorMessage('');

    // Cancel any prior in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // 10-second timeout to prevent infinite submitting state on slow networks
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 10000);

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          access_key: accessKey,
          subject: form.subject.trim()
            ? `[Portfolio] ${form.subject.trim()} (from ${form.name.trim()})`
            : `Portfolio Contact from ${form.name.trim()}`,
          from_name: form.name.trim(),
          name: form.name.trim(),
          email: form.email.trim(),
          message: form.message.trim(),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();

      if (data && data.success) {
        setStatus('success');
        setForm({ name: '', email: '', subject: '', message: '', honeypot: '' });
        analytics.contactApiSubmitted();
      } else {
        const errorMsg = data?.message || 'External submission rejected';
        setApiErrorMessage(errorMsg);
        setStatus('api_failed');
      }
    } catch (err) {
      clearTimeout(timeoutId);
      const isTimeout = err.name === 'AbortError';
      setApiErrorMessage(isTimeout ? 'Request timed out after 10 seconds' : 'Network connection failed');
      setStatus('api_failed');
    }
  };

  if (status === 'success') {
    return (
      <div className="contact-status-card success" role="alert" aria-live="polite">
        <CheckCircle size={32} className="status-icon" aria-hidden="true" />
        <div className="status-copy">
          <h3>Message Dispatched Successfully</h3>
          <p>Thank you for reaching out. The message has been delivered to Neel Shingavi&apos;s verified inbox.</p>
        </div>
        <button
          type="button"
          className="secondary-action"
          onClick={() => setStatus('idle')}
          style={{ marginTop: '12px' }}
        >
          Send Another Note
        </button>
      </div>
    );
  }

  if (status === 'fallback_opened') {
    return (
      <div className="contact-status-card info" role="alert" aria-live="polite">
        <Mail size={32} className="status-icon" aria-hidden="true" />
        <div className="status-copy">
          <h3>Email Client Launched</h3>
          <p>
            Your system email application has been launched with your prefilled message addressed to{' '}
            <strong>{profile.email}</strong>.
          </p>
          <p className="status-note">
            Please complete and dispatch the email from your application. If your client did not launch, copy the recipient address below.
          </p>
        </div>
        <div className="status-actions">
          <button
            type="button"
            className="primary-action"
            onClick={handleCopyEmail}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span>{copied ? 'Copied to Clipboard!' : `Copy Email (${profile.email})`}</span>
          </button>
          <button
            type="button"
            className="secondary-action"
            onClick={() => setStatus('idle')}
          >
            Edit Message
          </button>
        </div>
      </div>
    );
  }

  if (status === 'api_failed') {
    return (
      <div className="contact-status-card error" role="alert" aria-live="polite">
        <AlertCircle size={32} className="status-icon" aria-hidden="true" style={{ color: 'var(--coral, #ff6b6b)' }} />
        <div className="status-copy">
          <h3>Submission Endpoint Temporarily Unreachable</h3>
          <p>
            The direct API endpoint could not accept the submission ({apiErrorMessage || 'Service unavailable'}).
            Your entered message has been completely preserved.
          </p>
          <p className="status-note">
            You can launch your default email client with your message prefilled, or copy the direct address.
          </p>
        </div>
        <div className="status-actions" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '16px' }}>
          <button
            type="button"
            className="primary-action"
            onClick={() => triggerMailtoFallback(form.name, form.email, form.subject, form.message)}
          >
            <Mail size={16} />
            <span>Launch Email Client (mailto)</span>
          </button>
          <button
            type="button"
            className="secondary-action"
            onClick={handleCopyEmail}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span>{copied ? 'Copied!' : 'Copy Email Address'}</span>
          </button>
          <button
            type="button"
            className="secondary-action"
            onClick={() => setStatus('idle')}
          >
            Back to Form
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="contact-form-wrapper">
      <form onSubmit={handleSubmit} className="contact-form-inner" noValidate>
        {/* Honeypot field for bot filtering */}
        <input
          type="text"
          name="honeypot"
          style={{ display: 'none' }}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          value={form.honeypot}
          onChange={handleChange}
        />

        <div className="form-row-grid">
          <div className="form-group">
            <label htmlFor="cf-name">
              Your Name <span className="req" aria-hidden="true">*</span>
            </label>
            <input
              id="cf-name"
              name="name"
              type="text"
              required
              minLength={2}
              maxLength={100}
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Alex Chen"
              autoComplete="name"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'cf-name-error' : undefined}
            />
            {errors.name && (
              <span className="validation-error" id="cf-name-error" role="alert">
                {errors.name}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="cf-email">
              Your Email <span className="req" aria-hidden="true">*</span>
            </label>
            <input
              id="cf-email"
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
              placeholder="e.g. alex@company.com"
              autoComplete="email"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'cf-email-error' : undefined}
            />
            {errors.email && (
              <span className="validation-error" id="cf-email-error" role="alert">
                {errors.email}
              </span>
            )}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="cf-subject">Subject / Scope</label>
          <input
            id="cf-subject"
            name="subject"
            type="text"
            maxLength={150}
            value={form.subject}
            onChange={handleChange}
            placeholder="e.g. Backend engineering role / Architecture collaboration"
          />
        </div>

        <div className="form-group">
          <label htmlFor="cf-message">
            Project Context or Message <span className="req" aria-hidden="true">*</span>
          </label>
          <textarea
            id="cf-message"
            name="message"
            required
            minLength={15}
            maxLength={2000}
            rows={5}
            value={form.message}
            onChange={handleChange}
            placeholder="Outline your technical requirements, architecture inquiry, or software role..."
            aria-invalid={!!errors.message}
            aria-describedby={errors.message ? 'cf-message-error' : undefined}
          />
          {errors.message && (
            <span className="validation-error" id="cf-message-error" role="alert">
              {errors.message}
            </span>
          )}
        </div>

        <div className="form-submit-row">
          <button
            type="submit"
            className="primary-action submit-btn"
            disabled={status === 'submitting'}
          >
            {status === 'submitting' ? (
              <RefreshCw size={16} className="spin-icon" aria-hidden="true" />
            ) : (
              <Send size={16} aria-hidden="true" />
            )}
            <span>{status === 'submitting' ? 'Submitting...' : 'Send Message'}</span>
          </button>

          <button
            type="button"
            className="secondary-action copy-email-btn"
            onClick={handleCopyEmail}
            title="Copy Neel Shingavi's direct email"
          >
            {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
            <span>
              {copied
                ? 'Copied to Clipboard!'
                : copyFailed
                  ? `Direct: ${profile.email}`
                  : `Copy Email (${profile.email})`}
            </span>
          </button>
        </div>

        <p className="contact-footnote">
          Submissions deliver directly to Neel Shingavi via verified Web3Forms API or your default email client at{' '}
          <a href={`mailto:${profile.email}`} className="email-link">
            {profile.email}
          </a>
          .
        </p>
      </form>
    </div>
  );
}
