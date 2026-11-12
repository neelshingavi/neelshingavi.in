import { getEmail, getPhone } from '../utils/contact.js';
import { projectCaseStudies } from './caseStudies.js';

export const profile = {
  name: 'Neel Shingavi',
  title: 'PUNE, INDIA • PRODUCT ENGINEER',
  location: 'Pune, India',
  get email() { return getEmail(); },
  get phone() { return getPhone(); },
  resume: '/assets/neel-shingavi-resume.pdf',
  photo: '/assets/neel-shingavi.png',
  links: {
    linkedin: 'https://www.linkedin.com/in/neel-shingavi/',
    github: 'https://github.com/neelshingavi',
    leetcode: 'https://leetcode.com/u/neelshingavi/',
    codeforces: 'https://codeforces.com/profile/shingavineel',
  },
  summary:
    '',
  availability: 'Open for high-impact software engineering roles, backend systems architecture, and technical collaborations.',
};

export const capabilityCategories = [
  {
    id: 'backend',
    label: 'Backend Systems',
    tagline: 'Distributed Architecture • Java & Node.js • High-Throughput REST APIs',
    accent: '#bff205',
  },
  {
    id: 'ai-analytics',
    label: 'AI & LLM Analytics',
    tagline: 'NL-to-SQL Pipelines • Conversational Query Engines • UPI Data Analytics',
    accent: '#00e5ff',
  },
  {
    id: 'product-eng',
    label: 'Product Engineering',
    tagline: 'Full-Stack Execution • Client-Ready Systems • Rapid MVP Delivery',
    accent: '#a872ff',
  },
  {
    id: 'automation',
    label: 'Workflow Automation',
    tagline: 'Document Ingestion Pipelines • Event Automation • Batch QR Systems',
    accent: '#ff6b6b',
  },
  {
    id: 'database',
    label: 'Database Engineering',
    tagline: 'PostgreSQL & Supabase • Local-First SQLite • Offline Sync Ledgers',
    accent: '#fbc02d',
  },
];

export const heroRoles = [
  'Production backend systems',
  'AI analytics products',
  'Client-ready applications',
  'Hackathon-winning execution',
  'Founder-minded product design',
];

export const stats = [
  { value: 4, suffix: '', label: 'Client Projects Delivered', accent: 'teal' },
  { value: 9.50, suffix: '', label: 'Current CGPA', accent: 'gold', decimals: 2 },
  { value: 250, suffix: 'K+', label: 'UPI Records Analyzed', accent: 'signal' },
  { value: 6, suffix: '', label: 'Major Recognitions', accent: 'coral' },
  { value: 5, suffix: 'K+', label: 'Monthly Trades Managed', accent: 'lime' },
];

export const experience = [
  {
    id: 'exp-script-lanes',
    company: 'Script Lanes',
    role: 'Full Stack Developer Intern',
    startDate: '2026-06',
    endDate: null,
    status: 'ongoing',
    period: 'Jun 2026 - Present',
    location: 'On-Site',
    points: [
      'Engineered full-stack MERN features (MongoDB, Express.js, React.js, Node.js) alongside PostgreSQL, Prisma ORM, SQLite, REST APIs, and scalable system design workflows.',
      'Designed and implemented end-to-end AI Notes processing engine for MBBS Mentor, combining Prompt Engineering, AWS S3, and OpenRouter APIs to automate document ingestion, processing, and parsing.',
      'Built localized data aggregation pipelines under structured Git and GitHub workflows to process historical user activity and generate automated weekly and monthly concept summaries.',
    ],
  },
  {
    id: 'exp-word-lane',
    company: 'Word Lane Tech',
    role: 'Backend Developer and Client Coordination Intern',
    startDate: '2025-07',
    endDate: '2025-12',
    status: 'completed',
    period: 'Jul 2025 - Dec 2025',
    location: 'Remote',
    points: [
      'Developed and tested modular RESTful APIs using Node.js and Express.js to support production business services and application workflows.',
      'Collaborated with frontend engineering teams to translate product requirements into maintainable backend services, successfully testing and shipping 3 core service layers, while delivering 4 core projects end-to-end.',
      'Built and optimized production systems supporting both desktop and Android workflows, improving reliability and reducing manual operations.',
    ],
  },
];

export const clubs = [
  {
    id: 'club-sic',
    company: 'Startup and Innovation Cell (SIC), PICT',
    role: 'Technical Head',
    startDate: '2026-04',
    endDate: null,
    status: 'ongoing',
    period: 'Apr 2026 - Present',
    location: 'Pune',
    points: [
      'Directed technical strategy and architectural planning for 8 early-stage startups across diverse industry domains within the university incubator.',
      'Consulted cross-functional founding teams on system design, database modeling, and optimal technology stack selection, accelerating MVP delivery by 4 weeks.',
      'Conducted rigorous architectural reviews and provided cloud infrastructure guidance to ensure the deployment of robust, reliable, and scalable product solutions.',
    ],
  },
  {
    id: 'club-acm',
    company: 'PICT ACM Student Chapter',
    role: 'Complete Club Coordinator',
    startDate: '2025-08',
    endDate: null,
    status: 'ongoing',
    period: 'Aug 2025 - Present',
    location: 'Pune',
    points: [
      'Led 600+ students across 23 cross-functional teams to execute 12 major competitions and 15+ events.',
      'Coordinated multi-disciplinary operations ensuring successful delivery of technical events, workshops, and large-scale hackathons.',
      'Acted as the core liaison between management, student teams, and external sponsors for seamless event execution.',
    ],
  },
];

