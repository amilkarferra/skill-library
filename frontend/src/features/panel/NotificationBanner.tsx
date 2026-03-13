import { useEffect, useCallback, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, X } from 'lucide-react';
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
  const bannerTarget = buildNotificationTarget();

  return (
    <div className="notification-banner">
      <div className="notification-banner-left">
        <span className="notification-banner-dot" />
        <span className="notification-banner-text">{bannerMessage}</span>
      </div>
      <div className="notification-banner-right">
        <Link to={bannerTarget} className="notification-banner-link">
          Review now
          <ChevronRight size={12} />
        </Link>
        <button className="notification-banner-dismiss" onClick={handleDismiss}>
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

function buildNotificationMessage(
  pendingVersionProposals: number,
  pendingCollaborationRequests: number
): ReactNode {
  const hasVersionProposals = pendingVersionProposals > 0;
  const hasCollaborationRequests = pendingCollaborationRequests > 0;

  if (hasVersionProposals && hasCollaborationRequests) {
    return (
      <>
        You have{' '}
        <strong className="notification-banner-count">
          {pendingVersionProposals} version proposals
        </strong>
        {' '}and{' '}
        <strong className="notification-banner-count">
          {pendingCollaborationRequests} collaboration requests
        </strong>
        {' '}waiting for your review
      </>
    );
  }

  if (hasVersionProposals) {
    return (
      <>
        You have{' '}
        <strong className="notification-banner-count">
          {pendingVersionProposals} version proposals
        </strong>
        {' '}waiting for your review
      </>
    );
  }

  return (
    <>
      You have{' '}
      <strong className="notification-banner-count">
        {pendingCollaborationRequests} collaboration requests
      </strong>
      {' '}waiting for your review
    </>
  );
}

function buildNotificationTarget(): string {
  return '/panel/skills';
}
