import { render, screen } from '@testing-library/react';
import { EmptyState } from '../EmptyState';

const EMPTY_TITLE = 'No skills found';
const EMPTY_DESCRIPTION = 'Try adjusting your search filters.';

describe('EmptyState', () => {
  it('should render title', () => {
    render(<EmptyState title={EMPTY_TITLE} description={EMPTY_DESCRIPTION} />);
    expect(screen.getByText(EMPTY_TITLE)).toBeInTheDocument();
  });

  it('should render description', () => {
    render(<EmptyState title={EMPTY_TITLE} description={EMPTY_DESCRIPTION} />);
    expect(screen.getByText(EMPTY_DESCRIPTION)).toBeInTheDocument();
  });

  it('should apply correct CSS classes', () => {
    const { container } = render(
      <EmptyState title={EMPTY_TITLE} description={EMPTY_DESCRIPTION} />
    );
    expect(container.querySelector('.empty-state')).toBeInTheDocument();
    expect(container.querySelector('.empty-state-title')).toBeInTheDocument();
    expect(container.querySelector('.empty-state-description')).toBeInTheDocument();
  });
});
