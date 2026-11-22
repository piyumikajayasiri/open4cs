import { validateEvaluation } from "./engine.ts";
import type { EvaluationInput, RuleSet, Variety } from "./types";

export const EVALUATION_STEPS = ["Gemstone", "Basic Info", "Color", "Clarity", "Cut", "Carat", "Factors", "Review"] as const;
export const STEP_FIELDS = [
  ["variety"], ["origin", "shape"],
  ["color.hue", "color.tone", "color.saturation", "color.distribution", "color.zoning"],
  ["clarity.nakedEye", "clarity.loupe10x", "clarity.severity", "clarity.inclusionType", "clarity.inclusionLocation", "clarity.durabilityConcern"],
  ["cut.length", "cut.width", "cut.depth", "cut.symmetry", "cut.polish", "cut.windowing", "cut.extinction", "cut.bulging"],
  ["caratWeight"], ["originReliability", "treatment"],
] as const;
export type ObservationDraft = Record<string, string>;
export function blankDraft(): ObservationDraft { return { origin: "Sri Lanka" }; }
export function observationsFromDraft(draft: ObservationDraft): EvaluationInput {
  const value = (path: string) => ["caratWeight", "color.tone", "cut.length", "cut.width", "cut.depth"].includes(path)
    ? draft[path]?.trim() ? Number(draft[path]) : NaN : draft[path] || "";
  return {
    variety: value("variety"), origin: value("origin"), shape: value("shape"), treatment: value("treatment"), originReliability: value("originReliability"), caratWeight: value("caratWeight"),
    color: Object.fromEntries(["hue", "tone", "saturation", "distribution", "zoning"].map((key) => [key, value(`color.${key}`)])),
    clarity: Object.fromEntries(["nakedEye", "loupe10x", "severity", "inclusionType", "inclusionLocation", "durabilityConcern"].filter((key)=>["nakedEye","loupe10x","severity"].includes(key)||draft[`clarity.${key}`]?.trim()).map((key) => [key, value(`clarity.${key}`)])),
    cut: Object.fromEntries(["length", "width", "depth", "symmetry", "polish", "windowing", "extinction", "bulging"].map((key) => [key, value(`cut.${key}`)])),
  } as EvaluationInput;
}
export function draftErrors(draft: ObservationDraft, rules: Record<Variety, RuleSet>, step?: number) {
  const errors = validateEvaluation(observationsFromDraft(draft), rules);
  for (const path of Object.keys(errors)) if (!draft[path]?.trim()) errors[path] = "This field is required. Please enter or select a value.";
  return step === undefined || step === 7 ? errors : Object.fromEntries(Object.entries(errors).filter(([path]) => (STEP_FIELDS[step] as readonly string[]).includes(path)));
}
export function firstErrorStep(errors: Record<string, string>) {
  return STEP_FIELDS.findIndex((fields) => fields.some((path) => Boolean(errors[path])));
}
