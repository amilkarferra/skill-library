import { useCallback } from 'react';
import type { Category } from '../../shared/models/Category';
import type { Tag } from '../../shared/models/Tag';
import type { SkillFilters } from '../../shared/models/SkillFilters';
import './FilterSidebar.css';

interface FilterSidebarProps {
  categories: Category[];
  popularTags: Tag[];
  selectedCategory: string;
  selectedTags: string[];
  selectedSort: SkillFilters['sort'];
  onCategoryChange: (categorySlug: string) => void;
  onTagToggle: (tagName: string) => void;
  onSortChange: (sort: SkillFilters['sort']) => void;
}

const SORT_OPTIONS: { value: SkillFilters['sort']; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'most_likes', label: 'Most liked' },
  { value: 'most_downloads', label: 'Most downloaded' },
  { value: 'name_asc', label: 'Name A-Z' },
];

export function FilterSidebar({
  categories,
  popularTags,
  selectedCategory,
  selectedTags,
  selectedSort,
  onCategoryChange,
  onTagToggle,
  onSortChange,
}: FilterSidebarProps) {
  const handleCategoryClick = useCallback(
    (slug: string) => {
      const isSameCategory = slug === selectedCategory;
      onCategoryChange(isSameCategory ? '' : slug);
    },
    [selectedCategory, onCategoryChange]
  );

  const handleSortClick = useCallback(
    (sort: SkillFilters['sort']) => {
      onSortChange(sort);
    },
    [onSortChange]
  );

  const handleTagClick = useCallback(
    (tagName: string) => {
      onTagToggle(tagName);
    },
    [onTagToggle]
  );

  return (
    <div className="filter-sidebar">
      <div className="filter-section">
        <span className="filter-section-label">Categories</span>
        <button
          className={buildFilterItemClass(!selectedCategory)}
          onClick={() => handleCategoryClick('')}
        >
          All
          <span className="filter-item-count">{computeTotalSkillCount(categories)}</span>
        </button>
        {categories.map((category) => {
          const isActive = category.slug === selectedCategory;
          return (
            <button
              key={category.id}
              className={buildFilterItemClass(isActive)}
              onClick={() => handleCategoryClick(category.slug)}
            >
              {category.name}
              <span className="filter-item-count">{category.skillCount}</span>
            </button>
          );
        })}
      </div>

      <div className="filter-section">
        <span className="filter-section-label">Sort by</span>
        {SORT_OPTIONS.map((option) => {
          const isActive = option.value === selectedSort;
          return (
            <button
              key={option.value}
              className={buildFilterItemClass(isActive)}
              onClick={() => handleSortClick(option.value)}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <div className="filter-section">
        <span className="filter-section-label">Popular tags</span>
        <div className="filter-tags">
          {popularTags.map((tag) => {
            const isSelected = selectedTags.includes(tag.name);
            return (
              <button
                key={tag.name}
                className={buildFilterTagClass(isSelected)}
                onClick={() => handleTagClick(tag.name)}
              >
                {tag.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function buildFilterItemClass(isActive: boolean): string {
  const base = 'filter-item';
  return isActive ? `${base} filter-item--active` : base;
}

function buildFilterTagClass(isSelected: boolean): string {
  const base = 'filter-tag';
  return isSelected ? `${base} filter-tag--selected` : base;
}

function computeTotalSkillCount(categories: Category[]): number {
  return categories.reduce((sum, category) => sum + category.skillCount, 0);
}
