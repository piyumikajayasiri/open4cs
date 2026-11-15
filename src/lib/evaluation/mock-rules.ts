import type { EvaluationInput, RuleSet } from "./types";

// Invented rules for exercising the software. Historical records supply all base prices.
const depthRanges: RuleSet["depthRanges"] = {
  OVAL: [55, 75], ROUND: [55, 70], CUSHION: [55, 75], PEAR: [55, 75], EMERALD: [55, 75],
};
const matching = { relativeWeightTolerance: 0.5, maxComponentScoreDifference: 3, minimumComparables: 2, maximumComparables: 5 };
const pricing = { adjustmentPerScorePoint: 0.05, maximumAdjustmentPercentage: 25 };
const scoring: RuleSet["scoring"] = {
  severityPenalty: { NONE: 0, MINOR: 0.5, MODERATE: 1.5, SEVERE: 3 },
  qualityScore: { EXCELLENT: 10, GOOD: 8, FAIR: 5, POOR: 2 },
  saturationScore: { WEAK: 4, MEDIUM: 6, STRONG: 8, VIVID: 10 },
  nakedEyeScore: { CLEAN: 10, SLIGHTLY_INCLUDED: 8, INCLUDED: 5 },
  loupeScore: { MINOR: 10, MODERATE: 7, HEAVY: 4 },
  tonePenaltyPerStep: 0.75, unevenDistributionPenalty: 1, depthPenalty: 2,
  caratBands: [{ minimum: 0, score: 5 }, { minimum: 1, score: 6 }, { minimum: 2, score: 7 }, { minimum: 3, score: 8 }, { minimum: 5, score: 9 }],
};
export const MOCK_RULES: Record<EvaluationInput["variety"], RuleSet> = {
  RUBY: {
    version: "mock-ruby-v2", variety: "RUBY", dataKind: "MOCK", approval: "PROVISIONAL",
    hues: ["RED", "PURPLISH_RED"], toneRange: [4, 6],
    weights: { color: 0.45, clarity: 0.2, cut: 0.25, carat: 0.1 }, depthRanges,
    rangePercentage: 20, matching, pricing, scoring,
  },
  SAPPHIRE: {
    version: "mock-sapphire-v2", variety: "SAPPHIRE", dataKind: "MOCK", approval: "PROVISIONAL",
    hues: ["BLUE", "PINK", "YELLOW", "GREEN", "PURPLE", "COLORLESS"], toneRange: [4, 6],
    weights: { color: 0.4, clarity: 0.25, cut: 0.25, carat: 0.1 }, depthRanges,
    rangePercentage: 20, matching, pricing, scoring,
  },
};
