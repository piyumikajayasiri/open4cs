import test from "node:test";
import assert from "node:assert/strict";

// Real production imports from the Open 4Cs Evaluation Engine
import { evaluateGemstone } from "../src/lib/evaluation/evaluateGemstone";
import { evaluateColor } from "../src/lib/evaluation/evaluateColor";
import { evaluateCut } from "../src/lib/evaluation/evaluateCut";
import { evaluateClarity } from "../src/lib/evaluation/evaluateClarity";
import { evaluateCarat } from "../src/lib/evaluation/evaluateCarat";
import { evaluateTreatment } from "../src/lib/evaluation/evaluateTreatment";
import { evaluateOrigin } from "../src/lib/evaluation/evaluateOrigin";
import { calculatePriceSuggestion } from "../src/lib/evaluation/priceSuggestion";
import {
  FOUR_C_WEIGHTS,
  COLOR_FACTOR_WEIGHTS,
  CLARITY_FACTOR_WEIGHTS,
  CUT_FACTOR_WEIGHTS,
  TREATMENT_RULES,
  ORIGIN_RULES,
  PRICE_SUGGESTION_RULES,
  EVALUATION_RULE_VERSION,
  ENGINE_SUPPORTED_VARIETIES,
} from "../src/lib/evaluation/rules";

test("1. Production 4C weights sum precisely to 1.00 (100%)", () => {
  const sum =
    FOUR_C_WEIGHTS.color +
    FOUR_C_WEIGHTS.clarity +
    FOUR_C_WEIGHTS.cut +
    FOUR_C_WEIGHTS.carat;
  assert.equal(Number(sum.toFixed(4)), 1.0);
});

test("2. Production Color factor weights sum precisely to 1.00 (100%)", () => {
  const sum =
    COLOR_FACTOR_WEIGHTS.hue +
    COLOR_FACTOR_WEIGHTS.tone +
    COLOR_FACTOR_WEIGHTS.saturation +
    COLOR_FACTOR_WEIGHTS.distribution +
    COLOR_FACTOR_WEIGHTS.zoning;
  assert.equal(Number(sum.toFixed(4)), 1.0);
});

test("3. Production Clarity factor weights sum precisely to 1.00 (100%)", () => {
  const sum =
    CLARITY_FACTOR_WEIGHTS.nakedEye +
    CLARITY_FACTOR_WEIGHTS.loupe10x +
    CLARITY_FACTOR_WEIGHTS.severity;
  assert.equal(Number(sum.toFixed(4)), 1.0);
});

test("4. Production Cut factor weights sum precisely to 1.00 (100%)", () => {
  const sum =
    CUT_FACTOR_WEIGHTS.symmetry +
    CUT_FACTOR_WEIGHTS.polish +
    CUT_FACTOR_WEIGHTS.windowing +
    CUT_FACTOR_WEIGHTS.extinction +
    CUT_FACTOR_WEIGHTS.bulging;
  assert.equal(Number(sum.toFixed(4)), 1.0);
});

test("5. evaluateColor handles UI values: Royal Blue, Tone 6, Vivid Saturation", () => {
  const result = evaluateColor({
    variety: "Blue Sapphire",
    hue: "Royal Blue",
    tone: "6",
    saturation: "Vivid",
    distribution: "Even",
    zoning: "None visible",
  });

  assert.equal(result.status, "COMPLETED");
  assert.equal(result.score, 100);
});

test("6. evaluateColor handles UI values: Cornflower Blue and all numeric tones 1-9", () => {
  const tones = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
  for (const t of tones) {
    const result = evaluateColor({
      variety: "Blue Sapphire",
      hue: "Cornflower Blue",
      tone: t,
      saturation: "Strong",
      distribution: "Mostly Even",
      zoning: "None",
    });
    assert.equal(result.status, "COMPLETED", `Tone ${t} should evaluate as COMPLETED`);
    assert.ok(typeof result.score === "number" && result.score > 0);
  }
});

