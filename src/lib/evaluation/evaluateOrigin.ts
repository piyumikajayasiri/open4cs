import type { BaseEvaluationResult } from "./types";
import { ORIGIN_RULES } from "./rules";

export type OriginEvaluationInput = {
  value: string;
  reliability: string;
};

export type OriginEvaluationResult = BaseEvaluationResult & {
  adjustmentFactor: number | null;
  reliabilityFactor: number | null;
};

function getOriginAdjustmentFactor(
  value: string
): number | null {
  const normalizedValue = value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");

  const matchedKey = Object.keys(ORIGIN_RULES.value).find(
    (key) => key.toLowerCase() === normalizedValue
  );

  return matchedKey
    ? ORIGIN_RULES.value[
        matchedKey as keyof typeof ORIGIN_RULES.value
      ]
    : null;
}

function getOriginReliabilityFactor(
  reliability: string
): number | null {
  const normalizedReliability = reliability
    .trim()
    .toLowerCase();

  const matchedKey = Object.keys(
    ORIGIN_RULES.reliability
  ).find(
    (key) => key.toLowerCase() === normalizedReliability
  );

  return matchedKey
    ? ORIGIN_RULES.reliability[
        matchedKey as keyof typeof ORIGIN_RULES.reliability
      ]
    : null;
}

export function evaluateOrigin(
  origin: OriginEvaluationInput
): OriginEvaluationResult {
  const adjustmentFactor = getOriginAdjustmentFactor(
    origin.value
  );

  const reliabilityFactor = getOriginReliabilityFactor(
    origin.reliability
  );

  if (adjustmentFactor === null) {
    return {
      status: "UNAVAILABLE",
      reason:
        "Origin adjustment could not be determined because the origin value is unsupported.",
      adjustmentFactor: null,
      reliabilityFactor: null,
    };
  }

  if (reliabilityFactor === null) {
    return {
      status: "UNAVAILABLE",
      reason:
        "Origin evaluation could not be completed because the origin reliability value is unsupported.",
      adjustmentFactor,
      reliabilityFactor: null,
    };
  }

  return {
    status: "COMPLETED",
    reason:
      "Prototype Origin adjustment and reliability factors determined from the supplied origin information.",
    adjustmentFactor,
    reliabilityFactor,
  };
}
