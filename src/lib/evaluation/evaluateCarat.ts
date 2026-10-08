import type { ScoredEvaluationResult } from "./types";
import { CARAT_RULES } from "./rules";

export type CaratEvaluationInput = {
  caratWeight: number;
  length: number;
  width: number;
  depth: number;
};

export type CaratEvaluationResult = ScoredEvaluationResult & {
  caratWeight: number;
  dimensions: {
    length: number;
    width: number;
    depth: number;
  };
  sizeConsistency: number | null;
};

function calculateSizeConsistency(
  caratWeight: number,
  length: number,
  width: number,
  depth: number
): number | null {
  if (
    caratWeight <= 0 ||
    length <= 0 ||
    width <= 0 ||
    depth <= 0
  ) {
    return null;
  }

  const volumeIndicator = length * width * depth;

  return Number(
    (volumeIndicator / caratWeight).toFixed(2)
  );
}

export function evaluateCarat(
  carat: CaratEvaluationInput
): CaratEvaluationResult {
  const sizeConsistency = calculateSizeConsistency(
    carat.caratWeight,
    carat.length,
    carat.width,
    carat.depth
  );

  const weightBand = CARAT_RULES.weightBands.find(
    (band) =>
      carat.caratWeight >= band.min &&
      carat.caratWeight <= band.max
  );

  if (!weightBand) {
    return {
      status: "UNAVAILABLE",
      reason:
        "Carat score could not be calculated because the Carat Weight is outside the supported prototype range.",
      score: null,
      caratWeight: carat.caratWeight,
      dimensions: {
        length: carat.length,
        width: carat.width,
        depth: carat.depth,
      },
      sizeConsistency,
    };
  }

  const isSizeConsistent =
    sizeConsistency !== null &&
    sizeConsistency >= CARAT_RULES.sizeConsistency.expectedMin &&
    sizeConsistency <= CARAT_RULES.sizeConsistency.expectedMax;

  const sizeAdjustment = isSizeConsistent
    ? CARAT_RULES.sizeConsistency.adjustment.consistent
    : CARAT_RULES.sizeConsistency.adjustment.unusual;

  const finalScore = Math.max(
    0,
    Math.min(100, weightBand.score + sizeAdjustment)
  );

  const weightReason = `Prototype Carat score calculated from the Carat Weight band (${weightBand.score}/100).`;
  const sizeReason = isSizeConsistent
    ? "The entered dimensions are reasonably consistent with the entered carat weight under the current prototype size-consistency rule."
    : "The entered dimensions have an unusual relationship with the entered carat weight under the current prototype rule. Check that the measurements and carat weight were entered correctly.";

  return {
    status: "COMPLETED",
    reason:
      `${weightReason} ${sizeReason} ` +
      `The dimension check applies only a small adjustment and does not verify gemstone density, authenticity, or carat weight.`,
    score: finalScore,
    caratWeight: carat.caratWeight,
    dimensions: {
      length: carat.length,
      width: carat.width,
      depth: carat.depth,
    },
    sizeConsistency,
  };
}
