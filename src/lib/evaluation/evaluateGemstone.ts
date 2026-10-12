import {
  evaluateColor,
  type ColorEvaluationResult,
} from "./evaluateColor";

import {
  evaluateClarity,
  type ClarityEvaluationResult,
} from "./evaluateClarity";

import {
  evaluateCut,
  type CutEvaluationResult,
} from "./evaluateCut";

import {
  evaluateCarat,
  type CaratEvaluationResult,
} from "./evaluateCarat";

import {
  evaluateTreatment,
  type TreatmentEvaluationResult,
} from "./evaluateTreatment";

import {
  evaluateOrigin,
  type OriginEvaluationResult,
} from "./evaluateOrigin";

import {
  generateRecommendations,
  type RecommendationResult,
} from "./recommendations";

import type {
  EvaluationStatus,
  Overall4CEvaluationResult,
} from "./types";
import type { EvaluationInput, InformationReliability } from "./evaluationInput";
import { EVALUATION_RULE_VERSION, FOUR_C_WEIGHTS } from "./rules";

export type EvaluationResult = {
  status: EvaluationStatus;
  ruleVersion: string;
  overall4C: Overall4CEvaluationResult;
  color: ColorEvaluationResult;
  clarity: ClarityEvaluationResult;
  cut: CutEvaluationResult;
  carat: CaratEvaluationResult;
  treatment: TreatmentEvaluationResult;
  origin: OriginEvaluationResult;
  informationReliability: {
    measurements: InformationReliability;
    treatment: InformationReliability;
    origin: InformationReliability;
  };
  recommendations: RecommendationResult;
};

export function evaluateGemstone(
  gemstone: EvaluationInput
): EvaluationResult {
  const color = evaluateColor({
    variety: gemstone.variety,
    ...gemstone.color,
  });
  const clarity = evaluateClarity(gemstone.clarity);
  const cut = evaluateCut(gemstone.cut);
  const carat = evaluateCarat({
    caratWeight: gemstone.caratWeight,
    length: gemstone.cut.length,
    width: gemstone.cut.width,
    depth: gemstone.cut.depth,
  });
  const treatment = evaluateTreatment(gemstone.treatment);
  const origin = evaluateOrigin(gemstone.origin);

  const recommendations = generateRecommendations({
    color: {
      distribution: gemstone.color.distribution,
      zoning: gemstone.color.zoning,
    },

    clarity: {
      nakedEye: gemstone.clarity.nakedEye,
      loupe10x: gemstone.clarity.loupe10x,
      severity: gemstone.clarity.severity,
    },

    cut: {
      symmetry: gemstone.cut.symmetry,
      polish: gemstone.cut.polish,
      windowing: gemstone.cut.windowing,
      extinction: gemstone.cut.extinction,
      bulging: gemstone.cut.bulging,
    },

    measurements: {
      lengthToWidthRatio:
        cut.measurements.lengthToWidthRatio,
      depthPercentage:
        cut.measurements.depthPercentage,
    },

    originReliability: gemstone.origin.reliability,
    informationReliability: gemstone.informationReliability,
  });

  const overall4CScore =
    color.score !== null &&
    clarity.score !== null &&
    cut.score !== null &&
    carat.score !== null
      ? color.score * FOUR_C_WEIGHTS.color +
        clarity.score * FOUR_C_WEIGHTS.clarity +
        cut.score * FOUR_C_WEIGHTS.cut +
        carat.score * FOUR_C_WEIGHTS.carat
      : null;

  const overall4C: Overall4CEvaluationResult = {
    status: overall4CScore !== null ? "COMPLETED" : "UNAVAILABLE",
    reason:
      overall4CScore !== null
        ? "Prototype Overall 4C score calculated from Color, Clarity, Cut, and Carat Weight."
        : "Overall 4C score could not be calculated because one or more 4C scores are unavailable.",
    score:
      overall4CScore !== null
        ? Number(overall4CScore.toFixed(2))
        : null,
    weights: {
      color: FOUR_C_WEIGHTS.color,
      clarity: FOUR_C_WEIGHTS.clarity,
      cut: FOUR_C_WEIGHTS.cut,
      carat: FOUR_C_WEIGHTS.carat,
    },
  };

  const status: EvaluationStatus =
    overall4C.status === "COMPLETED"
      ? "COMPLETED"
      : overall4C.status === "UNAVAILABLE"
        ? "UNAVAILABLE"
        : "PENDING";

  return {
    status,
    ruleVersion: EVALUATION_RULE_VERSION,
    overall4C,
    color,
    clarity,
    cut,
    carat,
    treatment,
    origin,
    informationReliability: gemstone.informationReliability,
    recommendations,
  };
}
