import { sortByRelevance } from '../similar-skills.logic';
import type { SimilarSkill } from '../../../shared/models/SimilarSkill';

function buildSimilarSkill(displayName: string): SimilarSkill {
  return {
    name: displayName.toLowerCase().replace(/\s/g, '-'),
    displayName,
    ownerUsername: 'test-user',
    collaborationMode: 'open',
  };
}

describe('sortByRelevance', () => {
  it('should return exact match first', () => {
    const skills = [
      buildSimilarSkill('React Native'),
      buildSimilarSkill('React'),
      buildSimilarSkill('Angular'),
    ];

    const result = sortByRelevance(skills, 'React');
    expect(result[0].displayName).toBe('React');
  });

  it('should sort closest matches before distant ones', () => {
    const skills = [
      buildSimilarSkill('Angular'),
      buildSimilarSkill('React'),
      buildSimilarSkill('React Native'),
    ];

    const result = sortByRelevance(skills, 'React');
    const firstIndex = result.findIndex((skill) => skill.displayName === 'React');
    const nativeIndex = result.findIndex((skill) => skill.displayName === 'React Native');
    const angularIndex = result.findIndex((skill) => skill.displayName === 'Angular');

    expect(firstIndex).toBeLessThan(nativeIndex);
    expect(nativeIndex).toBeLessThan(angularIndex);
  });

  it('should return empty array for empty input', () => {
    const result = sortByRelevance([], 'React');
    expect(result).toEqual([]);
  });

  it('should not mutate the original array', () => {
    const skills = [
      buildSimilarSkill('Zebra'),
      buildSimilarSkill('Alpha'),
    ];
    const originalFirst = skills[0].displayName;

    sortByRelevance(skills, 'Alpha');
    expect(skills[0].displayName).toBe(originalFirst);
  });

  it('should handle single skill in array', () => {
    const skills = [buildSimilarSkill('React')];
    const result = sortByRelevance(skills, 'React');
    expect(result).toHaveLength(1);
    expect(result[0].displayName).toBe('React');
  });
});
