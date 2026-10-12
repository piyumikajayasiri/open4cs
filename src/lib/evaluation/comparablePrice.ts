export type ComparablePriceInput = {
  referencePrice: number;
  similarity: {
    overall: number | null;
  };
};

export function calculateComparableReferencePrice(
  references: ComparablePriceInput[]
): number | null {
  const validReferences = references.filter(
    (reference) =>
      reference.referencePrice > 0 &&
      reference.similarity.overall !== null &&
      reference.similarity.overall > 0
  );

  if (validReferences.length === 0) {
    return null;
  }

  const totalSimilarity = validReferences.reduce(
    (total, reference) =>
      total + (reference.similarity.overall ?? 0),
    0
  );

  if (totalSimilarity <= 0) {
    return null;
  }

  const weightedPriceTotal = validReferences.reduce(
    (total, reference) =>
      total +
      reference.referencePrice *
        (reference.similarity.overall ?? 0),
    0
  );

  return Number(
    (weightedPriceTotal / totalSimilarity).toFixed(2)
  );
}
