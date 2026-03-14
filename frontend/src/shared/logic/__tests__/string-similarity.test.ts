import {
  normalizeForComparison,
  computeLevenshteinDistance,
} from '../string-similarity';

describe('normalizeForComparison', () => {
  it('should lowercase the input', () => {
    const result = normalizeForComparison('Hello');
    expect(result).toBe('hello');
  });

  it('should trim whitespace', () => {
    const result = normalizeForComparison('  hello  ');
    expect(result).toBe('hello');
  });

  it('should remove hyphens', () => {
    const result = normalizeForComparison('my-skill');
    expect(result).toBe('myskill');
  });

  it('should remove underscores', () => {
    const result = normalizeForComparison('my_skill');
    expect(result).toBe('myskill');
  });

  it('should remove spaces between words', () => {
    const result = normalizeForComparison('my skill name');
    expect(result).toBe('myskillname');
  });

  it('should handle combined separators', () => {
    const result = normalizeForComparison('My-Skill_Name Test');
    expect(result).toBe('myskillnametest');
  });

  it('should return empty string for empty input', () => {
    const result = normalizeForComparison('');
    expect(result).toBe('');
  });

  it('should handle string with only separators', () => {
    const result = normalizeForComparison('- _ -');
    expect(result).toBe('');
  });
});

describe('computeLevenshteinDistance', () => {
  it('should return 0 for identical strings', () => {
    const result = computeLevenshteinDistance('hello', 'hello');
    expect(result).toBe(0);
  });

  it('should return the length of second string when first is empty', () => {
    const result = computeLevenshteinDistance('', 'hello');
    expect(result).toBe(5);
  });

  it('should return the length of first string when second is empty', () => {
    const result = computeLevenshteinDistance('hello', '');
    expect(result).toBe(5);
  });

  it('should return 1 for single character substitution', () => {
    const result = computeLevenshteinDistance('cat', 'car');
    expect(result).toBe(1);
  });

  it('should return 1 for single character insertion', () => {
    const result = computeLevenshteinDistance('cat', 'cats');
    expect(result).toBe(1);
  });

  it('should return 1 for single character deletion', () => {
    const result = computeLevenshteinDistance('cats', 'cat');
    expect(result).toBe(1);
  });

  it('should handle completely different strings', () => {
    const result = computeLevenshteinDistance('abc', 'xyz');
    expect(result).toBe(3);
  });

  it('should be symmetric', () => {
    const distanceAB = computeLevenshteinDistance('kitten', 'sitting');
    const distanceBA = computeLevenshteinDistance('sitting', 'kitten');
    expect(distanceAB).toBe(distanceBA);
  });

  it('should compute correct distance for kitten/sitting', () => {
    const result = computeLevenshteinDistance('kitten', 'sitting');
    expect(result).toBe(3);
  });

  it('should return 0 for two empty strings', () => {
    const result = computeLevenshteinDistance('', '');
    expect(result).toBe(0);
  });
});
