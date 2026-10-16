import type { InformationReliability } from "./evaluationInput";

export type RecommendationCategory =
  | "COLOR"
  | "CLARITY"
  | "CUT"
  | "MEASUREMENT"
  | "VERIFICATION";

export type Recommendation = {
  category: RecommendationCategory;
  message: string;
};

export type RecommendationResult = {
  status: "COMPLETED";
  recommendations: Recommendation[];
};

export const ENGINE_RECOMMENDATION_RULE_KEYS = [
  "COLOR_UNEVEN_DISTRIBUTION",
  "COLOR_NOTICEABLE_ZONING",

  "CLARITY_NAKED_EYE_VISIBLE",
  "CLARITY_10X_VISIBLE",
  "CLARITY_SEVERE_INCLUSIONS",

  "CUT_POOR_SYMMETRY_OR_POLISH",
  "CUT_NOTICEABLE_WINDOWING",
  "CUT_NOTICEABLE_EXTINCTION",
  "CUT_NOTICEABLE_BULGING",

  "MEASUREMENT_INCOMPLETE",
  "MEASUREMENT_LENGTH_WIDTH_RATIO",
  "MEASUREMENT_DEPTH_PERCENTAGE",

  "VERIFICATION_ORIGIN_LOW_UNKNOWN",
  "VERIFICATION_ORIGIN_MEDIUM",
  "VERIFICATION_MEASUREMENTS_UNVERIFIED",
  "VERIFICATION_TREATMENT_UNVERIFIED",
  "VERIFICATION_ORIGIN_UNVERIFIED",
] as const;

export type EngineRecommendationRuleKey =
  (typeof ENGINE_RECOMMENDATION_RULE_KEYS)[number];

export function generateInformationReliabilityRecommendations(
  informationReliability: {
    measurements: InformationReliability;
    treatment: InformationReliability;
    origin: InformationReliability;
  }
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  if (informationReliability.measurements === "Unverified") {
    recommendations.push({
      category: "VERIFICATION",
      message:
        "Gemstone measurements are unverified. Verify the measurements before relying on the evaluation.",
    });
  }

  if (informationReliability.treatment === "Unverified") {
    recommendations.push({
      category: "VERIFICATION",
      message:
        "Treatment information is unverified. Consider laboratory verification where appropriate.",
    });
  }

  if (informationReliability.origin === "Unverified") {
    recommendations.push({
      category: "VERIFICATION",
      message:
        "Origin information is unverified. Consider laboratory verification where appropriate.",
    });
  }

  return recommendations;
}

export type ColorRecommendationInput = {
  distribution: string;
  zoning: string;
};

export function getColorRecommendations(
  color: ColorRecommendationInput
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  const distribution = color.distribution
    .trim()
    .toLowerCase();

  const zoning = color.zoning
    .trim()
    .toLowerCase();

  if (distribution === "uneven") {
    recommendations.push({
      category: "COLOR",
      message:
        "Uneven color distribution was observed. Review the gemstone's color distribution when assessing overall quality.",
    });
  }

  if (
    zoning === "moderate" ||
    zoning === "severe"
  ) {
    recommendations.push({
      category: "COLOR",
      message:
        "Noticeable color zoning was observed. Consider further examination of the zoning and its effect on the gemstone's appearance.",
    });
  }

  return recommendations;
}

export type ClarityRecommendationInput = {
  nakedEye: string;
  loupe10x: string;
  severity: string;
};

export function getClarityRecommendations(
  clarity: ClarityRecommendationInput
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  const nakedEye = clarity.nakedEye
    .trim()
    .toLowerCase();

  const loupe10x = clarity.loupe10x
    .trim()
    .toLowerCase();

  const severity = clarity.severity
    .trim()
    .toLowerCase();

  if (
    nakedEye === "noticeable" ||
    nakedEye === "obvious"
  ) {
    recommendations.push({
      category: "CLARITY",
      message:
        "Visible inclusions were observed with the naked eye. Review their effect on the gemstone's appearance and clarity.",
    });
  }

  if (
    loupe10x === "noticeable" ||
    loupe10x === "obvious"
  ) {
    recommendations.push({
      category: "CLARITY",
      message:
        "Noticeable inclusions were observed under 10× magnification. Consider further examination of their type and location.",
    });
  }

  if (severity === "severe") {
    recommendations.push({
      category: "CLARITY",
      message:
        "Severe inclusion characteristics were reported. Consider professional examination before relying on the clarity assessment.",
    });
  }

  return recommendations;
}

