import type { BaseEvaluationResult } from "./types";
import { TREATMENT_RULES } from "./rules";

export type TreatmentEvaluationInput = {
  status: string;
  type: string;
};

export type TreatmentEvaluationResult = BaseEvaluationResult & {
  adjustmentFactor: number | null;
};

function getTreatmentAdjustmentFactor(
  status: string
): number | null {
  const normalizedStatus = status.trim().toLowerCase();

  const matchedKey = Object.keys(TREATMENT_RULES.status).find(
    (key) => key.toLowerCase() === normalizedStatus
  );

  return matchedKey
    ? TREATMENT_RULES.status[
        matchedKey as keyof typeof TREATMENT_RULES.status
      ]
    : null;
}

export function evaluateTreatment(
  treatment: TreatmentEvaluationInput
): TreatmentEvaluationResult {
  const adjustmentFactor = getTreatmentAdjustmentFactor(
    treatment.status
  );

  if (adjustmentFactor === null) {
    return {
      status: "UNAVAILABLE",
      reason:
        "Treatment adjustment could not be determined because the treatment status is unsupported.",
      adjustmentFactor: null,
    };
  }

  return {
    status: "COMPLETED",
    reason:
      "Prototype Treatment price adjustment factor determined from the treatment status.",
    adjustmentFactor,
  };
}
