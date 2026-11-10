import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Menu, Search, Download } from 'lucide-react';
import { m, AnimatePresence } from 'framer-motion';
import { lenis } from '../hooks/useSmoothScroll.js';
import { DESKTOP_NAV_ITEMS } from '../data/navigation.js';

export function MobileNav({ activeSection, onOpenCommandPalette }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on route change / section click with smooth scroll
  const handleNavClick = (href) => {
    setOpen(false);
    if (href && href.startsWith('#')) {
      setTimeout(() => {
        const el = document.querySelector(href);
        if (el) {
          if (lenis) {
            lenis.scrollTo(el, { offset: -70, duration: 1.1, force: true });
          } else {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      }, 80);
    }
  };

  // Prevent body scroll and pause Lenis when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      lenis?.stop();
    } else {
      document.body.style.overflow = '';
      lenis?.start();
    }
    return () => {
      document.body.style.overflow = '';
      lenis?.start();
    };
  }, [open]);

  // Close on escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      {/* Hamburger trigger button */}
      <button
        type="button"
        className="mobile-nav-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={open}
        aria-controls="mobile-nav-drawer"
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Overlay + Drawer Portaled to Document Body */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <>
                {/* Backdrop */}
                <m.div
                  key="backdrop"
                  className="mobile-nav-backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setOpen(false)}
                  style={{ zIndex: 9998 }}
                />

                {/* Drawer */}
                <m.nav
                  key="drawer"
                  id="mobile-nav-drawer"
                  className="mobile-nav-drawer"
                  data-lenis-prevent="true"
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                  aria-label="Mobile navigation"
                  style={{ zIndex: 9999, pointerEvents: 'auto' }}
                >
                  <div className="mobile-nav-header">
                    <span>Navigation</span>
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      aria-label="Close menu"
                      className="mobile-nav-close"
                    >
                      <X size={22} />
                    </button>
                  </div>

                  {/* Command Palette Trigger in Mobile Drawer */}
                  {onOpenCommandPalette && (
                    <div className="mobile-cmd-trigger-wrap" style={{ padding: '0 24px 16px 24px' }}>
                      <button
                        type="button"
                        className="mobile-cmd-btn"
                        onClick={() => {
                          setOpen(false);
                          setTimeout(onOpenCommandPalette, 150);
                        }}
                      >
                        <Search size={16} />
                        <span>Quick Commands & Search</span>
                        <kbd>⌘K</kbd>
                      </button>
                    </div>
                  )}

                  <ul className="mobile-nav-list">
                    {DESKTOP_NAV_ITEMS.map((item, i) => (
                      <m.li
                        key={item.target}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <a
                          href={item.target}
                          className={activeSection === item.id ? 'active' : ''}
                          onClick={(e) => {
                            e.preventDefault();
                            handleNavClick(item.target);
                          }}
                        >
                          <span className="mobile-nav-index">{item.number}</span>
                          {item.label}
                        </a>
                      </m.li>
                    ))}
                  </ul>

                  <div className="mobile-nav-footer">
                    <a
                      href="/assets/neel-shingavi-resume.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mobile-resume-link"
                    >
                      <Download size={16} />
                      <span>Download Resume (PDF)</span>
                    </a>
                  </div>
                </m.nav>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
