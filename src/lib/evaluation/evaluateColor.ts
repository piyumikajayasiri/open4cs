import type { ScoredEvaluationResult } from "./types";
import {
  COLOR_RULES,
  COLOR_FACTOR_WEIGHTS,
  COLOR_HUE_RULES,
} from "./rules";

export type ColorEvaluationInput = {
  variety: string;
  hue: string;
  tone: string;
  saturation: string;
  distribution: string;
  zoning: string;
};

export type ColorEvaluationResult = ScoredEvaluationResult;

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

export function evaluateColor(
  color: ColorEvaluationInput
): ColorEvaluationResult {
  const hueRules =
    COLOR_HUE_RULES[
      color.variety as keyof typeof COLOR_HUE_RULES
    ];

  if (!hueRules) {
    return {
      status: "UNAVAILABLE",
      reason: "Color score could not be calculated for this gemstone variety.",
      score: null,
    };
  }

  const hueScore = getRuleScore(
    color.hue,
    hueRules
  );

  const toneScore = getRuleScore(
    color.tone,
    COLOR_RULES.tone
  );

  const saturationScore = getRuleScore(
    color.saturation,
    COLOR_RULES.saturation
  );

  const distributionScore = getRuleScore(
    color.distribution,
    COLOR_RULES.distribution
  );

  const zoningScore = getRuleScore(
    color.zoning,
    COLOR_RULES.zoning
  );

  if (
    hueScore === null ||
    toneScore === null ||
    saturationScore === null ||
    distributionScore === null ||
    zoningScore === null
  ) {
    return {
      status: "UNAVAILABLE",
      reason:
        "Color score could not be calculated because one or more Color values are unsupported.",
      score: null,
    };
  }

  const score =
    hueScore * COLOR_FACTOR_WEIGHTS.hue +
    toneScore * COLOR_FACTOR_WEIGHTS.tone +
    saturationScore * COLOR_FACTOR_WEIGHTS.saturation +
    distributionScore * COLOR_FACTOR_WEIGHTS.distribution +
    zoningScore * COLOR_FACTOR_WEIGHTS.zoning;

  return {
    status: "COMPLETED",
    reason:
      "Prototype Color score calculated from hue, tone, saturation, distribution, and zoning.",
    score: Number(score.toFixed(2)),
  };
}
