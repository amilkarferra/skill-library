import { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Pagination.css';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function buildPageNumbers(currentPage: number, totalPages: number): (number | '...')[] {
  const pages: (number | '...')[] = [];
  const shouldShowAllPages = totalPages <= 7;

  if (shouldShowAllPages) {
    for (let pageIndex = 1; pageIndex <= totalPages; pageIndex++) {
      pages.push(pageIndex);
    }
    return pages;
  }

  pages.push(1);

  const isNearStart = currentPage <= 3;
  if (isNearStart) {
    pages.push(2, 3, 4, '...', totalPages);
    return pages;
  }

  const isNearEnd = currentPage >= totalPages - 2;
  if (isNearEnd) {
    pages.push('...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    return pages;
  }

  pages.push('...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
  return pages;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const pageNumbers = useMemo(
    () => buildPageNumbers(currentPage, totalPages),
    [currentPage, totalPages]
  );

  const hasSinglePage = totalPages <= 1;
  if (hasSinglePage) return null;

  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  return (
    <div className="pagination">
      <button
        className="pagination-arrow"
        disabled={isFirstPage}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeft size={16} />
      </button>
      {pageNumbers.map((pageNumber, index) => {
        const isEllipsis = pageNumber === '...';
        if (isEllipsis) {
          return <span key={`ellipsis-${index}`} className="pagination-ellipsis">...</span>;
        }
        const isActivePage = pageNumber === currentPage;
        return (
          <button
            key={pageNumber}
            className={`pagination-page ${isActivePage ? 'pagination-page--active' : ''}`}
            onClick={() => onPageChange(pageNumber as number)}
          >
            {pageNumber}
          </button>
        );
      })}
      <button
        className="pagination-arrow"
        disabled={isLastPage}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
