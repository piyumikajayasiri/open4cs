import { FOUR_C_WEIGHTS } from "./rules";

export type ReferenceGemstoneComparison = {
  referenceGemstoneId: string;
  variety: string;
  caratWeight: number;
  referencePrice: number;
  currency: string;

  similarity: {
    color: number | null;
    clarity: number | null;
    cut: number | null;
    cutDimensions: number | null;
    carat: number | null;
    overall: number | null;
  };
};

export function calculateTextMatchSimilarity(
  gemstoneValue: string,
  referenceValue: string
): number {
  const normalizedGemstoneValue = gemstoneValue
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");

  const normalizedReferenceValue = referenceValue
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");

  return normalizedGemstoneValue === normalizedReferenceValue
    ? 100
    : 0;
}

export function calculateMeasurementSimilarity(
  gemstoneValue: number | null,
  referenceValue: number | null
): number | null {
  if (
    gemstoneValue === null ||
    referenceValue === null ||
    gemstoneValue <= 0 ||
    referenceValue <= 0
  ) {
    return null;
  }

  const smallerValue = Math.min(
    gemstoneValue,
    referenceValue
  );

  const largerValue = Math.max(
    gemstoneValue,
    referenceValue
  );

  return Number(
    ((smallerValue / largerValue) * 100).toFixed(2)
  );
}

export function calculateCutDimensionSimilarity(
  gemstone: CutComparisonInput,
  reference: CutComparisonInput
): number | null {
  const similarities = [
    calculateMeasurementSimilarity(
      gemstone.length,
      reference.length
    ),
    calculateMeasurementSimilarity(
      gemstone.width,
      reference.width
    ),
    calculateMeasurementSimilarity(
      gemstone.depth,
      reference.depth
    ),
  ].filter(
    (value): value is number => value !== null
  );

  if (similarities.length === 0) {
    return null;
  }

  const average =
    similarities.reduce(
      (total, value) => total + value,
      0
    ) / similarities.length;

  return Number(average.toFixed(2));
}

export type ColorComparisonInput = {
  hue: string;
  tone: string;
  saturation: string;
  distribution: string;
  zoning: string;
};

export function calculateColorSimilarity(
  gemstoneColor: ColorComparisonInput,
  referenceColor: ColorComparisonInput
): number {
  const hueSimilarity = calculateTextMatchSimilarity(
    gemstoneColor.hue,
    referenceColor.hue
  );

  const toneSimilarity = calculateTextMatchSimilarity(
    gemstoneColor.tone,
    referenceColor.tone
  );

  const saturationSimilarity = calculateTextMatchSimilarity(
    gemstoneColor.saturation,
    referenceColor.saturation
  );

  const distributionSimilarity = calculateTextMatchSimilarity(
    gemstoneColor.distribution,
    referenceColor.distribution
  );

  const zoningSimilarity = calculateTextMatchSimilarity(
    gemstoneColor.zoning,
    referenceColor.zoning
  );

  const similarity =
    (hueSimilarity +
      toneSimilarity +
      saturationSimilarity +
      distributionSimilarity +
      zoningSimilarity) /
    5;

  return Number(similarity.toFixed(2));
}

export type ClarityComparisonInput = {
  nakedEye: string;
  loupe10x: string;
  inclusionType: string;
  inclusionLocation: string;
  severity: string;
};

export function calculateClaritySimilarity(
  gemstoneClarity: ClarityComparisonInput,
  referenceClarity: ClarityComparisonInput
): number {
  const nakedEyeSimilarity = calculateTextMatchSimilarity(
    gemstoneClarity.nakedEye,
    referenceClarity.nakedEye
  );

  const loupe10xSimilarity = calculateTextMatchSimilarity(
    gemstoneClarity.loupe10x,
    referenceClarity.loupe10x
  );

  const inclusionTypeSimilarity = calculateTextMatchSimilarity(
    gemstoneClarity.inclusionType,
    referenceClarity.inclusionType
  );

  const inclusionLocationSimilarity = calculateTextMatchSimilarity(
    gemstoneClarity.inclusionLocation,
    referenceClarity.inclusionLocation
  );

  const severitySimilarity = calculateTextMatchSimilarity(
    gemstoneClarity.severity,
    referenceClarity.severity
  );

  const similarity =
    (nakedEyeSimilarity +
      loupe10xSimilarity +
      inclusionTypeSimilarity +
      inclusionLocationSimilarity +
      severitySimilarity) /
    5;

  return Number(similarity.toFixed(2));
}

export type CutComparisonInput = {
  length: number | null;
  width: number | null;
  depth: number | null;
  symmetry: string;
  polish: string;
  windowing: string;
  extinction: string;
  bulging: string;
};

