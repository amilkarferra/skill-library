type SimilarityAction = 'use-existing' | 'confirm-similar' | 'create-new';

interface SimilarityResult {
  readonly action: SimilarityAction;
  readonly matchedTagName: string | null;
}

const SEPARATOR_PATTERN = /[-_\s]/g;
const MIN_LENGTH_FOR_DISTANCE_ONE = 4;
const MIN_LENGTH_FOR_DISTANCE_TWO = 7;
const MAX_SUBSTRING_LENGTH_DIFFERENCE = 3;

function normalizeForComparison(value: string): string {
  return value.toLowerCase().trim().replace(SEPARATOR_PATTERN, '');
}

function computeLevenshteinDistance(first: string, second: string): number {
  const firstLength = first.length;
  const secondLength = second.length;

  const distanceMatrix: number[][] = Array.from(
    { length: firstLength + 1 },
    (_, rowIndex) => {
      const row = Array.from(
        { length: secondLength + 1 },
        (_, columnIndex) => columnIndex
      );
      row[0] = rowIndex;
      return row;
    }
  );

  for (let row = 1; row <= firstLength; row++) {
    for (let column = 1; column <= secondLength; column++) {
      const isCharacterMatch = first[row - 1] === second[column - 1];
      const substitutionCost = isCharacterMatch ? 0 : 1;

      distanceMatrix[row][column] = Math.min(
        distanceMatrix[row - 1][column] + 1,
        distanceMatrix[row][column - 1] + 1,
        distanceMatrix[row - 1][column - 1] + substitutionCost
      );
    }
  }

  return distanceMatrix[firstLength][secondLength];
}

function computeDistanceThreshold(tagLength: number): number {
  const isLongEnoughForDistanceTwo = tagLength >= MIN_LENGTH_FOR_DISTANCE_TWO;
  if (isLongEnoughForDistanceTwo) return 2;

  const isLongEnoughForDistanceOne = tagLength >= MIN_LENGTH_FOR_DISTANCE_ONE;
  if (isLongEnoughForDistanceOne) return 1;

  return 0;
}

function isCloseSubstring(
  normalizedInput: string,
  normalizedExisting: string
): boolean {
  const lengthDifference = Math.abs(
    normalizedInput.length - normalizedExisting.length
  );
  const isLengthWithinRange =
    lengthDifference <= MAX_SUBSTRING_LENGTH_DIFFERENCE;
  const isInputContainedInExisting =
    normalizedExisting.includes(normalizedInput);
  const isExistingContainedInInput =
    normalizedInput.includes(normalizedExisting);

  return (
    isLengthWithinRange &&
    (isInputContainedInExisting || isExistingContainedInInput)
  );
}

export function findSimilarTag(
  inputValue: string,
  existingTagNames: readonly string[]
): SimilarityResult {
  const normalizedInput = normalizeForComparison(inputValue);
  const noMatchResult: SimilarityResult = {
    action: 'create-new',
    matchedTagName: null,
  };

  const hasEmptyInput = normalizedInput.length === 0;
  if (hasEmptyInput) return noMatchResult;

  for (const existingName of existingTagNames) {
    const normalizedExisting = normalizeForComparison(existingName);

    const isExactNormalizedMatch = normalizedInput === normalizedExisting;
    if (isExactNormalizedMatch) {
      return { action: 'use-existing', matchedTagName: existingName };
    }
  }

  let closestMatch: string | null = null;
  let closestDistance = Infinity;

  for (const existingName of existingTagNames) {
    const normalizedExisting = normalizeForComparison(existingName);
    const threshold = computeDistanceThreshold(normalizedInput.length);

    const hasNoFuzzyThreshold = threshold === 0;
    if (hasNoFuzzyThreshold) {
      const isSubstringMatch = isCloseSubstring(
        normalizedInput,
        normalizedExisting
      );
      if (isSubstringMatch) {
        return { action: 'confirm-similar', matchedTagName: existingName };
      }
      continue;
    }

    const distance = computeLevenshteinDistance(
      normalizedInput,
      normalizedExisting
    );
    const isWithinThreshold = distance <= threshold;
    const isCloserThanPrevious = distance < closestDistance;

    if (isWithinThreshold && isCloserThanPrevious) {
      closestDistance = distance;
      closestMatch = existingName;
    }

    const isSubstringMatch = isCloseSubstring(
      normalizedInput,
      normalizedExisting
    );
    const isSubstringCloser =
      isSubstringMatch && closestMatch === null;
    if (isSubstringCloser) {
      closestMatch = existingName;
    }
  }

  const hasSimilarMatch = closestMatch !== null;
  if (hasSimilarMatch) {
    return { action: 'confirm-similar', matchedTagName: closestMatch };
  }

  return noMatchResult;
}

export function isTagAlreadySelected(
  tagName: string,
  selectedTags: readonly string[]
): boolean {
  const normalizedInput = normalizeForComparison(tagName);
  return selectedTags.some(
    (selected) => normalizeForComparison(selected) === normalizedInput
  );
}
