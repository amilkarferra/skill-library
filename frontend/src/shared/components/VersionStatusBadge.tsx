import './StatusBadge.css';
import type { SkillVersion } from '../models/SkillVersion';

interface VersionStatusBadgeProps {
  status: SkillVersion['status'];
}

const VERSION_STATUS_LABELS: Record<SkillVersion['status'], string> = {
  published: 'PUBLISHED',
  pending_review: 'PENDING',
  rejected: 'REJECTED',
};

const VERSION_STATUS_CSS_CLASSES: Record<SkillVersion['status'], string> = {
  published: 'status-badge--active',
  pending_review: 'status-badge--pending',
  rejected: 'status-badge--inactive',
};

export function VersionStatusBadge({ status }: VersionStatusBadgeProps) {
  const statusLabel = VERSION_STATUS_LABELS[status];
  const statusClass = VERSION_STATUS_CSS_CLASSES[status];

  return (
    <span className={`status-badge ${statusClass}`}>{statusLabel}</span>
  );
}
