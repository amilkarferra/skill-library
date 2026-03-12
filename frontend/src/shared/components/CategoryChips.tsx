import { useCallback } from 'react';
import type { Category } from '../models/Category';
import './CategoryChips.css';

interface CategoryChipsProps {
  readonly categories: readonly Category[];
  readonly selectedCategoryId: number | null;
  readonly onSelectCategory: (categoryId: number) => void;
}

interface CategoryChipItemProps {
  readonly category: Category;
  readonly isSelected: boolean;
  readonly onSelect: (categoryId: number) => void;
}

function CategoryChipItem({ category, isSelected, onSelect }: CategoryChipItemProps) {
  const chipClassName = isSelected
    ? 'category-chip category-chip--selected'
    : 'category-chip';

  const handleClick = useCallback(() => {
    onSelect(category.id);
  }, [onSelect, category.id]);

  return (
    <button
      key={category.id}
      className={chipClassName}
      onClick={handleClick}
      type="button"
    >
      {category.name}
    </button>
  );
}

export function CategoryChips({
  categories,
  selectedCategoryId,
  onSelectCategory,
}: CategoryChipsProps) {
  return (
    <div className="category-chips">
      {categories.map((category) => {
        const isSelected = category.id === selectedCategoryId;

        return (
          <CategoryChipItem
            key={category.id}
            category={category}
            isSelected={isSelected}
            onSelect={onSelectCategory}
          />
        );
      })}
    </div>
  );
}
