import { useMemo, useState } from 'react';
import { projects, skills } from '../data/portfolio.js';
import { projectCaseStudies } from '../data/caseStudies.js';
import { projectsForSkill } from '../data/skillGraph.js';

const HUB_DEFINITIONS = [
  {
    id: 'project-tradersdesk',
    label: 'TradersDesk',
    kind: 'project',
    groupLabel: 'SHIPPED PROJECTS',
    y: 68,
    accent: '#ff5e3a',
  },
  {
    id: 'project-querypilot',
    label: 'QueryPilot',
    kind: 'project',
    y: 124,
    accent: '#bff205',
  },
  {
    id: 'project-payperuseai',
    label: 'PayPerUseAI',
    kind: 'project',
    y: 180,
    accent: '#00e5ff',
  },
  {
    id: 'project-certicraft',
    label: 'CertiCraft',
    kind: 'project',
    y: 236,
    accent: '#00a6a6',
  },
  {
    id: 'project-founderflow',
    label: 'FounderFlow',
    kind: 'project',
    y: 292,
    accent: '#fbc02d',
  },
  {
    id: 'exp-word-lane',
    label: 'Word Lane Tech',
    kind: 'internship',
    groupLabel: 'EXPERIENCE',
    y: 382,
    accent: '#a872ff',
    skills: ['Node.js', 'Express.js', 'REST APIs', 'JavaScript', 'TypeScript', 'React.js', 'Java', 'Android', 'SQL', 'MongoDB', 'PostgreSQL', 'System Design', 'Git', 'GitHub'],
  },
  {
    id: 'exp-script-lanes',
    label: 'Script Lanes',
    kind: 'internship',
    y: 438,
    accent: '#a872ff',
    skills: ['MongoDB', 'Express.js', 'React.js', 'Node.js', 'PostgreSQL', 'Prisma ORM', 'SQLite', 'SQL', 'JavaScript', 'REST APIs', 'System Design', 'Prompt Engineering', 'LLM APIs', 'OpenRouter', 'AWS S3/EC2', 'Data Analytics', 'Git', 'GitHub'],
  },
  {
    id: 'cluster-core',
    label: 'Core CS & Web',
    kind: 'foundation',
    groupLabel: 'FOUNDATIONS',
    y: 528,
    accent: '#e7dfc4',
    skills: ['Java', 'Python', 'C/C++', 'SQL', 'TypeScript', 'JavaScript', 'DSA', 'OOP', 'React.js', 'Tailwind CSS', 'Framer Motion', 'LangChain', 'Prompt Engineering'],
  },
  {
    id: 'cluster-infra',
    label: 'Systems & Infra',
    kind: 'foundation',
    y: 584,
    accent: '#aaa28a',
    skills: ['PostgreSQL', 'Prisma ORM', 'SQLite', 'MongoDB', 'Redis', 'DBMS & Indexing', 'System Design', 'AWS S3/EC2', 'Docker', 'Git', 'GitHub', 'Maven', 'Linux / Bash', 'OS & Networking'],
  },
];

const CENTER_X = 540;
const HUB_WIDTH = 208;
const HUB_HEIGHT = 42;
const SKILL_WIDTH = 204;
const SKILL_HEIGHT = 21;

function layoutColumn(groupsSlice, startIndex, side) {
  const isLeft = side === 'left';
  const x = isLeft ? 24 : 1080 - 24 - SKILL_WIDTH;
  const portX = isLeft ? x + SKILL_WIDTH + 6 : x - 6;

  // Balance left (22 items across 3 groups) & right (19 items across 3 groups) to span y=24..648
  const stepY = isLeft ? 24 : 27;
  const groupGap = isLeft ? 24 : 35;

  const headers = [];
  const nodes = [];
  let cursorY = 24;

  groupsSlice.forEach((group, localIdx) => {
    const num = String(startIndex + localIdx + 1).padStart(2, '0');
    headers.push({
      id: group.id,
      text: `${num} / ${group.label.toUpperCase()}`,
      x: isLeft ? x + 2 : x + SKILL_WIDTH - 2,
      y: cursorY + 8,
      anchor: isLeft ? 'start' : 'end',
    });
    cursorY += 18;

    group.items.forEach((name) => {
      nodes.push({
        name,
        group: group.label,
        side,
        x,
        y: cursorY,
        cy: cursorY + SKILL_HEIGHT / 2,
        portX,
      });
      cursorY += stepY;
    });

    cursorY += groupGap;
  });

  return { headers, nodes };
}

