import { render, screen } from '@testing-library/react';
import { VersionStatusBadge } from '../VersionStatusBadge';

describe('VersionStatusBadge', () => {
  it('should display PUBLISHED for published status', () => {
    render(<VersionStatusBadge status="published" />);
    expect(screen.getByText('PUBLISHED')).toBeInTheDocument();
  });

  it('should display PENDING for pending_review status', () => {
    render(<VersionStatusBadge status="pending_review" />);
    expect(screen.getByText('PENDING')).toBeInTheDocument();
  });

  it('should display REJECTED for rejected status', () => {
    render(<VersionStatusBadge status="rejected" />);
    expect(screen.getByText('REJECTED')).toBeInTheDocument();
  });

  it('should apply active class for published status', () => {
    render(<VersionStatusBadge status="published" />);
    const badge = screen.getByText('PUBLISHED');
    expect(badge.className).toContain('status-badge--active');
  });

  it('should apply pending class for pending_review status', () => {
    render(<VersionStatusBadge status="pending_review" />);
    const badge = screen.getByText('PENDING');
    expect(badge.className).toContain('status-badge--pending');
  });

  it('should apply inactive class for rejected status', () => {
    render(<VersionStatusBadge status="rejected" />);
    const badge = screen.getByText('REJECTED');
    expect(badge.className).toContain('status-badge--inactive');
  });
});
