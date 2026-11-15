import assert from "node:assert/strict";
import test from "node:test";
import { evaluateMock, validateEvaluation, validateRuleCatalog, EvaluationValidationError, MockDataError } from "../src/lib/evaluation/engine.ts";
import { MOCK_EXAMPLES, MOCK_GEMSTONE_RECORDS } from "../src/lib/evaluation/mock-data.ts";
import { MOCK_RULES } from "../src/lib/evaluation/mock-rules.ts";
import { SRI_LANKAN_REFERENCES } from "../src/lib/evaluation/reference-data.ts";

const example = (variety = "RUBY") => structuredClone(MOCK_EXAMPLES[variety]);

test("ruby and sapphire have distinct versioned provisional rules", () => {
  for (const variety of ["RUBY", "SAPPHIRE"]) {
    const result = evaluateMock(example(variety));
    assert.equal(result.ruleVersion, MOCK_RULES[variety].version);
    assert.equal(result.dataKind, "MOCK");
    assert.equal(result.approval, "PROVISIONAL");
    assert.equal(result.referenceValidation, "NOT_PERFORMED");
    assert.equal(Object.values(result.weights).reduce((sum, value) => sum + value, 0), 1);
    assert.ok(result.warnings.some((warning) => warning.includes("MOCK DATA")));
  }
  assert.notEqual(MOCK_RULES.RUBY.version, MOCK_RULES.SAPPHIRE.version);
});

test("calculates a known ruby example and an auditable mock price", () => {
  const result = evaluateMock(example());
  assert.deepEqual(result.scores, { color: 7.5, clarity: 7, cut: 8.5, carat: 6, overall: 7.5 });
  assert.deepEqual(result.measurements, { depthPercentage: 65, lengthWidthRatio: 1.33 });
  assert.equal(result.priceSuggestion.status, "MOCK_ONLY");
  assert.equal(result.priceSuggestion.suggestedPrice, 1350);
  assert.equal(result.priceSuggestion.minimumPrice, 1080);
  assert.equal(result.priceSuggestion.maximumPrice, 1620);
  assert.equal(result.trace.length, 8);
});

test("accepts every supported sapphire hue and rejects cross-variety hues", () => {
  for (const hue of MOCK_RULES.SAPPHIRE.hues) {
    const stone = example("SAPPHIRE"); stone.color.hue = hue;
    assert.deepEqual(validateEvaluation(stone), {});
  }
  const ruby = example(); ruby.color.hue = "BLUE";
  assert.ok(validateEvaluation(ruby)["color.hue"]);
  const sapphire = example("SAPPHIRE"); sapphire.color.hue = "RED";
  assert.ok(validateEvaluation(sapphire)["color.hue"]);
});

test("rejects missing, malformed, non-Sri Lankan and non-finite input", () => {
  for (const input of [null, [], {}, "RUBY"]) assert.throws(() => evaluateMock(input), EvaluationValidationError);
  for (const weight of [0, -1, NaN, Infinity, "1.5", true, 101]) {
    const stone = example(); stone.caratWeight = weight;
    assert.ok(validateEvaluation(stone).caratWeight);
  }
  const stone = example(); stone.origin = "Madagascar";
  assert.ok(validateEvaluation(stone).origin);
  stone.origin = "Sri Lanka"; stone.color.tone = 4.5;
  assert.ok(validateEvaluation(stone)["color.tone"]);
});

test("uses inclusive depth boundaries and does not round before grading", () => {
  const stone = example(); stone.cut.depth = 3.3;
  assert.equal(evaluateMock(stone).scores.cut, 8.5);
  stone.cut.depth = 4.5;
  assert.equal(evaluateMock(stone).scores.cut, 8.5);
  stone.cut.depth = 4.50001;
  assert.equal(evaluateMock(stone).scores.cut, 6.5);
});

test("uses a round-specific depth denominator and checks dimension order", () => {
  const stone = example(); stone.shape = "ROUND"; stone.cut.length = 6.2; stone.cut.width = 6;
  assert.equal(evaluateMock(stone).measurements.depthPercentage, 63.93);
  stone.cut.length = 8;
  assert.ok(validateEvaluation(stone)["cut.width"]);
  stone.shape = "OVAL"; stone.cut.length = 5;
  assert.ok(validateEvaluation(stone)["cut.length"]);
});

