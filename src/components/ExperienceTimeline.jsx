import { useState } from 'react';
import {
  Briefcase,
  GraduationCap,
  Users,
  ChevronDown,
  Calendar,
  MapPin,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { experience, clubs, education } from '../data/portfolio.js';

export function ExperienceTimeline() {
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'work' | 'leadership' | 'education'
  const [expandedIds, setExpandedIds] = useState({ 'Script Lanes': true, 'Word Lane Tech': true });

  const toggleExpand = (id) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Compile timeline items with standardized schema
  const allItems = [
    ...experience.map((item) => ({
      ...item,
      id: item.company,
      type: 'work',
      typeLabel: 'Industry Internship',
      icon: Briefcase,
      isCurrent: item.period.includes('Present'),
    })),
    ...clubs.map((item) => ({
      ...item,
      id: item.company,
      type: 'leadership',
      typeLabel: 'Leadership & Strategy',
      icon: Users,
      isCurrent: item.period.includes('Present'),
    })),
    ...education.map((item) => ({
      company: item.school,
      role: item.course,
      period: item.period,
      location: 'Pune',
      points: [item.result],
      id: item.school,
      type: 'education',
      typeLabel: 'Academic Foundation',
      icon: GraduationCap,
      isCurrent: item.period.includes('Present'),
      result: item.result,
    })),
  ];

  const filteredItems = allItems.filter(
    (item) => activeFilter === 'all' || item.type === activeFilter
  );

  return (
    <div className="experience-timeline-shell" aria-label="Professional Experience and Foundation Timeline">
      {/* Segmented Filter Pills */}
      <div className="timeline-filter-bar" role="tablist" aria-label="Filter timeline by category">
        {[
          { id: 'all', label: 'All Milestones' },
          { id: 'work', label: 'Industry Work' },
          { id: 'leadership', label: 'Leadership & Clubs' },
          { id: 'education', label: 'Education' },
        ].map((tab) => {
          const isSelected = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              type="button"
              aria-selected={isSelected}
              className={`timeline-tab-pill ${isSelected ? 'is-active' : ''}`}
              onClick={() => setActiveFilter(tab.id)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Vertical Interactive Timeline */}
      <div className="unified-timeline-stream">
        <div className="timeline-laser-line" aria-hidden="true" />

        {filteredItems.map((item, idx) => {
          const Icon = item.icon;
          const isExpanded = !!expandedIds[item.id];

          return (
            <div
              key={item.id}
              className={`timeline-node-entry ${item.isCurrent ? 'is-current-role' : ''}`}
            >
              {/* Milestone Indicator on Line */}
              <div className="timeline-node-dot" aria-hidden="true">
                <span className="dot-inner" />
                {item.isCurrent && <span className="dot-pulse-ring" />}
              </div>

              {/* Card Surface */}
              <div className="timeline-node-card">
                <div
                  className="timeline-card-header"
                  onClick={() => toggleExpand(item.id)}
                  role="button"
                  tabIndex={0}
                  aria-expanded={isExpanded}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleExpand(item.id);
                    }
                  }}
                >
                  <div className="card-header-main">
                    <div className="card-type-row">
                      <span className={`card-type-badge type-${item.type}`}>
                        <Icon size={12} aria-hidden="true" />
                        {item.typeLabel}
                      </span>
                      {item.isCurrent && (
                        <span className="current-badge">
                          <span className="live-dot" /> ACTIVE ROLE
                        </span>
                      )}
                    </div>
                    <h3 className="card-company-name">{item.company}</h3>
                    <p className="card-role-title">{item.role}</p>
                  </div>

                  <div className="card-header-meta">
                    <div className="period-chip">
                      <Calendar size={13} aria-hidden="true" />
                      <span>{item.period}</span>
                    </div>
                    {item.location && (
                      <div className="location-chip">
                        <MapPin size={13} aria-hidden="true" />
                        <span>{item.location}</span>
                      </div>
                    )}
                    <ChevronDown
                      size={18}
                      className={`expand-chevron ${isExpanded ? 'is-rotated' : ''}`}
                      aria-hidden="true"
                    />
                  </div>
                </div>

                {/* Collapsible Content */}
                {isExpanded && (
                  <div className="timeline-card-drawer">
                    {item.type === 'education' ? (
                      <div className="education-highlight">
                        <span className="result-label">Academic Achievement:</span>
                        <strong className="result-val">{item.result}</strong>
                      </div>
                    ) : (
                      <ul className="timeline-points-list">
                        {item.points.map((pt, pIdx) => (
                          <li key={pIdx} className="timeline-point-item">
                            <CheckCircle2 size={15} className="point-icon" aria-hidden="true" />
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

