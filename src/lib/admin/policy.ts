import type { RuleSet } from "../evaluation/types";

export type RuleStatus = "DRAFT" | "PENDING" | "ACTIVE" | "ARCHIVED";
export type RuleCategory = "COLOR" | "CLARITY" | "CUT" | "PRICING";
export function userAuditSnapshot(user: Record<string, unknown>) {
  return Object.fromEntries(["_id", "name", "email", "category", "role", "status", "deletedAt", "deletedBy"].map((key) => [key, user[key]]));
}
export type RuleRow = { id: string; path: string; category: RuleCategory; description: string; value: number; effect: string; inputScale: number };
function describe(path: string) {
  const parts = path.split(".");
  const name = (value: string) => value.replaceAll("_", " ").toLowerCase();
  if (parts[0] === "weights") return `${name(parts[1])} contribution to the overall score (%)`;
  if (parts[0] === "toneRange") return `Preferred colour tone: ${parts[1] === "0" ? "minimum" : "maximum"}`;
  if (parts[0] === "depthRanges") return `${name(parts[1])} ${parts[2] === "0" ? "minimum" : "maximum"} depth (%)`;
  if (parts[1] === "saturationScore") return `${name(parts[2])} saturation score`;
  if (parts[1] === "nakedEyeScore") return `${name(parts[2])} naked-eye clarity score`;
  if (parts[1] === "loupeScore") return `10× loupe: ${name(parts[2])} inclusion score`;
  if (parts[1] === "severityPenalty") return `${name(parts[2])} severity deduction (shared across the 4Cs)`;
  if (parts[1] === "qualityScore") return `${name(parts[2])} symmetry / polish score`;
  if (parts[1] === "caratBands") return `Size band ${Number(parts[2]) + 1}: ${parts[3] === "minimum" ? "minimum weight (ct)" : "score"}`;
  const labels: Record<string, string> = {
    rangePercentage: "Price range above / below suggested total (%)",
    "matching.relativeWeightTolerance": "Maximum comparable weight difference (%)",
    "matching.maxComponentScoreDifference": "Maximum difference in a comparable's component score",
    "matching.minimumComparables": "Minimum comparable records required for pricing",
    "matching.maximumComparables": "Maximum comparable records used",
    "pricing.adjustmentPerScorePoint": "Price adjustment per quality-score point (%)",
    "pricing.maximumAdjustmentPercentage": "Maximum quality adjustment (%)",
    "scoring.tonePenaltyPerStep": "Colour deduction per tone step outside the preferred range",
    "scoring.unevenDistributionPenalty": "Uneven colour distribution deduction",
    "scoring.depthPenalty": "Depth outside the preferred range: score deduction",
  };
  return labels[path] || path.replaceAll(".", " / ").replace(/([a-z])([A-Z])/g, "$1 $2");
}
export function ruleRows(definition: RuleSet): RuleRow[] {
  const rows: RuleRow[] = [];
  function walk(value: unknown, path: string) {
    if (typeof value === "number") {
      const category: RuleCategory = /saturation|tone|uneven|weights.color/.test(path) ? "COLOR" : /nakedEye|loupe|severityPenalty|weights.clarity/.test(path) ? "CLARITY" : /depth|qualityScore|weights.cut/.test(path) ? "CUT" : "PRICING";
      const percent = /weights\.|adjustmentPerScorePoint|relativeWeightTolerance/.test(path);
      const inputScale = percent ? 100 : 1;
      const showPercent = percent || /rangePercentage|maximumAdjustmentPercentage|^depthRanges\./.test(path);
      rows.push({ id: `${category.slice(0, 3)}-${rows.length + 1}`, path, category, description: describe(path), value, inputScale, effect: showPercent ? `${Number((value * inputScale).toFixed(2))}%` : String(value) });
    } else if (value && typeof value === "object") for (const [key, child] of Object.entries(value)) walk(child, path ? `${path}.${key}` : key);
  }
  walk(definition, "");
  return rows;
}

export function applyRuleChanges(definition: RuleSet, changes: unknown): RuleSet {
  if (!changes || typeof changes !== "object" || Array.isArray(changes)) throw new Error("Provide numeric rule changes.");
  const allowed = new Set(ruleRows(definition).map((row) => row.path));
  const next = structuredClone(definition);
  for (const [path, value] of Object.entries(changes)) {
    if (!allowed.has(path) || typeof value !== "number" || !Number.isFinite(value)) throw new Error(`Invalid rule field: ${path}.`);
    const segments = path.split(".");
    let target = next as unknown as Record<string, unknown>;
    for (const segment of segments.slice(0, -1)) target = target[segment] as Record<string, unknown>;
    target[segments.at(-1)!] = value;
  }
  return next;
}

export function requireRuleTransition(status: RuleStatus, action: string, creatorId: string | readonly string[], actorId: string) {
  if (action === "UPDATE" && status === "DRAFT") return "DRAFT";
  if (action === "SUBMIT" && status === "DRAFT") return "PENDING";
  if (action === "RETURN" && status === "PENDING") return "DRAFT";
  if (action === "ACTIVATE" && status === "PENDING") {
    if ((typeof creatorId === "string" ? [creatorId] : creatorId).includes(actorId)) throw new Error("A different administrator must review and activate this proposal.");
    return "ACTIVE";
  }
  throw new Error(`Cannot ${action.toLowerCase()} a ${status.toLowerCase()} version.`);
}

export function requireRuleDeletion(status: RuleStatus) {
  if (status !== "DRAFT") throw new Error("Only draft versions can be deleted. Return pending proposals to draft first; active and archived versions are retained for traceability.");
}

export function requireUserDeletion(targetId: string, actorId: string) {
  if (targetId.toLowerCase() === actorId.toLowerCase()) throw new Error("You cannot delete your own administrator account.");
}

export function compareRules(left: RuleSet, right: RuleSet) {
  const before = new Map(ruleRows(left).map((row) => [row.path, row]));
  const after = new Map(ruleRows(right).map((row) => [row.path, row]));
  return [...new Set([...before.keys(), ...after.keys()])].filter((path) => before.get(path)?.value !== after.get(path)?.value)
    .map((path) => ({ path, before: before.get(path)?.value ?? null, after: after.get(path)?.value ?? null }));
}