test("penalizes observed problems and clamps all scores to 0–10", () => {
  const stone = example(); const before = evaluateMock(stone);
  stone.color.saturation = "WEAK"; stone.color.zoning = "SEVERE"; stone.color.tone = 0;
  stone.clarity.nakedEye = "INCLUDED"; stone.clarity.loupe10x = "HEAVY"; stone.clarity.severity = "SEVERE";
  stone.cut.polish = "POOR"; stone.cut.symmetry = "POOR"; stone.cut.windowing = "SEVERE"; stone.cut.extinction = "SEVERE"; stone.cut.bulging = "SEVERE";
  const after = evaluateMock(stone);
  for (const key of ["color", "clarity", "cut"]) assert.ok(after.scores[key] < before.scores[key]);
  for (const value of Object.values(after.scores)) assert.ok(value >= 0 && value <= 10);
});

test("colourless sapphire does not use blue tone or saturation preferences", () => {
  const stone = example("SAPPHIRE"); stone.color.hue = "COLORLESS";
  stone.color.tone = 0; stone.color.saturation = "WEAK";
  assert.equal(evaluateMock(stone).scores.color, 10);
});

test("unknown treatment withholds price and origin uncertainty remains visible", () => {
  const stone = example(); stone.treatment = "UNKNOWN";
  const result = evaluateMock(stone);
  assert.equal(result.priceSuggestion.status, "UNAVAILABLE");
  assert.equal(result.priceSuggestion.suggestedPrice, undefined);
  assert.ok(result.warnings.some((warning) => warning.includes("not been independently verified")));
});

test("weight bands change at the documented boundaries", () => {
  for (const [weight, expected] of [[0.99, 5], [1, 6], [1.99, 6], [2, 7], [3, 8], [5, 9]]) {
    const stone = example(); stone.caratWeight = weight;
    assert.equal(evaluateMock(stone).scores.carat, expected);
  }
});

test("comparisons never cross variety, hue or treatment and missing matches are explicit", () => {
  const result = evaluateMock(example());
  assert.equal(result.comparables.length, 3);
  assert.ok(result.comparables.every((item) => item.id.startsWith("MOCK-RUBY-RED-HEATED")));
  const noMatches = evaluateMock(example(), []);
  assert.equal(noMatches.comparables.length, 0);
  assert.ok(noMatches.warnings.some((warning) => warning.includes("Not enough comparable")));
});

test("reference and foreign-origin records cannot enter the mock comparison pool", () => {
  for (const changes of [{ dataKind: "REFERENCE" }, { observations: { ...MOCK_GEMSTONE_RECORDS[0].observations, origin: "Burma" } }, { totalPrice: NaN }]) {
    assert.throws(() => evaluateMock(example(), [{ ...MOCK_GEMSTONE_RECORDS[0], ...changes }]), /only valid/);
  }
  assert.equal(SRI_LANKAN_REFERENCES.length, 0);
});

test("evaluation is deterministic and does not mutate source datasets", () => {
  const before = JSON.stringify({ MOCK_EXAMPLES, MOCK_GEMSTONE_RECORDS, MOCK_RULES });
  assert.deepEqual(evaluateMock(example()), evaluateMock(example()));
  assert.equal(JSON.stringify({ MOCK_EXAMPLES, MOCK_GEMSTONE_RECORDS, MOCK_RULES }), before);
});

test("historical record prices determine the suggestion", () => {
  const original = evaluateMock(example());
  const doubledRecords = MOCK_GEMSTONE_RECORDS.map((record) => ({ ...record, totalPrice: record.totalPrice * 2 }));
  const doubled = evaluateMock(example(), doubledRecords);
  assert.equal(doubled.priceSuggestion.suggestedPrice, original.priceSuggestion.suggestedPrice * 2);
  assert.equal(doubled.priceSuggestion.basePricePerCarat, original.priceSuggestion.basePricePerCarat * 2);
});