export default function SkillsConstellation({ highlightedSkill, onSelectSkill }) {
  const [hoveredHubId, setHoveredHubId] = useState(null);
  const [hoveredSkill, setHoveredSkill] = useState(null);

  const layout = useMemo(() => {
    const projectMap = new Map(projects.map((p) => [p.id, p]));
    const leftCol = layoutColumn(skills.slice(0, 3), 0, 'left');
    const rightCol = layoutColumn(skills.slice(3, 6), 3, 'right');
    const columnHeaders = [...leftCol.headers, ...rightCol.headers];

    const allTrackedSkillNames = new Set([...leftCol.nodes, ...rightCol.nodes].map((n) => n.name));

    const hubNodes = HUB_DEFINITIONS.map((hub) => {
      const explicitSkills = hub.skills || (projectCaseStudies[hub.id]?.stack || []);
      const hubSkills = Array.from(new Set(explicitSkills.filter((s) => allTrackedSkillNames.has(s))));
      return {
        ...hub,
        skills: hubSkills,
        label: projectMap.get(hub.id)?.name || hub.label,
        leftPortX: CENTER_X - HUB_WIDTH / 2,
        rightPortX: CENTER_X + HUB_WIDTH / 2,
        linksCount: hubSkills.length,
      };
    });
    const hubById = new Map(hubNodes.map((h) => [h.id, h]));

    // Deduplicate skills cleanly across columns and collect all linked hubs
    const seen = new Set();
    const skillNodes = [];
    [...leftCol.nodes, ...rightCol.nodes].forEach((raw) => {
      if (seen.has(raw.name)) return;
      seen.add(raw.name);

      const linkedHubIds = new Set(projectsForSkill(raw.name));
      hubNodes.forEach((hub) => {
        if (hub.skills.includes(raw.name)) {
          linkedHubIds.add(hub.id);
        }
      });

      const links = Array.from(linkedHubIds);
      const hasShippedLink = links.some((id) => {
        const h = hubById.get(id);
        return h && (h.kind === 'project' || h.kind === 'internship');
      });

      skillNodes.push({ ...raw, links, hasShippedLink });
    });

    const edges = [];
    skillNodes.forEach((skill) => {
      skill.links.forEach((hid) => {
        const hub = hubById.get(hid);
        if (!hub) return;
        const x1 = skill.side === 'left' ? hub.leftPortX : hub.rightPortX;
        const y1 = hub.y;
        const x2 = skill.portX;
        const y2 = skill.cy;
        const ctrlX = (x1 + x2) / 2;

        edges.push({
          key: `${hid}-${skill.name}`,
          hubId: hid,
          hubKind: hub.kind,
          skillName: skill.name,
          d: `M ${x1} ${y1} C ${ctrlX} ${y1}, ${ctrlX} ${y2}, ${x2} ${y2}`,
          accent: hub.accent,
        });
      });
    });

    return { columnHeaders, hubNodes, skillNodes, edges };
  }, []);

  const activeSkill = hoveredSkill || highlightedSkill;
  const activeSkillLinks = useMemo(() => {
    if (!activeSkill) return null;
    const node = layout.skillNodes.find((s) => s.name === activeSkill);
    return node ? new Set(node.links) : null;
  }, [activeSkill, layout.skillNodes]);

  const hasFocus = Boolean(hoveredHubId || activeSkill);

  return (
    <div className="skills-constellation-wrap" aria-label="Interactive Skill Architecture Graph">
      <svg
        className="skills-constellation-svg"
        viewBox="0 0 1080 676"
        role="img"
        aria-label="Structured architecture graph connecting all technical skills to shipped projects, internships, and core foundations"
      >
        {/* Subtle vertical zone dividers for visual clarity */}
        <line x1="252" y1="20" x2="252" y2="656" stroke="rgba(244, 240, 223, 0.05)" strokeDasharray="3 6" />
        <line x1="828" y1="20" x2="828" y2="656" stroke="rgba(244, 240, 223, 0.05)" strokeDasharray="3 6" />

        {/* Domain headers for Left & Right wings */}
        {layout.columnHeaders.map((hdr) => (
          <text
            key={hdr.id}
            x={hdr.x}
            y={hdr.y}
            textAnchor={hdr.anchor}
            fill="rgba(191, 242, 5, 0.72)"
            fontSize="9.5"
            fontWeight="700"
            letterSpacing="0.08em"
            fontFamily="JetBrains Mono, monospace"
            style={{ opacity: hasFocus ? 0.35 : 0.9, transition: 'opacity 0.2s ease' }}
          >
            {hdr.text}
          </text>
        ))}

        {/* Center spine section micro-labels */}
        {layout.hubNodes
          .filter((h) => h.groupLabel)
          .map((h) => (
            <text
              key={`lbl-${h.id}`}
              x={CENTER_X}
              y={h.y - 31}
              textAnchor="middle"
              fill="rgba(170, 162, 138, 0.75)"
              fontSize="9"
              fontWeight="700"
              letterSpacing="0.12em"
              fontFamily="JetBrains Mono, monospace"
              style={{ opacity: hasFocus ? 0.35 : 0.9, transition: 'opacity 0.2s ease' }}
            >
              {h.groupLabel}
            </text>
          ))}

        {/* Smooth Bezier wiring paths (zero text crossings) */}
        {layout.edges.map((edge) => {
          const isLit =
            (hoveredHubId && edge.hubId === hoveredHubId) ||
            (activeSkill && edge.skillName === activeSkill);
          const isFoundation = edge.hubKind === 'foundation';

          return (
            <path
              key={edge.key}
              d={edge.d}
              fill="none"
              stroke={isLit ? edge.accent : isFoundation ? 'rgba(244, 240, 223, 0.11)' : 'rgba(191, 242, 5, 0.16)'}
              strokeWidth={isLit ? 2.1 : 1}
              strokeDasharray={isFoundation ? '4 4' : undefined}
              strokeOpacity={hasFocus ? (isLit ? 0.96 : 0.04) : 0.72}
              style={{ transition: 'stroke-opacity 0.2s ease, stroke-width 0.2s ease' }}
            />
          );
        })}

        {/* Left & Right Skill Pill Nodes */}
        {layout.skillNodes.map((node) => {
          const linkedToHoveredHub = hoveredHubId && node.links.includes(hoveredHubId);
          const isSelectedOrHovered = node.name === activeSkill;
          const lit = isSelectedOrHovered || linkedToHoveredHub;
          const isLeft = node.side === 'left';

          return (
            <g
              key={node.name}
              data-skill={node.name}
              className="constellation-skill-node"
              style={{
                cursor: 'pointer',
                opacity: hasFocus ? (lit ? 1 : 0.16) : 1,
                transition: 'opacity 0.2s ease',
              }}
              tabIndex={0}
              role="button"
              aria-pressed={highlightedSkill === node.name}
              aria-label={`Filter projects by ${node.name}`}
              onMouseEnter={() => setHoveredSkill(node.name)}
              onMouseLeave={() => setHoveredSkill(null)}
              onFocus={() => setHoveredSkill(node.name)}
              onBlur={() => setHoveredSkill(null)}
              onClick={() => onSelectSkill?.(node.name)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectSkill?.(node.name);
                }
              }}
            >
              <rect
                x={node.x}
                y={node.y}
                width={SKILL_WIDTH}
                height={SKILL_HEIGHT}
                rx="5"
                fill={lit ? 'rgba(191, 242, 5, 0.11)' : 'rgba(19, 21, 16, 0.92)'}
                stroke={isSelectedOrHovered ? '#bff205' : lit ? 'rgba(191, 242, 5, 0.55)' : 'rgba(244, 240, 223, 0.12)'}
                strokeWidth={lit ? 1.2 : 0.8}
              />
              <circle
                cx={isLeft ? node.x + 12 : node.x + SKILL_WIDTH - 12}
                cy={node.cy}
                r="2.6"
                fill={node.hasShippedLink ? '#bff205' : '#8c8570'}
              />
              <circle
                cx={node.portX}
                cy={node.cy}
                r={lit ? 3 : 2.2}
                fill={lit ? '#bff205' : 'rgba(244, 240, 223, 0.35)'}
              />
              <text
                x={isLeft ? node.x + 22 : node.x + SKILL_WIDTH - 22}
                y={node.cy + 3.5}
                textAnchor={isLeft ? 'start' : 'end'}
                fill={isSelectedOrHovered ? '#bff205' : '#f4f0df'}
                fontSize="10.5"
                fontWeight={lit ? '600' : '400'}
                fontFamily="JetBrains Mono, monospace"
              >
                {node.name}
              </text>
            </g>
          );
        })}

        {/* Center Spine Hub Nodes */}
        {layout.hubNodes.map((hub) => {
          const isLit =
            hoveredHubId === hub.id ||
            (activeSkillLinks && activeSkillLinks.has(hub.id));

          return (
            <g
              key={hub.id}
              data-hub={hub.id}
              className="constellation-hub-node"
              transform={`translate(${CENTER_X}, ${hub.y})`}
              style={{
                cursor: 'pointer',
                opacity: hasFocus ? (isLit ? 1 : 0.24) : 1,
                transition: 'opacity 0.2s ease',
              }}
              tabIndex={0}
              onMouseEnter={() => setHoveredHubId(hub.id)}
              onMouseLeave={() => setHoveredHubId(null)}
              onFocus={() => setHoveredHubId(hub.id)}
              onBlur={() => setHoveredHubId(null)}
            >
              <rect
                x={-HUB_WIDTH / 2}
                y={-HUB_HEIGHT / 2}
                width={HUB_WIDTH}
                height={HUB_HEIGHT}
                rx="8"
                fill={isLit ? 'rgba(22, 24, 18, 0.98)' : 'rgba(13, 14, 11, 0.96)'}
                stroke={hub.accent}
                strokeWidth={isLit ? 2 : 1.1}
                strokeDasharray={hub.kind === 'foundation' ? '5 3' : undefined}
              />
              <circle cx={-HUB_WIDTH / 2 + 14} cy="0" r="3.5" fill={hub.accent} />
              <text
                x={-HUB_WIDTH / 2 + 25}
                y="4"
                textAnchor="start"
                fill={hub.kind === 'foundation' ? '#e7dfc4' : '#f4f0df'}
                fontSize="12"
                fontWeight="700"
                fontFamily="Bricolage Grotesque, sans-serif"
              >
                {hub.label}
              </text>
              <rect
                x={HUB_WIDTH / 2 - 34}
                y="-10"
                width="24"
                height="20"
                rx="4"
                fill="rgba(244, 240, 223, 0.06)"
              />
              <text
                x={HUB_WIDTH / 2 - 22}
                y="3.5"
                textAnchor="middle"
                fill={isLit ? hub.accent : '#aaa28a'}
                fontSize="10"
                fontWeight="600"
                fontFamily="JetBrains Mono, monospace"
              >
                {hub.linksCount}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="constellation-hint">
        Hover any hub to illuminate its stack · Solid = Shipped Work · Dashed = Core Domains · Click a skill to filter work
      </p>
    </div>
  );
}
