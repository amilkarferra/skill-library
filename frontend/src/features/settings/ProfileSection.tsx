import { useState, useCallback, useEffect } from 'react';
import { useAuthStore } from '../../shared/stores/useAuthStore';
import { updateProfile } from './settings.service';
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
          <div className="profile-form-error">{submitError}</div>
        )}
        {successMessage && (
          <div className="profile-form-success">{successMessage}</div>
        )}
        <div className="profile-form-field">
          <label
            className="profile-form-label label-uppercase"
            htmlFor="profileDisplayName"
          >
            DISPLAY NAME
          </label>
          <input
            id="profileDisplayName"
            type="text"
            className="profile-form-input"
            value={displayName}
            onChange={handleDisplayNameChange}
            required
          />
        </div>
        <div className="profile-form-actions">
          <button
            type="submit"
            className="profile-form-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
