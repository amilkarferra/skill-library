import { get, patch } from '../../shared/services/api.client';
import type { SkillSummary } from '../../shared/models/SkillSummary';
import type { VersionWithSlug } from '../../shared/models/VersionWithSlug';
import type { CollaborationRequest } from '../../shared/models/CollaborationRequest';
import type { NotificationCount } from '../../shared/models/NotificationCount';

export function fetchMySkills(): Promise<SkillSummary[]> {
  return get<SkillSummary[]>('/me/skills');
}

export function fetchMyCollaborations(): Promise<SkillSummary[]> {
  return get<SkillSummary[]>('/me/collaborations');
}

export function fetchMyLikes(): Promise<SkillSummary[]> {
  return get<SkillSummary[]>('/me/likes');
}

export function fetchMyCollaborationRequests(): Promise<CollaborationRequest[]> {
  return get<CollaborationRequest[]>('/me/collaboration-requests');
}

export function fetchPendingVersionProposals(): Promise<VersionWithSlug[]> {
  return get<VersionWithSlug[]>('/me/pending-versions');
}

export function fetchNotificationCount(): Promise<NotificationCount> {
  return get<NotificationCount>('/me/notifications/count');
}

export function handleCollaborationAction(
  requestId: number,
  action: 'accept' | 'reject' | 'cancel'
): Promise<void> {
  return patch<void>(`/me/collaboration-requests/${requestId}`, { action });
}

export function reviewVersionProposal(
  slug: string,
  version: string,
  action: 'approve' | 'reject'
): Promise<void> {
  return patch<void>(`/skills/${slug}/versions/${version}/review`, { action });
}
