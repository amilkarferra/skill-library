import { useState, useCallback } from 'react';
import { ConfirmDialog } from '../../shared/components/ConfirmDialog';
import { deactivateAccount } from './settings.service';
import { useAuth } from '../auth/useAuth';
import './DangerZoneSection.css';

export function DangerZoneSection() {
  const { signOut } = useAuth();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deactivateError, setDeactivateError] = useState<string | null>(null);

  const handleOpenConfirm = useCallback(() => {
    setIsConfirmOpen(true);
  }, []);

  const handleCloseConfirm = useCallback(() => {
    setIsConfirmOpen(false);
  }, []);

  const handleDeactivate = useCallback(async () => {
    setDeactivateError(null);
    try {
      await deactivateAccount();
      setIsConfirmOpen(false);
      await signOut();
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to deactivate account';
      setDeactivateError(errorMessage);
      setIsConfirmOpen(false);
    }
  }, [signOut]);

  return (
    <div className="danger-zone-section">
      <h3 className="danger-zone-title">Danger Zone</h3>
      <p className="danger-zone-warning">
        Deactivating your account will hide your profile and all your skills.
        This action can be reversed by contacting support.
      </p>

      {deactivateError && (
        <div className="danger-zone-error">{deactivateError}</div>
      )}

      <button
        className="danger-zone-button"
        onClick={handleOpenConfirm}
      >
        Deactivate Account
      </button>

      {isConfirmOpen && (
        <ConfirmDialog
          title="Deactivate Account"
          message="Are you sure you want to deactivate your account? Your skills will no longer be visible."
          confirmLabel="Deactivate"
          isDangerous={true}
          onConfirm={handleDeactivate}
          onCancel={handleCloseConfirm}
        />
      )}
    </div>
  );
}
