import { useCallback } from 'react';
import type { ReactNode } from 'react';
import { Check, X, Clock, Users, GitPullRequest } from 'lucide-react';
import { Button } from '../../shared/components/Button';
import { formatRelativeDate } from '../../shared/formatters/format-relative-date';
import type { CollaborationRequest } from '../../shared/models/CollaborationRequest';
import './RequestRow.css';

type RequestAction = 'accept' | 'reject' | 'cancel';

interface RequestRowProps {
  readonly request: CollaborationRequest;
  readonly isIncoming: boolean;
  readonly onAction: (requestId: number, action: RequestAction) => void;
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
  const isInvitation = request.direction === 'invitation';
  const iconClassName = buildRequestIconClassName(isIncoming);
  const labelClassName = buildLabelClassName(isIncoming);

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
        {isInvitation ? <Users size={14} /> : <GitPullRequest size={14} />}
      </div>
      <div className="request-row-info">
        <span className={labelClassName}>{requestLabel}</span>
        <span className="request-row-text">{requestText}</span>
        <div className="request-row-meta">
          <span className="request-row-date">{formatRelativeDate(request.createdAt)}</span>
        </div>
      </div>
      <div className="request-row-actions">
        {isPending && isIncoming && (
          <>
            <Button variant="success" size="small" onClick={handleAccept}>
              <Check size={13} />
              Accept
            </Button>
            <Button variant="danger-outline" size="small" onClick={handleReject}>
              <X size={13} />
              Reject
            </Button>
          </>
        )}
        {isPending && !isIncoming && (
          <>
            <span className="request-row-pending-label">
              <Clock size={12} />
              Pending
            </span>
            <Button variant="secondary" size="small" onClick={handleCancel}>
              <X size={13} />
              Cancel
            </Button>
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
): ReactNode {
  const isInvitation = request.direction === 'invitation';
  const skillName = <strong>{request.skillDisplayName}</strong>;

  if (isIncoming && isInvitation) {
    return <>{request.ownerDisplayName} invited you to collaborate on {skillName}</>;
  }

  if (isIncoming) {
    return <>{request.requesterDisplayName} asked to join {skillName}</>;
  }

  if (isInvitation) {
    return <>You invited {request.requesterDisplayName} to collaborate on {skillName}</>;
  }

  return <>You requested collaboration on {skillName}</>;
}

function buildRequestIconClassName(isIncoming: boolean): string {
  const baseClassName = 'request-row-icon';
  const modifier = isIncoming ? 'incoming' : 'sent';
  return `${baseClassName} ${baseClassName}--${modifier}`;
}

function buildLabelClassName(isIncoming: boolean): string {
  const baseClassName = 'request-row-type';
  return isIncoming ? baseClassName : `${baseClassName} request-row-type--sent`;
}
