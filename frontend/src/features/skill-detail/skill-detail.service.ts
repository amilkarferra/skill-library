import { get, post, put, del } from '../../shared/services/api.client';
import type { Skill } from '../../shared/models/Skill';
import type { SkillVersion } from '../../shared/models/SkillVersion';
import type { Comment } from '../../shared/models/Comment';
import type { PaginatedResponse } from '../../shared/models/PaginatedResponse';
import type { SkillContentResponse } from '../../shared/models/SkillContentResponse';
import type { SkillUpdateRequest } from '../../shared/models/SkillUpdateRequest';
import type { Category } from '../../shared/models/Category';
import type { Tag } from '../../shared/models/Tag';

export function fetchSkillBySlug(slug: string): Promise<Skill> {
  return get<Skill>(`/skills/${slug}`);
}

export function fetchSkillVersions(slug: string): Promise<SkillVersion[]> {
  return get<SkillVersion[]>(`/skills/${slug}/versions`);
}

export function fetchSkillComments(
  slug: string,
  page: number,
  pageSize: number
): Promise<PaginatedResponse<Comment>> {
  return get<PaginatedResponse<Comment>>(
    `/skills/${slug}/comments?page=${page}&pageSize=${pageSize}`
  );
}

export function postComment(
  slug: string,
  commentText: string
): Promise<Comment> {
  return post<Comment>(`/skills/${slug}/comments`, { commentText });
}

export function updateComment(
  slug: string,
  commentId: number,
  commentText: string
): Promise<Comment> {
  return put<Comment>(
    `/skills/${slug}/comments/${commentId}`,
    { commentText }
  );
}

export function deleteComment(
  slug: string,
  commentId: number
): Promise<void> {
  return del<void>(`/skills/${slug}/comments/${commentId}`);
}

export function requestCollaboration(slug: string): Promise<void> {
  return post<void>(`/skills/${slug}/collaboration-requests`);
}

export function fetchSkillContent(slug: string): Promise<SkillContentResponse> {
  return get<SkillContentResponse>(`/skills/${slug}/content`);
}

export function updateSkillMetadata(
  slug: string,
  data: SkillUpdateRequest
): Promise<Skill> {
  return put<Skill>(`/skills/${slug}`, data);
}

export function fetchEditFormCategories(): Promise<Category[]> {
  return get<Category[]>('/categories');
}

export function fetchEditFormPopularTags(): Promise<Tag[]> {
  return get<Tag[]>('/tags/popular');
}

