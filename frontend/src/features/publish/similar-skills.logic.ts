import type { SimilarSkill } from '../../shared/models/SimilarSkill';
import {
  normalizeForComparison,
  computeLevenshteinDistance,
} from '../../shared/logic/string-similarity';

export function sortByRelevance(
  skills: readonly SimilarSkill[],
  targetDisplayName: string,
): SimilarSkill[] {
  const normalizedTarget = normalizeForComparison(targetDisplayName);

  const scoredSkills = skills.map((skill) => {
    const normalizedSkillName = normalizeForComparison(skill.displayName);
    const distance = computeLevenshteinDistance(normalizedTarget, normalizedSkillName);
    return { skill, distance };
  });

  scoredSkills.sort(compareByDistanceAscending);

  return scoredSkills.map(extractSkillFromScoredPair);
}

function compareByDistanceAscending(
  first: { distance: number },
  second: { distance: number },
): number {
  return first.distance - second.distance;
}

function extractSkillFromScoredPair(pair: { skill: SimilarSkill }): SimilarSkill {
  return pair.skill;
}
