import assert from "node:assert/strict";
import test from "node:test";
import { MOCK_RULES } from "../src/lib/evaluation/mock-rules.ts";
import { MOCK_EXAMPLES, MOCK_GEMSTONE_RECORDS } from "../src/lib/evaluation/mock-data.ts";
import { validateApprovedDefinition, requireActiveApproval, requireRuleTransition, catalogueEligibility, requireCatalogueInput, referenceEligibility, evaluateApproved } from "../src/lib/evaluation/approved-policy.ts";
import { snapshotApprovedEvaluation } from "../src/lib/evaluation/approved-submission.ts";
import { parseSubmission, evaluationSummary } from "../src/lib/evaluation/submission.ts";
// All rules and quotations here are synthetic test fixtures, not domain approvals or market evidence.
const now = new Date("2026-11-15T10:00:00Z");
const entry = ()=>({_id:"123456789012345678901234",name:"Ruby",code:"RUBY",species:"Corundum",supportedOrigin:"Sri Lanka",status:"ACTIVE",evaluationVariety:"RUBY",supportedShapes:["OVAL"],supportedHues:["RED","PURPLISH_RED"]});
const input = ()=>({...structuredClone(MOCK_EXAMPLES.RUBY),catalogueId:entry()._id});
function approved(currency="USD") {
  const definition={...structuredClone(MOCK_RULES.RUBY),version:"cags-ruby-v1",dataKind:"REFERENCE",approval:"APPROVED",currency,maximumReferenceAgeDays:365};
  return {version:definition.version,variety:"RUBY",status:"ACTIVE",definition,summary:"Synthetic review test fixture",evidence:"Synthetic evidence for automated tests only",createdBy:"author",lastEditedBy:"editor",approvedBy:"reviewer",approvedByName:"Test Reviewer",approvedAt:"2026-11-14T00:00:00Z",reviewNotes:"Synthetic domain confirmation for testing only",domainReviewConfirmed:true};
}
function quotes(currency="USD") {
  return [1000,2000,3000].map((total,index)=>({id:`REF-${index}`,dataKind:"REFERENCE",datasetVersion:`ref-${index}-r1`,observations:input(),currency,priceBasis:"B2B_QUOTE",totalPrice:total,recordedAt:"2026-11-14",source:"Synthetic test quotation",description:"Synthetic test record; not market evidence",verificationStatus:"VERIFIED",qualityReviewed:true,permittedUseConfirmed:true,createdBy:"reference-author",verifiedBy:"reference-reviewer",verifiedAt:"2026-11-14T10:00:00Z"}));
}
test("approved definitions validate numeric bounds and reject hidden parameters or false identity",()=>{
  const rule=approved();assert.doesNotThrow(()=>validateApprovedDefinition(rule.definition,"RUBY",rule.version));
  for(const change of [r=>r.weights.color=-1,r=>r.maximumReferenceAgeDays=0,r=>r.currency="XXX",r=>r.pricing.originPremium=0.5,r=>r.scoring.caratBands[0].extra=1,r=>r.version="mock-ruby-v2",r=>r.matching.minimumComparables=1]){
    const definition=structuredClone(rule.definition);change(definition);assert.throws(()=>validateApprovedDefinition(definition,"RUBY",rule.version));
  }
});
test("review enforces draft transitions, independent approval, confirmation and notes",()=>{
  const rule=approved();rule.status="PENDING";
  for(const actor of [rule.createdBy,rule.lastEditedBy])assert.throws(()=>requireRuleTransition(rule,"APPROVE",actor,true,"Sufficient synthetic review notes"));
  assert.throws(()=>requireRuleTransition(rule,"APPROVE","other",false,"Sufficient synthetic review notes"));
  assert.throws(()=>requireRuleTransition(rule,"APPROVE","other",true,"short"));
  assert.doesNotThrow(()=>requireRuleTransition(rule,"APPROVE","other",true,"Sufficient synthetic review notes"));
  rule.status="ACTIVE";assert.throws(()=>requireRuleTransition(rule,"UPDATE","other",true,"notes"));assert.doesNotThrow(()=>requireRuleTransition(rule,"RETIRE","other",true,"notes"));
  for(const change of [r=>r.status="DRAFT",r=>r.approvedBy=r.createdBy,r=>r.domainReviewConfirmed=false,r=>r.definition.approval="PENDING"]){const invalid=approved();change(invalid);assert.throws(()=>requireActiveApproval(invalid));}
});
test("managed catalogue status, specialty scope, shape, hue and explicit mapping gate evaluation",()=>{
  const rule=approved();assert.equal(catalogueEligibility(entry(),rule),null);assert.doesNotThrow(()=>requireCatalogueInput(entry(),rule,input()));
  for(const change of [e=>e.status="INACTIVE",e=>delete e.evaluationVariety,e=>e.species="Beryl",e=>e.supportedOrigin="Other",e=>e.name="Star Ruby",e=>e.supportedShapes=["CABOCHON"],e=>e.supportedHues=["BLUE"]]){const invalid=entry();change(invalid);assert.ok(catalogueEligibility(invalid,rule));}
  assert.ok(catalogueEligibility(entry(),null));
  for(const change of [i=>i.shape="ROUND",i=>i.catalogueId="aaaaaaaaaaaaaaaaaaaaaaaa",i=>i.color.hue="BLUE"]){const invalid=input();change(invalid);assert.throws(()=>requireCatalogueInput(entry(),rule,invalid));}
});
test("real engine excludes retail, mock, unverified, incomplete, mixed-currency, stale and future evidence",()=>{
  const rule=approved();
  for(const change of [r=>r.dataKind="MOCK",r=>r.verificationStatus="PENDING",r=>r.qualityReviewed=false,r=>r.permittedUseConfirmed=false,r=>r.verifiedBy=r.createdBy,r=>r.verifiedBy=r.lastEditedBy="editor",r=>delete r.verifiedAt,r=>r.priceBasis="RETAIL_ESTIMATE",r=>r.priceBasis="COMPLETED_SALE",r=>r.currency="LKR",r=>r.recordedAt="2026-11-16",r=>r.recordedAt="2024-01-01",r=>r.recordedAt="2026-02-30",r=>r.totalPrice=NaN,r=>delete r.observations,r=>r.observations.cut.width=0,r=>r.observations.treatment="UNKNOWN",r=>r.deletedAt=new Date()]){
    const record=quotes()[0];change(record);assert.ok(referenceEligibility(record,rule.definition,now));assert.equal(evaluateApproved(input(),rule,[record],now).priceSuggestion.status,"UNAVAILABLE");
  }
  assert.equal(evaluateApproved(input(),rule,MOCK_GEMSTONE_RECORDS,now).priceSuggestion.status,"UNAVAILABLE");
});
test("verified B2B quotations supply a reproducible median and configured range without invented fallback",()=>{
  const rule=approved(),records=quotes();const result=evaluateApproved(input(),rule,records,now);
  assert.equal(result.dataKind,"REFERENCE");assert.equal(result.approval,"APPROVED");assert.equal(result.priceSuggestion.status,"AVAILABLE");
  assert.equal(result.priceSuggestion.suggestedPrice,2000);assert.equal(result.priceSuggestion.minimumPrice,1600);assert.equal(result.priceSuggestion.maximumPrice,2400);
  assert.equal(result.comparables.length,3);assert.deepEqual(evaluateApproved(input(),rule,records,now),result);
  records[0].totalPrice=1000000;assert.equal(evaluateApproved(input(),rule,records,now).priceSuggestion.suggestedPrice,3000);
  assert.equal(evaluateApproved(input(),rule,[],now).priceSuggestion.status,"UNAVAILABLE");
  const unknown=input();unknown.treatment="UNKNOWN";assert.equal(evaluateApproved(unknown,rule,quotes(),now).priceSuggestion.status,"UNAVAILABLE");
  assert.equal(evaluateApproved(input(),approved("LKR"),quotes("LKR"),now).priceSuggestion.currency,"LKR");
});
test("matching never crosses treatment, shape, hue or weight limits and respects quality adjustment caps",()=>{
  const rule=approved();
  for(const change of [r=>r.observations.treatment="UNHEATED",r=>r.observations.shape="CUSHION",r=>r.observations.color.hue="PURPLISH_RED",r=>r.observations.caratWeight=50]){
    const records=quotes();records.forEach(change);assert.equal(evaluateApproved(input(),rule,records,now).comparables.length,0);
  }
  const better=input();better.color.saturation="VIVID";better.color.zoning="NONE";
  const result=evaluateApproved(better,rule,quotes(),now);assert.ok(result.priceSuggestion.suggestedPrice>2000);assert.ok(result.comparables.every(r=>r.adjustmentFactor<=1.25));
  const duplicate=quotes();duplicate[1].id=duplicate[0].id;assert.throws(()=>evaluateApproved(input(),rule,duplicate,now));
});
test("approved snapshots preserve rule review, catalogue and complete reference evidence immutably",()=>{
  const rule=approved(),records=quotes(),catalogue=entry(),observations=input(),result=evaluateApproved(observations,rule,records,now);
  const snapshot=snapshotApprovedEvaluation(observations,result,rule,records,catalogue,now);
  rule.reviewNotes="Changed";records[0].totalPrice=99999;catalogue.status="INACTIVE";observations.color.tone=1;
  assert.equal(snapshot.recordSnapshots[0].totalPrice,1000);assert.equal(snapshot.catalogueSnapshot.status,"ACTIVE");assert.equal(snapshot.inputSnapshot.color.tone,MOCK_EXAMPLES.RUBY.color.tone);
  assert.notEqual(snapshot.ruleSnapshot.review.reviewNotes,"Changed");
  assert.throws(()=>snapshotApprovedEvaluation(input(),result,approved(),[],entry(),now));
  const summary=evaluationSummary({...snapshot,_id:entry()._id,evaluationId:"EVAL-TEST",createdAt:now});assert.equal(summary.dataKind,"REFERENCE");assert.match(summary.priceRange,/USD/);
});
test("submission retains catalogue identity and rejects malformed catalogue identifiers",()=>{
  const submissionKey="12345678-1234-4234-8234-123456789012";
  assert.equal(parseSubmission({submissionKey,observations:input()}).input.catalogueId,entry()._id);
  for(const catalogueId of [{},"invalid",12])assert.throws(()=>parseSubmission({submissionKey,observations:{...input(),catalogueId}}));
});
