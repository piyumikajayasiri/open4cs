import { TREATMENT_RULES, ORIGIN_RULES } from "./rules";

export type ComparableReferenceInput = {
  referenceId?: string;
  referencePrice: number;
  caratWeight: number;
  pricePerCarat?: number | null;
  currency?: string;
  treatment?: { status: string };
  origin?: { value: string; reliability?: string };
  similarity: {
    overall: number | null;
    color?: number | null;
    clarity?: number | null;
    cut?: number | null;
    carat?: number | null;
  };
  observationDate?: string;
  saleDate?: string;
  dataClassification?: string;
  transactionContext?: string;
  marketContext?: string;
  source?: string;
  labCertificate?: string;
  labName?: string;
};

export type CandidateGemstoneContext = {
  caratWeight: number;
  treatment?: { status?: string };
  origin?: { value?: string; reliability?: string };
};

export type ContributingComparable = {
  referenceId: string;
  caratWeight: number;
  currency: string;
  rawReferencePrice: number;
  rawPricePerCarat: number;
  normalizedPricePerCarat: number;
  treatmentStatus: string;
  treatmentMultiplier: number;
  originValue: string;
  originMultiplier: number;
  adjustedPricePerCarat: number;
  similarityScore: number;
  effectiveWeight: number;
  contributionPercentage: number;
  transactionContext: string;
  marketContext: string;
  observationDate: string;
  source: string;
};

export type ComparableAggregationResult = {
  benchmarkPricePerCarat: number;
  suggestedTotalPrice: number;
  rangePercentage: number;
  priceRangePerCarat: {
    minimum: number;
    maximum: number;
  };
  priceRangeTotal: {
    minimum: number;
    maximum: number;
  };
  observedRangePerCarat: {
    min: number;
    max: number;
  };
  dispersion: number;
  comparableCount: number;
  contributingComparables: ContributingComparable[];
};

/**
 * Calculates recency weighting factor based on observation/sale date.
 * Recent sales (< 1 year) get full 1.0 weight; 1-3 years get 0.95; > 3 years get 0.90.
 */
function getRecencyFactor(dateString?: string): number {
  if (!dateString) return 0.90;
  try {
    const saleDate = new Date(dateString);
    if (isNaN(saleDate.getTime())) return 0.90;
    const now = new Date();
    const diffMonths = (now.getFullYear() - saleDate.getFullYear()) * 12 + (now.getMonth() - saleDate.getMonth());
    if (diffMonths <= 12) return 1.0;
    if (diffMonths <= 36) return 0.95;
    return 0.90;
  } catch {
    return 0.90;
  }
}

/**
 * Calculates carat weight proximity factor.
 * Staggering penalizes comparing a 1ct stone against a 5ct stone without size adjustment.
 */
function getCaratProximityFactor(candidateCarat: number, referenceCarat: number): number {
  if (candidateCarat <= 0 || referenceCarat <= 0) return 0.8;
  const ratio = candidateCarat / referenceCarat;
  // If weights are within 25% of each other (0.8 <= ratio <= 1.25)
  if (ratio >= 0.8 && ratio <= 1.25) return 1.0;
  // If within 50%
  if (ratio >= 0.5 && ratio <= 2.0) return 0.92;
  // Further apart
  return 0.80;
}

/**
 * Resolves treatment multiplier relative to candidate stone.
 */
function getTreatmentMultiplier(candidateStatus?: string, referenceStatus?: string): number {
  const candKey = (candidateStatus || "unknown").toLowerCase() as keyof typeof TREATMENT_RULES.status;
  const refKey = (referenceStatus || "unknown").toLowerCase() as keyof typeof TREATMENT_RULES.status;

  const candWeight = TREATMENT_RULES.status[candKey] ?? 1.0;
  const refWeight = TREATMENT_RULES.status[refKey] ?? 1.0;

  return refWeight > 0 ? Number((candWeight / refWeight).toFixed(4)) : 1.0;
}

/**
 * Resolves origin multiplier relative to candidate stone.
 */
function getOriginMultiplier(candidateOrigin?: string, referenceOrigin?: string): number {
  const normCand = (candidateOrigin || "unknown").toLowerCase().replace(/\s+/g, "");
  const normRef = (referenceOrigin || "unknown").toLowerCase().replace(/\s+/g, "");

  const candWeight = (ORIGIN_RULES.value as Record<string, number>)[normCand] ?? 1.0;
  const refWeight = (ORIGIN_RULES.value as Record<string, number>)[normRef] ?? 1.0;

  return refWeight > 0 ? Number((candWeight / refWeight).toFixed(4)) : 1.0;
}

/**
 * Robust explainable comparable price aggregation engine.
 * Computes individual per-comparable adjustments, price-per-carat normalization,
 * multi-factor weights, and actual variance-derived price ranges.
 */
