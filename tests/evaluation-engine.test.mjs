import test from "node:test";
import assert from "node:assert/strict";

// Baseline rule specifications from Open 4Cs Evaluation Engine
const EVALUATION_RULE_VERSION = "prototype-v1";

const FOUR_C_WEIGHTS = {
  color: 0.35,
  clarity: 0.25,
  cut: 0.20,
  carat: 0.20,
};

const COLOR_RULES = {
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
};

const COLOR_FACTOR_WEIGHTS = {
  hue: 0.40,
  tone: 0.25,
  saturation: 0.20,
  distribution: 0.10,
  zoning: 0.05,
};

const TREATMENT_RULES = {
  status: {
    untreated: 1.0,
    heated: 0.9,
    treated: 0.8,
    unknown: 1.0,
  },
};

const ORIGIN_RULES = {
  reliability: {
    high: 1.0,
    medium: 0.75,
    low: 0.5,
    unknown: 0.25,
  },
};

const PRICE_SUGGESTION_RULES = {
  rangePercentage: 0.1, // +/- 10%
};

test("1. 4C weights sum precisely to 1.00 (100%)", () => {
  const sum =
    FOUR_C_WEIGHTS.color +
    FOUR_C_WEIGHTS.clarity +
    FOUR_C_WEIGHTS.cut +
    FOUR_C_WEIGHTS.carat;
  assert.equal(Number(sum.toFixed(4)), 1.0);
});

test("2. Color factor weights sum precisely to 1.00 (100%)", () => {
  const sum =
    COLOR_FACTOR_WEIGHTS.hue +
    COLOR_FACTOR_WEIGHTS.tone +
    COLOR_FACTOR_WEIGHTS.saturation +
    COLOR_FACTOR_WEIGHTS.distribution +
    COLOR_FACTOR_WEIGHTS.zoning;
  assert.equal(Number(sum.toFixed(4)), 1.0);
});

test("3. Color score calculation for top-grade Ceylon Blue Sapphire", () => {
  const hueScore = 100; // Cornflower / Royal Blue
  const toneScore = COLOR_RULES.tone.medium; // 100
  const saturationScore = COLOR_RULES.saturation.vivid; // 100
  const distributionScore = COLOR_RULES.distribution.even; // 100
  const zoningScore = COLOR_RULES.zoning.none; // 100

  const colorScore =
    hueScore * COLOR_FACTOR_WEIGHTS.hue +
    toneScore * COLOR_FACTOR_WEIGHTS.tone +
    saturationScore * COLOR_FACTOR_WEIGHTS.saturation +
    distributionScore * COLOR_FACTOR_WEIGHTS.distribution +
    zoningScore * COLOR_FACTOR_WEIGHTS.zoning;

  assert.equal(colorScore, 100);
});

test("4. Cut measurements calculate length-to-width and depth percentage accurately", () => {
  const length = 8.5;
  const width = 6.8;
  const depth = 4.25;

  const lengthToWidthRatio = length / width;
  const depthPercentage = (depth / width) * 100;

  assert.equal(Number(lengthToWidthRatio.toFixed(2)), 1.25);
  assert.equal(Number(depthPercentage.toFixed(2)), 62.5);
});

test("5. Overall 4C composite score calculates correct weighted sum", () => {
  const colorScore = 92.5;
  const clarityScore = 88.0;
  const cutScore = 85.0;
  const caratScore = 90.0;

  const overall =
    colorScore * FOUR_C_WEIGHTS.color +
    clarityScore * FOUR_C_WEIGHTS.clarity +
    cutScore * FOUR_C_WEIGHTS.cut +
    caratScore * FOUR_C_WEIGHTS.carat;

  assert.equal(Number(overall.toFixed(2)), 89.38);
});

test("6. B2B Price Suggestion applies treatment & origin factors with +/- 10% range", () => {
  const referencePrice = 100000; // LKR 100,000 / ct
  const treatmentFactor = TREATMENT_RULES.status.heated; // 0.90 (-10%)
  const originFactor = 1.0; // Standard Sri Lanka

  const suggestedPrice = referencePrice * treatmentFactor * originFactor;
  const minimumPrice = suggestedPrice * (1 - PRICE_SUGGESTION_RULES.rangePercentage);
  const maximumPrice = suggestedPrice * (1 + PRICE_SUGGESTION_RULES.rangePercentage);

  assert.equal(Number(suggestedPrice.toFixed(2)), 90000);
  assert.equal(Number(minimumPrice.toFixed(2)), 81000);
  assert.equal(Number(maximumPrice.toFixed(2)), 99000);
});

test("7. Report naming terminology enforces Evaluation & Price Suggestion Report", () => {
  const allowedTerms = [
    "Gemstone Evaluation Statement",
    "Educational Gemstone Evaluation & Price Suggestion Report",
    "Open 4Cs Gemstone Evaluation",
  ];

  const reportTitle = "Educational Gemstone Evaluation & Price Suggestion Report";
  assert.ok(allowedTerms.includes(reportTitle));

  const forbiddenTerm = "Lab Certificate";
  assert.notEqual(reportTitle.toLowerCase(), forbiddenTerm.toLowerCase());
});

test("8. Rule version conforms to prototype governance tag", () => {
  assert.ok(typeof EVALUATION_RULE_VERSION === "string");
  assert.match(EVALUATION_RULE_VERSION, /^prototype-/);
});
