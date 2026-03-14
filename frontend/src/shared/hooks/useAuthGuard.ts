import { useState, useCallback } from 'react';
import { useAuth } from '../../features/auth/useAuth';
import { useAuthStore } from '../stores/useAuthStore';
import { useConfirmDialog } from './useConfirmDialog';

export interface AuthGuardDialogState {
  readonly isOpen: boolean;
  readonly title: string;
  readonly message: string;
  readonly confirmLabel: string;
  readonly isDangerous: boolean;
  readonly onConfirm: () => void;
}

interface AuthGuardConfig {
  readonly message: string;
  readonly onAuthenticated: () => void | Promise<void>;
}

interface AuthGuardResult {
  readonly guardWithLogin: (config: AuthGuardConfig) => () => void;
  readonly loginDialogState: AuthGuardDialogState;
  readonly closeLoginDialog: () => void;
  readonly isAuthActionInProgress: boolean;
}

const LOGIN_DIALOG_TITLE = 'Sign in required';
const LOGIN_DIALOG_CONFIRM_LABEL = 'Sign in';

export function useAuthGuard(): AuthGuardResult {
  const { isAuthenticated } = useAuthStore();
  const { signIn } = useAuth();
  const {
    dialogState: loginDialogState,
    openDialog: openLoginDialog,
    closeDialog: closeLoginDialog,
  } = useConfirmDialog();
  const [isAuthActionInProgress, setIsAuthActionInProgress] = useState(false);

  const signInThenExecute = useCallback(
    async (onAuthenticated: () => void | Promise<void>) => {
      setIsAuthActionInProgress(true);
      try {
        await signIn();

        const isNowAuthenticated = useAuthStore.getState().isAuthenticated;
        if (isNowAuthenticated) {
          await onAuthenticated();
        }
      } finally {
        setIsAuthActionInProgress(false);
      }
    },
    [signIn],
  );

  const guardWithLogin = useCallback(
    (config: AuthGuardConfig): (() => void) => {
      return () => {
        if (isAuthenticated) {
          void config.onAuthenticated();
          return;
        }

        openLoginDialog({
          title: LOGIN_DIALOG_TITLE,
          message: config.message,
          confirmLabel: LOGIN_DIALOG_CONFIRM_LABEL,
          isDangerous: false,
          onConfirm: () => {
            closeLoginDialog();
            void signInThenExecute(config.onAuthenticated);
          },
        });
      };
    },
    [isAuthenticated, openLoginDialog, closeLoginDialog, signInThenExecute],
  );

  return {
    guardWithLogin,
    loginDialogState,
    closeLoginDialog,
    isAuthActionInProgress,
  };
}
