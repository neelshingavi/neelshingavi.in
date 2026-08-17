import { useState, useRef } from 'react';
import { gsap } from 'gsap';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';
import { analytics } from '../utils/analytics.js';
import { profile } from '../data/portfolio.js';

export function ContactForm() {
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const buttonRef = useRef(null);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status === 'submitting') return;
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
          ...form,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus('success');
        setForm({ name: '', email: '', message: '' });
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
          />
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
          />
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
          />
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
