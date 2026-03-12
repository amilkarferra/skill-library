import { useState, useCallback, useEffect } from 'react';
import { useAuthStore } from '../../shared/stores/useAuthStore';
import { updateProfile } from './settings.service';
import { AlertMessage } from '../../shared/components/AlertMessage';
import { FormField } from '../../shared/components/FormField';
import { TextInput } from '../../shared/components/TextInput';
import { Button } from '../../shared/components/Button';
import './ProfileSection.css';

export function ProfileSection() {
  const { user, setUser } = useAuthStore();
  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const hasUser = user !== null;
    if (hasUser) {
      setDisplayName(user.displayName);
    }
  }, [user]);

  const handleDisplayNameChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setDisplayName(event.target.value);
      setSuccessMessage(null);
    }, []
  );

  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setSuccessMessage(null);

    try {
      const updatedUser = await updateProfile(displayName);
      setUser(updatedUser);
      setSuccessMessage('Profile updated');
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to update profile';
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [displayName, setUser]);

  return (
    <div className="profile-section">
      <h3 className="profile-section-title">Profile</h3>
      <form className="profile-form" onSubmit={handleSubmit}>
        {submitError && (
          <AlertMessage variant="error">{submitError}</AlertMessage>
        )}
        {successMessage && (
          <AlertMessage variant="success">{successMessage}</AlertMessage>
        )}
        <FormField label="DISPLAY NAME" htmlFor="profileDisplayName">
          <TextInput
            id="profileDisplayName"
            value={displayName}
            onChange={handleDisplayNameChange}
            required
            maxWidth="360px"
          />
        </FormField>
        <div className="profile-form-actions">
          <Button variant="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
