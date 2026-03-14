export interface SimilarSkill {
  readonly name: string;
  readonly displayName: string;
  readonly ownerUsername: string;
  readonly collaborationMode: 'closed' | 'open';
}
