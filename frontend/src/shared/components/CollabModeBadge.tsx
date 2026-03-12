import './CollabModeBadge.css';

interface CollabModeBadgeProps {
  collaborationMode: 'closed' | 'open';
}

export function CollabModeBadge({ collaborationMode }: CollabModeBadgeProps) {
  const isOpenMode = collaborationMode === 'open';
  const label = isOpenMode ? 'OPEN' : 'CLOSED';
  const modeClass = isOpenMode ? 'collab-badge--open' : 'collab-badge--closed';

  return (
    <span className={`collab-badge ${modeClass}`}>{label}</span>
  );
}
