import { canonicalInput } from "./submission.ts";
import { requireActiveApproval, requireCatalogueInput, referenceEligibility, type RuleReview, type CatalogueEntry, type ReferenceQuote, type evaluateApproved } from "./approved-policy.ts";
import type { EvaluationInput } from "./types";
export function snapshotApprovedEvaluation(input: EvaluationInput, result: ReturnType<typeof evaluateApproved>, rule: RuleReview, records: readonly ReferenceQuote[], catalogue: CatalogueEntry, now = new Date()) {
  requireActiveApproval(rule); requireCatalogueInput(catalogue,rule,input);
  if (result.dataKind!=="REFERENCE" || result.approval!=="APPROVED" || result.ruleVersion!==rule.version || result.variety!==input.variety) throw new Error("Approved evaluation evidence does not match.");
  const ids = new Set(result.comparables.map((item)=>item.id));
  const selected = records.filter((item)=>ids.has(item.id));
  if (selected.length!==ids.size || selected.some((record)=>referenceEligibility(record,rule.definition,now))) throw new Error("Approved comparable snapshots are incomplete or ineligible.");
  return structuredClone({ inputSnapshot: canonicalInput(input), result, ruleSnapshot: {...rule.definition,review:rule}, recordSnapshots:selected,
    catalogueSnapshot:catalogue, ruleVersion:rule.version, priceSuggestion:result.priceSuggestion, dataKind:"REFERENCE",schemaVersion:2,status:"COMPLETED",
    bestReferenceMatch:result.comparables[0]||null, referenceDataSufficiency:{matched:result.comparables.length,minimumRequired:rule.definition.matching.minimumComparables,referenceValidation:result.referenceValidation} });
}
