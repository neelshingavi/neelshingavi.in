import { memo } from 'react';
import { useTilt } from '../hooks/useTilt.js';
import { ExternalLink } from 'lucide-react';

export const ProjectCard = memo(function ProjectCard({ project, index }) {
  const tiltRef = useTilt(8);

  return (
    <div ref={tiltRef} className={`project-card ${project.color}`}>
      <div className="project-index">0{index + 1}</div>
      <div>
        <span>{project.type}</span>
        <h3>{project.name}</h3>
        <p>{project.description}</p>
      </div>
      <div className="impact-list">
        {project.impact.map((item) => (
          <strong key={item}>{item}</strong>
        ))}
      </div>
      <div className="stack-list">
        {project.stack.map((item) => (
          <em key={item}>{item}</em>
        ))}
      </div>
      {project.photosLink && (
        <a 
          href={project.photosLink} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="project-photos-link"
        >
          View photos <ExternalLink size={14} />
        </a>
      )}
    </div>
  );
});