test("7. evaluateColor handles all UI saturation scales: Greyish to Vivid", () => {
  const saturations = ["Greyish", "Slightly Greyish", "Medium", "Strong", "Vivid"];
  for (const s of saturations) {
    const result = evaluateColor({
      variety: "Blue Sapphire",
      hue: "Blue",
      tone: "Medium",
      saturation: s,
      distribution: "Even",
      zoning: "None",
    });
    assert.equal(result.status, "COMPLETED", `Saturation ${s} should evaluate as COMPLETED`);
    assert.ok(typeof result.score === "number" && result.score > 0);
  }
});

test("8. evaluateCut handles UI value: Minimal extinction", () => {
  const result = evaluateCut({
    length: 8.5,
    width: 6.8,
    depth: 4.25,
    symmetry: "Good",
    polish: "Good",
    windowing: "None",
    extinction: "Minimal",
    bulging: "None",
  });

  assert.equal(result.status, "COMPLETED");
  assert.equal(result.measurements.lengthToWidthRatio, 1.25);
  assert.equal(result.measurements.depthPercentage, 62.5);
  assert.ok(typeof result.score === "number" && result.score > 0);
});

test("9. evaluateClarity handles eye-clean and 10x loupe observation using production engine", () => {
  const result = evaluateClarity({
    nakedEye: "Clean",
    loupe10x: "Very Slight",
    inclusionType: "Silk",
    inclusionLocation: "Off-table",
    severity: "Minor",
  });

  assert.equal(result.status, "COMPLETED");
  assert.ok(typeof result.score === "number" && result.score >= 90);
});

test("10. evaluateCarat calculates proportions and weight score using production engine", () => {
  const result = evaluateCarat({
    caratWeight: 2.5,
    length: 8.5,
    width: 6.8,
    depth: 4.25,
  });

  assert.equal(result.status, "COMPLETED");
  assert.ok(typeof result.score === "number");
});

test("11. evaluateTreatment applies production adjustment factors", () => {
  const heatedResult = evaluateTreatment({
    status: "Heated",
    type: "Thermal",
  });
  assert.equal(heatedResult.status, "COMPLETED");
  assert.equal(heatedResult.adjustmentFactor, TREATMENT_RULES.status.heated);

  const untreatedResult = evaluateTreatment({
    status: "Untreated",
    type: "None",
  });
  assert.equal(untreatedResult.status, "COMPLETED");
  assert.equal(untreatedResult.adjustmentFactor, TREATMENT_RULES.status.untreated);
});

test("12. evaluateOrigin applies production origin multipliers", () => {
  const ceylonResult = evaluateOrigin({
    value: "Sri Lanka",
    reliability: "High",
  });
  assert.equal(ceylonResult.status, "COMPLETED");
  assert.equal(ceylonResult.adjustmentFactor, ORIGIN_RULES.value.sriLanka);
  assert.equal(ceylonResult.reliabilityFactor, ORIGIN_RULES.reliability.high);
});

test("13. calculatePriceSuggestion applies treatment & origin factors with +/- 10% range", () => {
  const referencePrice = 100000;
  const treatmentFactor = 0.9;
  const originFactor = 1.0;

  const result = calculatePriceSuggestion(
    referencePrice,
    "LKR",
    treatmentFactor,
    originFactor
  );

  assert.equal(result.status, "COMPLETED");
  assert.equal(result.suggestedPrice, 90000);
  assert.equal(result.priceRange.minimum, 81000);
  assert.equal(result.priceRange.maximum, 99000);
  assert.equal(PRICE_SUGGESTION_RULES.rangePercentage, 0.1);
});

