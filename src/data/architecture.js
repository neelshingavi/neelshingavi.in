/**
 * Architecture and technical pipeline specifications
 * Verified against Neel Shingavi's shipped software and technical stack.
 */

export const systemsCapabilities = [
  {
    id: 'backend',
    title: 'Backend Architecture',
    subtitle: 'Distributed Systems & High-Throughput APIs',
    summary:
      'Designing fault-tolerant backend services with clean separation of concerns, structured data access, and reliable client contracts.',
    details: [
      'Modular RESTful API design using Java and Node.js / Express with strict request validation.',
      'Relational schema modeling and connection pooling in PostgreSQL for high concurrency.',
      'Sub-100ms response targets for critical path trading and analytics endpoints.',
      'Stateless service layers designed for predictable horizontal scaling.',
    ],
    tech: ['Java', 'Node.js', 'Express.js', 'PostgreSQL', 'REST APIs'],
  },
  {
    id: 'llm',
    title: 'LLM Analytics',
    subtitle: 'NL-to-SQL Pipelines & Data Intelligence',
    summary:
      'Building production analytical reasoning pipelines that convert natural language queries into accurate, schema-grounded database operations.',
    details: [
      'Context-grounded prompt orchestration and few-shot SQL generation using LangChain.',
      'Strict read-only safety guardrails allowing SELECT statements and blocking destructive keywords.',
      'Contextual insight extraction over large transaction volumes (250K+ UPI records).',
      'Revenue velocity metrics and automated trend identification for business users.',
    ],
    tech: ['Python', 'LangChain', 'PostgreSQL', 'LLM APIs', 'SQL'],
  },
  {
    id: 'automation',
    title: 'Workflow Automation',
    subtitle: 'Event-Driven Ingestion & Batch Processing',
    summary:
      'Automating complex, paper-heavy business and academic workflows through asynchronous document pipelines and digital validation.',
    details: [
      'AI Notes processing engine for MBBS Mentor integrating AWS S3 and OpenRouter APIs.',
      'Dynamic QR code generation, cryptographic validation, and bulk email distribution in CertiCraft.',
      'Localized data aggregation pipelines processing historical user activity into automated summaries.',
      '80%+ manual workflow reduction for real-world client operations.',
    ],
    tech: ['AWS S3', 'OpenRouter', 'QR Systems', 'Email Queues', 'Python'],
  },
  {
    id: 'delivery',
    title: 'Client Delivery',
    subtitle: 'Cross-Platform Software Shipped to Real Users',
    summary:
      'Taking product ideas from initial architecture to client-tested desktop and mobile applications deployed in production.',
    details: [
      'Local-first desktop interface built with Java Swing for textile trading brokers.',
      'Companion Android mobile workflows for field reconciliation and cloud synchronization.',
      'End-to-end delivery of 4 client projects with active production usage.',
      'Resilient offline-first persistence ensuring business continuity without internet connectivity.',
    ],
    tech: ['Java Swing', 'Android', 'Maven', 'Supabase', 'SQLite'],
  },
];

