import type { ClientSession } from "mongoose";
import { normalizeCatalogueEntry, catalogueSelectionEligibility } from "./catalogue-config";
import { MOCK_RULES } from "./mock-rules";
import ApprovedEvaluationRule from "@/models/ApprovedEvaluationRule";
import Gemstone from "@/models/Gemstone";
import ReferenceGemstone from "@/models/ReferenceGemstone";
import { referenceObservations } from "@/lib/admin/data";
import { catalogueEligibility, requireCatalogueInput, evaluateApproved, type CatalogueEntry, type RuleReview, type ReferenceQuote } from "./approved-policy";
import { MockDataError } from "./engine";
import type { EvaluationInput, RuleSet, Variety } from "./types";

export async function approvedCatalogue(session?: ClientSession) {
  const definitions = await ApprovedEvaluationRule.find({ status: "ACTIVE" }).session(session || null).lean();
  const rules = definitions as unknown as RuleReview[];
  const entries = await Gemstone.find({ name: { $type: "string" } }).sort({ name: 1 }).session(session || null).lean();
  const catalog = entries.map((document) => {
    const entry = normalizeCatalogueEntry({ ...document, _id: String(document._id) } as CatalogueEntry);
    const rule = rules.find((item)=>item.variety === entry.evaluationVariety);
    const reason = catalogueEligibility(entry, rule);
    const selectionReason = catalogueSelectionEligibility(entry);
    return { ...entry, eligible: !selectionReason, unavailableReason: selectionReason, evaluationReady: !reason, evaluationUnavailableReason: reason, ruleVersion: !reason ? rule!.version : null };
  });
  // Fallback definitions validate input fields only and never authorize scoring or pricing.
  const availableRules = Object.fromEntries(rules.filter((rule)=>catalog.some((entry)=>entry.evaluationReady && entry.evaluationVariety === rule.variety)).map((rule)=>[rule.variety,rule.definition]));
  return { catalogue: catalog.map(({ _id, code, name, species, status, supportedOrigin, evaluationVariety, supportedShapes, supportedHues, description, eligible, unavailableReason, ruleVersion, evaluationReady, evaluationUnavailableReason })=>
    ({ _id, code, name, species, status, supportedOrigin, evaluationVariety, supportedShapes, supportedHues, description, eligible, unavailableReason, ruleVersion, evaluationReady, evaluationUnavailableReason })), rules: { ...MOCK_RULES, ...availableRules } as Record<Variety, RuleSet> };
}
export async function loadApprovedEvaluation(input: EvaluationInput, session: ClientSession) {
  if (!input.catalogueId || !/^[0-9a-f]{24}$/i.test(input.catalogueId)) throw new MockDataError("Select a managed catalogue entry before evaluating.");
  const entry = await Gemstone.findById(input.catalogueId).session(session).lean();
  if (!entry) throw new MockDataError("The selected catalogue entry no longer exists.");
  const rule = await ApprovedEvaluationRule.findOne({ variety: input.variety, status: "ACTIVE" }).session(session).lean() as unknown as RuleReview | null;
  if (!rule) throw new MockDataError("This variety is awaiting independent rule approval.");
  requireCatalogueInput(normalizeCatalogueEntry({ ...entry, _id: String(entry._id) } as CatalogueEntry), rule, input);
  const documents = await ReferenceGemstone.find({ variety: input.variety, dataKind: "REFERENCE", deletedAt: null, verificationStatus: "VERIFIED", qualityReviewed: true,
    permittedUseConfirmed: true, priceBasis: "B2B_QUOTE", currency: rule.definition.currency }).sort({ sourceDate: -1, _id: 1 }).limit(5001).session(session).lean();
  if (documents.length > 5000) throw new MockDataError("The reference pool exceeds the supported limit. Narrow its scope before pricing.");
  const records: ReferenceQuote[] = documents.map((document)=>({
    id: document.referenceId || String(document._id), dataKind: "REFERENCE", datasetVersion: `reference-${String(document._id)}-r${document.revision ?? 0}`,
    observations: referenceObservations(document), totalPrice: document.referencePrice, currency: document.currency, priceBasis: document.priceBasis,
    recordedAt: document.sourceDate || "", source: document.source || "", description: document.description || "",
    verificationStatus: document.verificationStatus, qualityReviewed: document.qualityReviewed, permittedUseConfirmed: document.permittedUseConfirmed,
    createdBy: document.createdBy, lastEditedBy: document.lastEditedBy, verifiedBy: document.verifiedBy, verifiedAt: document.verifiedAt, deletedAt: document.deletedAt,
  }));
  const result = evaluateApproved(input, rule, records);
  return { rule, records, result, catalogueSnapshot: { ...entry, _id: String(entry._id) } };
}
