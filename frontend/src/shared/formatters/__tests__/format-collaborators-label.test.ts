import { formatCollaboratorsLabel } from '../format-collaborators-label';

describe('formatCollaboratorsLabel', () => {
  it('should return singular form when count is 1', () => {
    const result = formatCollaboratorsLabel(1);
    expect(result).toBe('1 collaborator');
  });

  it('should return plural form when count is 0', () => {
    const result = formatCollaboratorsLabel(0);
    expect(result).toBe('0 collaborators');
  });

  it('should return plural form when count is 2', () => {
    const result = formatCollaboratorsLabel(2);
    expect(result).toBe('2 collaborators');
  });

  it('should return plural form when count is large', () => {
    const largeCount = 100;
    const result = formatCollaboratorsLabel(largeCount);
    expect(result).toBe('100 collaborators');
  });
});
