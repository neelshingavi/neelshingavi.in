/**
 * Deep Technical Case Studies Data
 * Verified against Neel Shingavi's shipped code, hackathon outcomes, and client deployments.
 */

export const projectCaseStudies = {
  'project-tradersdesk': {
    id: 'project-tradersdesk',
    name: 'TradersDesk',
    tagline: 'Production local-first trading ledger and billing workflow system',
    badge: 'Production Client Software',
    period: 'Mar 2026 – Present',
    role: 'Lead Full-Stack & Systems Architect',
    status: 'In Active Production',
    accent: '#ff5e3a',
    blueprint: '/assets/projects/tradersdesk/tradersdesk-architecture-blueprint.svg',
    photosLink: 'https://drive.google.com/drive/folders/1tmuq4egWo1IHDVIaBjV3EH-x7ZLuNRKr?usp=drive_link',
    overview:
      'TradersDesk is an offline-first financial ledger and trade management application built specifically for saree brokers in traditional textile markets to handle fast billing, commissions, and reconciliation.',
    problem:
      'Textile saree brokerages operate in dense physical market clusters with erratic internet connectivity. Web-only SaaS tools repeatedly failed because network drops halted desk billing lines, froze cash settlement reconciliations, and led to severe ledger discrepancies between field visits and central ledger books.',
    productDescription:
      'A cross-platform system combining a high-density, keyboard-driven Java Swing desktop client for high-frequency office billing and a Flutter mobile companion client for field balance collections, powered by embedded SQLite transactional engines operating with local ACID guarantees and asynchronous delta synchronization.',
    architecture: [
      'Dual-client tier: Java Swing desktop workstation (office billing) + Flutter mobile companion (field collections).',
      'Data Access Object (DAO) pattern using Hibernate ORM to abstract ledger business logic.',
      'Embedded SQLite persistence on desktop and mobile clients ensuring local ACID transactions and sub-millisecond query responses.',
      'Asynchronous sync engine tracking mutations via monotonic timestamps and delta change vectors.',
      'Durable cloud backup and multi-device state synchronization via Supabase PostgreSQL with eventual consistency reconciliation.',
    ],
    technicalDecisions: [
      {
        decision: 'Embedded SQLite over Client-Server Database for Local Persistence',
        rationale:
          'Eliminated background daemon dependencies and networking overhead on client machines. Brokers can record trades and generate invoices with local ACID guarantees even with complete network disconnection.',
      },
      {
        decision: 'Change-Vector Monotonic Changelog Sync (Eventual Consistency)',
        rationale:
          'Rather than streaming entire database dumps or attempting fragile distributed two-phase commits over intermittent cellular connections, the sync engine queues minimal incremental diffs with monotonic version tags for eventual reconciliation.',
      },
      {
        decision: 'Strict Separation of Trade Lines and Settlement Transactions',
        rationale:
          'Textile brokerage trades involve complex returns and partial advances; decoupling trade volume records from financial settlement events prevented ledger corruption.',
      },
    ],
    challenges: [
      'Managing out-of-order reconciliation when mobile clients submit field collections while office desktop machines record trades concurrently.',
      'Ensuring instantaneous keyboard shortcut response times (<10ms) during high-throughput festive wholesale billing rushes.',
    ],
    outcomes: [
      '5,000+ monthly trade-related records processed across billing and return lines.',
      '2,000+ monthly client settlement transactions reliably managed across 3 active commercial brokerages.',
      'Zero recorded ledger corruption or billing dropouts across 3 active brokerages over 6+ months of daily physical operation, backed by SQLite write-ahead logging (WAL) and local transaction journaling.',
      'Verified physical client deployment with photographic proof and commercial operational history.',
    ],
    stack: ['Java', 'Java Swing', 'Flutter', 'SQLite', 'Hibernate ORM', 'PostgreSQL', 'Supabase', 'REST APIs'],
  },

  'project-querypilot': {
    id: 'project-querypilot',
    name: 'QueryPilot',
    tagline: 'Natural Language to SQL analytics pipeline for high-volume financial data',
    badge: 'National Hackathon Winner — 2nd Place IIT Bombay',
    period: 'Feb 2026 – Apr 2026',
    role: 'Lead Architect & AI Systems Engineer',
    status: 'Verified Prototype & Award Winner',
    accent: '#bff205',
    blueprint: '/assets/projects/querypilot/querypilot-pipeline-blueprint.svg',
    githubLink: 'https://github.com/neelshingavi',
    overview:
      'QueryPilot is an end-to-end analytical pipeline that allows non-technical business operators to query large-scale transactional datasets in natural English and obtain verified SQL execution metrics and conversational insights.',
    problem:
      'Non-technical finance and operations managers face hours of latency waiting for data teams to draft ad-hoc SQL queries over large UPI transaction logs. Existing LLM text-to-SQL solutions frequently hallucinated columns, generated invalid table joins, or posed security risks through destructive queries.',
    productDescription:
      'An enterprise NL-to-SQL pipeline that ground conversational queries in formal relational schema definitions, filters generated statements through an assertive read-only safety gate, executes the query against indexed PostgreSQL tables, and translates tabular outputs into synthesized business metrics.',
    architecture: [
      'Dataset ingestion layer parsing 250,000+ raw UPI records into clean tabular schema.',
      'Dynamic schema context injection with typed table definitions and semantic few-shot prompt bundles.',
      'LLM reasoning engine (LangChain) decomposing multi-condition questions into optimized SQL.',
      'Deterministic read-only guardrail enforcing SELECT-only statements and rejecting destructive tokens (DROP, DELETE, UPDATE, ALTER, TRUNCATE, INSERT, EXEC).',
      'PostgreSQL execution engine profiling query latencies, returning typed result sets and natural language summaries.',
    ],
    technicalDecisions: [
      {
        decision: 'Strict Schema Context Grounding in LLM Prompts',
        rationale:
          'Injected explicit DDL declarations (`transactions(id, amount, merchant, category, timestamp, status, latency_ms, upi_ref)`) into system prompts, eliminating column hallucinations.',
      },
      {
        decision: 'Read-Only Guardrail Enforcement & Token Sanitization',
        rationale:
          'Enforced deterministic syntax token scanning and keyword safety filters to guarantee that only non-destructive `SELECT` statements are transmitted to the database driver, safeguarding database integrity against destructive DDL/DML injection.',
      },
      {
        decision: 'Two-Stage Response Pipeline (SQL Execution + Metric Synthesis)',
        rationale:
          'Separated query execution from insight narration, allowing technical users to inspect the exact SQL code while executives receive clear bulleted takeaways.',
      },
    ],
    challenges: [
      'Achieving sub-second response times across a 250,000+ record transaction table without pre-aggregating metrics.',
      'Synthesizing contextual conversational insights without re-querying the LLM with massive raw tabular payloads.',
    ],
    outcomes: [
      '2nd Position nationally at InsightX Hackathon, IIT Bombay against 1,700+ competing teams.',
      'Successfully indexed and queried 250,000+ real UPI transaction records.',
      '142ms benchmarked execution time on indexed PostgreSQL tables (using B-tree indices on merchant, category, timestamp under local EXPLAIN ANALYZE runs over 250K indexed rows).',
      'Zero safety violations across rigorous adversarial testing rounds during live jury evaluation.',
    ],
    stack: ['Python', 'LangChain', 'PostgreSQL', 'LLM APIs', 'Pandas', 'SQL', 'Data Analytics'],
  },

  'project-payperuseai': {
    id: 'project-payperuseai',
    name: 'PayPerUseAI',
    tagline: 'Decentralized usage-based AI payment gateway with smart contract settlement',
    badge: 'Global Finalist — Top 30 Algorand HackSeries 3.0',
    period: 'Apr 2026 – Jun 2026',
    role: 'Backend Architect & Smart Contract Developer',
    status: 'Verified Project & Global Finalist',
    accent: '#00e5ff',
    blueprint: '/assets/projects/payperuseai/payperuseai-gateway-blueprint.svg',
    githubLink: 'https://github.com/neelshingavi',
    overview:
      'PayPerUseAI is a decentralized metering and micropayment gateway that allows developers and consumers to pay for multi-model AI inference on a per-token basis using Algorand smart contracts.',
    problem:
      'Current AI providers lock users into rigid monthly subscriptions or opaque prepaid credits, charging high platform fees and holding unspent user funds in custodial lock-in.',
    productDescription:
      'A non-custodial gateway combining a high-concurrency FastAPI streaming proxy with PyTeal smart contracts on Algorand Layer 1, enabling micro-billing that settles token inference costs in real time.',
    architecture: [
      'FastAPI async proxy handling real-time Server-Sent Events (SSE) token streaming.',
      'Token consumption metering engine calculating sub-cent inference cost per chunk.',
      'Algorand Layer 1 smart escrow contract written in PyTeal managing deposit locks.',
      'Cryptographically signed state proofs validating consumption before fund release.',
    ],
    technicalDecisions: [
      {
        decision: 'Server-Sent Events (SSE) Streaming',
        rationale:
          'Maintained sub-200ms real-time token streaming to clients while concurrently updating the in-memory inference counter.',
      },
      {
        decision: 'Algorand L1 Smart Contracts (PyTeal)',
        rationale:
          'Leveraged Algorand’s 3.3-second finality and negligible transaction costs (~$0.001) to make micro-settlement financially viable.',
      },
    ],
    challenges: [
      'Synchronizing high-frequency asynchronous streaming chunks with blockchain state updates without causing client-side stutter.',
      'Handling network disconnection mid-inference by implementing verifiable client token receipts with signed checkpoint proofs so neither the model provider nor the client suffers uncompensated token burn.',
    ],
    outcomes: [
      'Selected in Top 30 teams globally out of 800+ teams in Algorand HackSeries 3.0.',
      'Demonstrated end-to-end token-level billing with sub-200ms streaming latency.',
      'Eliminated custodial escrow liabilities through trustless PyTeal smart contract settlement.',
    ],
    stack: ['FastAPI', 'Python', 'React.js', 'PyTeal', 'Algorand Blockchain', 'SSE'],
  },

  'project-certicraft': {
    id: 'project-certicraft',
    name: 'CertiCraft',
    tagline: 'Cryptographic certificate automation & dynamic QR validation platform',
    badge: '1st Place Winner — TechSprint’26 (PICT ACM)',
    period: 'Jan 2026',
    role: 'Lead Architect & Full-Stack Developer',
    status: 'Hackathon Champion & Shipped System',
    accent: '#00a6a6',
    blueprint: '/assets/projects/certicraft/certicraft-automation-blueprint.svg',
    githubLink: 'https://github.com/neelshingavi',
    overview:
      'CertiCraft is an automated credential generation and validation platform that replaces paper-heavy, error-prone event certificate distribution with cryptographic verification and batch email queues.',
    problem:
      'College and industry technical symposiums spend dozens of manual hours formatting participant certificates, with high rates of typos, bounced emails, and no mechanism to verify credential authenticity.',
    productDescription:
      'A web-based automation engine that parses bulk event rosters, dynamically renders tamper-proof certificates with embedded cryptographic verification QR codes, and dispatches customized credentials via rate-limited email queues.',
    architecture: [
      'Batch roster ingestion with CSV/JSON normalization and name validation.',
      'Headless canvas rendering engine generating print-ready high-dpi PDF certificates.',
      'Server-verified cryptographic token generator embedding tamper-proof QR verification URLs pointing to a registry lookup endpoint.',
      'Asynchronous email dispatch queue preventing SMTP throttling.',
    ],
    technicalDecisions: [
      {
        decision: 'Server-Side Registry Verification via Dynamic QR Codes',
        rationale:
          'Allowed third-party reviewers and recruiters to scan printed or digital certificates and query the authoritative event registry endpoint, validating certificate metadata against the server database without exposing private verification keys.',
      },
      {
        decision: 'Headless Vector Template Compilation vs Heavy Chromium Rendering',
        rationale:
          'Utilized native vector PDF rendering rather than headless browser instances, cutting certificate rendering latency by 85% and maintaining memory usage under 60MB during batch runs.',
      },
    ],
    challenges: [
      'Generating hundreds of high-resolution vector PDF certificates concurrently without exhausting server memory.',
      'Preventing SMTP rate limits and connection throttling during bulk certificate dispatch through an adaptive exponential backoff queue with concurrent worker thread pooling.',
    ],
    outcomes: [
      '1st Position overall at TechSprint’26 Hackathon (PICT ACM) competing against 250+ teams.',
      'Automated credential issuance for 300+ symposium participants in under 4 minutes.',
      '80% reduction in organizer manual effort with 0% credential duplication or forgery.',
    ],
    stack: ['Web Development', 'QR Cryptographic Systems', 'Email Queues', 'Node.js'],
  },

  'project-founderflow': {
    id: 'project-founderflow',
    name: 'FounderFlow',
    tagline: 'Startup operating system combining validation, roadmap pipelines, and execution dashboards',
    badge: 'Incubator System',
    period: 'Dec 2025 – Jan 2026',
    role: 'Product Engineer & Systems Designer',
    status: 'Operational Product',
    accent: '#fbc02d',
    blueprint: '/assets/projects/founderflow/founderflow-system-blueprint.svg',
    githubLink: 'https://github.com/neelshingavi',
    overview:
      'FounderFlow is a centralized execution cockpit designed for early-stage startup founders to systematically validate ideas, schedule milestones, and track runway metrics in one place.',
    problem:
      'First-time founders waste critical momentum juggling disconnected Notion documents, messy spreadsheets, and complex task trackers, losing sight of burn rate and validation milestones.',
    productDescription:
      'An integrated operating platform combining structured idea scorecard heuristics, interactive milestone Gantt timelines, burn rate calculators, and exportable investor progress summaries.',
    architecture: [
      'Structured heuristic validation module scoring market size, customer pain, and moat defensibility.',
      'Dynamic dependency roadmap pipeline calculating sprint health and critical paths.',
      'Centralized founder dashboard aggregating real-time execution velocity and runway projections.',
    ],
    technicalDecisions: [
      {
        decision: 'Lightweight In-Memory State with Local Persistence',
        rationale:
          'Ensured founders experience instant dashboard reactivity without sluggish server roundtrips.',
      },
      {
        decision: 'Client-Side Directed Acyclic Graph (DAG) for Milestone Dependencies',
        rationale:
          'Implemented topological sorting in JavaScript on the frontend to compute critical paths in real-time, preventing circular task dependencies without requiring backend query overhead.',
      },
    ],
    challenges: [
      'Distilling complex startup strategy metrics into an intuitive, high-velocity dashboard.',
      'Ensuring responsive client-side Gantt rendering and sub-50ms DAG recalculations when founders dynamically alter task dependencies across complex multi-phase launch milestones.',
    ],
    outcomes: [
      'Streamlined startup workflow planning into a unified, actionable cockpit.',
      'Accelerated founder milestone tracking by consolidating disparate task tools.',
    ],
    stack: ['Workflow Automation', 'Product Design', 'Dashboards', 'React.js', 'State Management'],
  },
};

