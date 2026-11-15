import { MOCK_GEMSTONE_RECORDS } from "./mock-data.ts";
import { MOCK_RULES } from "./mock-rules.ts";
import type { EvaluationInput, MockGemstoneRecord, RuleSet } from "./types";

export class EvaluationValidationError extends Error {
  errors: Record<string, string>;
  constructor(errors: Record<string, string>) {
    super("Please correct the highlighted observations.");
    this.errors = errors;
  }
}

export class MockDataError extends Error {}

export function validateRuleCatalog(catalog: Record<EvaluationInput["variety"], RuleSet>) {
  const finite = (value: unknown, min: number, max: number) => typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;
  for (const variety of ["RUBY", "SAPPHIRE"] as const) {
    const rule = catalog?.[variety];
    const fail = () => { throw new MockDataError(`Invalid mock rule definition for ${variety}.`); };
    if (!rule || rule.variety !== variety || rule.dataKind !== "MOCK" || rule.approval !== "PROVISIONAL" || !/^mock-[a-z]+-v\d+$/.test(rule.version)) fail();
    if (!Array.isArray(rule.hues) || !rule.hues.length || rule.hues.some((hue) => !MOCK_RULES[variety].hues.includes(hue))) fail();
    if (!Array.isArray(rule.toneRange) || rule.toneRange.length !== 2 || rule.toneRange.some((value) => !finite(value, 0, 10)) || rule.toneRange[0] > rule.toneRange[1]) fail();
    if (!rule.weights || ["color", "clarity", "cut", "carat"].some((key) => !finite(rule.weights[key as keyof typeof rule.weights], 0, 1)) || Math.abs(Object.values(rule.weights).reduce((sum, value) => sum + value, 0) - 1) > 1e-9 || rule.weights.color + rule.weights.clarity + rule.weights.cut <= 0) fail();
    for (const shape of ["OVAL", "ROUND", "CUSHION", "PEAR", "EMERALD"] as const) {
      const range = rule.depthRanges?.[shape];
      if (!Array.isArray(range) || range.length !== 2 || range.some((value) => !finite(value, 0, 200)) || range[0] > range[1]) fail();
    }
    const tables = {
      severityPenalty: ["NONE", "MINOR", "MODERATE", "SEVERE"], qualityScore: ["EXCELLENT", "GOOD", "FAIR", "POOR"],
      saturationScore: ["WEAK", "MEDIUM", "STRONG", "VIVID"], nakedEyeScore: ["CLEAN", "SLIGHTLY_INCLUDED", "INCLUDED"], loupeScore: ["MINOR", "MODERATE", "HEAVY"],
    };
    for (const [table, keys] of Object.entries(tables)) {
      const values = rule.scoring?.[table as keyof typeof rule.scoring] as Record<string, number> | undefined;
      if (!values || keys.some((key) => !finite(values[key], 0, 10))) fail();
    }
    for (const key of ["tonePenaltyPerStep", "unevenDistributionPenalty", "depthPenalty"] as const) if (!finite(rule.scoring?.[key], 0, 10)) fail();
    const bands = rule.scoring?.caratBands;
    if (!Array.isArray(bands) || !bands.length || bands[0].minimum !== 0 || bands.some((band, index) => !finite(band.minimum, 0, 100) || !finite(band.score, 0, 10) || index > 0 && band.minimum <= bands[index - 1].minimum)) fail();
    if (!finite(rule.rangePercentage, 0, 100) || !finite(rule.matching?.relativeWeightTolerance, 0, 1) || !finite(rule.matching?.maxComponentScoreDifference, 0, 10)
      || !Number.isInteger(rule.matching?.minimumComparables) || !finite(rule.matching?.minimumComparables, 2, 100)
      || !Number.isInteger(rule.matching?.maximumComparables) || !finite(rule.matching?.maximumComparables, rule.matching.minimumComparables, 100)
      || !finite(rule.pricing?.adjustmentPerScorePoint, 0, 1) || !finite(rule.pricing?.maximumAdjustmentPercentage, 0, 50)) fail();
  }
}

const severities = ["NONE", "MINOR", "MODERATE", "SEVERE"];
const qualities = ["EXCELLENT", "GOOD", "FAIR", "POOR"];
const round = (value: number) => Math.round(value * 100) / 100;
const score = (value: number) => round(Math.max(0, Math.min(10, value)));

