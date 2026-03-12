import { useEffect, useCallback, useState, useMemo } from 'react';
import { EmptyState } from '../../shared/components/EmptyState';
import { RequestRow } from './RequestRow';
import {
  fetchMyCollaborationRequests,
  handleCollaborationAction,
} from './panel.service';
import { useAuthStore } from '../../shared/stores/useAuthStore';
import type { CollaborationRequest } from '../../shared/models/CollaborationRequest';
import './RequestsSection.css';

export function RequestsSection() {
  const { user } = useAuthStore();
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

  const handleAction = useCallback(async (
    requestId: number,
    action: 'accept' | 'reject' | 'cancel'
  ) => {
    setActionError(null);
    try {
      await handleCollaborationAction(requestId, action);
      await loadRequests();
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to process request';
      setActionError(errorMessage);
    }
  }, [loadRequests]);

  const hasIncoming = incomingRequests.length > 0;
  const hasSent = sentRequests.length > 0;
  const hasAnyRequests = hasIncoming || hasSent;

  if (isLoading) {
    return (
      <div className="requests-section">
        <p className="requests-loading">Loading requests...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="requests-section">
        <p className="requests-error">{loadError}</p>
      </div>
    );
  }

  return (
    <div className="requests-section">
      <div className="requests-header">
        <h2 className="requests-title">Collaboration Requests</h2>
      </div>
      {actionError && (
        <p className="requests-error">{actionError}</p>
      )}
      {!hasAnyRequests && (
        <EmptyState
          title="No requests"
          description="You have no collaboration requests at this time."
        />
      )}
      {hasIncoming && (
        <div className="requests-group">
          <span className="requests-group-label label-uppercase">INCOMING</span>
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
      {hasSent && (
        <div className="requests-group">
          <span className="requests-group-label label-uppercase">SENT</span>
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
