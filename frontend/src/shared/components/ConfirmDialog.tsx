import { useCallback } from 'react';
import './ConfirmDialog.css';

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel: string;
  isDangerous?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
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

  const confirmButtonClass = isDangerous
    ? 'confirm-dialog-button confirm-dialog-button--danger'
    : 'confirm-dialog-button confirm-dialog-button--primary';

  return (
    <div className="confirm-dialog-overlay" onClick={handleOverlayClick}>
      <div className="confirm-dialog">
        <h3 className="confirm-dialog-title">{title}</h3>
        <p className="confirm-dialog-message">{message}</p>
        <div className="confirm-dialog-actions">
          <button className="confirm-dialog-button confirm-dialog-button--cancel" onClick={onCancel}>
            Cancel
          </button>
          <button className={confirmButtonClass} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
