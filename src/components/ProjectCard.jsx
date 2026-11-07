import { memo, useCallback } from 'react';
import { useTilt } from '../hooks/useTilt.js';
import { ArrowUpRight, FolderGit2 } from 'lucide-react';
import { AnimatedMetric } from './AnimatedMetric.jsx';

export const ProjectCard = memo(function ProjectCard({ project, index }) {
  const tiltRef = useTilt(6);

  const handleMouseMove = useCallback((e) => {
    // Only update spotlight if user has fine pointer
    if (window.matchMedia && !window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      return;
    }
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--card-mx', `${x}px`);
    card.style.setProperty('--card-my', `${y}px`);
  }, []);

  const isFlagship = index === 0 || index === 1;

  return (
    <div className={`project-slot ${isFlagship ? 'is-flagship-slot' : ''}`} data-index={index}>
      <div
        ref={tiltRef}
        className={`project-card ${project.color} ${isFlagship ? 'is-flagship' : ''}`}
        onMouseMove={handleMouseMove}
      >
        <div className="project-index">0{index + 1}</div>

        <div className="project-main-content">
          <div className="project-meta-line">
            <span className="project-type-tag">{project.type}</span>
            {project.period && <span className="project-period-tag">{project.period}</span>}
          </div>
          <h3 className="project-title">{project.name}</h3>
          <p className="project-desc">{project.description}</p>
        </div>

        <div className="impact-list" aria-label="Key outcomes">
          {project.impact.map((item) => (
            <AnimatedMetric key={item} text={item} />
          ))}
        </div>

        <div className="stack-list" aria-label="Technology stack">
          {project.stack.map((item) => (
            <em key={item} className="tech-tag">
              {item}
            </em>
          ))}
        </div>

        {project.photosLink && (
          <a
            href={project.photosLink}
            target="_blank"
            rel="noopener noreferrer"
            className="project-photos-link"
            aria-label={`View production photos for ${project.name} on Google Drive (opens in new tab)`}
          >
            <FolderGit2 size={14} className="preview-icon" aria-hidden="true" />
            <span>View photos</span>
            <ArrowUpRight size={14} className="cta-arrow" aria-hidden="true" />
          </a>
        )}
      </div>
    </div>
  );
});
