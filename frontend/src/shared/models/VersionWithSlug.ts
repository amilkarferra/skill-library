import type { SkillVersion } from './SkillVersion';

export interface VersionWithSlug extends SkillVersion {
  skillSlug: string;
}