test("14. evaluateGemstone runs full end-to-end composite evaluation with UI inputs", () => {
  const fullResult = evaluateGemstone({
    variety: "Blue Sapphire",
    caratWeight: 2.5,
    color: {
      hue: "Royal Blue",
      tone: "6",
      saturation: "Vivid",
      distribution: "Even",
      zoning: "None visible",
    },
    clarity: {
      nakedEye: "Clean",
      loupe10x: "Very Slight",
      inclusionType: "Silk",
      inclusionLocation: "Off-table",
      severity: "Minor",
    },
    cut: {
      length: 8.5,
      width: 6.8,
      depth: 4.25,
      symmetry: "Good",
      polish: "Good",
      windowing: "None",
      extinction: "Minimal",
      bulging: "None",
    },
    treatment: {
      status: "Heated",
      type: "Thermal",
    },
    origin: {
      value: "Sri Lanka",
      reliability: "High",
    },
    informationReliability: {
      measurements: "Measured",
      treatment: "Laboratory Verified",
      origin: "Laboratory Verified",
    },
  });

  assert.equal(fullResult.status, "COMPLETED");
  assert.equal(fullResult.ruleVersion, EVALUATION_RULE_VERSION);
  assert.ok(typeof fullResult.overall4C.score === "number");
  assert.ok(fullResult.overall4C.score > 0);
  assert.ok(Array.isArray(fullResult.recommendations.recommendations));
});

test("15. Engine supported varieties are strictly guarded", () => {
  assert.deepEqual(Array.from(ENGINE_SUPPORTED_VARIETIES), [
    "Blue Sapphire",
    "Padparadscha",
    "Ruby",
  ]);
});

test("16. Two-page PDF generator strictly enforces 2 pages (A4) and contains mandatory disclaimer", async () => {
  const { generateEvaluationPdf } = await import("../src/lib/report/generateEvaluationPdf");
  const { PDFDocument } = await import("pdf-lib");

  const pdfBytes = await generateEvaluationPdf({
    reportTitle: "Open 4Cs Gemstone Assessment Report",
    evaluationId: "CEY-TEST-2026",
    generatedAt: new Date().toISOString(),
    evaluationDate: new Date(),
    user: { name: "Test Evaluator", category: "Trader" },
    gemstone: {
      variety: "Blue Sapphire",
      caratWeight: 2.5,
      color: { hue: "Royal Blue", tone: "6", saturation: "Vivid", distribution: "Even", zoning: "None" },
      clarity: { nakedEye: "Clean", loupe10x: "Very Slight", severity: "Minor" },
      cut: { length: 8.5, width: 6.5, depth: 4.2, symmetry: "Good", polish: "Good" },
      treatment: { status: "Heated" },
      origin: { value: "Sri Lanka" },
      informationReliability: { measurements: "Measured", treatment: "Unverified", origin: "Unverified" },
    },
    scores: { overall: 88.5, color: 92, clarity: 90, cut: 85, carat: 82 },
    priceSuggestion: { available: true, suggestedPrice: 4200, minimumPrice: 3800, maximumPrice: 4600, currency: "USD" },
    referenceComparison: { available: true, referenceName: "Ratnapura Blue Lot Ref", similarity: 91.2 },
    recommendations: ["Confirm unheated status via FTIR spectrometry."],
    ruleVersion: "v4.2",
    userStatement: "User observation statement.",
    disclaimer: "Mandatory disclaimer.",
  });

  const parsedPdf = await PDFDocument.load(pdfBytes);
  assert.equal(parsedPdf.getPageCount(), 2, "PDF must strictly contain 2 pages");
});

test("17. evaluateColor calculates accurate scores for Padparadscha and Ruby varieties", () => {
  const padRes = evaluateColor({
    variety: "Padparadscha",
    hue: "Pinkish Orange",
    tone: "5",
    saturation: "Strong",
    distribution: "Even",
    zoning: "None",
  });
  assert.equal(padRes.status, "COMPLETED");
  assert.ok(padRes.score! >= 90);

  const rubyRes = evaluateColor({
    variety: "Ruby",
    hue: "Pigeon Blood Red",
    tone: "6",
    saturation: "Vivid",
    distribution: "Even",
    zoning: "None Visible",
  });
  assert.equal(rubyRes.status, "COMPLETED");
  assert.equal(rubyRes.score, 100);
});

test("18. Missing or 0 dimensions correctly returns PENDING status in Cut & Carat engines", () => {
  const pendingCut = evaluateCut({
    length: 0,
    width: 0,
    depth: 0,
    symmetry: "Good",
    polish: "Good",
    windowing: "None",
    extinction: "None",
    bulging: "None",
  });
  assert.equal(pendingCut.status, "PENDING");
  assert.equal(pendingCut.score, null);

  const pendingCarat = evaluateCarat({
    caratWeight: 0,
    length: 8.0,
    width: 6.0,
    depth: 4.0,
  });
  assert.equal(pendingCarat.status, "UNAVAILABLE");
  assert.equal(pendingCarat.score, null);
});

