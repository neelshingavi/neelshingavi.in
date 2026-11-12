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
  Terminal,
} from 'lucide-react';
import { experience, profile, stats } from '../data/portfolio.js';
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

const KNOWN_CLI_TOKENS = ['whoami', 'git log', 'sudo hire neel', 'cat stats', 'help'];

function launchConfetti() {
  if (typeof window === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = document.createElement('canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  Object.assign(canvas.style, {
    position: 'fixed',
    inset: '0',
    zIndex: '100000',
    pointerEvents: 'none',
  });
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  const palette = ['#bff205', '#00e5ff', '#ff5e3a', '#fbc02d', '#f4f0df'];
  const particles = Array.from({ length: 120 }, () => ({
    x: window.innerWidth * (0.25 + Math.random() * 0.5),
    y: window.innerHeight * 0.35,
    vx: (Math.random() - 0.5) * 14,
    vy: -6 - Math.random() * 10,
    size: 4 + Math.random() * 4,
    color: palette[Math.floor(Math.random() * palette.length)],
    life: 1,
  }));

  const start = performance.now();
  const tick = (now) => {
    const elapsed = now - start;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      p.vy += 0.38;
      p.x += p.vx;
      p.y += p.vy;
      p.life = Math.max(0, 1 - elapsed / 1200);
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    });
    if (elapsed < 1200) {
      requestAnimationFrame(tick);
    } else {
      canvas.remove();
    }
  };
  requestAnimationFrame(tick);
}

export function CommandPalette({ isOpen, onClose, onOpenCaseStudy }) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [cliOutput, setCliOutput] = useState(null);
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
  const trimmedRaw = search.trim();
  const normalizedCli = trimmedRaw.replace(/^>\s*/, '').toLowerCase();
  const isCliMode = trimmedRaw.startsWith('>') || KNOWN_CLI_TOKENS.includes(normalizedCli);

  const runCliCommand = (cmdToken) => {
    const cmd = cmdToken.replace(/^>\s*/, '').trim().toLowerCase();
    if (cmd === 'whoami') {
      setCliOutput({
        title: '> whoami',
        lines: [`${profile.name} · Product Engineer · ${profile.location}`, `Email: ${profile.email}`],
      });
      return true;
    }
    if (cmd === 'git log') {
      setCliOutput({
        title: '> git log --experience',
        lines: experience.map(
          (exp, i) => `0${i + 1}a8f${9 - i}c · ${exp.period} · ${exp.company} — ${exp.role}`
        ),
      });
      return true;
    }
    if (cmd === 'cat stats') {
      setCliOutput({
        title: '> cat stats',
        lines: stats.map((st) => `${st.value}${st.suffix || ''}  ${st.label}`),
      });
      return true;
    }
    if (cmd === 'sudo hire neel') {
      setCliOutput(null);
      launchConfetti();
      navigateTo('#contact');
      return true;
    }
    if (cmd === 'help' || cmd === '') {
      setCliOutput({
        title: '> help',
        lines: ['Available CLI commands: whoami · git log · cat stats · sudo hire neel'],
      });
      return true;
    }
    setCliOutput({
      title: `> ${cmd}`,
      lines: [`Unknown command "${cmd}". Try: whoami, git log, cat stats, sudo hire neel`],
    });
    return true;
  };

  const filteredCommands = useMemo(() => {
    if (isCliMode) {
      return [
        {
          id: `cli-${normalizedCli || 'help'}`,
          category: 'Terminal',
          label: `Run "> ${normalizedCli || 'help'}"`,
          keywords: '',
          icon: Terminal,
          badge: 'CLI',
          action: () => runCliCommand(normalizedCli),
        },
      ];
    }
    const q = search.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((cmd) =>
      cmd.label.toLowerCase().includes(q) ||
      cmd.category.toLowerCase().includes(q) ||
      cmd.keywords.toLowerCase().includes(q)
    );
  }, [search, commands, isCliMode, normalizedCli]);

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
      setCliOutput(null);
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

        {/* Inline CLI Terminal Output */}
        {cliOutput && (
          <div className="cmd-terminal-output" role="status" aria-live="polite">
            <div className="cmd-terminal-head">{cliOutput.title}</div>
            {cliOutput.lines.map((line) => (
              <div key={line} className="cmd-terminal-line">{line}</div>
            ))}
          </div>
        )}

        {/* Results List */}
        <div
          ref={listRef}
          id="cmd-list"
          className="cmd-list-container cmd-results-list"
          role="listbox"
          aria-label="Available commands"
        >
          {filteredCommands.length === 0 ? (
            <div className="cmd-empty-state">
              <p>No results found for &ldquo;{search}&rdquo;</p>
              <small>Try &quot;Projects&quot;, &quot;Systems&quot;, &quot;Resume&quot;, or CLI: whoami, git log, cat stats</small>
            </div>
          ) : (
            Object.entries(groupedCommands).map(([category, items]) => (
              <div key={category} className="cmd-group cmd-category-group" role="group" aria-label={category}>
                <div className="cmd-group-title cmd-category-header">{category}</div>
                <div className="cmd-group-items">
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
                          {isSelected && <CornerDownLeft size={13} className="cmd-item-enter cmd-enter-icon" aria-hidden="true" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Shortcut Bar */}
        <div className="cmd-footer">
          <div className="cmd-footer-hints">
            <span className="cmd-shortcut-hint cmd-hint">
              <kbd className="cmd-kbd">↑</kbd> <kbd className="cmd-kbd">↓</kbd> <span>to navigate</span>
            </span>
            <span className="cmd-shortcut-hint cmd-hint">
              <kbd className="cmd-kbd">↵</kbd> <span>to select</span>
            </span>
            <span className="cmd-shortcut-hint cmd-hint">
              <kbd className="cmd-kbd">ESC</kbd> <span>to close</span>
            </span>
          </div>
          <span className="cmd-shortcut-hint cmd-cli-tip">
            Try: <kbd className="cmd-kbd">whoami</kbd> <kbd className="cmd-kbd">git log</kbd>
          </span>
        </div>
      </div>
    </div>,
    document.body
  );
}