export const tradersDeskArchitecture = {
  title: 'TradersDesk Architecture',
  summary:
    'A production local-first ledger and trading workflow system built for saree brokers to handle high-frequency bills, commission tracking, and cloud reconciliation.',
  nodes: [
    {
      id: 'client',
      label: 'Client Applications',
      role: 'Cross-Platform UI',
      tech: 'Java Swing (Desktop) · Flutter (Mobile)',
      description:
        'Dual-client interface designed for rapid daily operations. Native Java Swing provides high-density keyboard-driven desktop entry for office billing; Flutter client provides mobile ledger access for field visits.',
      metrics: '5,000+ monthly trade-related records · 2,000+ client transactions across 3 clients',
      flowStep: 1,
    },
    {
      id: 'logic',
      label: 'Application Logic',
      role: 'Business & Ledger Rules',
      tech: 'Core Java · Hibernate ORM · DAO Layer',
      description:
        'Enforces transaction integrity, commission settlement rules, returns calculation, and ledger reconciliation. Implements the Data Access Object (DAO) pattern to abstract persistence from UI components.',
      metrics: 'Sub-millisecond local responses for ledger operations',
      flowStep: 2,
    },
    {
      id: 'local_db',
      label: 'Local Persistence',
      role: 'Offline-First Storage',
      tech: 'SQLite Database · Embedded Engine',
      description:
        'Zero-configuration embedded SQLite database resides directly on client machines (desktop Hibernate, mobile sqflite). Provides local ACID execution so brokers can record trades, print invoices, and update balances during network outages.',
      metrics: 'Instant local read/write transactions (Local ACID)',
      flowStep: 3,
    },
    {
      id: 'sync',
      label: 'Sync Engine',
      role: 'Push / Pull Reconciliation',
      tech: 'Incremental HTTP Sync · Delta Queue',
      description:
        'Monitors local ledger mutations using changelogs with monotonic timestamps and change vectors. When internet connectivity is detected, asynchronously pushes local diffs and pulls remote updates.',
      metrics: 'Non-blocking background sync thread',
      flowStep: 4,
    },
    {
      id: 'cloud_db',
      label: 'Cloud Persistence',
      role: 'Centralized Cloud Store',
      tech: 'Supabase · Managed PostgreSQL',
      description:
        'Centralized cloud database serving as the durable source of truth. Stores encrypted broker ledger snapshots, multi-device backup archives, and enables synchronized state across desktop and mobile devices.',
      metrics: 'Cloud-synced multi-device access',
      flowStep: 5,
    },
  ],
  connections: [
    { from: 'client', to: 'logic', label: 'User Actions & Forms' },
    { from: 'logic', to: 'local_db', label: 'Local SQLite Transactions' },
    { from: 'local_db', to: 'sync', label: 'Delta Mutation Log' },
    { from: 'sync', to: 'cloud_db', label: 'HTTPS Push / Pull' },
  ],
  dataFlowSteps: [
    {
      step: 1,
      title: 'Ledger Entry Created',
      desc: 'Broker enters a trade bill, commission, or return item in the desktop or Android client.',
      nodeId: 'client',
    },
    {
      step: 2,
      title: 'Immediate Local Commit',
      desc: 'Business logic validates ledger calculations and writes atomically to local SQLite transactions with zero network delay.',
      nodeId: 'local_db',
    },
    {
      step: 3,
      title: 'Mutation Queued',
      desc: 'The sync engine registers an incremental mutation record with a monotonic timestamp and change vector.',
      nodeId: 'sync',
    },
    {
      step: 4,
      title: 'Cloud Push & Pull',
      desc: 'When online, the sync engine dispatches the payload to Supabase PostgreSQL and pulls counterparty updates.',
      nodeId: 'cloud_db',
    },
  ],
};

export const queryPilotPipeline = {
  title: 'Natural Language to SQL Analytics Pipeline',
  summary:
    'A Natural Language to SQL analytics pipeline that enables business users to query 250,000+ UPI transaction records in conversational English and receive verified SQL execution results.',
  stages: [
    {
      id: 'ingestion',
      name: 'Dataset Ingestion',
      category: 'Data Layer',
      tech: 'Python · Pandas · Chunked Ingestion',
      description:
        'Ingests 250,000+ UPI transaction records spanning merchant categories, payment methods, transaction velocity, and temporal distributions.',
      sample: '250,000+ raw UPI records · Cleaned, deduplicated, and indexed.',
    },
    {
      id: 'schema',
      name: 'Schema Context & Typing',
      category: 'Context Layer',
      tech: 'Relational Schema · DDL Metadata',
      description:
        'Extracts table schemas, column types, foreign key relationships, and representative categorical values into a structured context bundle.',
      sample: 'Tables: transactions(id, amount, merchant, category, timestamp, status, latency_ms, upi_ref)',
    },
    {
      id: 'nl_query',
      name: 'Natural Language Input',
      category: 'User Interface',
      tech: 'Conversational Input · Query Normalization',
      description:
        'User asks conversational business questions (e.g. "What was our highest-velocity merchant category last month?") without needing SQL knowledge.',
      sample: '"Show total transaction volume and average latency by merchant category for successful payments"',
    },
    {
      id: 'llm_reasoning',
      name: 'LLM Query Interpretation',
      category: 'Inference Layer',
      tech: 'LangChain · LLM APIs · Few-Shot Prompts',
      description:
        'Grounds the user query in the relational schema context, decomposes multi-condition requirements, and drafts optimized SQL statements.',
      sample: 'Prompt injected with schema context + semantic few-shot SQL examples.',
    },
    {
      id: 'safety_gate',
      name: 'SQL Validation & Safety Gate',
      category: 'Security Layer',
      tech: 'Read-Only Guardrails · Keyword Filter',
      description:
        'Verifies that generated queries are strictly read-only SELECT statements. Rejects destructive operations (DROP, DELETE, UPDATE, INSERT, ALTER) to preserve data integrity.',
      sample: 'Safety Check: PASS (ReadOnly: true, StatementType: SELECT, DisallowedTokens: 0)',
    },
    {
      id: 'execution',
      name: 'PostgreSQL Execution',
      category: 'Database Engine',
      tech: 'PostgreSQL · Analytical SQL Engine',
      description:
        'Executes the verified SQL query against the indexed PostgreSQL relational database with execution time profiling.',
      sample: 'SELECT category, COUNT(id) AS txn_count, SUM(amount) AS total_volume, AVG(latency_ms) AS avg_latency FROM transactions WHERE status = \'SUCCESS\' GROUP BY category ORDER BY total_volume DESC;',
    },
    {
      id: 'insights',
      name: 'Business Insight Synthesis',
      category: 'Output Layer',
      tech: 'Contextual Analytics · Velocity Metrics',
      description:
        'Synthesizes tabular SQL results into conversational summaries, trend identification, and actionable business intelligence.',
      sample: 'Illustrative Insight: Electronics lead at ₹4.2M volume; failure rate dropped 1.8% week-over-week.',
    },
  ],
};

