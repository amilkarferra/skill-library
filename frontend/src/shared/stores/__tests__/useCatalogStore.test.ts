import { useCatalogStore } from '../useCatalogStore';

const REACT_TAG = 'React';
const ANGULAR_TAG = 'Angular';
const TYPESCRIPT_TAG = 'TypeScript';
const MOST_DOWNLOADS_SORT = 'most_downloads' as const;

describe('useCatalogStore', () => {
  beforeEach(() => {
    useCatalogStore.setState({
      searchQuery: '',
      selectedCategory: '',
      selectedTags: [],
      selectedAuthor: '',
      selectedSort: 'newest',
      categories: [],
      popularTags: [],
      isSidebarDataLoaded: false,
    });
  });

  describe('setSearchQuery', () => {
    it('should update the search query', () => {
      useCatalogStore.getState().setSearchQuery('react hooks');
      expect(useCatalogStore.getState().searchQuery).toBe('react hooks');
    });
  });

  describe('toggleSelectedTag', () => {
    it('should add tag when not already selected', () => {
      useCatalogStore.getState().toggleSelectedTag(REACT_TAG);
      expect(useCatalogStore.getState().selectedTags).toEqual([REACT_TAG]);
    });

    it('should remove tag when already selected', () => {
      useCatalogStore.setState({ selectedTags: [REACT_TAG, ANGULAR_TAG] });
      useCatalogStore.getState().toggleSelectedTag(REACT_TAG);
      expect(useCatalogStore.getState().selectedTags).toEqual([ANGULAR_TAG]);
    });

    it('should add multiple tags sequentially', () => {
      useCatalogStore.getState().toggleSelectedTag(REACT_TAG);
      useCatalogStore.getState().toggleSelectedTag(ANGULAR_TAG);
      useCatalogStore.getState().toggleSelectedTag(TYPESCRIPT_TAG);
      expect(useCatalogStore.getState().selectedTags).toEqual([
        REACT_TAG,
        ANGULAR_TAG,
        TYPESCRIPT_TAG,
      ]);
    });

    it('should toggle same tag back to empty', () => {
      useCatalogStore.getState().toggleSelectedTag(REACT_TAG);
      useCatalogStore.getState().toggleSelectedTag(REACT_TAG);
      expect(useCatalogStore.getState().selectedTags).toEqual([]);
    });
  });

  describe('setSelectedSort', () => {
    it('should update sort to most_downloads', () => {
      useCatalogStore.getState().setSelectedSort(MOST_DOWNLOADS_SORT);
      expect(useCatalogStore.getState().selectedSort).toBe(MOST_DOWNLOADS_SORT);
    });

    it('should update sort to newest', () => {
      useCatalogStore.setState({ selectedSort: MOST_DOWNLOADS_SORT });
      useCatalogStore.getState().setSelectedSort('newest');
      expect(useCatalogStore.getState().selectedSort).toBe('newest');
    });
  });

  describe('setCategories', () => {
    it('should update categories list', () => {
      const categories = [
        { id: 1, name: 'Development', slug: 'development', skillCount: 5 },
        { id: 2, name: 'DevOps', slug: 'devops', skillCount: 3 },
      ];
      useCatalogStore.getState().setCategories(categories);
      expect(useCatalogStore.getState().categories).toEqual(categories);
    });
  });

  describe('setIsSidebarDataLoaded', () => {
    it('should set sidebar loaded flag', () => {
      useCatalogStore.getState().setIsSidebarDataLoaded(true);
      expect(useCatalogStore.getState().isSidebarDataLoaded).toBe(true);
    });
  });
});