export function validateEvaluation(input: unknown, catalog: Record<EvaluationInput["variety"], RuleSet> = MOCK_RULES): Record<string, string> {
  const errors: Record<string, string> = {};
  const object = (value: unknown): Record<string, unknown> => value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
  const root = object(input);
  const color = object(root.color);
  const clarity = object(root.clarity);
  const cut = object(root.cut);
  function choice(path: string, value: unknown, options: readonly string[]) {
    if (typeof value !== "string" || !options.includes(value)) errors[path] = `Choose one of: ${options.join(", ")}.`;
  }
  function number(path: string, value: unknown, min: number, max: number) {
    if (typeof value !== "number" || !Number.isFinite(value) || value < min || value > max) errors[path] = `Enter a number between ${min} and ${max}.`;
  }
  choice("variety", root.variety, ["RUBY", "SAPPHIRE"]);
  choice("origin", root.origin, ["Sri Lanka"]);
  choice("originReliability", root.originReliability, ["LAB_VERIFIED", "SELLER_PROVIDED", "UNVERIFIED"]);
  choice("treatment", root.treatment, ["UNHEATED", "HEATED", "UNKNOWN"]);
  choice("shape", root.shape, ["OVAL", "ROUND", "CUSHION", "PEAR", "EMERALD"]);
  number("caratWeight", root.caratWeight, 0.01, 100);
  if (root.variety === "RUBY" || root.variety === "SAPPHIRE") choice("color.hue", color.hue, catalog[root.variety].hues);
  number("color.tone", color.tone, 0, 10);
  if (typeof color.tone === "number" && !Number.isInteger(color.tone)) errors["color.tone"] = "Tone must be a whole number from 0 to 10.";
  choice("color.saturation", color.saturation, ["WEAK", "MEDIUM", "STRONG", "VIVID"]);
  choice("color.distribution", color.distribution, ["EVEN", "UNEVEN"]);
  choice("color.zoning", color.zoning, severities);
  choice("clarity.nakedEye", clarity.nakedEye, ["CLEAN", "SLIGHTLY_INCLUDED", "INCLUDED"]);
  choice("clarity.loupe10x", clarity.loupe10x, ["MINOR", "MODERATE", "HEAVY"]);
  choice("clarity.severity", clarity.severity, severities);
  for (const field of ["length", "width", "depth"]) number(`cut.${field}`, cut[field], 0.01, 100);
  for (const field of ["symmetry", "polish"]) choice(`cut.${field}`, cut[field], qualities);
  for (const field of ["windowing", "extinction", "bulging"]) choice(`cut.${field}`, cut[field], severities);
  if (typeof cut.length === "number" && typeof cut.width === "number" && cut.length < cut.width) errors["cut.length"] = "Length must be at least width; enter the longest dimension first.";
  if (root.shape === "ROUND" && typeof cut.length === "number" && typeof cut.width === "number" && cut.width > 0 && cut.length / cut.width > 1.1) errors["cut.width"] = "Round examples must have a length-to-width ratio no greater than 1.10.";
  return errors;
}

