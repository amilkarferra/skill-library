import { useCatalogStore } from '../useCatalogStore';

const REACT_TAG = 'React';
const ANGULAR_TAG = 'Angular';
const TYPESCRIPT_TAG = 'TypeScript';

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
    it('should update sort to downloads', () => {
      useCatalogStore.getState().setSelectedSort('downloads');
      expect(useCatalogStore.getState().selectedSort).toBe('downloads');
    });

    it('should update sort to newest', () => {
      useCatalogStore.setState({ selectedSort: 'downloads' });
      useCatalogStore.getState().setSelectedSort('newest');
      expect(useCatalogStore.getState().selectedSort).toBe('newest');
    });
  });

  describe('setCategories', () => {
    it('should update categories list', () => {
      const categories = [
        { id: 1, name: 'Development' },
        { id: 2, name: 'DevOps' },
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
