import { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Search,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  FileText,
  Home,
  Layers,
  Briefcase,
  Trophy,
  Cpu,
  Mail,
  X,
  CornerDownLeft,
  Command,
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

  const navigateTo = (selector) => {
    onClose();
    setTimeout(() => {
      const el = document.querySelector(selector);
      if (el) {
        if (lenis) {
          lenis.scrollTo(el, { offset: -60, duration: 1.2 });
        } else {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }, 100);
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
      // Fallback: window prompt
      window.prompt('Copy email:', profile.email);
    }
  };

  const commands = useMemo(() => [
    // NAVIGATION
    {
      id: 'nav-home',
      category: 'Navigation',
      label: 'Home / Hero',
      keywords: 'top start hero intro neel',
      icon: Home,
      action: () => navigateTo('#top'),
    },
    {
      id: 'nav-systems',
      category: 'Navigation',
      label: 'Systems & Architecture',
      keywords: 'systems backend architecture distributed pipeline tradersdesk querypilot',
      icon: Layers,
      action: () => navigateTo('#systems'),
    },
    {
      id: 'nav-work',
      category: 'Navigation',
      label: 'Selected Work & Projects',
      keywords: 'work projects querypilot tradersdesk certicraft payperuseai founderflow',
      icon: Briefcase,
      action: () => navigateTo('#work'),
    },
    {
      id: 'nav-experience',
      category: 'Navigation',
      label: 'Professional Experience & Background',
      keywords: 'experience background script lanes word lane pict education timeline',
      icon: Briefcase,
      action: () => navigateTo('#experience'),
    },
    {
      id: 'nav-skills',
      category: 'Navigation',
      label: 'Stack Architecture & Skills',
      keywords: 'skills stack technologies java python react node postgresql docker',
      icon: Cpu,
      action: () => navigateTo('#skills'),
    },
    {
      id: 'nav-wins',
      category: 'Navigation',
      label: 'Competitive Proof & Recognitions',
      keywords: 'wins awards hackathons iit bombay techsprint meta algorand achievements',
      icon: Trophy,
      action: () => navigateTo('#wins'),
    },
    {
      id: 'nav-contact',
      category: 'Navigation',
      label: 'Contact & Collaboration',
      keywords: 'contact email connect hire collaborate message',
      icon: Mail,
      action: () => navigateTo('#contact'),
    },

    // PROJECTS
    {
      id: 'proj-td',
      category: 'Projects',
      label: 'TradersDesk — Production Trading Workflow',
      keywords: 'tradersdesk java swing android sqlite supabase offline sync saree broker',
      icon: Layers,
      action: () => navigateTo('#systems'),
    },
    {
      id: 'proj-qp',
      category: 'Projects',
      label: 'QueryPilot — NL-to-SQL Analytics Pipeline',
      keywords: 'querypilot natural language sql llm upi analytics langchain postgresql',
      icon: Layers,
      action: () => navigateTo('#systems'),
    },
    {
      id: 'proj-ppu',
      category: 'Projects',
      label: 'PayPerUseAI — Usage-Based AI Payment Gateway',
      keywords: 'payperuseai algorand web3 blockchain sse pyteal fast api billing',
      icon: Layers,
      action: () => navigateTo('#work'),
    },
    {
      id: 'proj-cc',
      category: 'Projects',
      label: 'CertiCraft — Certificate Automation System',
      keywords: 'certicraft certificate qr automation verification email batch pict',
      icon: Layers,
      action: () => navigateTo('#work'),
    },
    {
      id: 'proj-ff',
      category: 'Projects',
      label: 'FounderFlow — Startup Operating System',
      keywords: 'founderflow startup workflow productivity dashboard roadmap tasks',
      icon: Layers,
      action: () => navigateTo('#work'),
    },

    // ACTIONS
    {
      id: 'act-resume',
      category: 'Actions',
      label: 'Download Resume (PDF)',
      keywords: 'resume cv pdf download neel shingavi',
      icon: FileText,
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
      keywords: 'github code open source repositories git',
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
      keywords: 'leetcode dsa algorithms problems coding 169',
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
      keywords: 'linkedin professional network connect social',
      icon: ExternalLink,
      badge: 'External',
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

  // Trap focus and restore focus on open/close
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement;
      document.body.style.overflow = 'hidden';
      // Auto focus input
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      document.body.style.overflow = '';
      setSearch('');
      setSelectedIndex(0);
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        previousFocusRef.current.focus();
      }
    }
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
      setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selectedCmd = filteredCommands[selectedIndex];
      if (selectedCmd) {
        selectedCmd.action();
      }
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current) return;
    const activeItem = listRef.current.querySelector('.cmd-item.is-selected');
    if (activeItem) {
      activeItem.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  let flatCounter = 0;

  return createPortal(
    <div
      className="cmd-palette-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="presentation"
    >
      <div
        className="cmd-palette-modal"
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
        <div className="cmd-list-container" id="cmd-list" ref={listRef} role="listbox">
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
                        onMouseEnter={() => setSelectedIndex(thisIndex)}
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

