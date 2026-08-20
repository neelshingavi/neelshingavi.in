import { getEmail, getPhone } from '../utils/contact.js';

export const profile = {
  name: 'Neel Shingavi',
  title: 'PUNE, INDIA • FULL STACK DEVELOPER',
  location: 'Pune, India',
  get email() { return getEmail(); },
  get phone() { return getPhone(); },
  resume: '/assets/neel-shingavi-resume.pdf',
  photo: '/assets/neel-shingavi.png',
  links: {
    linkedin: 'https://www.linkedin.com/in/neel-shingavi/',
    github: 'https://github.com/neelshingavi',
  },
  summary:
    'Full-Stack Software Engineer with expertise in building scalable web applications, distributed architectures, and AI-integrated data pipelines. Proficient across the stack using Java, Node.js, Next.js, and PostgreSQL, alongside cloud deployment on AWS. Proven track record of accelerating product delivery from responsive client interfaces to secure backend systems.',
  availability: 'Open for internships, full-time roles, freelance builds, and serious product collaborations.',
};

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
  { value: 250, suffix: 'K+', label: 'Transactions Processed', accent: 'signal' },
  { value: 6, suffix: '', label: 'Major Recognitions', accent: 'coral' },
  { value: 5, suffix: 'K+', label: 'Monthly Trades Managed', accent: 'lime' },
];

export const experience = [
  {
    company: 'Script Lanes',
    role: 'Full Stack Developer Intern',
    period: 'Jun 2026 - Present',
    location: 'On-Site',
    points: [
      'Designed and implemented end-to-end AI Notes processing engine for MBBS Mentor, integrating AWS S3 and OpenRouter APIs to automate document ingestion, processing, and parsing workflows.',
      'Engineered localized data aggregation pipelines to process historical user activity and generate automated weekly and monthly concept summaries.',
      'Upcoming internship focusing on cross-platform mobile app development in the React Native stack.',
    ],
  },
  {
    company: 'Word Lane Tech',
    role: 'Backend Developer and Client Coordination Intern',
    period: 'Jul 2025 - Dec 2025',
    location: 'Remote',
    points: [
      'Developed and tested modular RESTful APIs using Node.js and Express.js to support production business services and application workflows.',
      'Collaborated with frontend engineering teams to translate product requirements into maintainable backend services, successfully testing and shipping 3 core service layers, while delivering 4 core projects end-to-end.',
      'Built and optimized production systems supporting both desktop and Android workflows, improving reliability and reducing manual operations.',
    ],
  }
];

export const clubs = [
  {
    company: 'Startup and Innovation Cell (SIC), PICT',
    role: 'Technical Head',
    period: 'Apr 2026 - Present',
    location: 'Pune',
    points: [
      'Directed technical strategy and architectural planning for 8 early-stage startups across diverse industry domains within the university incubator.',
      'Consulted cross-functional founding teams on system design, database modeling, and optimal technology stack selection, accelerating MVP delivery by 4 weeks.',
      'Conducted rigorous architectural reviews and provided cloud infrastructure guidance to ensure the deployment of robust, reliable, and scalable product solutions.',
    ],
  },
  {
    company: 'PICT ACM Student Chapter',
    role: 'Complete Club Coordinator',
    period: 'Aug 2025 - Present',
    location: 'Pune',
    points: [
      'Led 600+ students across 23 cross-functional teams to execute 12 major competitions and 15+ events.',
      'Coordinated multi-disciplinary operations ensuring successful delivery of technical events, workshops, and large-scale hackathons.',
      'Acted as the core liaison between management, student teams, and external sponsors for seamless event execution.',
    ],
  }
];

export const education = [
  {
    school: 'Pune Institute of Computer Technology (PICT)',
    course: 'B.Tech in Electronics and Computer Engineering',
    period: 'Aug 2025 - May 2028',
    result: 'CGPA 9.50/10',
  },
  {
    school: 'Bharati Vidyapeeth J.N.I.O.T., Katraj, Pune',
    course: 'Diploma in Computer Technology',
    period: 'Aug 2022 - May 2025',
    result: '93.26%',
  },
  {
    school: 'St. Vincent High School, Camp, Pune',
    course: 'Secondary and High School (SSC)',
    period: 'Jul 2015 - May 2022',
    result: '87%',
  },
];

