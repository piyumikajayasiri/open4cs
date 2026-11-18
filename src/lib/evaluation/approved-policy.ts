import { validateScoringDefinition, validateEvaluation, gradeGemstone, MockDataError } from "./engine.ts";
import { MOCK_RULES } from "./mock-rules.ts";
import type { EvaluationInput, RuleSet, Variety } from "./types";

export type ApprovedDefinition = RuleSet & { dataKind: "REFERENCE"; approval: "PENDING" | "APPROVED"; currency: "USD" | "LKR"; maximumReferenceAgeDays: number };
export interface RuleReview {
  version: string; variety: Variety; status: string; definition: ApprovedDefinition;
  summary: string; evidence: string; createdBy: string; lastEditedBy: string;
  recordedDomainApproval?: { basis: string; approvalDate: string; reviewerName: string | null; reviewerNameStatus: string; documentReference: string | null; appliesToDefinition: boolean };
  sourcePackId?: string; sourceCandidateId?: string; sourcePackFingerprint?: string;
  approvedBy?: string; approvedByName?: string; approvedAt?: string | Date; reviewNotes?: string; domainReviewConfirmed?: boolean;
}
export const SHAPES = ["OVAL", "ROUND", "CUSHION", "PEAR", "EMERALD"] as const;
export function validateApprovedDefinition(value: unknown, variety: Variety, version: string): ApprovedDefinition {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new MockDataError("Provide a complete rule definition.");
  const rule = structuredClone(value) as ApprovedDefinition;
  if (!/^cags-(ruby|sapphire)-v[1-9]\d*$/.test(version) || version !== rule.version || rule.variety !== variety || !version.startsWith(`cags-${variety.toLowerCase()}-`)
    || rule.dataKind !== "REFERENCE" || !["PENDING", "APPROVED"].includes(rule.approval)) throw new MockDataError("Rule identity, variety or review label is invalid.");
  validateScoringDefinition(rule, variety);
  if (!["USD", "LKR"].includes(rule.currency) || !Number.isInteger(rule.maximumReferenceAgeDays) || rule.maximumReferenceAgeDays < 1 || rule.maximumReferenceAgeDays > 3650)
    throw new MockDataError("Choose USD or LKR and a reference age limit of 1–3650 days.");
  const checkKeys = (actual: unknown, expected: unknown): void => {
    if (!actual || typeof actual !== "object" || !expected || typeof expected !== "object") return;
    if (Array.isArray(actual)) { if (!Array.isArray(expected)) throw new MockDataError("Invalid rule parameter structure."); actual.forEach((item)=>checkKeys(item, expected[0])); return; }
    const target = expected as Record<string, unknown>;
    for (const [key, item] of Object.entries(actual)) {
      if (!Object.hasOwn(target, key)) throw new MockDataError(`Unsupported rule parameter: ${key}.`);
      checkKeys(item, target[key]);
    }
  };
  for (const key of ["weights", "depthRanges", "scoring", "matching", "pricing"] as const) checkKeys(rule[key], MOCK_RULES[variety][key]);
  const allowed = new Set([...Object.keys(MOCK_RULES[variety]), "currency", "maximumReferenceAgeDays"]);
  if (Object.keys(rule).some((key) => !allowed.has(key))) throw new MockDataError("The rule contains unsupported parameters.");
  return rule;
}
export function requireActiveApproval(rule: RuleReview) {
  validateApprovedDefinition(rule.definition, rule.variety, rule.version);
  if (rule.status !== "ACTIVE" || rule.definition.approval !== "APPROVED" || !rule.createdBy || !rule.lastEditedBy || !rule.approvedBy
    || rule.approvedBy === rule.createdBy || rule.approvedBy === rule.lastEditedBy || !rule.approvedAt || !Number.isFinite(new Date(rule.approvedAt).getTime())
    || rule.domainReviewConfirmed !== true || (rule.evidence?.trim().length || 0) < 20 || (rule.reviewNotes?.trim().length || 0) < 20) throw new MockDataError("An active rule with recorded independent approval is required.");
}
export function requireRuleTransition(rule: RuleReview, action: string, actorId: string, confirmed: unknown, notes: unknown) {
  if (action === "UPDATE" && rule.status === "DRAFT" || action === "SUBMIT" && rule.status === "DRAFT" || action === "RETURN" && rule.status === "PENDING" || action === "RETIRE" && rule.status === "ACTIVE") return;
  if (action === "APPROVE" && rule.status === "PENDING") {
    if (actorId === rule.createdBy || actorId === rule.lastEditedBy) throw new MockDataError("A different administrator must approve this definition.");
    if (confirmed !== true || typeof notes !== "string" || notes.trim().length < 20 || notes.length > 4000) throw new MockDataError("Confirm domain review and record 20–4000 characters of approval notes.");
    return;
  }
  throw new MockDataError("This action is not available for the current rule status.");
}
export interface CatalogueEntry {
  _id: string; code?: string; name?: string; species?: string; status?: string; supportedOrigin?: string;
  evaluationVariety?: Variety; supportedShapes?: string[]; supportedHues?: string[]; description?: string;
}
export function catalogueEligibility(entry: CatalogueEntry, rule?: RuleReview | null) {
  if (entry.status !== "ACTIVE") return "This catalogue entry is inactive.";
  if (entry.species?.toLowerCase().trim() !== "corundum" || entry.supportedOrigin !== "Sri Lanka") return "Only Sri Lankan corundum is supported.";
  if (/star|padparadscha/i.test(`${entry.code} ${entry.name}`)) return "Specialty grading is not supported by this engine.";
  if (!entry.evaluationVariety) return "An administrator must configure the evaluation variety.";
  if (!rule || rule.variety !== entry.evaluationVariety) return "Awaiting an independently approved rule version.";
  try { requireActiveApproval(rule); } catch { return "Awaiting an independently approved rule version."; }
  if (!entry.supportedShapes?.length || entry.supportedShapes.some((shape) => !SHAPES.includes(shape as typeof SHAPES[number]))) return "Configure supported engine shapes.";
  if (!entry.supportedHues?.length || entry.supportedHues.some((hue) => !rule.definition.hues.includes(hue as EvaluationInput["color"]["hue"]))) return "Configure hues supported by the approved rule.";
  return null;
}
export function requireCatalogueInput(entry: CatalogueEntry, rule: RuleReview, input: EvaluationInput) {
  const reason = catalogueEligibility(entry, rule);
  if (reason) throw new MockDataError(reason);
  if (String(entry._id) !== input.catalogueId || entry.evaluationVariety !== input.variety || !entry.supportedShapes!.includes(input.shape) || !entry.supportedHues!.includes(input.color.hue))
    throw new MockDataError("The selected variety, hue or shape is not enabled in this catalogue entry. Reload the catalogue.");
}
export interface ReferenceQuote {
  id: string; dataKind: "REFERENCE"; datasetVersion: string; observations: EvaluationInput;
  totalPrice: number; currency: string; priceBasis: string; recordedAt: string; source: string; description: string;
  verificationStatus: string; qualityReviewed: boolean; permittedUseConfirmed: boolean;
  createdBy?: string; lastEditedBy?: string; verifiedBy?: string; verifiedAt?: string | Date;
  deletedAt?: unknown;
}
export function referenceEligibility(record: ReferenceQuote, definition: ApprovedDefinition, now = new Date()) {
  if (record.dataKind !== "REFERENCE" || record.deletedAt || record.verificationStatus !== "VERIFIED" || record.qualityReviewed !== true || record.permittedUseConfirmed !== true
    || !record.createdBy || !record.verifiedBy || record.verifiedBy === record.createdBy || record.verifiedBy === record.lastEditedBy || !record.verifiedAt || !Number.isFinite(new Date(record.verifiedAt).getTime())) return "Independent reference verification is required.";
  // Completed sales lack a trade-channel declaration in the current schema; retail evidence is never B2B evidence.
  if (record.priceBasis !== "B2B_QUOTE" || record.currency !== definition.currency) return "Use B2B quotations in the approved currency.";
  const date = new Date(`${record.recordedAt}T00:00:00Z`);
  const today = new Date(now.toLocaleDateString("en-CA", { timeZone: "Asia/Colombo" }) + "T00:00:00Z");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(record.recordedAt) || !Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== record.recordedAt
    || date > today || today.getTime() - date.getTime() > definition.maximumReferenceAgeDays * 86400000) return "The reference date is future, invalid or outside the approved age limit.";
  if (!record.id || !record.datasetVersion || !record.source?.trim() || !record.description?.trim() || !Number.isFinite(record.totalPrice) || record.totalPrice <= 0 || !record.observations || record.observations.treatment === "UNKNOWN") return "Complete source, observations and price are required.";
  if (record.observations.variety !== definition.variety) return "Reference variety does not match.";
  const errors = validateEvaluation(record.observations, { [definition.variety]: definition } as Record<Variety, RuleSet>);
  return Object.keys(errors).length ? "Complete supported reference observations are required." : null;
}
const round = (value: number) => Math.round(value * 100) / 100;
const median = (values: number[]) => { const sorted = [...values].sort((a,b) => a-b), middle = Math.floor(sorted.length/2); return sorted.length % 2 ? sorted[middle] : (sorted[middle-1]+sorted[middle])/2; };
export function evaluateApproved(input: EvaluationInput, rule: RuleReview, records: readonly ReferenceQuote[], now = new Date()) {
  requireActiveApproval(rule);
  const definition = rule.definition;
  if (input.variety !== rule.variety) throw new MockDataError("The approved rule does not match the selected variety.");
  const catalog = { [rule.variety]: definition } as Record<Variety, RuleSet>;
  const graded = gradeGemstone(input, catalog);
  const ids = new Set<string>();
  const eligible = records.filter((record) => {
    if (referenceEligibility(record, definition, now)) return false;
    if (ids.has(record.id)) throw new MockDataError("Duplicate reference identifiers cannot be priced.");
    ids.add(record.id); return true;
  });
  const cap = definition.pricing.maximumAdjustmentPercentage / 100;
  const qualityWeight = definition.weights.color + definition.weights.clarity + definition.weights.cut;
  const comparables = eligible.filter(({ observations: other }) => other.color.hue === input.color.hue && other.shape === input.shape && other.treatment === input.treatment
    && Math.abs(other.caratWeight-input.caratWeight)/input.caratWeight <= definition.matching.relativeWeightTolerance).map((record) => {
      const referenceScores = gradeGemstone(record.observations, catalog).scores;
      const differences = { color: graded.scores.color-referenceScores.color, clarity: graded.scores.clarity-referenceScores.clarity, cut: graded.scores.cut-referenceScores.cut };
      const delta = (differences.color*definition.weights.color+differences.clarity*definition.weights.clarity+differences.cut*definition.weights.cut)/qualityWeight;
      const adjustmentFactor = Math.max(1-cap,Math.min(1+cap,1+delta*definition.pricing.adjustmentPerScorePoint));
      const rawPricePerCarat = record.totalPrice/record.observations.caratWeight;
      return { id: record.id, dataKind: record.dataKind, datasetVersion: record.datasetVersion, description: record.description, source: record.source, recordedAt: record.recordedAt,
        currency: record.currency, priceBasis: record.priceBasis, caratWeight: record.observations.caratWeight, totalPrice: record.totalPrice, referenceScores, differences,
        weightDifference: round(Math.abs(record.observations.caratWeight-input.caratWeight)),
        rankDistance: Math.abs(record.observations.caratWeight-input.caratWeight)/input.caratWeight + Object.values(differences).reduce((sum,value)=>sum+Math.abs(value)/10,0),
        rawPricePerCarat, adjustmentFactor, adjustedPricePerCarat: rawPricePerCarat*adjustmentFactor };
    }).filter((match)=>Object.values(match.differences).every((difference)=>Math.abs(difference)<=definition.matching.maxComponentScoreDifference))
    .sort((a,b)=>a.rankDistance-b.rankDistance || a.id.localeCompare(b.id)).slice(0,definition.matching.maximumComparables);
  const reason = input.treatment === "UNKNOWN" ? "Treatment is unknown. Pricing is unavailable." : comparables.length < definition.matching.minimumComparables
    ? `Found ${comparables.length} eligible B2B comparables; ${definition.matching.minimumComparables} required. No sample or retail fallback is used.` : null;
  const baseline = comparables.length ? median(comparables.map((item)=>item.rawPricePerCarat)) : 0;
  const adjusted = comparables.length ? median(comparables.map((item)=>item.adjustedPricePerCarat)) : 0;
  const suggestedPrice = round(adjusted*input.caratWeight);
  const priceSuggestion = reason ? { status: "UNAVAILABLE" as const, reason } : {
    status: "AVAILABLE" as const, currency: definition.currency, suggestedPrice,
    minimumPrice: round(suggestedPrice*(1-definition.rangePercentage/100)), maximumPrice: round(suggestedPrice*(1+definition.rangePercentage/100)),
    basePricePerCarat: round(baseline), adjustedPricePerCarat: round(adjusted), adjustments: { quality: round(adjusted/baseline) },
    formula: "median of quality-adjusted verified B2B quotation prices per carat × input carat weight",
    basis: `Independently reviewed B2B quotations in ${definition.currency}, no older than ${definition.maximumReferenceAgeDays} days. Range ±${definition.rangePercentage}% is a configured allowance, not statistical confidence. No extra treatment or origin multiplier.`,
  };
  const warnings = ["A suggested B2B range based on reviewed quotations is not a completed-sale price, certification or guaranteed selling price."];
  if (input.originReliability !== "LAB_VERIFIED") warnings.push("Origin is user-declared and remains unverified.");
  if (reason) warnings.push(reason);
  const recommendations = [];
  if (graded.scores.color < 7) recommendations.push("Review colour observations and zoning.");
  if (graded.scores.clarity < 7) recommendations.push("Review inclusions with a trained gemologist.");
  if (graded.scores.cut < 7) recommendations.push("Recheck measurements and cut concerns.");
  if (reason) recommendations.push("Complete treatment information or obtain sufficient eligible B2B references.");
  return { dataKind: "REFERENCE" as const, approval: "APPROVED" as const, ruleVersion: definition.version, variety: input.variety, origin: input.origin,
    ...graded, weights: definition.weights, priceSuggestion, comparables: comparables.map((match)=>({...match, rawPricePerCarat: round(match.rawPricePerCarat), adjustedPricePerCarat: round(match.adjustedPricePerCarat), adjustmentFactor: round(match.adjustmentFactor)})),
    trace: [...graded.trace, {ruleId:`${definition.version}:MATCH`,explanation:"Verified B2B references matched by hue, shape, treatment, weight and score tolerances.",value:comparables.length},
      {ruleId:`${definition.version}:PRICE`, explanation:priceSuggestion.status === "AVAILABLE" ? priceSuggestion.formula : priceSuggestion.reason,value:priceSuggestion.status === "AVAILABLE" ? priceSuggestion.suggestedPrice : "UNAVAILABLE"}],
    referenceValidation: "REVIEWED_B2B_QUOTES" as const, recordedDomainApproval: rule.recordedDomainApproval || null, policyFeatures: { sizeScored: definition.weights.carat > 0, toneAdjustmentEnabled: definition.scoring.tonePenaltyPerStep > 0, depthAdjustmentEnabled: definition.scoring.depthPenalty > 0, qualityPriceAdjustmentEnabled: definition.pricing.adjustmentPerScorePoint > 0 && definition.pricing.maximumAdjustmentPercentage > 0 }, warnings, recommendations };
}
