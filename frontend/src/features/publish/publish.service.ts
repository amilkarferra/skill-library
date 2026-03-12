import { get, upload } from '../../shared/services/api.client';
import type { Skill } from '../../shared/models/Skill';
import type { SkillVersion } from '../../shared/models/SkillVersion';
import type { Category } from '../../shared/models/Category';
import type { Tag } from '../../shared/models/Tag';
import type { FrontmatterResponse } from '../../shared/models/FrontmatterResponse';

export function createSkill(formData: FormData): Promise<Skill> {
  return upload<Skill>('/skills', formData);
}

export function extractFrontmatter(file: File): Promise<FrontmatterResponse> {
  const formData = new FormData();
  formData.append('file', file);
  return upload<FrontmatterResponse>('/skills/extract-frontmatter', formData);
}

export function uploadNewVersion(
  slug: string,
  formData: FormData
): Promise<SkillVersion> {
  return upload<SkillVersion>(`/skills/${slug}/versions`, formData);
}

export function fetchCategories(): Promise<Category[]> {
  return get<Category[]>('/categories');
}

export function fetchPopularTags(): Promise<Tag[]> {
  return get<Tag[]>('/tags/popular');
}
