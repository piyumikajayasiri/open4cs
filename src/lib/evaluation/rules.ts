export const EVALUATION_RULE_VERSION = "prototype-v1";

export const ENGINE_SUPPORTED_VARIETIES = [
  "Blue Sapphire",
  "Padparadscha",
  "Ruby",
] as const;

export const ENGINE_SUPPORTED_TREATMENTS = [
  "Untreated",
  "Heated",
  "Treated",
  "Unknown",
] as const;

export const ENGINE_SUPPORTED_ORIGINS = [
  "Sri Lanka",
  "Myanmar",
  "Madagascar",
  "Other",
  "Unknown",
] as const;

export const ENGINE_SUPPORTED_ORIGIN_RELIABILITIES = [
  "High",
  "Medium",
  "Low",
  "Unknown",
] as const;

export const SCORE_RANGE = {
  minimum: 0,
  maximum: 100,
} as const;

export const FOUR_C_WEIGHTS = {
  color: 0.35,
  clarity: 0.25,
  cut: 0.20,
  carat: 0.20,
} as const;

export const COLOR_RULES = {
  tone: {
    veryLight: 40,
    light: 60,
    medium: 100,
    dark: 70,
    veryDark: 50,
  },

  saturation: {
    weak: 40,
    moderate: 70,
    strong: 90,
    vivid: 100,
  },

  distribution: {
    uneven: 60,
    mostlyEven: 80,
    even: 100,
  },

  zoning: {
    severe: 50,
    moderate: 70,
    slight: 85,
    none: 100,
  },
} as const;

export const COLOR_HUE_RULES = {
  "Blue Sapphire": {
    blue: 100,
    violetBlue: 90,
    greenishBlue: 75,
  },

  Padparadscha: {
    pinkishOrange: 100,
    orangishPink: 100,
    orangePink: 95,
  },

  Ruby: {
    red: 100,
    purplishRed: 90,
    orangishRed: 80,
  },
} as const;

export const COLOR_FACTOR_WEIGHTS = {
  hue: 0.25,
  tone: 0.20,
  saturation: 0.25,
  distribution: 0.15,
  zoning: 0.15,
} as const;

export const CLARITY_RULES = {
  nakedEye: {
    clean: 100,
    verySlight: 90,
    slight: 75,
    noticeable: 55,
    obvious: 35,
  },

  loupe10x: {
    clean: 100,
    verySlight: 90,
    slight: 75,
    noticeable: 55,
    obvious: 35,
  },

  severity: {
    none: 100,
    minor: 85,
    moderate: 65,
    severe: 40,
  },
} as const;

export const CLARITY_FACTOR_WEIGHTS = {
  nakedEye: 0.40,
  loupe10x: 0.35,
  severity: 0.25,
} as const;

export const CUT_RULES = {
  symmetry: {
    excellent: 100,
    good: 85,
    fair: 65,
    poor: 40,
  },

  polish: {
    excellent: 100,
    good: 85,
    fair: 65,
    poor: 40,
  },

  windowing: {
    none: 100,
    slight: 85,
    moderate: 60,
    severe: 35,
  },

  extinction: {
    none: 100,
    slight: 85,
    moderate: 60,
    severe: 35,
  },

  bulging: {
    none: 100,
    slight: 85,
    moderate: 60,
    severe: 35,
  },
} as const;

export const CUT_FACTOR_WEIGHTS = {
  symmetry: 0.25,
  polish: 0.20,
  windowing: 0.20,
  extinction: 0.20,
  bulging: 0.15,
} as const;

export const CARAT_RULES = {
  weightBands: [
    {
      min: 0.01,
      max: 0.49,
      score: 60,
    },
    {
      min: 0.5,
      max: 0.99,
      score: 70,
    },
    {
      min: 1.0,
      max: 1.99,
      score: 80,
    },
    {
      min: 2.0,
      max: 2.99,
      score: 90,
    },
    {
      min: 3.0,
      max: Number.POSITIVE_INFINITY,
      score: 100,
    },
  ],
  sizeConsistency: {
    expectedMin: 35,
    expectedMax: 65,
    adjustment: {
      consistent: 5,
      unusual: -5,
    },
  },
} as const;

export const TREATMENT_RULES = {
  status: {
    untreated: 1.0,
    heated: 0.9,
    treated: 0.8,
    unknown: 1.0,
  },
} as const;

export const ORIGIN_RULES = {
  value: {
    sriLanka: 1.0,
    myanmar: 1.0,
    madagascar: 1.0,
    other: 1.0,
    unknown: 1.0,
  },

  reliability: {
    high: 1.0,
    medium: 0.75,
    low: 0.5,
    unknown: 0.25,
  },
} as const;

export const REFERENCE_COMPARISON_RULES = {
  minimumSimilarityForPricing: 70,
  minimumReferencesForSimilarity: 2,
};

export const PRICE_SUGGESTION_RULES = {
  rangePercentage: 0.1,
} as const;