export const projects = [
  {
    name: 'QueryPilot',
    type: 'AI analytics platform',
    period: 'Feb 2026 - Apr 2026',
    description:
      'Engineered an analytical RAG engine using conversational LLM pipelines for natural-language querying across relational databases. Ingested and processed 250,000+ UPI financial transactions to generate contextual business insights and revenue velocity metrics.',
    impact: ['250,000+ transactions processed', '2nd place at InsightX IIT Bombay', 'Pipeline optimization'],
    stack: ['Python', 'LangChain', 'DuckDB', 'LLM APIs', 'SQL', 'Data Analytics', 'PostgreSQL'],
    color: 'lime',
  },
  {
    name: 'TradersDesk',
    type: 'Production trading workflow app',
    period: 'Mar 2026 - Present',
    description:
      'Developed a local-first financial ledger and trade management application with a native desktop interface for managing bills, payments, return goods, and commission settlements. Implemented offline-first persistence using SQLite and Hibernate ORM, with PostgreSQL (Supabase) as the cloud backend and incremental push/pull HTTP synchronization for multi-device data consistency.',
    impact: ['5,000+ monthly transactions', 'Offline-first persistence', 'Multi-device cloud sync'],
    stack: ['Java', 'Swing', 'Android', 'Maven', 'SQLite', 'Hibernate ORM', 'PostgreSQL', 'Supabase', 'HTTP APIs'],
    color: 'coral',
  },
  {
    name: 'PayPerUseAI',
    type: 'Usage-based AI payment gateway',
    period: 'Apr 2026 - Jun 2026',
    description:
      'Usage-based payment gateway that dynamically meters and processes multi-model AI inference queries utilizing Algorand smart contracts for secure billing.',
    impact: ['Smart escrow settlement (PyTeal)', 'Sub-200ms real-time streaming (SSE)', 'Blockchain-backed ledgers'],
    stack: ['FastAPI', 'Python', 'React.js', 'PyTeal', 'Algorand Blockchain'],
    color: 'lime',
  },
  {
    name: 'CertiCraft',
    type: 'Certificate automation system',
    period: 'Jan 2026',
    description:
      'Event management platform for certificate generation, participant management, QR validation, and bulk email communication.',
    impact: ['300+ participants automated', '80% manual effort reduction', 'Hackathon-winning end-to-end product'],
    stack: ['Web Development', 'QR Systems', 'Email Automation'],
    color: 'teal',
  },
  {
    name: 'FounderFlow',
    type: 'Startup operating system',
    period: 'Dec 2025 - Jan 2026',
    description:
      'Startup workflow platform combining idea validation, roadmap planning, task tracking, dashboards, and team communication into one execution system.',
    impact: ['Roadmap and task execution pipelines', 'Centralized founder dashboard', 'Built around startup productivity workflows'],
    stack: ['Workflow Automation', 'Product Design', 'Dashboards'],
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
    label: 'Languages',
    items: ['Java', 'Python', 'C/C++', 'SQL', 'TypeScript', 'JavaScript'],
  },
  {
    label: 'Frameworks',
    items: ['Next.js', 'Node.js', 'Express.js', 'JavaFX', 'Swing', 'LLM APIs'],
  },
  {
    label: 'Databases',
    items: ['SQLite', 'PostgreSQL', 'Supabase', 'MongoDB', 'Redis'],
  },
  {
    label: 'Tools',
    items: ['Git', 'GitHub', 'Docker', 'AWS S3/EC2', 'Maven', 'VS Code'],
  },
  {
    label: 'Core CS',
    items: ['DSA', 'OOP', 'DBMS', 'OS', 'CN', 'System Design'],
  },
  {
    label: 'Professional',
    items: ['Leadership', 'Problem Solving', 'Team Player', 'Public Speaking', 'Agile / Scrum', 'Time Management'],
  },
];
