const SEPARATOR_PATTERN = /[-_\s]/g;

export function normalizeForComparison(value: string): string {
  return value.toLowerCase().trim().replace(SEPARATOR_PATTERN, '');
}

export function computeLevenshteinDistance(first: string, second: string): number {
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
