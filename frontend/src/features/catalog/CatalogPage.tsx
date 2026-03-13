import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Skill } from '../../shared/models/Skill';
import type { SkillFilters } from '../../shared/models/SkillFilters';
import { useDebounce } from '../../shared/hooks/useDebounce';
import { usePagination } from '../../shared/hooks/usePagination';
import { useCatalogStore } from '../../shared/stores/useCatalogStore';
import { useLikeStore } from '../../shared/stores/useLikeStore';
import { Pagination } from '../../shared/components/Pagination';
import { EmptyState } from '../../shared/components/EmptyState';
import { SearchBar } from './SearchBar';
import { FilterSidebar } from './FilterSidebar';
import { SkillRow } from './SkillRow';
import { SkillRowExpanded } from './SkillRowExpanded';
import { SkillRowSkeletonList } from './SkillRowSkeleton';
import {
  fetchSkills,
  fetchCategories,
  fetchPopularTags,
} from './catalog.service';
import { SidebarLayout } from '../../shared/components/SidebarLayout';
import './CatalogPage.css';

const DEBOUNCE_DELAY_MS = 350;
const PAGE_SIZE = 20;

export function CatalogPage() {
  const {
    searchQuery,
    selectedCategory,
    selectedTags,
    selectedAuthor,
    selectedSort,
    categories,
    popularTags,
    isSidebarDataLoaded,
    setSearchQuery,
    setSelectedCategory,
    toggleSelectedTag,
    setSelectedAuthor,
    setSelectedSort,
    setCategories,
    setPopularTags,
    setIsSidebarDataLoaded,
  } = useCatalogStore();

  const [searchParams, setSearchParams] = useSearchParams();
  const { lastLikeUpdate } = useLikeStore();

  const [skills, setSkills] = useState<Skill[]>([]);
  const [expandedSkillId, setExpandedSkillId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const debouncedQuery = useDebounce(searchQuery, DEBOUNCE_DELAY_MS);
  const pagination = usePagination(PAGE_SIZE);
  const {
    currentPage,
    pageSize,
    totalCount,
    totalPages,
    goToPage,
    setTotalCount: setSkillsTotalCount,
    resetToFirstPage,
  } = pagination;

  useEffect(() => {
    const authorFromUrl = searchParams.get('author') || '';
    const isAuthorChanged = authorFromUrl !== selectedAuthor;
    if (isAuthorChanged) {
      setSelectedAuthor(authorFromUrl);
    }
  }, [searchParams, selectedAuthor, setSelectedAuthor]);

  const loadSkills = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    const filters: Partial<SkillFilters> = {
      searchQuery: debouncedQuery || undefined,
      category: selectedCategory || undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      author: selectedAuthor || undefined,
      sort: selectedSort,
      page: currentPage,
      pageSize: pageSize,
    };

    try {
      const skillsPage = await fetchSkills(filters);
      setSkills(skillsPage.items);
      setSkillsTotalCount(skillsPage.totalCount);
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to load skills';
      setLoadError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [
    debouncedQuery,
    selectedCategory,
    selectedTags,
    selectedAuthor,
    selectedSort,
    currentPage,
    pageSize,
    setSkillsTotalCount,
  ]);

  const loadSidebarData = useCallback(async () => {
    if (isSidebarDataLoaded) return;

    try {
      const [fetchedCategories, fetchedTags] = await Promise.all([
        fetchCategories(),
        fetchPopularTags(),
      ]);
      setCategories(fetchedCategories);
      setPopularTags(fetchedTags);
      setIsSidebarDataLoaded(true);
    } catch {
      void 0;
    }
  }, [isSidebarDataLoaded, setCategories, setPopularTags, setIsSidebarDataLoaded]);

  useEffect(() => {
    loadSidebarData();
  }, [loadSidebarData]);

  useEffect(() => {
    loadSkills();
  }, [loadSkills]);

  useEffect(() => {
    const hasNoUpdate = lastLikeUpdate === null;
    if (hasNoUpdate) return;

    setSkills((previous) =>
      previous.map((existingSkill) => {
        const isTargetSkill = existingSkill.id === lastLikeUpdate.skillId;
        if (!isTargetSkill) return existingSkill;
        return {
          ...existingSkill,
          isLikedByMe: lastLikeUpdate.isLiked,
          totalLikes: lastLikeUpdate.totalLikes,
        };
      })
    );
  }, [lastLikeUpdate]);

  const handleCategoryChange = useCallback(
    (categorySlug: string) => {
      setSelectedCategory(categorySlug);
      resetToFirstPage();
    },
    [setSelectedCategory, resetToFirstPage]
  );

  const handleTagToggle = useCallback(
    (tagName: string) => {
      toggleSelectedTag(tagName);
      resetToFirstPage();
    },
    [toggleSelectedTag, resetToFirstPage]
  );

  const handleSortChange = useCallback(
    (sort: SkillFilters['sort']) => {
      setSelectedSort(sort);
      resetToFirstPage();
    },
    [setSelectedSort, resetToFirstPage]
  );

  const handleClearAuthor = useCallback(
    () => {
      setSelectedAuthor('');
      setSearchParams({});
      resetToFirstPage();
    },
    [setSelectedAuthor, setSearchParams, resetToFirstPage]
  );

  const handleSearchChange = useCallback(
    (query: string) => {
      setSearchQuery(query);
      resetToFirstPage();
    },
    [setSearchQuery, resetToFirstPage]
  );

  const handleToggleExpand = useCallback(
    (skillId: number) => {
      setExpandedSkillId((prevId) => {
        const isSameSkill = prevId === skillId;
        return isSameSkill ? null : skillId;
      });
    },
    []
  );

  const handlePageChange = useCallback(
    (page: number) => {
      goToPage(page);
      setExpandedSkillId(null);
    },
    [goToPage]
  );

  const handleSkillDeleted = useCallback(
    (skillId: number) => {
      setSkills((previous) =>
        previous.filter((skill) => skill.id !== skillId)
      );
      setExpandedSkillId(null);
    },
    []
  );

  const hasSkills = skills.length > 0;
  const hasError = loadError !== null;
  const hasAuthorFilter = selectedAuthor.length > 0;

  return (
    <SidebarLayout
      sidebar={
        <FilterSidebar
          categories={categories}
          popularTags={popularTags}
          selectedCategory={selectedCategory}
          selectedTags={selectedTags}
          selectedSort={selectedSort}
          onCategoryChange={handleCategoryChange}
          onTagToggle={handleTagToggle}
          onSortChange={handleSortChange}
        />
      }
    >
      <div className="catalog-content">
        <div className="catalog-header">
          <span className="catalog-count">
            {totalCount} skills
          </span>
        </div>
        <div className="catalog-search-row">
          <SearchBar value={searchQuery} onChange={handleSearchChange} />
        </div>
        {hasAuthorFilter && (
          <div className="catalog-active-filter">
            <span className="catalog-active-filter-label">
              Author: @{selectedAuthor}
            </span>
            <button
              className="catalog-active-filter-clear"
              onClick={handleClearAuthor}
            >
              x
            </button>
          </div>
        )}
        {hasError && (
          <div className="catalog-error">{loadError}</div>
        )}
        <div className="catalog-list">
          {isLoading && (
            <SkillRowSkeletonList />
          )}
          {!isLoading && !hasSkills && (
            <EmptyState
              title="No skills found"
              description="Try adjusting your search or filters."
            />
          )}
          {!isLoading && hasSkills && skills.map((skill, index) => {
            const isExpanded = expandedSkillId === skill.id;
            const isAlternate = index % 2 === 1;
            return (
              <div key={skill.id}>
                <SkillRow
                  skill={skill}
                  isExpanded={isExpanded}
                  isAlternate={isAlternate}
                  onToggleExpand={handleToggleExpand}
                />
                {isExpanded && (
                  <SkillRowExpanded
                    skill={skill}
                    onSkillDeleted={handleSkillDeleted}
                  />
                )}
              </div>
            );
          })}
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </SidebarLayout>
  );
}
