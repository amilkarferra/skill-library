import { renderHook, act } from '@testing-library/react';
import { usePagination } from '../usePagination';

const DEFAULT_PAGE_SIZE = 20;
const CUSTOM_PAGE_SIZE = 10;
const TOTAL_ITEMS_FOR_THREE_PAGES = 50;
const TOTAL_ITEMS_FOR_FIVE_PAGES = 100;

describe('usePagination', () => {
  it('should initialize with page 1 and default page size', () => {
    const { result } = renderHook(() => usePagination());

    expect(result.current.currentPage).toBe(1);
    expect(result.current.pageSize).toBe(DEFAULT_PAGE_SIZE);
    expect(result.current.totalCount).toBe(0);
    expect(result.current.totalPages).toBe(1);
  });

  it('should accept custom page size', () => {
    const { result } = renderHook(() => usePagination(CUSTOM_PAGE_SIZE));
    expect(result.current.pageSize).toBe(CUSTOM_PAGE_SIZE);
  });

  it('should calculate totalPages correctly', () => {
    const { result } = renderHook(() => usePagination(DEFAULT_PAGE_SIZE));

    act(() => {
      result.current.setTotalCount(TOTAL_ITEMS_FOR_THREE_PAGES);
    });

    expect(result.current.totalPages).toBe(3);
  });

  it('should round up totalPages for partial pages', () => {
    const { result } = renderHook(() => usePagination(DEFAULT_PAGE_SIZE));

    const itemCountWithPartialPage = 21;
    act(() => {
      result.current.setTotalCount(itemCountWithPartialPage);
    });

    expect(result.current.totalPages).toBe(2);
  });

  it('should navigate to valid page', () => {
    const { result } = renderHook(() => usePagination(DEFAULT_PAGE_SIZE));

    act(() => {
      result.current.setTotalCount(TOTAL_ITEMS_FOR_FIVE_PAGES);
    });

    act(() => {
      result.current.goToPage(3);
    });

    expect(result.current.currentPage).toBe(3);
  });

  it('should not navigate to page 0', () => {
    const { result } = renderHook(() => usePagination(DEFAULT_PAGE_SIZE));

    act(() => {
      result.current.setTotalCount(TOTAL_ITEMS_FOR_FIVE_PAGES);
    });

    act(() => {
      result.current.goToPage(0);
    });

    expect(result.current.currentPage).toBe(1);
  });

  it('should not navigate beyond total pages', () => {
    const { result } = renderHook(() => usePagination(DEFAULT_PAGE_SIZE));

    act(() => {
      result.current.setTotalCount(TOTAL_ITEMS_FOR_THREE_PAGES);
    });

    act(() => {
      result.current.goToPage(4);
    });

    expect(result.current.currentPage).toBe(1);
  });

  it('should reset to first page', () => {
    const { result } = renderHook(() => usePagination(DEFAULT_PAGE_SIZE));

    act(() => {
      result.current.setTotalCount(TOTAL_ITEMS_FOR_FIVE_PAGES);
    });

    act(() => {
      result.current.goToPage(3);
    });

    act(() => {
      result.current.resetToFirstPage();
    });

    expect(result.current.currentPage).toBe(1);
  });

  it('should return 1 totalPages when totalCount is 0', () => {
    const { result } = renderHook(() => usePagination(DEFAULT_PAGE_SIZE));
    expect(result.current.totalPages).toBe(1);
  });
});
