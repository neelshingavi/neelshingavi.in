import { useState } from 'react';
import { capabilityCategories } from '../data/portfolio.js';

export function HeroCapabilities({ onSelectCategory }) {
  const [activeId, setActiveId] = useState(capabilityCategories[0].id);

  const activeCategory =
    capabilityCategories.find((cat) => cat.id === activeId) || capabilityCategories[0];

  const handleSelect = (category) => {
    setActiveId(category.id);
    onSelectCategory?.(category);
  };

  const handleKeyDown = (e, index) => {
    let nextIndex = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      nextIndex = (index + 1) % capabilityCategories.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      nextIndex = (index - 1 + capabilityCategories.length) % capabilityCategories.length;
    } else if (e.key === 'Home') {
      nextIndex = 0;
    } else if (e.key === 'End') {
      nextIndex = capabilityCategories.length - 1;
    }

    if (nextIndex !== null) {
      e.preventDefault();
      const target = capabilityCategories[nextIndex];
      handleSelect(target);
      const el = document.getElementById(`cap-tab-${target.id}`);
      el?.focus();
    }
  };

  return (
    <div className="hero-capabilities-shell" aria-label="Core Engineering Domains">
      <div
        className="capabilities-tablist"
        role="tablist"
        aria-label="Engineering Capabilities"
      >
        {capabilityCategories.map((category, idx) => {
          const isActive = category.id === activeId;
          return (
            <button
              key={category.id}
              id={`cap-tab-${category.id}`}
              role="tab"
              type="button"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              className={`capability-pill ${isActive ? 'is-active' : ''}`}
              onClick={() => handleSelect(category)}
              onMouseEnter={() => handleSelect(category)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
            >
              <span className="pill-dot" aria-hidden="true" />
              <span className="pill-text">{category.label}</span>
            </button>
          );
        })}
      </div>

      <div
        className="capability-detail-bar"
        role="tabpanel"
        id={`cap-panel-${activeCategory.id}`}
        aria-labelledby={`cap-tab-${activeCategory.id}`}
      >
        <span className="capability-tagline">{activeCategory.tagline}</span>
      </div>
    </div>
  );
}

