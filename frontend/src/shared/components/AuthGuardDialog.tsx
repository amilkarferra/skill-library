import { ConfirmDialog } from './ConfirmDialog';
import type { AuthGuardDialogState } from '../hooks/useAuthGuard';

interface AuthGuardDialogProps {
  readonly dialogState: AuthGuardDialogState;
  readonly onClose: () => void;
}

export function AuthGuardDialog({ dialogState, onClose }: AuthGuardDialogProps) {
  if (!dialogState.isOpen) return null;

  return (
    <ConfirmDialog
      title={dialogState.title}
      message={dialogState.message}
      confirmLabel={dialogState.confirmLabel}
      isDangerous={dialogState.isDangerous}
      onConfirm={dialogState.onConfirm}
      onCancel={onClose}
    />
  );
}
