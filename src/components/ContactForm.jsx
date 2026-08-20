import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';
import { analytics } from '../utils/analytics.js';
import { profile } from '../data/portfolio.js';

export function ContactForm() {
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [form, setForm] = useState({ name: '', email: '', message: '', honeypot: '' });
  const [errors, setErrors] = useState({});
  const buttonRef = useRef(null);
  const mountTime = useRef(0);

  useEffect(() => {
    mountTime.current = Date.now();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    // Clear error when user types
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status === 'submitting') return;

    // Manual Validation
    const newErrors = {};
    if (form.name.trim().length < 2) newErrors.name = 'Name must be at least 2 characters.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) newErrors.email = 'Please enter a valid email address.';
    if (form.message.trim().length < 20) newErrors.message = 'Message must be at least 20 characters.';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Bot Protection
    const timeElapsed = Date.now() - mountTime.current;
    if (form.honeypot || timeElapsed < 3000) {
      // Silently succeed to fool bots without hitting the API
      setStatus('success');
      setForm({ name: '', email: '', message: '', honeypot: '' });
      return;
    }

    setStatus('submitting');
    
    const btn = buttonRef.current;
    const tl = gsap.timeline();
    tl.to(btn, { width: 48, borderRadius: 24, color: 'transparent', duration: 0.4, ease: 'power3.inOut' });

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: import.meta.env.VITE_WEB3FORMS_KEY,
          subject: `Portfolio Contact from ${form.name}`,
          from_name: form.name,
          name: form.name,
          email: form.email,
          message: form.message
        }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus('success');
        setForm({ name: '', email: '', message: '', honeypot: '' });
        analytics.contactFormSubmitted();
        tl.to(btn, { backgroundColor: 'var(--lime)', color: 'var(--ink)', duration: 0.3 });
      } else {
        setStatus('error');
        tl.to(btn, { width: '100%', borderRadius: 8, color: 'var(--ink)', duration: 0.4 });
      }
    } catch {
      setStatus('error');
      tl.to(btn, { width: '100%', borderRadius: 8, color: 'var(--ink)', duration: 0.4 });
    }
  };

  if (status === 'success') {
    return (
      <div className="contact-success" role="alert">
        <CheckCircle size={32} className="success-icon" />
        <h3>Message received.</h3>
        <p>I&apos;ll get back to you within 24 hours.</p>
      </div>
    );
  }

  return (
    <div className="contact-form-wrapper">
      {status === 'error' && (
        <div className="contact-error" role="alert">
          <AlertCircle size={18} />
          Something went wrong. Email me directly at {profile.email}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
        {/* Hidden from users via CSS, skipped by screen readers */}
        <input 
          type="text" 
          name="honeypot" 
          style={{ display: 'none' }} 
          tabIndex="-1" 
          autoComplete="off" 
          aria-hidden="true" 
          value={form.honeypot}
          onChange={handleChange}
        />

        <div className="form-group">
          <label htmlFor="cf-name">Name</label>
          <input
            id="cf-name"
            name="name"
            type="text"
            required
            minLength={2}
            maxLength={100}
            value={form.name}
            onChange={handleChange}
            placeholder="Your name"
            autoComplete="name"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "cf-name-error" : undefined}
          />
          {errors.name && <span className="validation-error" id="cf-name-error" role="alert">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="cf-email">Email</label>
          <input
            id="cf-email"
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
            placeholder="your@email.com"
            autoComplete="email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "cf-email-error" : undefined}
          />
          {errors.email && <span className="validation-error" id="cf-email-error" role="alert">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="cf-message">Message</label>
          <textarea
            id="cf-message"
            name="message"
            required
            minLength={20}
            maxLength={2000}
            rows={5}
            value={form.message}
            onChange={handleChange}
            placeholder="Tell me about the opportunity or project..."
            aria-invalid={!!errors.message}
            aria-describedby={errors.message ? "cf-message-error" : undefined}
          />
          {errors.message && <span className="validation-error" id="cf-message-error" role="alert">{errors.message}</span>}
        </div>

        <button
          ref={buttonRef}
          type="submit"
          className="primary-action liquid-button"
          disabled={status === 'submitting'}
          style={{ overflow: 'hidden', whiteSpace: 'nowrap', minHeight: 48, justifyContent: 'center' }}
        >
          {status === 'success' ? (
            <CheckCircle size={18} />
          ) : (
            <>
              <Send size={18} /> Send Message
            </>
          )}
        </button>
      </form>
    </div>
  );
}
