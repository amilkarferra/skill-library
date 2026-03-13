import { useState, useCallback } from 'react';

interface ConfirmDialogConfig {
  readonly title: string;
  readonly message: string;
  readonly confirmLabel: string;
  readonly isDangerous: boolean;
  readonly onConfirm: () => void;
}

interface ConfirmDialogState extends ConfirmDialogConfig {
  readonly isOpen: boolean;
}

const INITIAL_STATE: ConfirmDialogState = {
  isOpen: false,
  title: '',
  message: '',
  confirmLabel: '',
  isDangerous: false,
  onConfirm: () => undefined,
};

export function useConfirmDialog() {
  const [dialogState, setDialogState] = useState<ConfirmDialogState>(INITIAL_STATE);

  const openDialog = useCallback((config: ConfirmDialogConfig) => {
    setDialogState({ ...config, isOpen: true });
  }, []);

  const closeDialog = useCallback(() => {
    setDialogState(INITIAL_STATE);
  }, []);

  return { dialogState, openDialog, closeDialog } as const;
}