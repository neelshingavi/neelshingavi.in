import { memo, useCallback } from 'react';
import { useTilt } from '../hooks/useTilt.js';
import { ArrowUpRight, BookOpen, CheckCircle2, ExternalLink, FolderGit2 } from 'lucide-react';
import { projectCaseStudies } from '../data/caseStudies.js';

/**
 * Compact Editorial Project Card
 * Displays flagship & production software in a scannable layout without visual bloat.
 * Blueprints & interactive architecture explorers open inside ProjectCaseStudyModal.
 */
export const ProjectCard = memo(function ProjectCard({
  project,
  index,
  onOpenCaseStudy,
  highlightedSkill,
}) {
  const tiltRef = useTilt(3);

  const handleMouseMove = useCallback((e) => {
    if (window.matchMedia && !window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      return;
    }
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--card-mx', `${e.clientX - rect.left}px`);
    card.style.setProperty('--card-my', `${e.clientY - rect.top}px`);
  }, []);

  const isFlagship = Boolean(project.featured);
  const cardDomId = project.id || `project-${project.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
  const caseStudy = projectCaseStudies[project.id];
  const isSkillMatched = highlightedSkill
    ? project.stack?.some((s) => s.toLowerCase() === highlightedSkill.toLowerCase())
    : false;
  const isSkillDimmed = Boolean(highlightedSkill && !isSkillMatched);

  const handleCaseStudyClick = () => {
    if (caseStudy && onOpenCaseStudy) {
      onOpenCaseStudy(caseStudy);
    }
  };

  const indexStr = String(index + 1).padStart(2, '0');
  const maxVisibleTags = isFlagship ? 6 : 4;
  const visibleStack = project.stack?.slice(0, maxVisibleTags) || [];
  const hiddenStackCount = Math.max(0, (project.stack?.length || 0) - maxVisibleTags);

  return (
    <article
      id={cardDomId}
      ref={tiltRef}
      onMouseMove={handleMouseMove}
      className={`project-compact-card tone-${project.color || 'lime'} ${isFlagship ? 'is-flagship' : ''} ${isSkillMatched ? 'is-skill-matched' : ''} ${isSkillDimmed ? 'is-skill-dimmed' : ''}`}
      aria-labelledby={`title-${cardDomId}`}
    >
      {/* Card Header Meta */}
      <div className="compact-card-meta">
        <div className="compact-meta-left">
          <span className="compact-index">
            {isFlagship ? `${indexStr} // FLAGSHIP` : indexStr}
          </span>
          {project.categories?.[0] && (
            <span className="compact-category">{project.categories[0]}</span>
          )}
        </div>
        {project.period && <span className="compact-period">{project.period}</span>}
      </div>

      {/* Title & Role/Type */}
      <h3 id={`title-${cardDomId}`} className="compact-project-title">
        {project.name}
      </h3>
      <p className="compact-project-type">{project.type}</p>

      {/* Description */}
      <p className="compact-project-desc">{project.description}</p>

      {/* Verified Outcomes */}
      {Array.isArray(project.impact) && project.impact.length > 0 && (
        <ul className="compact-outcomes-list" aria-label="Verified outcomes">
          {project.impact.map((item) => (
            <li key={item} className="compact-outcome-item">
              <CheckCircle2 size={13} className="outcome-icon" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Technology Stack Tags */}
      {visibleStack.length > 0 && (
        <div className="compact-stack-list" aria-label="Technologies used">
          {visibleStack.map((tech) => (
            <span key={tech} className="tech-badge">
              {tech}
            </span>
          ))}
          {hiddenStackCount > 0 && (
            <span className="secondary-tech-more">+{hiddenStackCount}</span>
          )}
        </div>
      )}

      {/* Footer Actions Bar */}
      <div className="compact-actions-bar">
        <button
          type="button"
          className={isFlagship ? 'primary-showcase-btn' : 'secondary-read-btn compact-read-btn'}
          onClick={handleCaseStudyClick}
          aria-label={`Read technical case study for ${project.name}`}
        >
          {isFlagship && <BookOpen size={14} aria-hidden="true" />}
          <span>{isFlagship ? 'Technical Deep Dive' : 'Read Case Study'}</span>
          <ArrowUpRight size={14} aria-hidden="true" />
        </button>

        {project.photosLink && (
          <a
            href={project.photosLink}
            target="_blank"
            rel="noopener noreferrer"
            className="secondary-showcase-btn"
            title="View verified client deployment photos on Google Drive"
          >
            <FolderGit2 size={14} aria-hidden="true" />
            <span>Client Photos</span>
            <ExternalLink size={13} aria-hidden="true" />
          </a>
        )}
      </div>
    </article>
  );
});
