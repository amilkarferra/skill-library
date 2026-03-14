import { useEffect, useCallback, useState, useMemo } from 'react';
import { EmptyState } from '../../shared/components/EmptyState';
import { RequestRow } from './RequestRow';
import {
  fetchMyCollaborationRequests,
  fetchNotificationCount,
  handleCollaborationAction,
} from './panel.service';
import { useAuthStore } from '../../shared/stores/useAuthStore';
import { useNotificationsStore } from '../../shared/stores/useNotificationsStore';
import { PanelListSkeleton } from './PanelListSkeleton';
import type { CollaborationRequest } from '../../shared/models/CollaborationRequest';
import styles from './RequestsSection.module.css';

export function RequestsSection() {
  const { user } = useAuthStore();
  const { setNotificationCounts } = useNotificationsStore();
  const [requests, setRequests] = useState<CollaborationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadRequests = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const collaborationRequests = await fetchMyCollaborationRequests();
      setRequests(collaborationRequests);
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to load requests';
      setLoadError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const { incomingRequests, sentRequests } = useMemo(() => {
    const currentUsername = user?.username ?? '';
    const incoming = requests.filter((collaborationRequest) => {
      const isInvitationForMe = collaborationRequest.direction === 'invitation'
        && collaborationRequest.requesterUsername === currentUsername;
      const isRequestToMySkill = collaborationRequest.direction === 'request'
        && collaborationRequest.requesterUsername !== currentUsername;
      return isInvitationForMe || isRequestToMySkill;
    });
    const sent = requests.filter((collaborationRequest) => {
      const isInvitationISent = collaborationRequest.direction === 'invitation'
        && collaborationRequest.requesterUsername !== currentUsername;
      const isRequestISent = collaborationRequest.direction === 'request'
        && collaborationRequest.requesterUsername === currentUsername;
      return isInvitationISent || isRequestISent;
    });
    return { incomingRequests: incoming, sentRequests: sent };
  }, [requests, user]);

  const refreshNotificationCounts = useCallback(async () => {
    const updatedCounts = await fetchNotificationCount();
    setNotificationCounts(updatedCounts);
  }, [setNotificationCounts]);

  const handleAction = useCallback(async (
    requestId: number,
    action: 'accept' | 'reject' | 'cancel'
  ) => {
    setActionError(null);
    try {
      await handleCollaborationAction(requestId, action);
      await loadRequests();
      await refreshNotificationCounts();
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to process request';
      setActionError(errorMessage);
    }
  }, [loadRequests, refreshNotificationCounts]);

  const hasIncoming = incomingRequests.length > 0;
  const hasSent = sentRequests.length > 0;
  const hasAnyRequests = hasIncoming || hasSent;
  const hasLoadError = loadError !== null;
  const hasActionError = actionError !== null;
  const isDataReady = !isLoading && !hasLoadError;

  return (
    <div className={styles.section}>
      {isLoading && <PanelListSkeleton />}
      {hasLoadError && (
        <p className={styles.error}>{loadError}</p>
      )}
      {hasActionError && (
        <p className={styles.error}>{actionError}</p>
      )}
      {isDataReady && !hasAnyRequests && (
        <EmptyState
          title="No requests"
          description="You have no collaboration requests at this time."
        />
      )}
      {isDataReady && hasIncoming && (
        <div className={styles.group}>
          <span className={styles.groupLabel}>INCOMING</span>
          {incomingRequests.map((collaborationRequest) => (
            <RequestRow
              key={collaborationRequest.id}
              request={collaborationRequest}
              isIncoming={true}
              onAction={handleAction}
            />
          ))}
        </div>
      )}
      {isDataReady && hasSent && (
        <div className={styles.group}>
          <span className={styles.groupLabel}>SENT</span>
          {sentRequests.map((collaborationRequest) => (
            <RequestRow
              key={collaborationRequest.id}
              request={collaborationRequest}
              isIncoming={false}
              onAction={handleAction}
            />
          ))}
        </div>
      )}
    </div>
  );
}
