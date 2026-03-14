import { useCallback } from 'react';
import type { Category } from '../../shared/models/Category';
import type { Tag } from '../../shared/models/Tag';
import type { SkillFilters } from '../../shared/models/SkillFilters';
import { QuickPublishDropzone } from '../../shared/components/QuickPublishDropzone';
import styles from './FilterSidebar.module.css';

interface FilterSidebarProps {
  categories: Category[];
  popularTags: Tag[];
  selectedCategory: string;
  selectedTags: string[];
  selectedSort: SkillFilters['sort'];
  hasActiveFilters: boolean;
  onCategoryChange: (categorySlug: string) => void;
  onTagToggle: (tagName: string) => void;
  onSortChange: (sort: SkillFilters['sort']) => void;
  onClearFilters: () => void;
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
  hasActiveFilters,
  onCategoryChange,
  onTagToggle,
  onSortChange,
  onClearFilters,
}: Readonly<FilterSidebarProps>) {
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
    <div className={styles.sidebar}>
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>Categories</span>
          <button
            className={styles.clearButton}
            onClick={onClearFilters}
            disabled={!hasActiveFilters}
          >
            Clear filters
          </button>
        </div>
        <button
          className={buildFilterItemClass(!selectedCategory, styles)}
          onClick={() => handleCategoryClick('')}
        >
          {'All'}
          <span className={styles.itemCount}>{computeTotalSkillCount(categories)}</span>
        </button>
        {categories.map((category) => {
          const isActive = category.slug === selectedCategory;
          return (
            <button
              key={category.id}
              className={buildFilterItemClass(isActive, styles)}
              onClick={() => handleCategoryClick(category.slug)}
            >
              {category.name}
              <span className={styles.itemCount}>{category.skillCount}</span>
            </button>
          );
        })}
      </div>

      <div className={styles.section}>
        <span className={styles.sectionLabel}>Sort by</span>
        {SORT_OPTIONS.map((option) => {
          const isActive = option.value === selectedSort;
          return (
            <button
              key={option.value}
              className={buildFilterItemClass(isActive, styles)}
              onClick={() => handleSortClick(option.value)}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <div className={styles.section}>
        <span className={styles.sectionLabel}>Popular tags</span>
        <div className={styles.tags}>
          {popularTags.map((tag) => {
            const isSelected = selectedTags.includes(tag.name);
            return (
              <button
                key={tag.name}
                className={buildFilterTagClass(isSelected, styles)}
                onClick={() => handleTagClick(tag.name)}
              >
                {tag.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.section}>
        <QuickPublishDropzone />
      </div>
    </div>
  );
}

function buildFilterItemClass(
  isActive: boolean,
  styles: Record<string, string>
): string {
  const base = styles.item;
  return isActive ? `${base} ${styles.itemActive}` : base;
}

function buildFilterTagClass(
  isSelected: boolean,
  styles: Record<string, string>
): string {
  const base = styles.tag;
  return isSelected ? `${base} ${styles.tagSelected}` : base;
}

function computeTotalSkillCount(categories: Category[]): number {
  return categories.reduce((sum, category) => sum + category.skillCount, 0);
}