export function calculateCutSimilarity(
  gemstoneCut: CutComparisonInput,
  referenceCut: CutComparisonInput
): number {
  const symmetrySimilarity = calculateTextMatchSimilarity(
    gemstoneCut.symmetry,
    referenceCut.symmetry
  );

  const polishSimilarity = calculateTextMatchSimilarity(
    gemstoneCut.polish,
    referenceCut.polish
  );

  const windowingSimilarity = calculateTextMatchSimilarity(
    gemstoneCut.windowing,
    referenceCut.windowing
  );

  const extinctionSimilarity = calculateTextMatchSimilarity(
    gemstoneCut.extinction,
    referenceCut.extinction
  );

  const bulgingSimilarity = calculateTextMatchSimilarity(
    gemstoneCut.bulging,
    referenceCut.bulging
  );

  const observationalAverage =
    (symmetrySimilarity +
      polishSimilarity +
      windowingSimilarity +
      extinctionSimilarity +
      bulgingSimilarity) /
    5;

  const dimensionSimilarity =
    calculateCutDimensionSimilarity(
      gemstoneCut,
      referenceCut
    );

  if (dimensionSimilarity === null) {
    return Number(observationalAverage.toFixed(2));
  }

  const combinedCutSimilarity =
    observationalAverage * 0.75 +
    dimensionSimilarity * 0.25;

  return Number(combinedCutSimilarity.toFixed(2));
}

export function calculateCaratSimilarity(
  gemstoneCaratWeight: number,
  referenceCaratWeight: number
): number {
  if (
    gemstoneCaratWeight <= 0 ||
    referenceCaratWeight <= 0
  ) {
    return 0;
  }

  const smallerWeight = Math.min(
    gemstoneCaratWeight,
    referenceCaratWeight
  );

  const largerWeight = Math.max(
    gemstoneCaratWeight,
    referenceCaratWeight
  );

  const similarity =
    (smallerWeight / largerWeight) * 100;

  return Number(similarity.toFixed(2));
}

export function calculateOverall4CSimilarity(
  colorSimilarity: number,
  claritySimilarity: number,
  cutSimilarity: number,
  caratSimilarity: number
): number {
  const similarity =
    colorSimilarity * FOUR_C_WEIGHTS.color +
    claritySimilarity * FOUR_C_WEIGHTS.clarity +
    cutSimilarity * FOUR_C_WEIGHTS.cut +
    caratSimilarity * FOUR_C_WEIGHTS.carat;

  return Number(similarity.toFixed(2));
}

export type GemstoneForComparison = {
  variety: string;
  color: ColorComparisonInput;
  clarity: ClarityComparisonInput;
  cut: CutComparisonInput;
  caratWeight: number;
};

export type ReferenceForComparison = {
  _id: string;
  variety: string;
  caratWeight: number;
  referencePrice: number;
  currency: string;
  color: ColorComparisonInput;
  clarity: ClarityComparisonInput;
  cut: CutComparisonInput;
};

export function compareWithReference(
  gemstone: GemstoneForComparison,
  reference: ReferenceForComparison
): ReferenceGemstoneComparison {
  const colorSimilarity = calculateColorSimilarity(
    gemstone.color,
    reference.color
  );

  const claritySimilarity = calculateClaritySimilarity(
    gemstone.clarity,
    reference.clarity
  );

  const cutSimilarity = calculateCutSimilarity(
    gemstone.cut,
    reference.cut
  );

  const cutDimensionSimilarity =
    calculateCutDimensionSimilarity(
      gemstone.cut,
      reference.cut
    );

  const caratSimilarity = calculateCaratSimilarity(
    gemstone.caratWeight,
    reference.caratWeight
  );

  const overallSimilarity =
    calculateOverall4CSimilarity(
      colorSimilarity,
      claritySimilarity,
      cutSimilarity,
      caratSimilarity
    );

  return {
    referenceGemstoneId: reference._id,
    variety: reference.variety,
    caratWeight: reference.caratWeight,
    referencePrice: reference.referencePrice,
    currency: reference.currency,

    similarity: {
      color: colorSimilarity,
      clarity: claritySimilarity,
      cut: cutSimilarity,
      cutDimensions: cutDimensionSimilarity,
      carat: caratSimilarity,
      overall: overallSimilarity,
    },
  };
}

export function filterReferencesByVariety(
  variety: string,
  references: ReferenceForComparison[]
): ReferenceForComparison[] {
  const normalizedVariety = variety
    .trim()
    .toLowerCase();

  return references.filter(
    (reference) =>
      reference.variety.trim().toLowerCase() ===
      normalizedVariety
  );
}

export function compareWithReferences(
  gemstone: GemstoneForComparison,
  references: ReferenceForComparison[]
): ReferenceGemstoneComparison[] {
  const matchingReferences =
    filterReferencesByVariety(
      gemstone.variety,
      references
    );

  const comparisons = matchingReferences.map(
    (reference) =>
      compareWithReference(gemstone, reference)
  );

  return comparisons.sort(
    (a, b) =>
      (b.similarity.overall ?? 0) -
      (a.similarity.overall ?? 0)
  );
}