export type CutRecommendationInput = {
  symmetry: string;
  polish: string;
  windowing: string;
  extinction: string;
  bulging: string;
};

export function getCutRecommendations(
  cut: CutRecommendationInput
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  const symmetry = cut.symmetry.trim().toLowerCase();
  const polish = cut.polish.trim().toLowerCase();
  const windowing = cut.windowing.trim().toLowerCase();
  const extinction = cut.extinction.trim().toLowerCase();
  const bulging = cut.bulging.trim().toLowerCase();

  if (symmetry === "poor" || polish === "poor") {
    recommendations.push({
      category: "CUT",
      message:
        "Poor symmetry or polish was reported. Consider professional examination of the gemstone's cut quality.",
    });
  }

  if (
    windowing === "moderate" ||
    windowing === "severe"
  ) {
    recommendations.push({
      category: "CUT",
      message:
        "Noticeable windowing was observed. Consider professional assessment of whether recutting could improve the gemstone's appearance.",
    });
  }

  if (
    extinction === "moderate" ||
    extinction === "severe"
  ) {
    recommendations.push({
      category: "CUT",
      message:
        "Noticeable extinction was observed. Review its effect on brilliance and overall appearance.",
    });
  }

  if (
    bulging === "moderate" ||
    bulging === "severe"
  ) {
    recommendations.push({
      category: "CUT",
      message:
        "Noticeable bulging was reported. Consider professional assessment of the gemstone's proportions and possible recutting considerations.",
    });
  }

  return recommendations;
}

export type MeasurementRecommendationInput = {
  lengthToWidthRatio: number | null;
  depthPercentage: number | null;
};

export function getMeasurementRecommendations(
  measurements: MeasurementRecommendationInput
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  if (
    measurements.lengthToWidthRatio === null ||
    measurements.depthPercentage === null
  ) {
    recommendations.push({
      category: "MEASUREMENT",
      message:
        "Complete dimension measurements are required before proportion-related recommendations can be provided.",
    });

    return recommendations;
  }

  if (
    measurements.lengthToWidthRatio < 1 ||
    measurements.lengthToWidthRatio > 2
  ) {
    recommendations.push({
      category: "MEASUREMENT",
      message:
        "The calculated length-to-width ratio is outside the current prototype review range. Recheck the entered length and width measurements.",
    });
  }

  if (
    measurements.depthPercentage < 40 ||
    measurements.depthPercentage > 90
  ) {
    recommendations.push({
      category: "MEASUREMENT",
      message:
        "The calculated depth percentage is outside the current prototype review range. Recheck the entered width and depth measurements.",
    });
  }

  return recommendations;
}

export type VerificationRecommendationInput = {
  originReliability: string;
};

export function getVerificationRecommendations(
  input: VerificationRecommendationInput
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  const reliability = input.originReliability
    .trim()
    .toLowerCase();

  if (
    reliability === "low" ||
    reliability === "unknown"
  ) {
    recommendations.push({
      category: "VERIFICATION",
      message:
        "Origin information has low or unknown reliability. Consider laboratory verification before relying on the stated origin for pricing or evaluation.",
    });
  }

  if (reliability === "medium") {
    recommendations.push({
      category: "VERIFICATION",
      message:
        "Origin information has medium reliability. Consider additional verification when origin materially affects the evaluation or price suggestion.",
    });
  }

  return recommendations;
}

export type RecommendationInput = {
  color: ColorRecommendationInput;
  clarity: ClarityRecommendationInput;
  cut: CutRecommendationInput;
  measurements: MeasurementRecommendationInput;
  originReliability: string;
  informationReliability: {
    measurements: InformationReliability;
    treatment: InformationReliability;
    origin: InformationReliability;
  };
};

export function generateRecommendations(
  input: RecommendationInput
): RecommendationResult {
  const recommendations: Recommendation[] = [
    ...getColorRecommendations(input.color),
    ...getClarityRecommendations(input.clarity),
    ...getCutRecommendations(input.cut),
    ...getMeasurementRecommendations(
      input.measurements
    ),
    ...getVerificationRecommendations({
      originReliability: input.originReliability,
    }),
    ...generateInformationReliabilityRecommendations(
      input.informationReliability
    ),
  ];

  return {
    status: "COMPLETED",
    recommendations,
  };
}
