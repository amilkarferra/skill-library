import { useEffect, useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, X } from 'lucide-react';
import { fetchNotificationCount } from './panel.service';
import { useNotificationsStore } from '../../shared/stores/useNotificationsStore';
import './NotificationBanner.css';

export function NotificationBanner() {
  const {
    pendingNotificationCount,
    pendingCollaborationRequests,
    pendingVersionProposals,
    setNotificationCounts,
  } = useNotificationsStore();
  const [isDismissed, setIsDismissed] = useState(false);

  const loadNotifications = useCallback(async () => {
    try {
      const notificationCount = await fetchNotificationCount();
      setNotificationCounts(notificationCount);
    } catch {
      void 0;
    }
  }, [setNotificationCounts]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleDismiss = useCallback(() => {
    setIsDismissed(true);
  }, []);

  const hasNoPendingNotifications = pendingNotificationCount === 0;
  const isBannerHidden = isDismissed || hasNoPendingNotifications;
  if (isBannerHidden) return null;

  const bannerMessage = buildNotificationMessage(
    pendingVersionProposals,
    pendingCollaborationRequests
  );
  const bannerTarget = buildNotificationTarget(
    pendingVersionProposals,
    pendingCollaborationRequests
  );

  return (
    <div className="notification-banner">
      <div className="notification-banner-content">
        <Bell size={14} className="notification-banner-icon" />
        <div className="notification-banner-copy">
          <span className="notification-banner-kicker">Needs review</span>
          <span className="notification-banner-text">{bannerMessage}</span>
        </div>
        <Link to={bannerTarget} className="notification-banner-link">
          Review now
        </Link>
      </div>
      <button className="notification-banner-dismiss" onClick={handleDismiss}>
        <X size={14} />
      </button>
    </div>
  );
}

function buildNotificationMessage(
  pendingVersionProposals: number,
  pendingCollaborationRequests: number
): string {
  const hasVersionProposals = pendingVersionProposals > 0;
  const hasCollaborationRequests = pendingCollaborationRequests > 0;

  if (hasVersionProposals && hasCollaborationRequests) {
    return `${pendingVersionProposals} version proposals and ${pendingCollaborationRequests} collaboration requests are waiting`;
  }

  if (hasVersionProposals) {
    return `${pendingVersionProposals} version proposals are waiting`;
  }

  return `${pendingCollaborationRequests} collaboration requests are waiting`;
}

function buildNotificationTarget(
  pendingVersionProposals: number,
  pendingCollaborationRequests: number
): string {
  const hasVersionProposals = pendingVersionProposals > 0;
  if (hasVersionProposals) {
    return '/panel/versions';
  }

  const hasCollaborationRequests = pendingCollaborationRequests > 0;
  if (hasCollaborationRequests) {
    return '/panel/requests';
  }

  return '/panel';
}
