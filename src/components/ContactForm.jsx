import { useState, useRef, useEffect } from 'react';
import { Send, CheckCircle, AlertCircle, Copy, Check, Mail } from 'lucide-react';
import { analytics } from '../utils/analytics.js';
import { profile } from '../data/portfolio.js';

export function ContactForm() {
  const [status, setStatus] = useState('idle'); // 'idle' | 'submitting' | 'success' | 'fallback_opened' | 'error'
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    honeypot: '',
  });
  const [errors, setErrors] = useState({});
  const [copied, setCopied] = useState(false);
  const mountTime = useRef(0);

  useEffect(() => {
    mountTime.current = Date.now();
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
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      analytics.emailClicked();
      setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt('Copy email:', profile.email);
    }
  };

  const triggerMailtoFallback = (name, email, subject, message) => {
    const subjectLine = subject.trim() || `Inquiry from ${name.trim() || 'Portfolio'}`;
    const bodyText = `Hi Neel,\n\n${message.trim()}\n\nBest regards,\n${name.trim()}\n${email.trim()}`;
    const mailtoUrl = `mailto:${profile.email}?subject=${encodeURIComponent(subjectLine)}&body=${encodeURIComponent(bodyText)}`;
    
    // Open user's email client
    window.location.href = mailtoUrl;
    setStatus('fallback_opened');
    analytics.contactFormSubmitted();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status === 'submitting') return;

    // Validate inputs
    const newErrors = {};
    if (form.name.trim().length < 2) {
      newErrors.name = 'Please provide your name (at least 2 characters).';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email.trim())) {
      newErrors.email = 'Please provide a valid email address.';
    }
    if (form.message.trim().length < 15) {
      newErrors.message = 'Please provide a brief message (at least 15 characters).';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Bot protection
    const timeElapsed = Date.now() - mountTime.current;
    if (form.honeypot || timeElapsed < 2500) {
      setStatus('success');
      setForm({ name: '', email: '', subject: '', message: '', honeypot: '' });
      return;
    }

    const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;

    // If no backend key configured, use the genuine mailto composer
    if (!accessKey) {
      triggerMailtoFallback(form.name, form.email, form.subject, form.message);
      return;
    }

    // Otherwise, submit through Web3Forms
    setStatus('submitting');

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: accessKey,
          subject: form.subject ? `[Portfolio] ${form.subject} (from ${form.name})` : `Portfolio Contact from ${form.name}`,
          from_name: form.name,
          name: form.name,
          email: form.email,
          message: form.message,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus('success');
        setForm({ name: '', email: '', subject: '', message: '', honeypot: '' });
        analytics.contactFormSubmitted();
      } else {
        // If external API returns error, gracefully fallback to mailto
        triggerMailtoFallback(form.name, form.email, form.subject, form.message);
      }
    } catch {
      // Network failure: fallback to mailto
      triggerMailtoFallback(form.name, form.email, form.subject, form.message);
    }
  };

  if (status === 'success') {
    return (
      <div className="contact-status-card success" role="alert">
        <CheckCircle size={32} className="status-icon" aria-hidden="true" />
        <div className="status-copy">
          <h3>Message Dispatched Successfully</h3>
          <p>Thank you for reaching out. I typically reply within 24 hours.</p>
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
      <div className="contact-status-card info" role="alert">
        <Mail size={32} className="status-icon" aria-hidden="true" />
        <div className="status-copy">
          <h3>Email Client Launched</h3>
          <p>
            Your default email application has been launched with your prefilled message addressed to{' '}
            <strong>{profile.email}</strong>.
          </p>
          <p className="status-note">
            If your mail app did not open automatically, you can copy my email below or send directly.
          </p>
        </div>
        <div className="status-actions">
          <button
            type="button"
            className="primary-action"
            onClick={handleCopyEmail}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied to Clipboard!' : 'Copy Email Address'}
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
            placeholder="Outline your technical problem, architecture requirement, or opportunity..."
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
            <Send size={16} aria-hidden="true" />
            <span>{status === 'submitting' ? 'Dispatching...' : 'Send Message'}</span>
          </button>

          <button
            type="button"
            className="secondary-action copy-email-btn"
            onClick={handleCopyEmail}
            title="Copy Neel Shingavi's direct email"
          >
            {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
            <span>{copied ? 'Copied to Clipboard!' : `Copy Email (${profile.email})`}</span>
          </button>
        </div>

        <p className="contact-footnote">
          Submitting triggers genuine direct delivery to Neel Shingavi. Direct email:{' '}
          <a href={`mailto:${profile.email}`} className="email-link">
            {profile.email}
          </a>
        </p>
      </form>
    </div>
  );
}
