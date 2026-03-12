import './StatusBadge.css';

interface StatusBadgeProps {
  isActive: boolean;
}

export function StatusBadge({ isActive }: StatusBadgeProps) {
  const statusLabel = isActive ? 'ACTIVE' : 'INACTIVE';
  const statusClass = isActive ? 'status-badge--active' : 'status-badge--inactive';

  return (
    <span className={`status-badge ${statusClass}`}>{statusLabel}</span>
  );
}