export const detailedAchievements = [
  {
    id: 'insightx',
    title: '2nd Position — InsightX Hackathon',
    organization: 'IIT Bombay',
    year: '2026',
    scale: '1,700+ Teams',
    role: 'Team Leader',
    project: 'QueryPilot',
    summary:
      'Secured 2nd place nationally at IIT Bombay for building QueryPilot, a Natural Language to SQL analytics pipeline processing 250K+ UPI transactions for automated business intelligence.',
    impact: [
      'Engineered the end-to-end natural-language to SQL pipeline using LangChain and PostgreSQL.',
      'Achieved high evaluation scores on query generation accuracy and transaction data analysis speed.',
      'Presented live system demonstration to senior engineering and data science judges.',
    ],
    tone: 'lime',
    linkText: 'View Case Study',
    projectAnchor: '#casestudy-querypilot',
  },
  {
    id: 'techsprint',
    title: "1st Position — TechSprint'26 Hackathon",
    organization: 'PICT ACM',
    year: '2026',
    scale: '250+ Teams',
    role: 'Team Leader',
    project: 'CertiCraft',
    summary:
      'Won 1st place overall for architecting CertiCraft, an end-to-end certificate automation platform with cryptographic QR validation and batch email distribution.',
    impact: [
      'Built automated certificate generation pipeline handling 300+ participant records in parallel.',
      'Engineered instant QR code verification mechanism to eliminate credential forgery.',
      'Integrated bulk email queuing system reducing manual organizer effort by 80%.',
    ],
    tone: 'gold',
    linkText: 'View Case Study',
    projectAnchor: '#casestudy-certicraft',
  },
  {
    id: 'gdg',
    title: 'Finalist — GDG Cloud Pune Hackathon',
    organization: 'Google Developer Group Pune',
    year: '2025',
    scale: 'Top 20 of 1,000+',
    role: 'Team Leader',
    project: 'Cloud Systems',
    summary:
      'Selected among the top 20 teams out of 1,000+ participants for developing cloud-native distributed service architectures on Google Cloud.',
    impact: [
      'Designed microservice architecture with low-latency communication contracts.',
      'Presented cloud deployment strategy to Google Cloud experts and community mentors.',
    ],
    tone: 'teal',
    linkText: 'View Background',
    projectAnchor: '#systems',
  },
  {
    id: 'meta',
    title: 'Finalist — Meta x PyTorch Hackathon',
    organization: 'Meta / PyTorch Ecosystem',
    year: '2025',
    scale: '52k Teams',
    role: 'Core Engineer',
    project: 'AI Engineering',
    summary:
      'Ranked in the top 1.5% globally among 52,000+ teams in Meta and PyTorch’s international open environment hackathon challenge.',
    impact: [
      'Built AI-integrated agent environments focusing on verifiable decision loops.',
      'Leveraged state-of-the-art open-source machine learning tooling and PyTorch workflows.',
    ],
    tone: 'coral',
    linkText: 'View Background',
    projectAnchor: '#systems',
  },
  {
    id: 'algorand',
    title: 'Finalist — Algorand HackSeries 3.0',
    organization: 'Algorand Foundation',
    year: '2026',
    scale: 'Top 30 of 800+ Teams',
    role: 'Team Leader',
    project: 'PayPerUseAI',
    summary:
      'Selected in the top 30 teams for building PayPerUseAI, a decentralized usage-based AI payment gateway metering model inference via PyTeal smart contracts.',
    impact: [
      'Architected smart contract escrow settlements on Algorand testnet.',
      'Engineered SSE streaming endpoint for sub-200ms model response delivery.',
      'Demonstrated production micropayment flow for multi-tenant LLM inference.',
    ],
    tone: 'gold',
    linkText: 'View Case Study',
    projectAnchor: '#casestudy-payperuseai',
  },
  {
    id: 'indradhanu',
    title: "2nd Position — Indradhanu'25 Project Competition",
    organization: 'State-Level Technical Summit',
    year: '2025',
    scale: '250+ Projects',
    role: 'Lead Architect',
    project: 'Software Systems',
    summary:
      'Awarded 2nd position at the state level for engineering practical, high-impact software systems addressing business operational bottlenecks.',
    impact: [
      'Built and demonstrated modular business management system with local-first workflows.',
      'Awarded top marks for system design practicality and execution quality.',
    ],
    tone: 'teal',
    linkText: 'View Background',
    projectAnchor: '#experience',
  },
];
