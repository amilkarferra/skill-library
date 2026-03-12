import { useCallback } from 'react';
import { Check, X, Clock, Users, GitPullRequest } from 'lucide-react';
import { formatDate } from '../../shared/formatters/format-date';
import type { CollaborationRequest } from '../../shared/models/CollaborationRequest';
import './RequestRow.css';

interface RequestRowProps {
  request: CollaborationRequest;
  isIncoming: boolean;
  onAction: (requestId: number, action: 'accept' | 'reject' | 'cancel') => void;
}

export function RequestRow({
  request,
  isIncoming,
  onAction,
}: RequestRowProps) {
  const isPending = request.status === 'pending';
  const rowClass = isIncoming
    ? 'request-row request-row--incoming'
    : 'request-row request-row--sent';
  const requestLabel = buildRequestLabel(request.direction, isIncoming);
  const requestText = buildRequestText(request, isIncoming);
  const RequestIcon = buildRequestIcon(request.direction);
  const iconClassName = buildRequestIconClassName(isIncoming);

  const handleAccept = useCallback(() => {
    onAction(request.id, 'accept');
  }, [onAction, request.id]);

  const handleReject = useCallback(() => {
    onAction(request.id, 'reject');
  }, [onAction, request.id]);

  const handleCancel = useCallback(() => {
    onAction(request.id, 'cancel');
  }, [onAction, request.id]);

  return (
    <div className={rowClass}>
      <div className={iconClassName}>
        <RequestIcon size={14} />
      </div>
      <div className="request-row-info">
        <span className="request-row-type">{requestLabel}</span>
        <span className="request-row-text">{requestText}</span>
        <div className="request-row-meta">
          <span className="request-row-user">@{request.requesterUsername}</span>
          <span className="request-row-date">{formatDate(request.createdAt)}</span>
        </div>
      </div>
      <div className="request-row-actions">
        {isPending && isIncoming && (
          <>
            <button className="request-row-btn request-row-btn--accept" onClick={handleAccept}>
              <Check size={13} />
              Accept
            </button>
            <button className="request-row-btn request-row-btn--reject" onClick={handleReject}>
              <X size={13} />
              Reject
            </button>
          </>
        )}
        {isPending && !isIncoming && (
          <>
            <span className="request-row-pending-label">
              <Clock size={12} />
              Pending
            </span>
            <button className="request-row-btn request-row-btn--cancel" onClick={handleCancel}>
              <X size={13} />
              Cancel
            </button>
          </>
        )}
        {!isPending && (
          <span className="request-row-status label-uppercase">{request.status}</span>
        )}
      </div>
    </div>
  );
}

function buildRequestLabel(
  direction: CollaborationRequest['direction'],
  isIncoming: boolean
): string {
  const requestTypeLabel = direction === 'invitation' ? 'Invitation' : 'Join request';
  const requestDirectionLabel = isIncoming ? 'Incoming' : 'Sent';
  return `${requestDirectionLabel} ${requestTypeLabel}`;
}

function buildRequestText(
  request: CollaborationRequest,
  isIncoming: boolean
): string {
  const isInvitation = request.direction === 'invitation';

  if (isIncoming && isInvitation) {
    return `${request.requesterDisplayName} invited you to collaborate on ${request.skillDisplayName}`;
  }

  if (isIncoming) {
    return `${request.requesterDisplayName} asked to join ${request.skillDisplayName}`;
  }

  if (isInvitation) {
    return `You invited ${request.requesterDisplayName} to collaborate on ${request.skillDisplayName}`;
  }

  return `You requested collaboration on ${request.skillDisplayName}`;
}

function buildRequestIcon(direction: CollaborationRequest['direction']) {
  if (direction === 'invitation') {
    return Users;
  }

  return GitPullRequest;
}

function buildRequestIconClassName(isIncoming: boolean): string {
  const baseClassName = 'request-row-icon';
  return isIncoming ? `${baseClassName} ${baseClassName}--incoming` : `${baseClassName} ${baseClassName}--sent`;
}