test("there is no fixed-price fallback for empty, insufficient or mismatched records", () => {
  const relevant = MOCK_GEMSTONE_RECORDS.filter((record) => record.id.startsWith("MOCK-RUBY-RED-HEATED"));
  for (const records of [[], relevant.slice(0, 1), MOCK_GEMSTONE_RECORDS.filter((record) => record.observations.variety === "SAPPHIRE")]) {
    const result = evaluateMock(example(), records);
    assert.equal(result.priceSuggestion.status, "UNAVAILABLE");
    assert.equal(result.priceSuggestion.suggestedPrice, undefined);
  }
});

test("quality differences use configured adjustments rather than fixed base prices", () => {
  const rules = structuredClone(MOCK_RULES);
  const stone = example(); stone.color.saturation = "VIVID";
  const adjusted = evaluateMock(stone, MOCK_GEMSTONE_RECORDS, rules);
  rules.RUBY.pricing.adjustmentPerScorePoint = 0;
  const unadjusted = evaluateMock(stone, MOCK_GEMSTONE_RECORDS, rules);
  assert.ok(adjusted.priceSuggestion.suggestedPrice > unadjusted.priceSuggestion.suggestedPrice);
  assert.equal(unadjusted.priceSuggestion.suggestedPrice, 1350);
});

test("median baseline limits the impact of one extreme price", () => {
  const records = structuredClone(MOCK_GEMSTONE_RECORDS);
  records.find((record) => record.id === "MOCK-RUBY-RED-HEATED-2").totalPrice = 1000000;
  const result = evaluateMock(example(), records);
  assert.equal(result.priceSuggestion.basePricePerCarat, 945);
  assert.equal(result.priceSuggestion.suggestedPrice, 1417.5);
});

test("rejects currency, price-basis, duplicate-ID and malformed-price contamination", () => {
  const record = MOCK_GEMSTONE_RECORDS[0];
  for (const change of [{ currency: "LKR" }, { priceBasis: "RETAIL_ESTIMATE" }, { totalPrice: -1 }, { totalPrice: Infinity }, { recordedAt: "not a date" }, { recordedAt: "2026-02-31" }]) {
    assert.throws(() => evaluateMock(example(), [{ ...record, ...change }]), MockDataError);
  }
  assert.throws(() => evaluateMock(example(), [record, record]), MockDataError);
});

test("rejects invalid rules and loads scoring parameters from the supplied rules", () => {
  const rules = structuredClone(MOCK_RULES);
  rules.RUBY.weights.color = 4;
  assert.throws(() => validateRuleCatalog(rules), MockDataError);
  const valid = structuredClone(MOCK_RULES);
  valid.RUBY.scoring.saturationScore.STRONG = 9;
  assert.equal(evaluateMock(example(), MOCK_GEMSTONE_RECORDS, valid).scores.color, 8.5);
  valid.RUBY.matching.minimumComparables = 0;
  assert.throws(() => validateRuleCatalog(valid), MockDataError);
});

test("the seed includes 48 unique records covering both varieties and treatment groups", () => {
  assert.equal(MOCK_GEMSTONE_RECORDS.length, 48);
  assert.equal(new Set(MOCK_GEMSTONE_RECORDS.map((record) => record.id)).size, 48);
  for (const variety of ["RUBY", "SAPPHIRE"]) for (const hue of MOCK_RULES[variety].hues) for (const treatment of ["HEATED", "UNHEATED"]) {
    const stone = example(variety); stone.color.hue = hue; stone.treatment = treatment;
    const result = evaluateMock(stone);
    assert.equal(result.priceSuggestion.status, "MOCK_ONLY");
    assert.equal(result.comparables.length, 3);
  }
});

test("inactive and deleted historical records never contribute to pricing", () => {
  const inactive = MOCK_GEMSTONE_RECORDS.map((record) => ({ ...record, isActive: false }));
  const deleted = MOCK_GEMSTONE_RECORDS.map((record) => ({ ...record, deletedAt: "2026-11-09" }));
  for (const records of [inactive, deleted]) {
    const result = evaluateMock(example(), records);
    assert.equal(result.comparables.length, 0);
    assert.equal(result.priceSuggestion.status, "UNAVAILABLE");
  }
});
