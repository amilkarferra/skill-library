import { create } from 'zustand';
import type { Category } from '../models/Category';
import type { Tag } from '../models/Tag';
import type { SkillFilters } from '../models/SkillFilters';

interface CatalogStore {
  searchQuery: string;
  selectedCategory: string;
  selectedTags: string[];
  selectedAuthor: string;
  selectedSort: SkillFilters['sort'];
  categories: Category[];
  popularTags: Tag[];
  isSidebarDataLoaded: boolean;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  toggleSelectedTag: (tagName: string) => void;
  setSelectedAuthor: (author: string) => void;
  setSelectedSort: (sort: SkillFilters['sort']) => void;
  setCategories: (categories: Category[]) => void;
  setPopularTags: (tags: Tag[]) => void;
  setIsSidebarDataLoaded: (isLoaded: boolean) => void;
}

export const useCatalogStore = create<CatalogStore>((set) => ({
  searchQuery: '',
  selectedCategory: '',
  selectedTags: [],
  selectedAuthor: '',
  selectedSort: 'newest',
  categories: [],
  popularTags: [],
  isSidebarDataLoaded: false,
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  toggleSelectedTag: (tagName) =>
    set((state) => {
      const isTagSelected = state.selectedTags.includes(tagName);
      const updatedTags = isTagSelected
        ? state.selectedTags.filter((existingTag) => existingTag !== tagName)
        : [...state.selectedTags, tagName];
      return { selectedTags: updatedTags };
    }),
  setSelectedAuthor: (selectedAuthor) => set({ selectedAuthor }),
  setSelectedSort: (selectedSort) => set({ selectedSort }),
  setCategories: (categories) => set({ categories }),
  setPopularTags: (popularTags) => set({ popularTags }),
  setIsSidebarDataLoaded: (isSidebarDataLoaded) => set({ isSidebarDataLoaded }),
}));
