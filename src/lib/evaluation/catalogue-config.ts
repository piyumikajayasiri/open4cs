import { MOCK_RULES } from "./mock-rules.ts";
import type { CatalogueEntry } from "./approved-policy.ts";
import type { Variety } from "./types";
export const CATALOGUE_SHAPES = ["OVAL", "ROUND", "CUSHION", "PEAR", "EMERALD"] as const;
export function normalizeCatalogueEntry(entry: CatalogueEntry): CatalogueEntry {
  const name = String(entry.name || "").trim();
  const inferred: Variety | undefined = /\bruby\b/i.test(name) ? "RUBY" : /\bsapphire\b/i.test(name) ? "SAPPHIRE" : undefined;
  const variety = entry.evaluationVariety === "RUBY" || entry.evaluationVariety === "SAPPHIRE" ? entry.evaluationVariety : inferred;
  const species = String(entry.species || "").trim();
  const origin = String(entry.supportedOrigin || "").trim();
  const hues = variety ? [...MOCK_RULES[variety].hues] : [];
  const hints = hues.filter((hue) => name.toUpperCase().split(/[^A-Z]+/).includes(hue));
  if (/\bwhite\b/i.test(name) && variety === "SAPPHIRE") hints.push("COLORLESS");
  return { ...entry, name, status: String(entry.status || "").trim().toUpperCase(),
    species: /^corundum$/i.test(species) || variety && /^sri lankan$/i.test(species) ? "Corundum" : species,
    supportedOrigin: /^(?:sri lanka(?: \(ceylon\))?|ceylon)$/i.test(origin) ? "Sri Lanka" : origin,
    evaluationVariety: variety,
    supportedShapes: entry.supportedShapes?.length ? [...new Set(entry.supportedShapes.map((shape) => shape.trim().toUpperCase()))] : variety ? [...CATALOGUE_SHAPES] : [],
    supportedHues: entry.supportedHues?.length ? [...new Set(entry.supportedHues.map((hue) => hue.trim().toUpperCase()))] : hints.length === 1 ? hints : hues,
  };
}
export function catalogueSelectionEligibility(entry: CatalogueEntry): string | null {
  if (entry.status !== "ACTIVE") return "This catalogue entry is inactive.";
  if (entry.species !== "Corundum" || entry.supportedOrigin !== "Sri Lanka") return "Only Sri Lankan corundum is supported.";
  if (/star|padparadscha/i.test(entry.name || "")) return "Specialty grading is not supported by this engine.";
  const variety = entry.evaluationVariety;
  if (variety !== "RUBY" && variety !== "SAPPHIRE") return "Configure a ruby or sapphire evaluation variety.";
  if (!entry.supportedShapes?.length || entry.supportedShapes.some((shape) => !(CATALOGUE_SHAPES as readonly string[]).includes(shape))) return "Configure supported engine shapes.";
  if (!entry.supportedHues?.length || entry.supportedHues.some((hue) => !(MOCK_RULES[variety].hues as readonly string[]).includes(hue))) return "Configure supported engine hues.";
  return null;
}
export function catalogueWriteFields(entry: CatalogueEntry) {
  const normalized = normalizeCatalogueEntry(entry);
  return { species: normalized.species, supportedOrigin: normalized.supportedOrigin, evaluationVariety: normalized.evaluationVariety, supportedShapes: normalized.supportedShapes, supportedHues: normalized.supportedHues };
}
