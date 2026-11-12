import { projectCaseStudies } from './caseStudies.js';

const edges = {};
Object.values(projectCaseStudies).forEach((cs) => {
  (cs.stack || []).forEach((tech) => {
    if (!edges[tech]) edges[tech] = [];
    if (!edges[tech].includes(cs.id)) {
      edges[tech].push(cs.id);
    }
  });
});

// Preserve alias mapping for legacy naming
if (edges['REST APIs']) {
  edges['HTTP APIs'] = edges['REST APIs'];
}

export const skillEdges = edges;

export const INTERNSHIP_SKILLS = new Set([
  'AWS S3/EC2',
  'OpenRouter',
  'Express.js',
  'Android',
]);

export function projectsForSkill(skill) {
  if (!skill) return [];
  return skillEdges[skill] ?? [];
}

