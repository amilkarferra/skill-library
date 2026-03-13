export interface SkillUpdateRequest {
  displayName?: string;
  shortDescription?: string;
  longDescription?: string;
  categoryId?: number;
  tags?: string[];
  collaborationMode?: 'closed' | 'open';
}
