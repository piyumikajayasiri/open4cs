import type { ScoredEvaluationResult } from "./types";
import {
  CLARITY_RULES,
  CLARITY_FACTOR_WEIGHTS,
} from "./rules";

export type ClarityEvaluationInput = {
  nakedEye: string;
  loupe10x: string;
  inclusionType: string;
  inclusionLocation: string;
  severity: string;
};

export type ClarityEvaluationResult = ScoredEvaluationResult;

function getRuleScore(
  value: string,
  rules: Record<string, number>
): number | null {
  const normalizedValue = value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");

  const matchedKey = Object.keys(rules).find(
    (key) => key.toLowerCase() === normalizedValue
  );

  return matchedKey ? rules[matchedKey] : null;
}

export function evaluateClarity(
  clarity: ClarityEvaluationInput
): ClarityEvaluationResult {
  const nakedEyeScore = getRuleScore(
    clarity.nakedEye,
    CLARITY_RULES.nakedEye
  );

  const loupe10xScore = getRuleScore(
    clarity.loupe10x,
    CLARITY_RULES.loupe10x
  );

  const severityScore = getRuleScore(
    clarity.severity,
    CLARITY_RULES.severity
  );

  if (
    nakedEyeScore === null ||
    loupe10xScore === null ||
    severityScore === null
  ) {
    return {
      status: "UNAVAILABLE",
      reason:
        "Clarity score could not be calculated because one or more Clarity values are unsupported.",
      score: null,
    };
  }

  const score =
    nakedEyeScore * CLARITY_FACTOR_WEIGHTS.nakedEye +
    loupe10xScore * CLARITY_FACTOR_WEIGHTS.loupe10x +
    severityScore * CLARITY_FACTOR_WEIGHTS.severity;

  return {
    status: "COMPLETED",
    reason:
      "Prototype Clarity score calculated from naked-eye observation, 10× loupe observation, and inclusion severity. Inclusion type and location are not yet applied.",
    score: Number(score.toFixed(2)),
  };
}
