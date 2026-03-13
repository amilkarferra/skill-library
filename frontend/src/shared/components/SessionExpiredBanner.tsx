import { useCallback, useState } from 'react';
import { useAuth } from '../../features/auth/useAuth';
import { useAuthStore } from '../stores/useAuthStore';
import './SessionExpiredBanner.css';

export function SessionExpiredBanner() {
  const { isSessionExpired } = useAuthStore();
  const { reconnect } = useAuth();
  const [isReconnecting, setIsReconnecting] = useState(false);

  const handleReconnect = useCallback(async () => {
    setIsReconnecting(true);
    try {
      await reconnect();
    } finally {
      setIsReconnecting(false);
    }
  }, [reconnect]);

  if (!isSessionExpired) return null;

  const buttonLabel = isReconnecting ? 'Reconnecting...' : 'Reconnect';

  return (
    <div className="session-expired-banner" role="alert">
      <span className="session-expired-banner-text">
        Your session has expired. Click reconnect to continue.
      </span>
      <button
        className="session-expired-banner-action"
        onClick={handleReconnect}
        disabled={isReconnecting}
      >
        {buttonLabel}
      </button>
    </div>
  );
}
