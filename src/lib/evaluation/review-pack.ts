import { createHash } from "node:crypto";
import numerical from "../../../data/cags-review/2026-11-17/numerical-candidates.json" with {type:"json"};
import approval from "../../../data/cags-review/2026-11-17/approval-record.json" with {type:"json"};
import research from "../../../data/cags-review/2026-11-17/draft-evaluation-rules.json" with {type:"json"};
import pricing from "../../../data/cags-review/2026-11-17/pricing-references.json" with {type:"json"};
import sources from "../../../data/cags-review/2026-11-17/sources.json" with {type:"json"};
import { validateApprovedDefinition } from "./approved-policy.ts";
import type { Variety } from "./types";
export const REVIEW_PACK_ID="cags-review-2026-11-17";
export const REVIEW_PACK_FINGERPRINT=createHash("sha256").update(JSON.stringify({numerical,approval,research})).digest("hex");
export function recordedCandidate(candidateId:string,version:string){
 const candidate=numerical.candidates.find(item=>item.candidate===candidateId);
 if(!candidate||approval.status!=="USER_REPORTED_CAGS_APPROVAL"||!approval.scope.numericalCandidates.includes(candidateId)||research.rules.some(rule=>!approval.scope.ruleIds.includes(rule.id)))throw new Error("The recorded approval does not cover this candidate.");
 if(!/^\d{4}-\d{2}-\d{2}$/.test(approval.approvalDate)||!Number.isFinite(Date.parse(approval.approvalDate)))throw new Error("The recorded approval date is invalid.");
 const definition=validateApprovedDefinition({...structuredClone(candidate.definition),version,approval:"PENDING"},candidate.definition.variety as Variety,version);
 return {definition,sourcePackId:REVIEW_PACK_ID,sourceCandidateId:candidateId,sourcePackFingerprint:REVIEW_PACK_FINGERPRINT,recordedDomainApproval:{basis:"USER_REPORTED_CAGS_APPROVAL",approvalDate:approval.approvalDate,reviewerName:approval.reviewerName,reviewerNameStatus:approval.reviewerNameStatus,documentReference:approval.approvalDocumentReference,appliesToDefinition:true},summary:`Recorded CAGS-reviewed ${candidate.definition.variety.toLowerCase()} definition from 17 November 2026`,evidence:`User reported CAGS approval for all 16 draft rules and both numerical candidates on ${approval.approvalDate}. Domain reviewer name and document were not provided. Research pack ${REVIEW_PACK_ID}; candidate ${candidateId}; fingerprint ${REVIEW_PACK_FINGERPRINT}. Independent system review is required before activation. Pricing records are not approved as B2B evidence.`};
}
export function reviewPackSummary(){return {id:REVIEW_PACK_ID,fingerprint:REVIEW_PACK_FINGERPRINT,approval:{basis:approval.status,date:approval.approvalDate,reviewerName:approval.reviewerName,reviewerNameStatus:approval.reviewerNameStatus,documentReference:approval.approvalDocumentReference},candidates:numerical.candidates.map(item=>({id:item.candidate,variety:item.definition.variety,hues:item.definition.hues,definition:item.definition})),ruleCount:research.rules.length,referenceCount:pricing.records.length,verifiedB2BQuotes:pricing.statistics.verifiedCompleteB2BQuotes,sources:sources.sources.map(item=>({id:item.id,title:item.title,url:item.url})),references:pricing.records.map(record=>({id:record.id,sourceId:record.sourceId,sourceUrl:record.sourceUrl,basis:record.priceBasis,price:record.price,issues:record.evidenceIssues}))};}
