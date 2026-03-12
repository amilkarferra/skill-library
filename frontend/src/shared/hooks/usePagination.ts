import { useState, useCallback, useMemo } from 'react';
import type { PaginationState } from '../models/PaginationState';

const DEFAULT_PAGE_SIZE = 20;

export function usePagination(initialPageSize: number = DEFAULT_PAGE_SIZE): PaginationState {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(initialPageSize);
  const [totalCount, setTotalCount] = useState(0);

  const totalPages = useMemo(() => {
    const hasNoItems = totalCount === 0;
    if (hasNoItems) return 1;
    return Math.ceil(totalCount / pageSize);
  }, [totalCount, pageSize]);

  const goToPage = useCallback((page: number) => {
    const isValidPage = page >= 1 && page <= totalPages;
    if (isValidPage) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  const resetToFirstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  return {
    currentPage,
    pageSize,
    totalCount,
    totalPages,
    goToPage,
    setTotalCount,
    resetToFirstPage,
  };
}