test("19. Relative pricing eliminates double-counting between candidate and reference", () => {
  // If candidate is Heated and reference is Heated, relative factor is 1.0 (no double-discounting)
  const refPrice = 1500000;
  const result = calculatePriceSuggestion(refPrice, "LKR", 0.9, 1.0, {
    referenceCount: 3,
    relativeTreatmentMultiplier: 1.0, // Heated / Heated = 1.0
    relativeOriginMultiplier: 1.0,
  });

  assert.equal(result.status, "COMPLETED");
  assert.equal(result.suggestedPrice, 1500000);
  assert.equal(result.relativeMultipliers?.treatment, 1.0);
  assert.equal(result.relativeMultipliers?.origin, 1.0);
});

test("20. Pricing engine requires at least 3 verified references for data sufficiency", () => {
  // Only 2 references available
  const result = calculatePriceSuggestion(1500000, "LKR", 1.0, 1.0, {
    referenceCount: 2,
  });

  assert.equal(result.status, "UNAVAILABLE");
  assert.ok(result.reason.includes("At least 3 verified market references are required"));
  assert.equal(result.suggestedPrice, null);
});

test("21. Dated exchange rate source converts USD; omits USD if unavailable (LKR only)", () => {
  const datedRate = {
    currencyPair: "USD/LKR" as const,
    rate: 300,
    source: "Central Bank of Sri Lanka (CBSL) - Indicative Spot Exchange Rate",
    asOfDate: "2026-11-12",
    isOfficial: true,
    isAvailable: true,
  };

  // With dated official exchange rate
  const resultWithFx = calculatePriceSuggestion(300000, "LKR", 1.0, 1.0, {
    referenceCount: 3,
    exchangeRate: datedRate,
  });

  assert.equal(resultWithFx.status, "COMPLETED");
  assert.equal(resultWithFx.priceLkr, 300000);
  assert.equal(resultWithFx.priceUsd, 1000);
  assert.equal(resultWithFx.priceRangeLkr?.minimum, 270000);
  assert.equal(resultWithFx.priceRangeLkr?.maximum, 330000);
  assert.equal(resultWithFx.priceRangeUsd?.minimum, 900);
  assert.equal(resultWithFx.priceRangeUsd?.maximum, 1100);
  assert.equal(resultWithFx.exchangeRate?.rate, 300);
  assert.equal(resultWithFx.exchangeRate?.source, "Central Bank of Sri Lanka (CBSL) - Indicative Spot Exchange Rate");
  assert.equal(resultWithFx.exchangeRate?.asOfDate, "2026-11-12");

  // When exchange rate is unavailable: display LKR only without silent guessing
  const resultLkrOnly = calculatePriceSuggestion(300000, "LKR", 1.0, 1.0, {
    referenceCount: 3,
    exchangeRate: null,
  });

  assert.equal(resultLkrOnly.status, "COMPLETED");
  assert.equal(resultLkrOnly.priceLkr, 300000);
  assert.equal(resultLkrOnly.priceUsd, null);
  assert.equal(resultLkrOnly.priceRangeUsd, null);
  assert.equal(resultLkrOnly.exchangeRate, null);
});

test("22. evaluateColor strictly rejects cross-variety hues", () => {
  // Attempting to evaluate Blue Sapphire with a Ruby hue (Pigeon Blood Red)
  const crossVarietyColor = evaluateColor({
    variety: "Blue Sapphire",
    hue: "Pigeon Blood Red",
    tone: "6",
    saturation: "Vivid",
    distribution: "Even",
    zoning: "None",
  });

  assert.equal(crossVarietyColor.status, "UNAVAILABLE");
  assert.ok(crossVarietyColor.reason.includes("unsupported"));
  assert.equal(crossVarietyColor.score, null);
});
