import { useCallback } from 'react';
import { Button } from './Button';
import './ConfirmDialog.css';

interface ConfirmDialogProps {
  readonly title: string;
  readonly message: string;
  readonly confirmLabel: string;
  readonly isDangerous?: boolean;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel,
  isDangerous = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const handleOverlayClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const isOverlayTarget = event.target === event.currentTarget;
      if (isOverlayTarget) onCancel();
    },
    [onCancel]
  );

  const confirmVariant = isDangerous ? 'danger' : 'primary';

  return (
    <div className="confirm-dialog-overlay" onClick={handleOverlayClick}>
      <div className="confirm-dialog">
        <h3 className="confirm-dialog-title">{title}</h3>
        <p className="confirm-dialog-message">{message}</p>
        <div className="confirm-dialog-actions">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant={confirmVariant} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
