import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Pagination } from '../Pagination';

const TOTAL_PAGES_SMALL = 5;
const TOTAL_PAGES_LARGE = 20;

describe('Pagination', () => {
  it('should return null when totalPages is 1', () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={1} onPageChange={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render all page numbers when totalPages is 7 or less', () => {
    render(
      <Pagination currentPage={1} totalPages={TOTAL_PAGES_SMALL} onPageChange={vi.fn()} />
    );

    for (let page = 1; page <= TOTAL_PAGES_SMALL; page++) {
      expect(screen.getByRole('button', { name: String(page) })).toBeInTheDocument();
    }
  });

  it('should show ellipsis for large page counts', () => {
    render(
      <Pagination currentPage={10} totalPages={TOTAL_PAGES_LARGE} onPageChange={vi.fn()} />
    );
    const ellipses = screen.getAllByText('...');
    expect(ellipses.length).toBeGreaterThanOrEqual(1);
  });

  it('should disable previous button on first page', () => {
    render(
      <Pagination currentPage={1} totalPages={TOTAL_PAGES_SMALL} onPageChange={vi.fn()} />
    );
    const buttons = screen.getAllByRole('button');
    const previousButton = buttons[0];
    expect(previousButton).toBeDisabled();
  });

  it('should disable next button on last page', () => {
    render(
      <Pagination
        currentPage={TOTAL_PAGES_SMALL}
        totalPages={TOTAL_PAGES_SMALL}
        onPageChange={vi.fn()}
      />
    );
    const buttons = screen.getAllByRole('button');
    const nextButton = buttons[buttons.length - 1];
    expect(nextButton).toBeDisabled();
  });

  it('should call onPageChange with previous page when clicking previous', async () => {
    const handlePageChange = vi.fn();
    const user = userEvent.setup();
    const currentPage = 3;

    render(
      <Pagination
        currentPage={currentPage}
        totalPages={TOTAL_PAGES_SMALL}
        onPageChange={handlePageChange}
      />
    );

    const buttons = screen.getAllByRole('button');
    const previousButton = buttons[0];
    await user.click(previousButton);

    const expectedPreviousPage = currentPage - 1;
    expect(handlePageChange).toHaveBeenCalledWith(expectedPreviousPage);
  });

  it('should call onPageChange with next page when clicking next', async () => {
    const handlePageChange = vi.fn();
    const user = userEvent.setup();
    const currentPage = 3;

    render(
      <Pagination
        currentPage={currentPage}
        totalPages={TOTAL_PAGES_SMALL}
        onPageChange={handlePageChange}
      />
    );

    const buttons = screen.getAllByRole('button');
    const nextButton = buttons[buttons.length - 1];
    await user.click(nextButton);

    const expectedNextPage = currentPage + 1;
    expect(handlePageChange).toHaveBeenCalledWith(expectedNextPage);
  });

  it('should call onPageChange when clicking a page number', async () => {
    const handlePageChange = vi.fn();
    const user = userEvent.setup();
    const targetPage = 3;

    render(
      <Pagination currentPage={1} totalPages={TOTAL_PAGES_SMALL} onPageChange={handlePageChange} />
    );

    await user.click(screen.getByRole('button', { name: String(targetPage) }));
    expect(handlePageChange).toHaveBeenCalledWith(targetPage);
  });

  it('should highlight current page with active class', () => {
    const currentPage = 3;
    render(
      <Pagination currentPage={currentPage} totalPages={TOTAL_PAGES_SMALL} onPageChange={vi.fn()} />
    );

    const activeButton = screen.getByRole('button', { name: String(currentPage) });
    expect(activeButton.className).toContain('pagination-page--active');
  });

  it('should show pages near start correctly', () => {
    render(
      <Pagination currentPage={2} totalPages={TOTAL_PAGES_LARGE} onPageChange={vi.fn()} />
    );

    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '3' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '4' })).toBeInTheDocument();
  });

  it('should show pages near end correctly', () => {
    const lastPage = TOTAL_PAGES_LARGE;
    render(
      <Pagination currentPage={lastPage - 1} totalPages={lastPage} onPageChange={vi.fn()} />
    );

    expect(screen.getByRole('button', { name: String(lastPage) })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: String(lastPage - 1) })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: String(lastPage - 2) })).toBeInTheDocument();
  });
});