export function calculateComparableReferencePrice(
  references: ComparableReferenceInput[],
  candidateContext?: CandidateGemstoneContext
): ComparableAggregationResult | null {
  const candidateCarat = candidateContext?.caratWeight ?? 1.0;

  // Filter valid comparables with positive price, positive carat, and valid similarity
  const validReferences = references.filter(
    (ref) =>
      ref.referencePrice > 0 &&
      ref.caratWeight > 0 &&
      ref.similarity.overall !== null &&
      ref.similarity.overall > 0
  );

  if (validReferences.length === 0) {
    return null;
  }

  // 1. Compute individual per-comparable adjustments
  const preparedComparables = validReferences.map((ref, idx) => {
    const rawPricePerCarat = ref.pricePerCarat && ref.pricePerCarat > 0
      ? ref.pricePerCarat
      : Math.round(ref.referencePrice / ref.caratWeight);

    const refTreatmentStatus = ref.treatment?.status || "Unknown";
    const refOriginValue = ref.origin?.value || "Unknown";

    const treatmentMultiplier = candidateContext
      ? getTreatmentMultiplier(candidateContext.treatment?.status, refTreatmentStatus)
      : 1.0;

    const originMultiplier = candidateContext
      ? getOriginMultiplier(candidateContext.origin?.value, refOriginValue)
      : 1.0;

    const adjustedPricePerCarat = Math.round(
      rawPricePerCarat * treatmentMultiplier * originMultiplier
    );

    const similarity = (ref.similarity.overall ?? 70) / 100;
    const recency = getRecencyFactor(ref.saleDate || ref.observationDate);
    const proximity = getCaratProximityFactor(candidateCarat, ref.caratWeight);

    const effectiveWeight = Number((similarity * recency * proximity).toFixed(4));

    return {
      referenceId: ref.referenceId || `REF-COMP-${idx + 1}`,
      caratWeight: ref.caratWeight,
      currency: ref.currency || "LKR",
      rawReferencePrice: ref.referencePrice,
      rawPricePerCarat,
      normalizedPricePerCarat: rawPricePerCarat,
      treatmentStatus: refTreatmentStatus,
      treatmentMultiplier,
      originValue: refOriginValue,
      originMultiplier,
      adjustedPricePerCarat,
      similarityScore: ref.similarity.overall ?? 0,
      effectiveWeight,
      contributionPercentage: 0, // will compute after sum
      transactionContext: ref.transactionContext || "Completed Sale",
      marketContext: ref.marketContext || "Wholesale",
      observationDate: ref.saleDate || ref.observationDate || "",
      source: ref.source || "Market Registry",
    };
  });

  const totalWeight = preparedComparables.reduce(
    (acc, comp) => acc + comp.effectiveWeight,
    0
  );

  if (totalWeight <= 0) {
    return null;
  }

  // Compute contribution percentages
  for (const comp of preparedComparables) {
    comp.contributionPercentage = Number(
      ((comp.effectiveWeight / totalWeight) * 100).toFixed(1)
    );
  }

  // 2. Weighted average price per carat
  const weightedPricePerCaratTotal = preparedComparables.reduce(
    (acc, comp) => acc + comp.adjustedPricePerCarat * comp.effectiveWeight,
    0
  );

  const benchmarkPricePerCarat = Math.round(weightedPricePerCaratTotal / totalWeight);
  const suggestedTotalPrice = Math.round(benchmarkPricePerCarat * candidateCarat);

  // 3. Dispersion and adaptive price range
  // Compute weighted variance of adjusted prices per carat
  const weightedVariance = preparedComparables.reduce(
    (acc, comp) =>
      acc + comp.effectiveWeight * Math.pow(comp.adjustedPricePerCarat - benchmarkPricePerCarat, 2),
    0
  ) / totalWeight;

  const standardDeviation = Math.sqrt(weightedVariance);
  const relativeDispersion = benchmarkPricePerCarat > 0
    ? Number((standardDeviation / benchmarkPricePerCarat).toFixed(4))
    : 0.10;

  // Adaptive range percentage: minimum 5%, maximum 20%, calibrated to data dispersion
  const rangePercentage = Math.max(0.05, Math.min(0.20, relativeDispersion));

  const minPricePerCarat = Math.round(benchmarkPricePerCarat * (1 - rangePercentage));
  const maxPricePerCarat = Math.round(benchmarkPricePerCarat * (1 + rangePercentage));

  const minTotalPrice = Math.round(minPricePerCarat * candidateCarat);
  const maxTotalPrice = Math.round(maxPricePerCarat * candidateCarat);

  // Observed min and max comparable price per carat
  const allAdjPrices = preparedComparables.map((c) => c.adjustedPricePerCarat);
  const observedMin = Math.min(...allAdjPrices);
  const observedMax = Math.max(...allAdjPrices);

  return {
    benchmarkPricePerCarat,
    suggestedTotalPrice,
    rangePercentage: Number((rangePercentage * 100).toFixed(1)),
    priceRangePerCarat: {
      minimum: minPricePerCarat,
      maximum: maxPricePerCarat,
    },
    priceRangeTotal: {
      minimum: minTotalPrice,
      maximum: maxTotalPrice,
    },
    observedRangePerCarat: {
      min: observedMin,
      max: observedMax,
    },
    dispersion: Number((relativeDispersion * 100).toFixed(1)),
    comparableCount: preparedComparables.length,
    contributingComparables: preparedComparables,
  };
}
