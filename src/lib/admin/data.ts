import type { EvaluationInput } from "../evaluation/types";
import { validateEvaluation } from "../evaluation/engine.ts";

export type Dataset = "MOCK" | "REFERENCE";
export interface ManagedRecord {
  key: string; recordId: string; dataset: Dataset; variety: string; hue: string; weight: number;
  treatment: string; quality: string; source: string; date: string; totalPrice: number; currency: string;
  status: string; priceBasis: string; observations?: EvaluationInput; description: string;
  qualityReviewed: boolean; permittedUseConfirmed: boolean; createdBy?: string;
  revision: number;
}
export function validDate(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}
export function validateHistoricalRecord(record: Record<string, unknown>, dataset: Dataset) {
  const errors = validateEvaluation(record.observations);
  if (typeof record.totalPrice !== "number" || !Number.isFinite(record.totalPrice) || record.totalPrice <= 0 || record.totalPrice > 1e9) errors.totalPrice = "Enter a positive total price no greater than 1 billion.";
  if (typeof record.source !== "string" || record.source.trim().length < 3 || record.source.length > 500) errors.source = "Provide a source with 3–500 characters.";
  if (!validDate(record.recordedAt)) errors.recordedAt = "Enter a valid record date.";
  if (typeof record.currency !== "string" || !/^[A-Z]{3}$/.test(record.currency)) errors.currency = "Use a three-letter currency code.";
  if (typeof record.description !== "string" || record.description.trim().length < 3 || record.description.length > 1000) errors.description = "Describe the record in 3–1000 characters.";
  if (dataset === "MOCK") {
    if (record.dataKind !== "MOCK" || record.currency !== "USD" || record.priceBasis !== "MOCK_B2B") errors.dataset = "Mock imports require MOCK labels, USD prices and MOCK_B2B basis.";
    if (typeof record.id !== "string" || !/^MOCK-[A-Z0-9_-]{3,120}$/.test(record.id)) errors.id = "Use a unique MOCK- identifier containing letters, numbers or hyphens.";
    if ((record.observations as EvaluationInput | undefined)?.treatment === "UNKNOWN") errors.treatment = "Historical mock records require a known treatment.";
  } else if (record.dataKind !== "REFERENCE" || !["RETAIL_ESTIMATE", "B2B_QUOTE", "COMPLETED_SALE"].includes(String(record.priceBasis))) errors.dataset = "Reference records require a reference label and a declared price basis.";
  return errors;
}

export function requireReferenceVerification(record: { source?: string; sourceDate?: string; origin?: { value?: string }; createdBy?: string; lastEditedBy?: string }, actorId: string, qualityReviewed: unknown, permittedUseConfirmed: unknown) {
  if (!record.source || !validDate(record.sourceDate) || record.origin?.value !== "Sri Lanka") throw new Error("A dated source and explicit Sri Lankan origin are required before verification.");
  if (record.createdBy === actorId || record.lastEditedBy === actorId) throw new Error("A different administrator must verify this reference record.");
  if (qualityReviewed !== true || permittedUseConfirmed !== true) throw new Error("Confirm data quality and permitted use before verifying this record.");
}

export class RecordValidationError extends Error {
  errors: Record<string, string>;
  constructor(errors: Record<string, string>) { super("Correct the highlighted record fields."); this.errors = errors; }
}

export function recordUpdateFields(input: Record<string, unknown>, dataset: Dataset) {
  const errors = validateHistoricalRecord(input, dataset);
  if (Object.keys(errors).length) throw new RecordValidationError(errors);
  const observations = structuredClone(input.observations) as EvaluationInput;
  const common = { currency: input.currency, source: String(input.source).trim(), description: String(input.description).trim() };
  if (dataset === "MOCK") return { ...common, observations, totalPrice: input.totalPrice, priceBasis: "MOCK_B2B", recordedAt: input.recordedAt };
  return { ...common, variety: observations.variety, caratWeight: observations.caratWeight, shape: observations.shape,
    color: observations.color, clarity: observations.clarity, cut: observations.cut,
    origin: { value: observations.origin, reliability: observations.originReliability }, treatment: { status: observations.treatment },
    referencePrice: input.totalPrice, priceBasis: input.priceBasis, sourceDate: input.recordedAt,
    verificationStatus: "PENDING", qualityReviewed: false, permittedUseConfirmed: false,
    verifiedBy: undefined, verifiedByName: undefined, verifiedAt: undefined };
}

// Missing legacy observations stay blank for an editor to correct; no mock values are substituted.
export function referenceObservations(record: Record<string, unknown>): EvaluationInput {
  const object = (value: unknown) => value && typeof value === "object" ? value as Record<string, unknown> : {};
  const color = object(record.color), clarity = object(record.clarity), cut = object(record.cut), origin = object(record.origin), treatment = object(record.treatment);
  const numeric = (value: unknown) => value !== null && value !== "" && value !== undefined && Number.isFinite(Number(value)) ? Number(value) : NaN;
  return {
    variety: record.variety, caratWeight: numeric(record.caratWeight), shape: record.shape || "",
    origin: origin.value || (typeof record.origin === "string" ? record.origin : ""), originReliability: origin.reliability || "", treatment: treatment.status || (typeof record.treatment === "string" ? record.treatment : ""),
    color: { ...color, tone: numeric(color.tone) }, clarity, cut: { ...cut, length: numeric(cut.length), width: numeric(cut.width), depth: numeric(cut.depth) },
  } as unknown as EvaluationInput;
}