export function gradeMock(input: unknown, catalog: Record<EvaluationInput["variety"], RuleSet> = MOCK_RULES) {
  const errors = validateEvaluation(input, catalog);
  if (Object.keys(errors).length) throw new EvaluationValidationError(errors);
  const stone = input as EvaluationInput;
  const rules = catalog[stone.variety];
  const { severityPenalty, qualityScore } = rules.scoring;
  const trace: { ruleId: string; explanation: string; value: number | string }[] = [];
  function record(id: string, explanation: string, value: number | string) {
    trace.push({ ruleId: `${rules.version}:${id}`, explanation, value });
  }

  const colorless = stone.color.hue === "COLORLESS";
  const [toneMin, toneMax] = rules.toneRange;
  const tonePenalty = Math.max(0, toneMin - stone.color.tone, stone.color.tone - toneMax) * rules.scoring.tonePenaltyPerStep;
  const saturationScore = rules.scoring.saturationScore[stone.color.saturation];
  const color = score((colorless ? 10 : saturationScore - tonePenalty)
    - (stone.color.distribution === "UNEVEN" ? rules.scoring.unevenDistributionPenalty : 0) - severityPenalty[stone.color.zoning]);
  record("COLOR", colorless ? "Colourless mock scoring uses distribution and zoning; coloured-stone tone and saturation preferences are skipped." : `Mock saturation score ${saturationScore}, tone penalty ${tonePenalty}; uneven distribution penalty ${stone.color.distribution === "UNEVEN" ? rules.scoring.unevenDistributionPenalty : 0}, zoning penalty ${severityPenalty[stone.color.zoning]}.`, color);

  const clarity = score((rules.scoring.nakedEyeScore[stone.clarity.nakedEye]
    + rules.scoring.loupeScore[stone.clarity.loupe10x]) / 2 - severityPenalty[stone.clarity.severity]);
  record("CLARITY", "Average naked-eye and 10x observation scores, then deduct the mock inclusion severity penalty.", clarity);

  const denominator = stone.shape === "ROUND" ? (stone.cut.length + stone.cut.width) / 2 : stone.cut.width;
  const rawDepthPercentage = stone.cut.depth / denominator * 100;
  const depthPercentage = round(rawDepthPercentage);
  const lengthWidthRatio = round(stone.cut.length / stone.cut.width);
  const [depthMin, depthMax] = rules.depthRanges[stone.shape];
  // Allow binary floating-point noise at an inclusive boundary, not display rounding.
  const depthPenalty = rawDepthPercentage < depthMin - 1e-9 || rawDepthPercentage > depthMax + 1e-9 ? rules.scoring.depthPenalty : 0;
  const cut = score((qualityScore[stone.cut.symmetry] + qualityScore[stone.cut.polish]) / 2 - depthPenalty
    - severityPenalty[stone.cut.windowing] - severityPenalty[stone.cut.extinction] - severityPenalty[stone.cut.bulging]);
  record("CUT", `Depth is ${depthPercentage}% (${stone.shape === "ROUND" ? "average face-up diameter" : "width"} denominator); mock preferred range ${depthMin}-${depthMax}%. Depth penalty ${depthPenalty}; visible cut concerns apply additional penalties.`, cut);
  record("DIMENSIONS", "Length divided by width; dimensions are in millimetres.", lengthWidthRatio);

  const carat = [...rules.scoring.caratBands].reverse().find((band) => stone.caratWeight >= band.minimum)!.score;
  record("CARAT", `Configured mock bands: ${rules.scoring.caratBands.map((band) => `${band.minimum}+ ct → ${band.score}`).join(", ")}. This is a test size score, not a quality claim.`, carat);
  const overall = round(color * rules.weights.color + clarity * rules.weights.clarity + cut * rules.weights.cut + carat * rules.weights.carat);
  record("OVERALL", "Provisional weighted score out of 10; weights differ for ruby and sapphire.", overall);

  return { scores: { color, clarity, cut, carat, overall }, measurements: { depthPercentage, lengthWidthRatio }, trace };
}

const median = (values: number[]) => {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};

