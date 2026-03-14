import { findSimilarTag, isTagAlreadySelected } from '../TagsAutocomplete.logic';

describe('findSimilarTag', () => {
  const EXISTING_TAGS = ['React', 'Angular', 'TypeScript', 'JavaScript', 'Python', 'AI'];

  it('should return use-existing for exact normalized match', () => {
    const result = findSimilarTag('react', EXISTING_TAGS);
    expect(result.action).toBe('use-existing');
    expect(result.matchedTagName).toBe('React');
  });

  it('should return use-existing for match with different casing', () => {
    const result = findSimilarTag('TYPESCRIPT', EXISTING_TAGS);
    expect(result.action).toBe('use-existing');
    expect(result.matchedTagName).toBe('TypeScript');
  });

  it('should return use-existing ignoring separators', () => {
    const tagsWithSeparators = ['React Native', 'Vue.js'];
    const result = findSimilarTag('react-native', tagsWithSeparators);
    expect(result.action).toBe('use-existing');
    expect(result.matchedTagName).toBe('React Native');
  });

  it('should return create-new for empty input', () => {
    const result = findSimilarTag('', EXISTING_TAGS);
    expect(result.action).toBe('create-new');
    expect(result.matchedTagName).toBeNull();
  });

  it('should return create-new for completely different tag', () => {
    const result = findSimilarTag('Kubernetes', EXISTING_TAGS);
    expect(result.action).toBe('create-new');
    expect(result.matchedTagName).toBeNull();
  });

  it('should return confirm-similar for close Levenshtein match', () => {
    const result = findSimilarTag('Angulr', EXISTING_TAGS);
    expect(result.action).toBe('confirm-similar');
    expect(result.matchedTagName).toBe('Angular');
  });

  it('should return confirm-similar for typo in longer tag', () => {
    const result = findSimilarTag('JavaScrip', EXISTING_TAGS);
    expect(result.action).toBe('confirm-similar');
    expect(result.matchedTagName).toBe('JavaScript');
  });

  it('should return create-new for short tags that are different', () => {
    const result = findSimilarTag('Go', EXISTING_TAGS);
    expect(result.action).toBe('create-new');
  });

  it('should return confirm-similar for close substring match', () => {
    const result = findSimilarTag('Angular', ['AngularJS']);
    expect(result.action).toBe('confirm-similar');
    expect(result.matchedTagName).toBe('AngularJS');
  });

  it('should handle empty existing tags array', () => {
    const result = findSimilarTag('React', []);
    expect(result.action).toBe('create-new');
    expect(result.matchedTagName).toBeNull();
  });

  it('should return use-existing when input has extra spaces', () => {
    const result = findSimilarTag('  React  ', EXISTING_TAGS);
    expect(result.action).toBe('use-existing');
    expect(result.matchedTagName).toBe('React');
  });
});

describe('isTagAlreadySelected', () => {
  it('should return true when tag is in selected list', () => {
    const selectedTags = ['React', 'Angular'];
    const result = isTagAlreadySelected('React', selectedTags);
    expect(result).toBe(true);
  });

  it('should return true for case-insensitive match', () => {
    const selectedTags = ['React', 'Angular'];
    const result = isTagAlreadySelected('react', selectedTags);
    expect(result).toBe(true);
  });

  it('should return false when tag is not selected', () => {
    const selectedTags = ['React', 'Angular'];
    const result = isTagAlreadySelected('Vue', selectedTags);
    expect(result).toBe(false);
  });

  it('should return false for empty selected list', () => {
    const result = isTagAlreadySelected('React', []);
    expect(result).toBe(false);
  });

  it('should normalize separators when comparing', () => {
    const selectedTags = ['React Native'];
    const result = isTagAlreadySelected('react-native', selectedTags);
    expect(result).toBe(true);
  });
});
