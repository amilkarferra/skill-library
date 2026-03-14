import { render, screen } from '@testing-library/react';
import { CollabModeBadge } from '../CollabModeBadge';

describe('CollabModeBadge', () => {
  it('should display OPEN for open collaboration mode', () => {
    render(<CollabModeBadge collaborationMode="open" />);
    expect(screen.getByText('OPEN')).toBeInTheDocument();
  });

  it('should display CLOSED for closed collaboration mode', () => {
    render(<CollabModeBadge collaborationMode="closed" />);
    expect(screen.getByText('CLOSED')).toBeInTheDocument();
  });

  it('should apply open class for open mode', () => {
    render(<CollabModeBadge collaborationMode="open" />);
    const badge = screen.getByText('OPEN');
    expect(badge.className).toContain('collab-badge--open');
  });

  it('should apply closed class for closed mode', () => {
    render(<CollabModeBadge collaborationMode="closed" />);
    const badge = screen.getByText('CLOSED');
    expect(badge.className).toContain('collab-badge--closed');
  });
});
