export interface SkillFilters {
  searchQuery: string;
  category: string;
  tags: string[];
  author: string;
  sort: 'newest' | 'most_likes' | 'most_downloads' | 'name_asc';
  page: number;
  pageSize: number;
}
