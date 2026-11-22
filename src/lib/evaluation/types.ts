export type Variety = "RUBY" | "SAPPHIRE";
export type Grade = "EXCELLENT" | "GOOD" | "FAIR" | "POOR";
export type Severity = "NONE" | "MINOR" | "MODERATE" | "SEVERE";
export type Treatment = "UNHEATED" | "HEATED" | "UNKNOWN";
export type Hue = "RED" | "PURPLISH_RED" | "BLUE" | "PINK" | "YELLOW" | "GREEN" | "PURPLE" | "COLORLESS";

export interface EvaluationInput {
  catalogueId?: string;
  variety: Variety;
  origin: "Sri Lanka";
  originReliability: "LAB_VERIFIED" | "SELLER_PROVIDED" | "UNVERIFIED";
  treatment: Treatment;
  caratWeight: number;
  shape: "OVAL" | "ROUND" | "CUSHION" | "PEAR" | "EMERALD";
  color: {
    hue: Hue;
    tone: number;
    saturation: "WEAK" | "MEDIUM" | "STRONG" | "VIVID";
    distribution: "EVEN" | "UNEVEN";
    zoning: Severity;
  };
  clarity: {
    inclusionType?: string;
    inclusionLocation?: string;
    durabilityConcern?: "NONE_OBSERVED" | "POSSIBLE" | "UNKNOWN";
    nakedEye: "CLEAN" | "SLIGHTLY_INCLUDED" | "INCLUDED";
    loupe10x: "MINOR" | "MODERATE" | "HEAVY";
    severity: Severity;
  };
  cut: {
    length: number;
    width: number;
    depth: number;
    symmetry: Grade;
    polish: Grade;
    windowing: Severity;
    extinction: Severity;
    bulging: Severity;
  };
}

export interface RuleSet {
  version: string;
  variety: Variety;
  dataKind: "MOCK" | "REFERENCE";
  approval: "PROVISIONAL" | "PENDING" | "APPROVED";
  currency?: "USD" | "LKR";
  maximumReferenceAgeDays?: number;
  hues: readonly Hue[];
  toneRange: readonly [number, number];
  weights: { color: number; clarity: number; cut: number; carat: number };
  depthRanges: Record<EvaluationInput["shape"], readonly [number, number]>;
  rangePercentage: number;
  scoring: {
    severityPenalty: Record<Severity, number>;
    qualityScore: Record<Grade, number>;
    saturationScore: Record<EvaluationInput["color"]["saturation"], number>;
    nakedEyeScore: Record<EvaluationInput["clarity"]["nakedEye"], number>;
    loupeScore: Record<EvaluationInput["clarity"]["loupe10x"], number>;
    tonePenaltyPerStep: number;
    unevenDistributionPenalty: number;
    depthPenalty: number;
    caratBands: { minimum: number; score: number }[];
  };
  matching: {
    relativeWeightTolerance: number;
    maxComponentScoreDifference: number;
    minimumComparables: number;
    maximumComparables: number;
  };
  pricing: {
    adjustmentPerScorePoint: number;
    maximumAdjustmentPercentage: number;
  };
}

export interface MockGemstoneRecord {
  id: string;
  dataKind: "MOCK";
  datasetVersion: string;
  observations: EvaluationInput;
  currency: "USD";
  priceBasis: "MOCK_B2B";
  totalPrice: number;
  recordedAt: string;
  source: string;
  description: string;
  isActive?: boolean;
  deletedAt?: string | Date | null;
}

// Reference records are intentionally a different type and are not engine inputs.
export interface SriLankanReference {
  id: string;
  dataKind: "REFERENCE";
  origin: "Sri Lanka";
  variety: Variety;
  source: string;
  sourceDate: string;
  qualityReviewed: boolean;
  permittedUseConfirmed: boolean;
  priceBasis: "RETAIL_ESTIMATE" | "B2B_QUOTE" | "COMPLETED_SALE";
  currency: string;
  totalPrice: number;
}
