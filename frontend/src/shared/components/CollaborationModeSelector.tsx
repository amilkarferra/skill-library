import { useCallback } from 'react';
import { Lock, Users } from 'lucide-react';
import './CollaborationModeSelector.css';

interface CollaborationModeSelectorProps {
  readonly selectedMode: 'closed' | 'open';
  readonly onSelectMode: (mode: 'closed' | 'open') => void;
}

const CLOSED_HINT = 'Only you and invited collaborators can contribute';
const OPEN_HINT = 'Anyone can request to collaborate and propose versions';

export function CollaborationModeSelector({
  selectedMode,
  onSelectMode,
}: CollaborationModeSelectorProps) {
  const handleSelectClosed = useCallback(() => {
    onSelectMode('closed');
  }, [onSelectMode]);

  const handleSelectOpen = useCallback(() => {
    onSelectMode('open');
  }, [onSelectMode]);

  const isClosedSelected = selectedMode === 'closed';

  const closedChipClass = buildChipClassName(isClosedSelected, 'closed');
  const openChipClass = buildChipClassName(!isClosedSelected, 'open');

  const hintText = isClosedSelected ? CLOSED_HINT : OPEN_HINT;

  return (
    <div className="collab-mode-selector">
      <div className="collab-mode-selector-options">
        <button
          type="button"
          className={closedChipClass}
          onClick={handleSelectClosed}
        >
          <Lock size={14} />
          Closed
        </button>
        <button
          type="button"
          className={openChipClass}
          onClick={handleSelectOpen}
        >
          <Users size={14} />
          Open
        </button>
      </div>
      <span className="collab-mode-hint">{hintText}</span>
    </div>
  );
}

function buildChipClassName(
  isSelected: boolean,
  mode: 'closed' | 'open'
): string {
  const base = 'collab-mode-chip';
  if (!isSelected) return base;
  return `${base} collab-mode-chip--${mode}-selected`;
}
