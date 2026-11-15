import { validateEvaluation } from "./engine.ts";
import type { evaluateMock } from "./engine";
import type { evaluateApproved, ReferenceQuote } from "./approved-policy";
import type { EvaluationInput, MockGemstoneRecord, RuleSet } from "./types";

export class SubmissionError extends Error {
  errors: Record<string, string>;
  constructor(message: string, errors: Record<string, string> = {}) { super(message); this.errors = errors; }
}
export type EngineResult = ReturnType<typeof evaluateMock> | ReturnType<typeof evaluateApproved>;
export function canonicalInput(input: EvaluationInput): EvaluationInput {
  return {
    ...(input.catalogueId ? { catalogueId: input.catalogueId } : {}),
    variety: input.variety, origin: input.origin, originReliability: input.originReliability, treatment: input.treatment,
    caratWeight: input.caratWeight, shape: input.shape,
    color: { hue: input.color.hue, tone: input.color.tone, saturation: input.color.saturation, distribution: input.color.distribution, zoning: input.color.zoning },
    clarity: { nakedEye: input.clarity.nakedEye, loupe10x: input.clarity.loupe10x, severity: input.clarity.severity },
    cut: { length: input.cut.length, width: input.cut.width, depth: input.cut.depth, symmetry: input.cut.symmetry, polish: input.cut.polish,
      windowing: input.cut.windowing, extinction: input.cut.extinction, bulging: input.cut.bulging },
  };
}
export function parseSubmission(body: unknown) {
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new SubmissionError("Provide gemstone observations and a submission key.");
  const value = body as Record<string, unknown>;
  if (typeof value.submissionKey !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value.submissionKey)) throw new SubmissionError("Start a new evaluation and try submitting again.");
  const errors = validateEvaluation(value.observations);
  if (Object.keys(errors).length) throw new SubmissionError("Correct the highlighted observations.", errors);
  return { submissionKey: value.submissionKey.toLowerCase(), input: canonicalInput(value.observations as EvaluationInput) };
}

export function snapshotEvaluation(input: EvaluationInput, result: EngineResult, rule: RuleSet, records: readonly MockGemstoneRecord[]) {
  if (result.ruleVersion !== rule.version || rule.variety !== input.variety || result.variety !== input.variety || result.dataKind !== "MOCK") throw new Error("Evaluation snapshots do not match the applied rules.");
  const ids = new Set(result.comparables.map((record) => record.id));
  const selected = records.filter((record) => ids.has(record.id));
  if (selected.length !== ids.size || selected.some((record) => record.dataKind !== "MOCK" || record.deletedAt || record.isActive === false)) throw new Error("Comparable snapshots are incomplete or ineligible.");
  return structuredClone({ inputSnapshot: canonicalInput(input), result, ruleSnapshot: rule, recordSnapshots: selected,
    ruleVersion: rule.version, priceSuggestion: result.priceSuggestion, dataKind: "MOCK" as const, schemaVersion: 1, status: "COMPLETED" as const,
    referenceDataSufficiency: { matched: result.comparables.length, minimumRequired: rule.matching.minimumComparables, referenceValidation: "NOT_PERFORMED" },
    bestReferenceMatch: result.comparables[0] || null });
}

export function ownedEvaluationFilter(userId: string, id?: string) {
  if (!/^[0-9a-f]{24}$/i.test(userId) || id !== undefined && !/^[0-9a-f]{24}$/i.test(id)) throw new Error("Invalid evaluation owner or identifier.");
  return { userId: userId.toLowerCase(), ...(id ? { _id: id.toLowerCase() } : {}) };
}

export function sriLankanMonthStart(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Colombo", year: "numeric", month: "numeric" }).formatToParts(now);
  const year = Number(parts.find((part) => part.type === "year")!.value);
  const month = Number(parts.find((part) => part.type === "month")!.value);
  return new Date(Date.UTC(year, month - 1, 1) - 330 * 60_000);
}

type ScoreName = "overall" | "color" | "clarity" | "cut" | "carat";
export interface EvaluationSummary {
  _id: string; evaluationId: string; variety: string; caratWeight: number | null; ruleVersion: string;
  status: string; createdAt: string; dataKind: string; scores: Record<ScoreName, number | null>;
  priceRange: string; priceStatus: string; priceReason: string;
}
const object = (value: unknown): Record<string, unknown> => value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
const finite = (value: unknown) => typeof value === "number" && Number.isFinite(value) ? value : null;
export function evaluationSummary(document: Record<string, unknown>): EvaluationSummary {
  const input = object(document.inputSnapshot), result = object(document.result), scores = object(result.scores), price = object(document.priceSuggestion);
  const minimum = finite(price.minimumPrice), maximum = finite(price.maximumPrice);
  const hasPrice = price.status !== "UNAVAILABLE" && minimum !== null && maximum !== null && minimum >= 0 && maximum >= minimum;
  const currency = typeof price.currency === "string" && /^[A-Z]{3}$/.test(price.currency) ? price.currency : "USD";
  const formatted = (value: number) => value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const scoreFor = (key: ScoreName) => finite(scores[key]) ?? finite(object(result[key === "overall" ? "overall4C" : key]).score);
  const createdAt = document.createdAt instanceof Date ? document.createdAt.toISOString() : typeof document.createdAt === "string" ? document.createdAt : "";
  return {
    _id: String(document._id), evaluationId: String(document.evaluationId || document._id), variety: String(input.variety || result.variety || "Gemstone"),
    caratWeight: finite(input.caratWeight), ruleVersion: String(document.ruleVersion || "Not recorded"), status: String(document.status || "COMPLETED"), createdAt,
    dataKind: document.dataKind === "MOCK" ? "MOCK" : document.dataKind === "REFERENCE" ? "REFERENCE" : "LEGACY", scores: { overall: scoreFor("overall"), color: scoreFor("color"), clarity: scoreFor("clarity"), cut: scoreFor("cut"), carat: scoreFor("carat") },
    priceRange: hasPrice ? `${currency} ${formatted(minimum)} – ${formatted(maximum)}` : "Price unavailable", priceStatus: hasPrice ? String(price.status || "AVAILABLE") : "UNAVAILABLE",
    priceReason: typeof price.reason === "string" ? price.reason : hasPrice ? "" : "No price suggestion was saved.",
  };
}
export interface EvaluationDetail extends EvaluationSummary {
  inputSnapshot: EvaluationInput | null; result: EngineResult | null; ruleSnapshot: RuleSet | null; recordSnapshots: (MockGemstoneRecord | ReferenceQuote)[];
}
export function evaluationDetail(document: Record<string, unknown>): EvaluationDetail {
  return { ...evaluationSummary(document), inputSnapshot: document.inputSnapshot ? document.inputSnapshot as EvaluationInput : null,
    result: object(document.result).scores ? document.result as EngineResult : null,
    ruleSnapshot: document.ruleSnapshot ? document.ruleSnapshot as RuleSet : null,
    recordSnapshots: Array.isArray(document.recordSnapshots) ? document.recordSnapshots as (MockGemstoneRecord | ReferenceQuote)[] : [] };
}