export const education = [
  {
    id: 'edu-pict',
    school: 'Pune Institute of Computer Technology (PICT)',
    course: 'B.Tech in Electronics and Computer Engineering',
    startDate: '2025-08',
    endDate: null,
    expectedEndDate: '2028-05',
    status: 'ongoing',
    period: 'Aug 2025 - May 2028',
    result: 'CGPA 9.50/10',
  },
  {
    id: 'edu-diploma',
    school: 'Bharati Vidyapeeth J.N.I.O.T., Katraj, Pune',
    course: 'Diploma in Computer Technology',
    startDate: '2022-08',
    endDate: '2025-05',
    status: 'completed',
    period: 'Aug 2022 - May 2025',
    result: '93.26%',
  },
  {
    id: 'edu-ssc',
    school: 'St. Vincent High School, Camp, Pune',
    course: 'Secondary and High School (SSC)',
    startDate: '2015-07',
    endDate: '2022-05',
    status: 'completed',
    period: 'Jul 2015 - May 2022',
    result: '87%',
  },
];

export const projects = [
  {
    id: 'project-tradersdesk',
    name: 'TradersDesk',
    featured: true,
    type: 'Production trading workflow app',
    categories: ['Financial & Trading'],
    period: 'Mar 2026 - Present',
    blueprint: '/assets/projects/tradersdesk/tradersdesk-architecture-blueprint.svg',
    visual: {
      previewImage: null, // Slot ready for authentic UI screenshot: '/assets/projects/tradersdesk/tradersdesk-preview.webp'
      architectureImage: '/assets/projects/tradersdesk/tradersdesk-architecture-blueprint.svg',
      previewType: 'architecture',
      badgeLabel: 'SYSTEM ARCHITECTURE BLUEPRINT',
      imageAlt: 'TradersDesk local-first transactional architecture and dual-client synchronization blueprint',
    },
    description:
      'Developed a local-first financial ledger and trade management application with a native desktop interface for managing billing, returns, and commission settlements. Handles 5,000+ monthly trade-related records (trade lines, invoices, and bill orders) and 2,000+ client settlement transactions across 3 active clients. Implemented offline-first persistence using SQLite (desktop via Hibernate ORM, mobile via Flutter sqflite), synchronized with Supabase PostgreSQL via incremental push/pull HTTP replication with eventual consistency.',
    impact: ['5,000+ monthly trade records', '2,000+ client transactions', 'Offline-first SQLite persistence'],
    stack: projectCaseStudies['project-tradersdesk'].stack,
    color: 'coral',
    photosLink: 'https://drive.google.com/drive/folders/1tmuq4egWo1IHDVIaBjV3EH-x7ZLuNRKr?usp=drive_link',
  },
  {
    id: 'project-querypilot',
    name: 'QueryPilot',
    featured: true,
    type: 'Natural Language to SQL Analytics Pipeline',
    categories: ['AI & LLM'],
    period: 'Feb 2026 - Apr 2026',
    blueprint: '/assets/projects/querypilot/querypilot-pipeline-blueprint.svg',
    visual: {
      previewImage: null, // Slot ready for authentic UI screenshot: '/assets/projects/querypilot/querypilot-preview.webp'
      architectureImage: '/assets/projects/querypilot/querypilot-pipeline-blueprint.svg',
      previewType: 'pipeline',
      badgeLabel: 'PIPELINE ARCHITECTURE BLUEPRINT',
      imageAlt: 'QueryPilot natural-language to SQL analytics pipeline and safety gate architecture',
    },
    description:
      'Engineered a natural language to SQL analytics pipeline using conversational LLM reasoning and schema-grounded prompt orchestration. Ingested and analyzed 250,000+ UPI financial transactions to extract contextual business insights, spending patterns, and revenue velocity metrics with strict read-only SQL safety guardrails.',
    impact: ['250,000+ UPI records analyzed', '2nd place at InsightX IIT Bombay', 'Read-only SQL safety guardrails'],
    stack: projectCaseStudies['project-querypilot'].stack,
    color: 'lime',
  },
  {
    id: 'project-payperuseai',
    name: 'PayPerUseAI',
    featured: false,
    type: 'Usage-based AI payment gateway',
    categories: ['AI & LLM', 'Payments & Web3'],
    period: 'Apr 2026 - Jun 2026',
    blueprint: '/assets/projects/payperuseai/payperuseai-gateway-blueprint.svg',
    visual: {
      previewImage: null, // Slot ready for authentic UI screenshot: '/assets/projects/payperuseai/payperuseai-preview.webp'
      architectureImage: '/assets/projects/payperuseai/payperuseai-gateway-blueprint.svg',
      previewType: 'gateway',
      badgeLabel: 'MICROPAYMENT GATEWAY BLUEPRINT',
      imageAlt: 'PayPerUseAI Algorand PyTeal smart escrow and FastAPI SSE streaming gateway blueprint',
    },
    description:
      'Usage-based AI payment gateway built with FastAPI, LangChain, and LLM APIs that dynamically routes and meters multi-model inference streams over SSE with Algorand PyTeal smart contract settlement.',
    impact: ['Smart escrow settlement (PyTeal)', 'Sub-200ms real-time streaming (SSE)', 'Blockchain-backed ledgers'],
    stack: projectCaseStudies['project-payperuseai'].stack,
    color: 'teal',
  },
  {
    id: 'project-certicraft',
    name: 'CertiCraft',
    featured: false,
    type: 'Certificate automation system',
    categories: ['Automation'],
    period: 'Jan 2026',
    blueprint: '/assets/projects/certicraft/certicraft-automation-blueprint.svg',
    visual: {
      previewImage: null, // Slot ready for authentic UI screenshot: '/assets/projects/certicraft/certicraft-preview.webp'
      architectureImage: '/assets/projects/certicraft/certicraft-automation-blueprint.svg',
      previewType: 'automation',
      badgeLabel: 'AUTOMATION SYSTEM BLUEPRINT',
      imageAlt: 'CertiCraft cryptographic QR validation and batch email delivery pipeline blueprint',
    },
    description:
      'Event management platform for certificate generation, participant management, QR validation, and bulk email communication.',
    impact: ['300+ participants automated', '80% manual effort reduction', 'Hackathon-winning end-to-end product'],
    stack: projectCaseStudies['project-certicraft'].stack,
    color: 'teal',
  },
  {
    id: 'project-founderflow',
    name: 'FounderFlow',
    featured: false,
    type: 'Startup operating system',
    categories: ['Automation'],
    period: 'Dec 2025 - Jan 2026',
    blueprint: '/assets/projects/founderflow/founderflow-system-blueprint.svg',
    visual: {
      previewImage: null, // Slot ready for authentic UI screenshot: '/assets/projects/founderflow/founderflow-preview.webp'
      architectureImage: '/assets/projects/founderflow/founderflow-system-blueprint.svg',
      previewType: 'system',
      badgeLabel: 'OPERATING SYSTEM BLUEPRINT',
      imageAlt: 'FounderFlow idea scorecard heuristics and milestone dependency DAG blueprint',
    },
    description:
      'Startup workflow platform combining idea validation, roadmap planning, task tracking, dashboards, and team communication into one execution system.',
    impact: ['Roadmap and task execution pipelines', 'Centralized founder dashboard', 'Built around startup productivity workflows'],
    stack: projectCaseStudies['project-founderflow'].stack,
    color: 'gold',
  },
];

