import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Menu, Search, Download } from 'lucide-react';
import { m, AnimatePresence } from 'framer-motion';

const navItems = [
  { label: 'Systems', href: '#systems' },
  { label: 'Experience', href: '#experience' },
  { label: 'Work', href: '#work' },
  { label: 'Skills', href: '#skills' },
  { label: 'Wins', href: '#wins' },
  { label: 'Contact', href: '#contact' },
];

export function MobileNav({ activeSection, onOpenCommandPalette }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on route change / section click
  const handleNavClick = () => setOpen(false);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
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
                    {navItems.map((item, i) => (
                      <m.li
                        key={item.href}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <a
                          href={item.href}
                          className={activeSection === item.href.replace('#', '') ? 'active' : ''}
                          onClick={handleNavClick}
                        >
                          <span className="mobile-nav-index">0{i + 1}</span>
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
