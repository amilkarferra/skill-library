import { render, screen } from '@testing-library/react';
import { StatusBadge } from '../StatusBadge';

describe('StatusBadge', () => {
  it('should display ACTIVE when isActive is true', () => {
    render(<StatusBadge isActive={true} />);
    expect(screen.getByText('ACTIVE')).toBeInTheDocument();
  });

  it('should display INACTIVE when isActive is false', () => {
    render(<StatusBadge isActive={false} />);
    expect(screen.getByText('INACTIVE')).toBeInTheDocument();
  });

  it('should apply active class when isActive is true', () => {
    render(<StatusBadge isActive={true} />);
    const badge = screen.getByText('ACTIVE');
    expect(badge.className).toContain('status-badge--active');
  });

  it('should apply inactive class when isActive is false', () => {
    render(<StatusBadge isActive={false} />);
    const badge = screen.getByText('INACTIVE');
    expect(badge.className).toContain('status-badge--inactive');
  });
});
