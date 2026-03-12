export interface Skill {
  id: number;
  ownerId: number;
  ownerUsername: string;
  ownerDisplayName: string;
  name: string;
  displayName: string;
  shortDescription: string;
  longDescription: string;
  categoryId: number;
  categoryName: string;
  categorySlug: string;
  collaborationMode: 'closed' | 'open';
  currentVersion: string | null;
  totalLikes: number;
  totalDownloads: number;
  totalComments: number;
  tags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  isLikedByMe?: boolean;
  myRole?: 'owner' | 'collaborator' | null;
}
