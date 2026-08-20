import { 
  Coffee, 
  Database, 
  GitBranch, 
  Terminal, 
  Cpu, 
  ServerCog,
  Layers, 
  FileCode, 
  Brain, 
  Box, 
  Workflow, 
  Globe, 
  Code2, 
  FolderTree, 
  Boxes 
} from 'lucide-react';
import { useMagnetic } from '../hooks/useMagnetic.js';

const LOGO_MAP = {
  // Languages
  'Java': { icon: Coffee, color: '#f89820', isCustomSvg: false },
  'Python': {
    color: '#3776ab',
    isCustomSvg: true,
    svg: (
      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
        <path d="M14.25.18c.9 0 1.66.72 1.88 1.6l.3 1.25a6.57 6.57 0 0 0-4.43 4.43l-1.25-.3a1.9 1.9 0 0 1-1.6-1.88v-2.25c0-.9.72-1.66 1.6-1.88l1.25-.3A6.57 6.57 0 0 1 14.25.18M9.75 23.82c-.9 0-1.66-.72-1.88-1.6l-.3-1.25a6.57 6.57 0 0 0 4.43-4.43l1.25.3c.9 0 1.66.72 1.88 1.6v2.25c0 .9-.72 1.66-1.6 1.88l-1.25.3a6.57 6.57 0 0 0-4.43-4.43"/>
        <path d="M11.93 2.03c-2.45 0-4.27.2-5.32.65-1.58.68-1.55 2.1-.03 2.67.62.24 1.54.38 2.66.42l-.25 1c-1.34.05-2.5.25-3.32.66-1.58.78-1.55 2.4.03 3.03.8.32 1.93.47 3.3.49l.25-1c-1.54-.03-2.73-.2-3.4-.64-.84-.54-.62-1.3.17-1.65.68-.3 1.76-.46 3.12-.47l.5-2.02c-.75 0-1.38-.05-1.84-.13-.86-.16-1.2-.6-.35-.97.6-.26 1.5-.4 2.63-.41l.24-.96z" fill="#3776AB"/>
        <path d="M12.07 21.97c2.45 0 4.27-.2 5.32-.65 1.58-.68 1.55-2.1.03-2.67-.62-.24-1.54-.38-2.66-.42l.25-1c1.34-.05 2.5-.25 3.32-.66 1.58-.78 1.55-2.4-.03-3.03-.8-.32-1.93-.47-3.3-.49l-.25 1c1.54.03 2.73.2 3.4.64.84.54.62 1.3-.17 1.65-.68.3-1.76.46-3.12.47l-.5 2.02c.75 0 1.38.05 1.84.13.86.16 1.2.6.35.97-.6.26-1.5.4-2.63.41l-.24.96z" fill="#FFE873"/>
      </svg>
    )
  },
  'C/C++': { icon: Code2, color: '#00599c', isCustomSvg: false },
  'SQL': { icon: Database, color: '#e38c00', isCustomSvg: false },
  'JavaScript': {
    color: '#f7df1e',
    isCustomSvg: true,
    svg: (
      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
        <path d="M0 0h24v24H0V0zm22.034 18.5c-.007-1.264-.755-2.316-2.227-2.902-1.472-.586-1.802-.916-1.802-1.45 0-.534.407-.887 1.082-.887.674 0 1.13.256 1.488.755l1.373-.878c-.526-.87-1.396-1.434-2.86-1.434-1.74 0-3.045 1.02-3.045 2.656 0 1.702 1.144 2.296 2.89 2.993 1.748.698 2.02.973 2.02 1.544 0 .473-.393.854-1.166.854-.885 0-1.472-.442-1.876-1.197l-1.373.832c.587 1.144 1.74 1.876 3.25 1.876 2.19 0 3.23-1.12 3.23-2.915zm-9.356 1.93c-.64 0-1.07-.282-1.28-.74l-.045-.008v.678H9.728v-9h1.625v4.542c.214-.45.64-.732 1.28-.732 1.19 0 2.213.992 2.213 2.63 0 1.638-1.023 2.63-2.213 2.63zm-.42-1.374c.64 0 1.008-.48 1.008-1.256 0-.775-.368-1.255-1.008-1.255s-1.007.48-1.007 1.255c0 .776.367 1.256 1.007 1.256z" fill="#f7df1e"/>
      </svg>
    )
  },

  // Frameworks
  'React': {
    color: '#61dafb',
    isCustomSvg: true,
    svg: (
      <svg viewBox="-11.5 -10.23174 23 20.46348" width="14" height="14">
        <circle cx="0" cy="0" r="2.05" fill="#61dafb"/>
        <g stroke="#61dafb" strokeWidth="1" fill="none">
          <ellipse rx="11" ry="4.2"/>
          <ellipse rx="11" ry="4.2" transform="rotate(60)"/>
          <ellipse rx="11" ry="4.2" transform="rotate(120)"/>
        </g>
      </svg>
    )
  },
  'Node.js': { icon: Cpu, color: '#68a063', isCustomSvg: false },
  'Express.js': { icon: ServerCog, color: '#999999', isCustomSvg: false },
  'JavaFX': { icon: Layers, color: '#f89820', isCustomSvg: false },
  'Swing': { icon: FileCode, color: '#e76f51', isCustomSvg: false },
  'LLM APIs': { icon: Brain, color: '#a855f7', isCustomSvg: false },

  // Databases
  'SQLite': { icon: Database, color: '#003b57', isCustomSvg: false },
  'PostgreSQL': {
    color: '#336791',
    isCustomSvg: true,
    svg: (
      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
        <path d="M12.016 0c-3.15 0-6.066 1.93-7.534 4.887C4.167 4.708 3.82 4.6 3.468 4.6c-1.92 0-3.468 1.554-3.468 3.475v5.772c0 2.224 1.79 4.025 4.015 4.025h.547c1.378 1.968 3.593 3.128 5.928 3.128h3.048c4.42 0 8.016-3.608 8.016-8.03V8.03c0-4.42-3.596-8.03-8.016-8.03h-1.522z" fill="#336791"/>
      </svg>
    )
  },
  'Supabase': {
    color: '#3ecf8e',
    isCustomSvg: true,
    svg: (
      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
        <path d="M21.362 10.428l-8.487-5.093c-.63-.378-1.428-.378-2.058 0L2.33 10.428a1.206 1.206 0 0 0-.256 1.83l8.487 5.093c.63.378 1.428.378 2.058 0l8.487-5.093a1.206 1.206 0 0 0 .256-1.83z" fill="#3ecf8e"/>
      </svg>
    )
  },
  'MongoDB': {
    color: '#47a248',
    isCustomSvg: true,
    svg: (
      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
        <path d="M12 .002c-.08-.002-7.585 5.586-5.83 12.383 1.159 4.49 4.542 7.785 5.71 8.915.043.04.103.04.14 0 1.168-1.13 4.55-4.425 5.71-8.915C19.585 5.588 12.08.002 12 .002zm-.628 17.518a9.49 9.49 0 0 1-.955-.898c-.968-.992-1.748-2.073-2.317-3.21l3.272-1.343v5.451zm1.256 0v-5.45l3.272 1.342c-.57 1.137-1.35 2.218-2.317 3.21a9.49 9.49 0 0 1-.955.898z" fill="#47a248"/>
      </svg>
    )
  },

  // Tools
  'Git': { icon: GitBranch, color: '#f05032', isCustomSvg: false },
  'GitHub': {
    color: '#ffffff',
    isCustomSvg: true,
    svg: (
      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
      </svg>
    )
  },
  'Maven': { icon: Box, color: '#c71a36', isCustomSvg: false },
  'VS Code': {
    color: '#007acc',
    isCustomSvg: true,
    svg: (
      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
        <path d="M23.985 6.809l-2.985-2.29-15.008 13.064-3.818-3.003-.174.156-2 1.83c-.001.001 0 .002.001.002l5.999 4.932 18-14.739z" fill="#007ACC"/>
      </svg>
    )
  },
  'JAR/EXE Packaging': { icon: Box, color: '#10b981', isCustomSvg: false },

  // Core
  'DSA': { icon: Terminal, color: '#14b8a6', isCustomSvg: false },
  'OOP': { icon: Boxes, color: '#14b8a6', isCustomSvg: false },
  'DBMS': { icon: Database, color: '#14b8a6', isCustomSvg: false },
  'Data Modeling': { icon: FolderTree, color: '#14b8a6', isCustomSvg: false },
  'System Design Basics': { icon: Workflow, color: '#14b8a6', isCustomSvg: false },
  'HTTP API Integration': { icon: Globe, color: '#14b8a6', isCustomSvg: false },
};

export const SkillBadge = ({ name }) => {
  const config = LOGO_MAP[name] || { icon: Code2, color: '#64748b', isCustomSvg: false };
  const IconComponent = config.icon;
  const magRef = useMagnetic(0.2);

  return (
    <span 
      ref={magRef}
      className="skill-badge" 
      style={{ '--hover-color': config.color }}
    >
      {config.isCustomSvg ? (
        <div aria-hidden="true" focusable="false" className="skill-icon-wrapper" style={{ display: 'flex' }}>
          {config.svg}
        </div>
      ) : (
        <IconComponent size={14} style={{ color: 'inherit' }} aria-hidden="true" focusable="false" />
      )}
      {name}
    </span>
  );
};
