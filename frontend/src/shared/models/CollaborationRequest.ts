export interface CollaborationRequest {
  id: number;
  skillId: number;
  skillName: string;
  skillDisplayName: string;
  requesterUsername: string;
  requesterDisplayName: string;
  direction: 'invitation' | 'request';
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  createdAt: string;
  resolvedAt: string | null;
}
