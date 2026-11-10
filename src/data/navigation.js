/**
 * Centralized Navigation Configuration
 * Single source of truth for desktop navigation, mobile drawer, and command palette.
 * Sections:
 * 01 Systems & Architecture -> 02 Experience -> 03 Selected Work -> 04 Cadence -> 05 Wins -> 06 Skills -> 07 Contact
 */

export const SECTIONS = [
  {
    id: 'systems',
    number: '01',
    label: 'Systems',
    fullTitle: 'Core Systems & Architecture Topology',
    target: '#systems',
    keywords: 'systems backend architecture capabilities distributed pipelines topology 01',
  },
  {
    id: 'experience',
    number: '02',
    label: 'Experience',
    fullTitle: 'Experience & Leadership',
    target: '#experience',
    keywords: 'experience background timeline script lanes word lane pict acm sic 02',
  },
  {
    id: 'work',
    number: '03',
    label: 'Work',
    fullTitle: 'Selected Work & Flagship Projects',
    target: '#work',
    keywords: 'work projects showcase portfolio 03',
  },
  {
    id: 'cadence',
    number: '04',
    label: 'Cadence',
    fullTitle: 'Verified Engineering Cadence & Coding Heatmaps',
    target: '#cadence',
    keywords: 'cadence coding activity heatmaps github leetcode codeforces 04 velocity commits',
  },
  {
    id: 'wins',
    number: '05',
    label: 'Wins',
    fullTitle: 'Competitive Proof & Major Recognitions',
    target: '#wins',
    keywords: 'wins awards hackathons recognitions iit bombay techsprint meta algorand 05',
  },
  {
    id: 'skills',
    number: '06',
    label: 'Skills',
    fullTitle: 'Stack Architecture & Academic Foundation',
    target: '#skills',
    keywords: 'skills stack technologies java python react node postgresql docker aws education pict 06',
  },
  {
    id: 'contact',
    number: '07',
    label: 'Contact',
    fullTitle: 'Contact & Collaboration',
    target: '#contact',
    keywords: 'contact email connect hire collaborate message pune 07',
  },
];

// Desktop navigation items (7 primary numbered sections)
export const DESKTOP_NAV_ITEMS = SECTIONS;

// Specific project destinations for command palette (opens interactive case studies & architecture explorers)
export const PROJECT_COMMANDS = [
  {
    id: 'proj-td',
    name: 'TradersDesk',
    label: 'TradersDesk — Offline-First Trading Architecture',
    caseStudyId: 'project-tradersdesk',
    badge: 'Production System',
    keywords: 'tradersdesk java swing flutter sqlite supabase offline sync saree broker trading architecture explorer',
  },
  {
    id: 'proj-qp',
    name: 'QueryPilot',
    label: 'QueryPilot — NL-to-SQL Analytics Pipeline',
    caseStudyId: 'project-querypilot',
    badge: 'LLM Analytics',
    keywords: 'querypilot natural language sql llm upi analytics langchain postgresql pipeline explorer',
  },
  {
    id: 'proj-ppu',
    name: 'PayPerUseAI',
    label: 'PayPerUseAI — Usage-Based AI Payment Gateway',
    caseStudyId: 'project-payperuseai',
    badge: 'Web3 & AI',
    keywords: 'payperuseai algorand pyteal smart contracts inference micropayment gateway',
  },
  {
    id: 'proj-cc',
    name: 'CertiCraft',
    label: 'CertiCraft — Certificate Automation System',
    caseStudyId: 'project-certicraft',
    badge: 'Automation',
    keywords: 'certicraft qr dynamic verification bulk email pdf generation pict acm winner',
  },
  {
    id: 'proj-ff',
    name: 'FounderFlow',
    label: 'FounderFlow — Startup Operating System',
    caseStudyId: 'project-founderflow',
    badge: 'Productivity',
    keywords: 'founderflow startup workflow roadmap planning execution dashboard incubator',
  },
];
