import { getEmail, getPhone } from '../utils/contact.js';

export const profile = {
  name: 'Neel Shingavi',
  title: 'Backend engineer and product builder',
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
    'Software developer building scalable, production-grade applications, backend systems, data-driven products, and LLM-powered analytics with a strong focus on performance, reliability, and clean architecture.',
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
  { value: 4, suffix: '', label: 'Client Projects Delivered End to End', accent: 'teal' },
  { value: 9.50, suffix: '', label: 'Current CGPA', accent: 'gold', decimals: 2 },
  { value: 6, suffix: ' Months', label: 'Work Experience', accent: 'signal' },
  { value: 5, suffix: '+', label: 'Hackathon Victories', accent: 'coral' },
  { value: 10, suffix: '+', label: 'Expert Sessions Attended', accent: 'lime' },
];

export const experience = [
  {
    company: 'Script Lanes',
    role: 'Full Stack Developer Intern',
    period: 'Jun 2026 - Present',
    location: 'Pune',
    points: [
      'Designed and implemented the end-to-end AI Notes processing engine for MBBS Mentor, integrating AWS S3 and OpenRouter APIs to automate document ingestion and parsing workloads.',
      'Engineered localized aggregation logic to process historical user data, generating automated weekly and monthly concept summaries.',
      'Upcoming internship focusing on cross-platform mobile app development in the React Native stack.',
    ],
  },
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
    company: 'Word Lane Tech',
    role: 'Backend Developer and Client Coordination Intern',
    period: 'Jul 2025 - Dec 2025',
    location: 'Pune',
    points: [
      'Developed and verified modular RESTful API endpoints utilizing Node.js and Express.js to support active business consumer services.',
      'Collaborated with client-side engineering teams to translate product specifications into maintainable server logic, delivering 4 core projects end-to-end.',
      'Built and optimized production systems supporting both desktop and Android workflows, improving reliability and reducing manual operations.',
    ],
  }
];

export const education = [
  {
    school: 'Pune Institute of Computer Technology (PICT)',
    course: 'B.Tech in Electronics and Computer Engineering',
    period: 'Aug 2025 - Present',
    result: 'CGPA 9.50/10',
  },
  {
    school: 'Bharati Vidyapeeth J.N.I.O.T., Katraj, Pune',
    course: 'Diploma in Computer Technology',
    period: 'May 2022 - May 2025',
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
    period: 'Jan 2026 - Feb 2026',
    description:
      'LLM-powered analytics platform that turns UPI transaction data into contextual business insights, spending patterns, revenue trends, and customer behavior intelligence.',
    impact: ['250,000+ transactions processed', '2nd place at IIT Bombay InsightX', 'Built for real-world business analysis'],
    stack: ['Python', 'LangChain', 'DuckDB', 'LLM APIs', 'SQL', 'Data Analytics', 'PostgreSQL'],
    color: 'lime',
  },
  {
    name: 'TradersDesk',
    type: 'Production trading workflow app',
    period: 'Mar 2026 - Present',
    description:
      'Desktop and Android platform for saree brokers to manage billing, payments, commissions, returns, and cloud-synced daily workflows.',
    impact: ['5,000+ monthly transactions', '2 active clients', 'Offline SQLite plus Supabase cloud sync'],
    stack: ['Java', 'Swing', 'Android', 'Maven', 'SQLite', 'PostgreSQL', 'HTTP APIs'],
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
  { title: "1st Position - TechSprint'26 Hackathon", detail: 'Team Leader, 200+ teams', tone: 'gold' },
  { title: 'Finalist - GDG Cloud Pune Hackathon', detail: '1,000+ teams', tone: 'teal' },
  { title: 'Finalist - Meta x OpenEnv x PyTorch Hackathon', detail: 'Team Leader, 52,000+ teams', tone: 'coral' },
  { title: 'Finalist - Algorand HackSeries 3.0', detail: 'Top 30 of 800+', tone: 'signal' },
  { title: "2nd Position - Indradhanu'25 Project Competition", detail: '150+ projects', tone: 'signal' },
];

export const skills = [
  {
    label: 'Languages',
    items: ['Java', 'Python', 'C/C++', 'SQL', 'TypeScript', 'JavaScript'],
  },
  {
    label: 'Frameworks',
    items: ['React', 'Next.js', 'Node.js', 'Express.js', 'JavaFX', 'Swing', 'LLM APIs'],
  },
  {
    label: 'Databases',
    items: ['SQLite', 'PostgreSQL', 'Supabase', 'MongoDB', 'Redis'],
  },
  {
    label: 'Tools',
    items: ['Git', 'GitHub', 'Docker', 'AWS (S3/EC2)', 'Maven', 'VS Code', 'JAR/EXE Packaging'],
  },
  {
    label: 'Core',
    items: ['DSA', 'OOP', 'DBMS', 'Data Modeling', 'System Design Basics', 'HTTP API Integration'],
  },
  {
    label: 'Soft Skills',
    items: ['Leadership', 'Critical Thinking', 'Effective Communication', 'Teamwork & Collaboration'],
  },
];