export function evaluateMock(input: unknown, records: readonly MockGemstoneRecord[] = MOCK_GEMSTONE_RECORDS, catalog: Record<EvaluationInput["variety"], RuleSet> = MOCK_RULES) {
  validateRuleCatalog(catalog);
  const graded = gradeMock(input, catalog);
  const stone = input as EvaluationInput;
  const rules = catalog[stone.variety];
  const ids = new Set<string>();
  for (const record of records) {
    if (!record || record.dataKind !== "MOCK" || !record.id || ids.has(record.id) || !record.datasetVersion
      || record.currency !== "USD" || record.priceBasis !== "MOCK_B2B" || !Number.isFinite(record.totalPrice) || record.totalPrice <= 0
      || !record.source || !/^\d{4}-\d{2}-\d{2}$/.test(record.recordedAt) || !Number.isFinite(Date.parse(record.recordedAt)) || new Date(record.recordedAt).toISOString().slice(0, 10) !== record.recordedAt
      || Object.keys(validateEvaluation(record.observations, catalog)).length || record.observations.treatment === "UNKNOWN") {
      throw new MockDataError("The mock engine accepts only valid, uniquely identified mock Sri Lankan historical records with USD mock prices.");
    }
    ids.add(record.id);
  }
  const qualityWeight = rules.weights.color + rules.weights.clarity + rules.weights.cut;
  const cap = rules.pricing.maximumAdjustmentPercentage / 100;
  const matches = records.filter((record) => {
    if (record.isActive === false || record.deletedAt) return false;
    const other = record.observations;
    return other.variety === stone.variety && other.color.hue === stone.color.hue && other.treatment === stone.treatment
      && other.shape === stone.shape && Math.abs(other.caratWeight - stone.caratWeight) / stone.caratWeight <= rules.matching.relativeWeightTolerance;
  }).map((record) => {
    const referenceScores = gradeMock(record.observations, catalog).scores;
    const differences = { color: graded.scores.color - referenceScores.color, clarity: graded.scores.clarity - referenceScores.clarity, cut: graded.scores.cut - referenceScores.cut };
    const qualityDifference = (differences.color * rules.weights.color + differences.clarity * rules.weights.clarity + differences.cut * rules.weights.cut) / qualityWeight;
    const adjustmentFactor = Math.max(1 - cap, Math.min(1 + cap, 1 + qualityDifference * rules.pricing.adjustmentPerScorePoint));
    const rawPricePerCarat = record.totalPrice / record.observations.caratWeight;
    return {
      id: record.id, dataKind: record.dataKind, datasetVersion: record.datasetVersion, description: record.description,
      caratWeight: record.observations.caratWeight, totalPrice: record.totalPrice, currency: record.currency,
      source: record.source, recordedAt: record.recordedAt, referenceScores, differences,
      weightDifference: round(Math.abs(record.observations.caratWeight - stone.caratWeight)),
      rankDistance: Math.abs(record.observations.caratWeight - stone.caratWeight) / stone.caratWeight + Math.abs(differences.color) / 10 + Math.abs(differences.clarity) / 10 + Math.abs(differences.cut) / 10,
      rawPricePerCarat, adjustmentFactor, adjustedPricePerCarat: rawPricePerCarat * adjustmentFactor,
    };
  }).filter((match) => Object.values(match.differences).every((difference) => Math.abs(difference) <= rules.matching.maxComponentScoreDifference))
    .sort((a, b) => a.rankDistance - b.rankDistance || a.id.localeCompare(b.id)).slice(0, rules.matching.maximumComparables);

  const warnings = ["MOCK DATA: historical records, rules and prices are invented for software testing; no actual trades or CAGS-approved valuations are represented."];
  if (stone.originReliability !== "LAB_VERIFIED") warnings.push("Sri Lankan origin is declared for this test and has not been independently verified.");
  const unavailableReason = stone.treatment === "UNKNOWN" ? "Treatment is unknown. A price cannot be suggested."
    : matches.length < rules.matching.minimumComparables ? `Not enough comparable historical records: found ${matches.length}, need ${rules.matching.minimumComparables}. No fixed-price fallback is used.` : null;
  const baseline = matches.length ? median(matches.map((match) => match.rawPricePerCarat)) : 0;
  const adjusted = matches.length ? median(matches.map((match) => match.adjustedPricePerCarat)) : 0;
  const suggestedPrice = round(adjusted * stone.caratWeight);
  const priceSuggestion = unavailableReason ? { status: "UNAVAILABLE" as const, reason: unavailableReason } : {
    status: "MOCK_ONLY" as const, currency: "USD", suggestedPrice,
    minimumPrice: round(suggestedPrice * (1 - rules.rangePercentage / 100)), maximumPrice: round(suggestedPrice * (1 + rules.rangePercentage / 100)),
    basePricePerCarat: round(baseline), adjustedPricePerCarat: round(adjusted),
    adjustments: { quality: round(adjusted / baseline) },
    formula: "median of quality-adjusted historical prices per carat × input carat weight",
    basis: "Matching historical mock records supply the entire price baseline. There is no fixed base price, origin premium or additional treatment multiplier.",
  };
  if (unavailableReason) warnings.push(unavailableReason);
  const trace = [...graded.trace,
    { ruleId: `${rules.version}:MATCH`, explanation: "Match variety, Sri Lankan origin, hue, shape and treatment; apply weight tolerance and 4C score-distance limits.", value: matches.length },
    { ruleId: `${rules.version}:PRICE`, explanation: priceSuggestion.status === "MOCK_ONLY" ? priceSuggestion.formula : priceSuggestion.reason, value: priceSuggestion.status === "MOCK_ONLY" ? priceSuggestion.suggestedPrice : "UNAVAILABLE" },
  ];
  const recommendations = [];
  if (graded.scores.color < 7) recommendations.push("Review colour observations and zoning.");
  if (graded.scores.clarity < 7) recommendations.push("Review inclusion observations with a trained gemologist.");
  if (graded.scores.cut < 7) recommendations.push("Recheck dimensions and cut concerns.");
  if (unavailableReason) recommendations.push("Add suitable historical records or complete treatment information before requesting a price.");
  return {
    dataKind: "MOCK" as const, approval: "PROVISIONAL" as const, ruleVersion: rules.version,
    variety: stone.variety, origin: stone.origin, scores: graded.scores, measurements: graded.measurements,
    weights: rules.weights, trace, priceSuggestion,
    comparables: matches.map((match) => ({ ...match, rawPricePerCarat: round(match.rawPricePerCarat), adjustedPricePerCarat: round(match.adjustedPricePerCarat), adjustmentFactor: round(match.adjustmentFactor) })),
    referenceValidation: "NOT_PERFORMED" as const, warnings, recommendations,
  };
}
