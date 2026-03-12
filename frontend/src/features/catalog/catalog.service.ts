import { get } from '../../shared/services/api.client';
import type { PaginatedResponse } from '../../shared/models/PaginatedResponse';
import type { Skill } from '../../shared/models/Skill';
import type { Category } from '../../shared/models/Category';
import type { Tag } from '../../shared/models/Tag';
import type { SkillFilters } from '../../shared/models/SkillFilters';

export function fetchSkills(
  filters: Partial<SkillFilters>
): Promise<PaginatedResponse<Skill>> {
  const params = new URLSearchParams();

  const hasSearchQuery = !!filters.searchQuery;
  if (hasSearchQuery) params.set('searchQuery', filters.searchQuery!);

  const hasCategoryFilter = !!filters.category;
  if (hasCategoryFilter) params.set('category', filters.category!);

  const hasTagFilters = !!filters.tags && filters.tags.length > 0;
  if (hasTagFilters) {
    filters.tags!.forEach(tag => params.append('tags', tag));
  }

  const hasAuthorFilter = !!filters.author;
  if (hasAuthorFilter) params.set('author', filters.author!);

  const hasSortOption = !!filters.sort;
  if (hasSortOption) params.set('sort', filters.sort!);

  const hasPageParam = !!filters.page;
  if (hasPageParam) params.set('page', String(filters.page));

  const hasPageSizeParam = !!filters.pageSize;
  if (hasPageSizeParam) params.set('pageSize', String(filters.pageSize));

  return get<PaginatedResponse<Skill>>(`/skills?${params.toString()}`);
}

export function fetchCategories(): Promise<Category[]> {
  return get<Category[]>('/categories');
}

export function fetchPopularTags(): Promise<Tag[]> {
  return get<Tag[]>('/tags/popular');
}
