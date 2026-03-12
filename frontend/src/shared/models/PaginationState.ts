export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  goToPage: (page: number) => void;
  setTotalCount: (count: number) => void;
  resetToFirstPage: () => void;
}