export const achievements = [
  { title: '2nd Position - InsightX, IIT Bombay', detail: 'Team Leader, 1,700+ teams', tone: 'lime' },
  { title: "1st Position - TechSprint'26 Hackathon", detail: 'Team Leader, 250+ teams', tone: 'gold' },
  { title: 'Finalist - GDG Cloud Pune Hackathon', detail: 'Team Leader, Top 20 of 1,000+', tone: 'teal' },
  { title: 'Finalist - Meta x OpenEnv x PyTorch Hackathon', detail: 'Top 800 of 52,000+ teams', tone: 'coral' },
  { title: 'Finalist - Algorand HackSeries 3.0', detail: 'Top 30 of 800+', tone: 'signal' },
  { title: "2nd Position - Indradhanu'25 Project Competition", detail: 'Team Leader, 250+ projects', tone: 'signal' },
];

export const skills = [
  {
    label: 'Languages & Core CS',
    items: ['Java', 'Python', 'C/C++', 'SQL', 'TypeScript', 'JavaScript', 'DSA', 'OOP'],
  },
  {
    label: 'Backend & API Architecture',
    items: ['Node.js', 'Express.js', 'FastAPI', 'REST APIs', 'Prisma ORM', 'Hibernate ORM', 'System Design'],
  },
  {
    label: 'Databases & Data Engineering',
    items: ['PostgreSQL', 'SQLite', 'Supabase', 'MongoDB', 'Redis', 'Pandas', 'DBMS & Indexing'],
  },
  {
    label: 'Frontend & Mobile',
    items: ['React.js', 'Next.js', 'Java Swing', 'Android', 'Tailwind CSS', 'Framer Motion'],
  },
  {
    label: 'AI & LLM Engineering',
    items: ['LangChain', 'OpenRouter', 'LLM APIs', 'Data Analytics', 'Prompt Engineering', 'NL-to-SQL Pipelines'],
  },
  {
    label: 'Infrastructure & Systems',
    items: ['AWS S3/EC2', 'Docker', 'Git', 'GitHub', 'Maven', 'Linux / Bash', 'OS & Networking'],
  },
];
