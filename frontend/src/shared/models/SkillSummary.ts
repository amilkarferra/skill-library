export interface SkillSummary {
  id: number;
  name: string;
  displayName: string;
  shortDescription: string;
  ownerUsername: string;
  collaborationMode: 'closed' | 'open';
  currentVersion: string | null;
  tags: string[];
  totalLikes: number;
  totalDownloads: number;
  isActive: boolean;
  createdAt: string;
}
