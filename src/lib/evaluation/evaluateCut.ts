import type { ScoredEvaluationResult } from "./types";
import {
  CUT_RULES,
  CUT_FACTOR_WEIGHTS,
} from "./rules";

export type CutEvaluationInput = {
  length: number;
  width: number;
  depth: number;
  symmetry: string;
  polish: string;
  windowing: string;
  extinction: string;
  bulging: string;
};

export type CutEvaluationResult = ScoredEvaluationResult & {
  measurements: {
    lengthToWidthRatio: number | null;
    depthPercentage: number | null;
  };
};

function getRuleScore(
  value: string,
  rules: Record<string, number>
): number | null {
  const normalizedValue = value.trim().toLowerCase();

  const matchedKey = Object.keys(rules).find(
    (key) => key.toLowerCase() === normalizedValue
  );

  return matchedKey ? rules[matchedKey] : null;
}

export function evaluateCut(
  cut: CutEvaluationInput
): CutEvaluationResult {
  const hasValidDimensions =
    cut.length > 0 &&
    cut.width > 0 &&
    cut.depth > 0;

  if (!hasValidDimensions) {
    return {
      status: "PENDING",
      reason: "Valid gemstone dimensions are required for Cut calculations.",
      score: null,
      measurements: {
        lengthToWidthRatio: null,
        depthPercentage: null,
      },
    };
  }

  const symmetryScore = getRuleScore(
    cut.symmetry,
    CUT_RULES.symmetry
  );

  const polishScore = getRuleScore(
    cut.polish,
    CUT_RULES.polish
  );

  const windowingScore = getRuleScore(
    cut.windowing,
    CUT_RULES.windowing
  );

  const extinctionScore = getRuleScore(
    cut.extinction,
    CUT_RULES.extinction
  );

  const bulgingScore = getRuleScore(
    cut.bulging,
    CUT_RULES.bulging
  );

  const lengthToWidthRatio = cut.length / cut.width;

  const depthPercentage =
    (cut.depth / cut.width) * 100;

  if (
    symmetryScore === null ||
    polishScore === null ||
    windowingScore === null ||
    extinctionScore === null ||
    bulgingScore === null
  ) {
    return {
      status: "UNAVAILABLE",
      reason:
        "Cut score could not be calculated because one or more Cut values are unsupported.",
      score: null,
      measurements: {
        lengthToWidthRatio: Number(lengthToWidthRatio.toFixed(2)),
        depthPercentage: Number(depthPercentage.toFixed(2)),
      },
    };
  }

  const score =
    symmetryScore * CUT_FACTOR_WEIGHTS.symmetry +
    polishScore * CUT_FACTOR_WEIGHTS.polish +
    windowingScore * CUT_FACTOR_WEIGHTS.windowing +
    extinctionScore * CUT_FACTOR_WEIGHTS.extinction +
    bulgingScore * CUT_FACTOR_WEIGHTS.bulging;

  return {
    status: "COMPLETED",
    reason:
      "Prototype Cut score calculated from symmetry, polish, windowing, extinction, and bulging. Proportion measurements are reported separately and are not yet included in scoring.",
    score: Number(score.toFixed(2)),
    measurements: {
      lengthToWidthRatio: Number(lengthToWidthRatio.toFixed(2)),
      depthPercentage: Number(depthPercentage.toFixed(2)),
    },
  };
}
