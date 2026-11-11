import { useMemo } from 'react';

export const PROJECT_FILTER_CATEGORIES = [
  'All',
  'AI & LLM',
  'Financial & Trading',
  'Payments & Web3',
  'Automation',
];

export function ProjectFilters({
  categories = PROJECT_FILTER_CATEGORIES,
  selectedCategory = 'All',
  onSelectCategory,
  projects = [],
}) {
  // Compute counts for each category
  const counts = useMemo(() => {
    const map = { All: projects.length };
    categories.forEach((cat) => {
      if (cat !== 'All') {
        map[cat] = projects.filter(
          (p) => Array.isArray(p.categories) && p.categories.includes(cat)
        ).length;
      }
    });
    return map;
  }, [categories, projects]);

  const handleKeyDown = (e, index) => {
    let nextIndex = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      nextIndex = (index + 1) % categories.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      nextIndex = (index - 1 + categories.length) % categories.length;
    } else if (e.key === 'Home') {
      nextIndex = 0;
    } else if (e.key === 'End') {
      nextIndex = categories.length - 1;
    }

    if (nextIndex !== null) {
      e.preventDefault();
      const targetCategory = categories[nextIndex];
      onSelectCategory?.(targetCategory);
      const el = document.getElementById(`proj-filter-${targetCategory.replace(/\s+/g, '-').toLowerCase()}`);
      el?.focus();
    }
  };

  return (
    <div
      className="project-filters"
      role="group"
      aria-label="Filter projects by category"
    >
      {categories.map((category, idx) => {
        const isSelected = selectedCategory === category;
        const count = counts[category] || 0;
        const domId = `proj-filter-${category.replace(/\s+/g, '-').toLowerCase()}`;

        return (
          <button
            key={category}
            id={domId}
            type="button"
            aria-pressed={isSelected}
            className={`filter-pill ${isSelected ? 'is-active' : ''}`}
            onClick={() => onSelectCategory?.(category)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
          >
            <span className="filter-label">{category}</span>
            <span className="filter-count" aria-label={`${count} projects`}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
