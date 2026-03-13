import { get, post, del } from './api.client';
import type { DownloadUrlResponse } from '../models/DownloadUrlResponse';

export function toggleSkillLike(
  slug: string,
  isCurrentlyLiked: boolean
): Promise<void> {
  const shouldUnlike = isCurrentlyLiked;
  if (shouldUnlike) {
    return del<void>(`/skills/${slug}/like`);
  }
  return post<void>(`/skills/${slug}/like`);
}

export function fetchSkillVersionDownloadUrl(
  slug: string,
  version: string
): Promise<DownloadUrlResponse> {
  return get<DownloadUrlResponse>(
    `/skills/${slug}/versions/${version}/download`
  );
}
