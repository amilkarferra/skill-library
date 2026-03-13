export interface SkillActionTarget {
  readonly id: number;
  readonly name: string;
  readonly totalLikes: number;
  readonly totalDownloads: number;
  readonly totalComments?: number;
  readonly currentVersion: string | null;
  readonly isLikedByMe?: boolean;
}
