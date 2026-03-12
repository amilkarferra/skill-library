export interface SkillVersion {
  id: number;
  version: string;
  changelog: string;
  fileSize: number;
  uploadedByUsername: string;
  reviewedByUsername: string | null;
  status: 'published' | 'pending_review' | 'rejected';
  createdAt: string;
}
