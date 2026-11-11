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
  BookOpen,
} from 'lucide-react';
import { profile } from '../data/portfolio.js';
import { lenis } from '../hooks/useSmoothScroll.js';
import { SECTIONS, PROJECT_COMMANDS } from '../data/navigation.js';
import { projectCaseStudies } from '../data/caseStudies.js';

const sectionIconMap = {
  work: Briefcase,
  systems: Layers,
  experience: Briefcase,
  cadence: Code2,
  skills: Cpu,
  wins: Trophy,
  architecture: Layers,
  contact: Mail,
};

export function CommandPalette({ isOpen, onClose, onOpenCaseStudy }) {
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
    // Home Action
    {
      id: 'nav-home',
      category: 'Navigation',
      label: 'Home / Hero Overview',
      keywords: 'top start hero intro neel overview title home',
      icon: Home,
      action: () => navigateTo('#top'),
    },
    // SECTIONS (Direct from centralized configuration)
    ...SECTIONS.map((sec) => ({
      id: `nav-${sec.id}`,
      category: 'Navigation',
      label: `${sec.number} · ${sec.fullTitle}`,
      keywords: sec.keywords,
      icon: sectionIconMap[sec.id] || Layers,
      action: () => navigateTo(sec.target),
    })),

    // PROJECTS (Direct deep links to architecture workbench or case study modal)
    ...PROJECT_COMMANDS.map((proj) => ({
      id: proj.id,
      category: 'Projects',
      label: proj.label,
      keywords: proj.keywords,
      icon: Layers,
      badge: proj.badge,
      action: () => {
        if (proj.caseStudyId && projectCaseStudies[proj.caseStudyId] && onOpenCaseStudy) {
          onClose();
          onOpenCaseStudy(projectCaseStudies[proj.caseStudyId]);
          return;
        }
        navigateTo(proj.target);
      },
    })),

    // CASE STUDIES (Direct technical case study modal triggers)
    ...Object.values(projectCaseStudies).map((cs) => ({
      id: `cs-${cs.id}`,
      category: 'Case Studies',
      label: `Case Study: ${cs.name} — Technical Architecture`,
      keywords: `case study architecture ${cs.name.toLowerCase()} decisions tradeoffs outcomes deep dive`,
      icon: BookOpen,
      badge: 'Case Study',
      action: () => {
        onClose();
        if (onOpenCaseStudy) {
          onOpenCaseStudy(cs);
        }
      },
    })),

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
      badge: 'GitHub',
      action: () => {
        onClose();
        window.open(profile.links.github, '_blank', 'noopener,noreferrer');
      },
    },
    {
      id: 'act-leetcode',
      category: 'Actions',
      label: 'Open LeetCode Profile',
      keywords: 'leetcode dsa algorithms problems coding solved rank',
      icon: ExternalLink,
      badge: 'LeetCode',
      action: () => {
        onClose();
        window.open(profile.links.leetcode, '_blank', 'noopener,noreferrer');
      },
    },
    {
      id: 'act-codeforces',
      category: 'Actions',
      label: 'Open Codeforces Profile',
      keywords: 'codeforces cp competitive programming contest rating pupil',
      icon: ExternalLink,
      badge: 'Codeforces',
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
      if (!window.location.hash.toLowerCase().startsWith('#casestudy-')) {
        document.body.style.overflow = '';
        lenis?.start();
      }
      setSearch('');
      setSelectedIndex(0);
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        previousFocusRef.current.focus({ preventScroll: true });
      }
    }
    return () => {
      if (!window.location.hash.toLowerCase().startsWith('#casestudy-')) {
        document.body.style.overflow = '';
        lenis?.start();
      }
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
          ref={listRef}
          id="cmd-list"
          className="cmd-results-list"
          role="listbox"
          aria-label="Available commands"
        >
          {filteredCommands.length === 0 ? (
            <div className="cmd-empty-state">
              <p>No results found for &ldquo;{search}&rdquo;</p>
              <span>Try searching for &quot;Projects&quot;, &quot;Systems&quot;, or &quot;Resume&quot;</span>
            </div>
          ) : (
            Object.entries(groupedCommands).map(([category, items]) => (
              <div key={category} className="cmd-category-group" role="group" aria-label={category}>
                <div className="cmd-category-header">{category}</div>
                {items.map((cmd) => {
                  const itemIndex = flatCounter++;
                  const isSelected = itemIndex === selectedIndex;
                  const Icon = cmd.icon;

                  return (
                    <div
                      key={cmd.id}
                      id={`cmd-${cmd.id}`}
                      role="option"
                      aria-selected={isSelected}
                      className={`cmd-item ${isSelected ? 'is-selected' : ''}`}
                      onClick={() => cmd.action()}
                      onMouseEnter={() => {
                        setSelectedIndex(itemIndex);
                      }}
                    >
                      <div className="cmd-item-left">
                        <Icon size={16} className="cmd-item-icon" aria-hidden="true" />
                        <span className="cmd-item-label">{cmd.label}</span>
                      </div>
                      <div className="cmd-item-right">
                        {cmd.badge && <span className="cmd-item-badge">{cmd.badge}</span>}
                        {isSelected && <CornerDownLeft size={13} className="cmd-enter-icon" aria-hidden="true" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer Shortcut Bar */}
        <div className="cmd-footer">
          <div className="cmd-footer-hints">
            <span className="cmd-hint">
              <kbd>↑</kbd> <kbd>↓</kbd> to navigate
            </span>
            <span className="cmd-hint">
              <kbd>↵</kbd> to select
            </span>
            <span className="cmd-hint">
              <kbd>ESC</kbd> to close
            </span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
