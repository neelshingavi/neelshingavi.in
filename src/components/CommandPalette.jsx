import { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Search,
  Home,
  Layers,
  Cpu,
  Trophy,
  Briefcase,
  ExternalLink,
  Copy,
  Check,
  Mail,
  Code2,
  X,
  CornerDownLeft,
  Download,
} from 'lucide-react';
import { profile } from '../data/portfolio.js';
import { lenis } from '../hooks/useSmoothScroll.js';

export function CommandPalette({ isOpen, onClose }) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const previousFocusRef = useRef(null);
  const isKeyboardNavRef = useRef(false);

  const navigateTo = (selector) => {
    onClose();
    setTimeout(() => {
      const activeLenis = lenis || (typeof window !== 'undefined' ? window.__lenis : null);
      if (activeLenis) {
        activeLenis.scrollTo(selector, { offset: -80, duration: 1.1, force: true });
      } else {
        const el = document.querySelector(selector);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }, 120);
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
      setCopiedEmail(true);
      setTimeout(() => {
        setCopiedEmail(false);
        onClose();
      }, 1400);
    } catch {
      window.prompt('Copy email:', profile.email);
    }
  };

  const commands = useMemo(() => [
    // NAVIGATION (Aligned exactly with numbered section flow)
    {
      id: 'nav-home',
      category: 'Navigation',
      label: 'Home / Hero Overview',
      keywords: 'top start hero intro neel overview title',
      icon: Home,
      action: () => navigateTo('#top'),
    },
    {
      id: 'nav-systems',
      category: 'Navigation',
      label: '01 · Core Systems & Capabilities',
      keywords: 'systems backend architecture capabilities distributed pipelines 01',
      icon: Layers,
      action: () => navigateTo('#systems'),
    },
    {
      id: 'nav-experience',
      category: 'Navigation',
      label: '02 · Experience & Background',
      keywords: 'experience background timeline education pict roles 02',
      icon: Briefcase,
      action: () => navigateTo('#experience'),
    },
    {
      id: 'nav-work',
      category: 'Navigation',
      label: '03 · Selected Work & Projects',
      keywords: 'work projects showcase certicraft payperuseai founderflow 03',
      icon: Briefcase,
      action: () => navigateTo('#work'),
    },
    {
      id: 'nav-cadence',
      category: 'Navigation',
      label: '04 · Verified Engineering Cadence',
      keywords: 'cadence coding activity heatmaps github leetcode codeforces 04 velocity pulse',
      icon: Code2,
      action: () => navigateTo('#cadence'),
    },
    {
      id: 'nav-skills',
      category: 'Navigation',
      label: '05 · Stack Architecture & Skills',
      keywords: 'skills stack technologies java python react node postgresql docker aws 05',
      icon: Cpu,
      action: () => navigateTo('#skills'),
    },
    {
      id: 'nav-wins',
      category: 'Navigation',
      label: '06 · Competitive Proof & Wins',
      keywords: 'wins awards hackathons recognitions iit bombay techsprint meta algorand 06',
      icon: Trophy,
      action: () => navigateTo('#wins'),
    },
    {
      id: 'nav-architecture',
      category: 'Navigation',
      label: '07 · Production Architecture Deep Dives',
      keywords: 'architecture system topology tradersdesk querypilot pipeline sync offline local first 07',
      icon: Layers,
      action: () => navigateTo('#architecture'),
    },
    {
      id: 'nav-contact',
      category: 'Navigation',
      label: '08 · Contact & Collaboration',
      keywords: 'contact email connect hire collaborate message pune 08',
      icon: Mail,
      action: () => navigateTo('#contact'),
    },

    // PROJECTS
    {
      id: 'proj-td',
      category: 'Projects',
      label: 'TradersDesk — Offline-First Trading Architecture',
      keywords: 'tradersdesk java swing android sqlite supabase offline sync saree broker architecture',
      icon: Layers,
      badge: 'Architecture',
      action: () => navigateTo('#architecture'),
    },
    {
      id: 'proj-qp',
      category: 'Projects',
      label: 'QueryPilot — NL-to-SQL Analytics Pipeline',
      keywords: 'querypilot natural language sql llm upi analytics langchain postgresql architecture',
      icon: Layers,
      badge: 'Architecture',
      action: () => navigateTo('#architecture'),
    },
    {
      id: 'proj-ppu',
      category: 'Projects',
      label: 'PayPerUseAI — Usage-Based AI Payment Gateway',
      keywords: 'payperuseai algorand web3 blockchain sse pyteal fast api billing',
      icon: Layers,
      badge: 'Web3 / AI',
      action: () => navigateTo('#work'),
    },
    {
      id: 'proj-cc',
      category: 'Projects',
      label: 'CertiCraft — Certificate Automation System',
      keywords: 'certicraft certificate qr automation verification email batch pict',
      icon: Layers,
      badge: 'Automation',
      action: () => navigateTo('#work'),
    },
    {
      id: 'proj-ff',
      category: 'Projects',
      label: 'FounderFlow — Startup Operating System',
      keywords: 'founderflow startup workflow productivity dashboard roadmap tasks',
      icon: Layers,
      badge: 'Platform',
      action: () => navigateTo('#work'),
    },

    // ACTIONS
    {
      id: 'act-resume',
      category: 'Actions',
      label: 'Download Resume (PDF)',
      keywords: 'resume cv pdf download neel shingavi',
      icon: Download,
      badge: 'PDF',
      action: () => {
        onClose();
        window.open(profile.resume, '_blank', 'noopener,noreferrer');
      },
    },
    {
      id: 'act-email',
      category: 'Actions',
      label: copiedEmail ? 'Email Copied to Clipboard!' : `Copy Email (${profile.email})`,
      keywords: 'copy email address mail clipboard',
      icon: copiedEmail ? Check : Copy,
      badge: copiedEmail ? 'Copied!' : 'Click to copy',
      action: handleCopyEmail,
    },
    {
      id: 'act-github',
      category: 'Actions',
      label: 'Open GitHub Profile',
      keywords: 'github code open source repositories git velocity contributions',
      icon: ExternalLink,
      badge: '21 Repos',
      action: () => {
        onClose();
        window.open(profile.links.github, '_blank', 'noopener,noreferrer');
      },
    },
    {
      id: 'act-leetcode',
      category: 'Actions',
      label: 'Open LeetCode Profile',
      keywords: 'leetcode dsa algorithms problems coding 169 solved rank',
      icon: ExternalLink,
      badge: '169 Solved',
      action: () => {
        onClose();
        window.open(profile.links.leetcode, '_blank', 'noopener,noreferrer');
      },
    },
    {
      id: 'act-codeforces',
      category: 'Actions',
      label: 'Open Codeforces Profile',
      keywords: 'codeforces cp competitive programming contest rating pupil 1279',
      icon: ExternalLink,
      badge: '1279 Pupil',
      action: () => {
        onClose();
        window.open(profile.links.codeforces, '_blank', 'noopener,noreferrer');
      },
    },
    {
      id: 'act-linkedin',
      category: 'Actions',
      label: 'Open LinkedIn Profile',
      keywords: 'linkedin professional network connect social profile',
      icon: ExternalLink,
      badge: 'Connect',
      action: () => {
        onClose();
        window.open(profile.links.linkedin, '_blank', 'noopener,noreferrer');
      },
    },
  ], [copiedEmail]);

  // Filter commands based on search query
  const filteredCommands = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((cmd) =>
      cmd.label.toLowerCase().includes(q) ||
      cmd.category.toLowerCase().includes(q) ||
      cmd.keywords.toLowerCase().includes(q)
    );
  }, [search, commands]);

  // Group filtered commands by category
  const groupedCommands = useMemo(() => {
    const map = {};
    filteredCommands.forEach((cmd) => {
      if (!map[cmd.category]) map[cmd.category] = [];
      map[cmd.category].push(cmd);
    });
    return map;
  }, [filteredCommands]);

  // Reset selected index when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  // Trap focus and lock background scroll on open/close
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement;
      document.body.style.overflow = 'hidden';
      lenis?.stop();
      // Auto focus input
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      document.body.style.overflow = '';
      lenis?.start();
      setSearch('');
      setSelectedIndex(0);
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        previousFocusRef.current.focus({ preventScroll: true });
      }
    }
    return () => {
      document.body.style.overflow = '';
      lenis?.start();
    };
  }, [isOpen]);

  // Keyboard navigation inside command palette
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
      return;
    }

    if (filteredCommands.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      isKeyboardNavRef.current = true;
      setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      isKeyboardNavRef.current = true;
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selectedCmd = filteredCommands[selectedIndex];
      if (selectedCmd) {
        selectedCmd.action();
      }
    }
  };

  // Scroll active item into view ONLY when keyboard navigation is used
  useEffect(() => {
    if (!isKeyboardNavRef.current || !listRef.current) return;
    const activeItem = listRef.current.querySelector('.cmd-item.is-selected');
    if (activeItem) {
      activeItem.scrollIntoView({ block: 'nearest' });
    }
    isKeyboardNavRef.current = false;
  }, [selectedIndex]);

  if (!isOpen) return null;

  let flatCounter = 0;

  return createPortal(
    <div
      className="cmd-palette-backdrop"
      data-lenis-prevent="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="presentation"
    >
      <div
        className="cmd-palette-modal"
        data-lenis-prevent="true"
        role="dialog"
        aria-modal="true"
        aria-label="Command Palette"
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="cmd-search-bar">
          <Search size={18} className="cmd-search-icon" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            className="cmd-search-input"
            placeholder="Type a command or search (e.g. Projects, Systems, Resume)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-autocomplete="list"
            aria-controls="cmd-list"
            aria-activedescendant={
              filteredCommands[selectedIndex] ? `cmd-${filteredCommands[selectedIndex].id}` : undefined
            }
          />
          {search ? (
            <button
              type="button"
              className="cmd-clear-btn"
              onClick={() => setSearch('')}
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          ) : (
            <kbd className="cmd-kbd-badge">ESC</kbd>
          )}
        </div>

        {/* Results List */}
        <div
          className="cmd-list-container"
          id="cmd-list"
          ref={listRef}
          role="listbox"
          data-lenis-prevent="true"
          onWheel={(e) => e.stopPropagation()}
        >
          {filteredCommands.length === 0 ? (
            <div className="cmd-empty-state">
              <p>No matching commands found for &ldquo;{search}&rdquo;</p>
              <small>Try searching for &quot;TradersDesk&quot;, &quot;Experience&quot;, &quot;Resume&quot;, or &quot;Contact&quot;.</small>
            </div>
          ) : (
            Object.entries(groupedCommands).map(([category, items]) => (
              <div key={category} className="cmd-group">
                <div className="cmd-group-title">{category}</div>
                <div className="cmd-group-items">
                  {items.map((cmd) => {
                    const thisIndex = flatCounter++;
                    const isSelected = thisIndex === selectedIndex;
                    const IconComponent = cmd.icon;

                    return (
                      <div
                        key={cmd.id}
                        id={`cmd-${cmd.id}`}
                        role="option"
                        aria-selected={isSelected}
                        className={`cmd-item ${isSelected ? 'is-selected' : ''}`}
                        onClick={() => cmd.action()}
                        onMouseEnter={() => {
                          isKeyboardNavRef.current = false;
                          setSelectedIndex(thisIndex);
                        }}
                      >
                        <div className="cmd-item-left">
                          <span className="cmd-item-icon">
                            <IconComponent size={16} aria-hidden="true" />
                          </span>
                          <span className="cmd-item-label">{cmd.label}</span>
                        </div>
                        <div className="cmd-item-right">
                          {cmd.badge && (
                            <span className={`cmd-item-badge ${cmd.badge === 'Copied!' ? 'success' : ''}`}>
                              {cmd.badge}
                            </span>
                          )}
                          {isSelected && (
                            <span className="cmd-item-enter">
                              <CornerDownLeft size={13} aria-hidden="true" />
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Shortcut Hints */}
        <div className="cmd-footer">
          <div className="cmd-shortcut-hint">
            <kbd className="cmd-kbd">↑</kbd>
            <kbd className="cmd-kbd">↓</kbd>
            <span>to navigate</span>
          </div>
          <div className="cmd-shortcut-hint">
            <kbd className="cmd-kbd">↵</kbd>
            <span>to select</span>
          </div>
          <div className="cmd-shortcut-hint">
            <kbd className="cmd-kbd">ESC</kbd>
            <span>to close</span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
