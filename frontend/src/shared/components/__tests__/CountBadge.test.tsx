import { render, screen } from '@testing-library/react';
import { CountBadge } from '../CountBadge';

describe('CountBadge', () => {
  it('should return null when count is 0', () => {
    const { container } = render(<CountBadge count={0} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render count when greater than 0', () => {
    render(<CountBadge count={5} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('should apply default variant class', () => {
    render(<CountBadge count={3} />);
    const badge = screen.getByText('3');
    expect(badge.className).toContain('count-badge');
    expect(badge.className).not.toContain('count-badge--warning');
  });

  it('should apply warning variant class', () => {
    render(<CountBadge count={3} variant="warning" />);
    const badge = screen.getByText('3');
    expect(badge.className).toContain('count-badge--warning');
  });

  it('should render large numbers', () => {
    const largeCount = 999;
    render(<CountBadge count={largeCount} />);
    expect(screen.getByText('999')).toBeInTheDocument();
  });
});
