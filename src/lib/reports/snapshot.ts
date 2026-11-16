import { evaluationDetail, SubmissionError } from "../evaluation/submission.ts";
import { buildPricingHistory } from "../evaluation/comparison-history.ts";
import { STATEMENT_CATEGORIES, type StatementCategory } from "../evaluation/guidance.ts";
export const REPORT_RENDERER_VERSION="report-layout-v1";
export type ReportType="FULL"|"SUMMARY";
export interface ReportSection {title:string;paragraphs:string[];rows:[string,string][]}
export interface ReportSnapshot {
  version:string;reportId:string;generatedAt:string;evaluationId:string;evaluationDate:string;name:string;dataKind:string;ruleVersion:string;audience:StatementCategory;reportType:ReportType;
  scores:{label:string;value:string}[];priceRange:string;sections:ReportSection[];disclaimer:string;
}
export function parseReportRequest(body:unknown){
  if(!body||typeof body!=="object"||Array.isArray(body))throw new SubmissionError("Choose an evaluation and report options.");
  const input=body as Record<string,unknown>;
  if(typeof input.generationKey!=="string"||!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(input.generationKey))throw new SubmissionError("Start report generation again.");
  if(input.parentReportId!==undefined){if(typeof input.parentReportId!=="string"||!/^[0-9a-f]{24}$/i.test(input.parentReportId))throw new SubmissionError("Choose a valid report to regenerate.");return {generationKey:input.generationKey.toLowerCase(),parentReportId:input.parentReportId.toLowerCase()};}
  if(typeof input.evaluationId!=="string"||!/^[0-9a-f]{24}$/i.test(input.evaluationId)||!["FULL","SUMMARY"].includes(String(input.reportType))||!STATEMENT_CATEGORIES.includes(input.audience as StatementCategory))throw new SubmissionError("Choose a saved evaluation, report type and audience.");
  return {generationKey:input.generationKey.toLowerCase(),evaluationId:input.evaluationId.toLowerCase(),reportType:input.reportType as ReportType,audience:input.audience as StatementCategory};
}
const text=(value:unknown)=>value===undefined||value===null||value===""?"Not recorded":String(value).replaceAll("_"," ");
const obj=(value:unknown):Record<string,unknown>=>value&&typeof value==="object"?value as Record<string,unknown>:{};
export function buildReportSnapshot(document:Record<string,unknown>,options:{reportId:string;generatedAt:string;reportType:ReportType;audience:StatementCategory}):ReportSnapshot{
  const saved=evaluationDetail(document),input=saved.inputSnapshot,result=saved.result,guidance=saved.guidanceSnapshot;
  const sections:ReportSection[]=[];
  const add=(title:string,paragraphs:string[]=[],rows:[string,string][]=[])=>(sections.push({title,paragraphs,rows}));
  const flatten=(value:unknown,prefix=""): [string,string][]=>Object.entries(obj(value)).flatMap(([key,item])=>key==="catalogueId"?[]:item&&typeof item==="object"?flatten(item,prefix?`${prefix} / ${key}`:key):[[(prefix?`${prefix} / ${key}`:key).replace(/([a-z])([A-Z])/g,"$1 $2"),text(item)]]);
  const name=text(obj(document.catalogueSnapshot).name||saved.variety);
  add("Gemstone information",[],input?flatten(input):[["Legacy record","A complete observation snapshot was not saved."]]);
  add("Evaluation and evidence status",[saved.dataKind==="MOCK"?"SAMPLE DATA: these rules, historical records and prices are invented development fixtures. They are not real trades or CAGS-approved valuations.":saved.dataKind==="REFERENCE"?"This report reproduces a saved evaluation using its recorded approved scoring rules and selected reviewed B2B quotations. Review is not laboratory authentication.":"This legacy evaluation may not contain complete reproducible evidence."],[["Evaluation",saved.evaluationId],["Rule version",saved.ruleVersion],["Saved evaluation date",saved.createdAt||"Not recorded"],["Report audience",options.audience],["Colour similarity","Not calculated"]]);
  if(result?.scores)add("4C results",["The size score is separate from gemstone quality. Scores are not market prices."],Object.entries(result.scores).map(([key,value])=>[key,`${value} / 10`]));
  add("Price suggestion",[saved.priceRange,saved.priceReason||"The range is a suggestion, not a guaranteed selling price."],[]);
  const statement=guidance?.statements?.[options.audience];
  if(options.reportType==="FULL"){
    if(result?.trace)add("Evaluation breakdown",[],result.trace.map(item=>[text(item.ruleId),`${text(item.explanation)} Result: ${text(item.value)}`]));
    if(result?.weights)add("Score weighting",[],Object.entries(result.weights).map(([key,value])=>[key,`${Math.round(value*100)}%`]));
    add("Information reliability",["Measurements, colour, clarity, treatment and origin were entered by the user. Declaring laboratory verification does not attach or authenticate a laboratory report."],[["Origin",input?`${input.origin} / ${text(input.originReliability)} (declared)`:"Not recorded"],["Treatment",input?`${input.treatment} (declared)`:"Not recorded"],["Reference basis",saved.dataKind==="REFERENCE"?"Reviewed B2B quotations":saved.dataKind==="MOCK"?"Sample fixtures":"Not recorded"]]);
    add("Comparable gemstone evidence",[`${result?.comparables?.length||0} comparable records were selected in the saved evaluation.`],saved.recordSnapshots.flatMap(record=>[[record.id,`${record.recordedAt} | ${record.currency} ${record.totalPrice} total | ${record.observations?.caratWeight??"Unknown"} ct | ${record.priceBasis} | ${record.source}`] as [string,string],["Saved record version",record.datasetVersion],["Recorded observations",flatten(record.observations).map(([key,value])=>`${key}: ${value}`).join("; ")]]));
    const price=result?.priceSuggestion;
    if(price&&price.status!=="UNAVAILABLE")add("Pricing calculation",[price.formula,price.basis],[["Historical baseline per carat",`${price.currency} ${price.basePricePerCarat}`],["Adjusted median per carat",`${price.currency} ${price.adjustedPricePerCarat}`],...Object.entries(price.adjustments).map(([key,value])=>[`${key} factor`,String(value)] as [string,string]),...(result?.comparables||[]).map(record=>[record.id,`Raw ${record.currency} ${record.rawPricePerCarat}/ct; adjustment x${record.adjustmentFactor}; adjusted ${record.adjustedPricePerCarat}/ct`] as [string,string])]);
    const history=buildPricingHistory(document,12);
    add("Historical pricing evidence",[history.notice,history.methodology],history.buckets.map(bucket=>[bucket.month,bucket.median===null?"No saved evidence":`${bucket.count} records | median ${history.currency} ${bucket.median} per carat`]));
  }
  if(guidance)add("Recommendations",["These are versioned explanatory system recommendations, not a separate CAGS-approved recommendation policy."],guidance.recommendations.map(item=>[`${item.group}: ${item.title}`,`${item.explanation} ${item.actions[options.audience]} Evidence: ${item.evidence.map(e=>`${e.field}: ${e.value}`).join("; ")}. References: ${item.relatedRules.join(", ")||"Saved observations"} / ${item.id}`]));
  else add("Recommendations",result?.recommendations?.length?result.recommendations:["Structured recommendations were not saved with this older evaluation."]);
  add(`${options.audience.toLowerCase()} statement`,[statement?.text||"A personalised statement was not saved with this evaluation. No newer statement has been generated retrospectively."]);
  if(result?.warnings?.length)add("Recorded limitations",result.warnings);
  add("Report snapshot",["This document reproduces saved evaluation evidence. Generating or regenerating a report does not reevaluate the gemstone. Regenerated reports retain their predecessors."],[["Guidance version",guidance?.version||"Not saved"],["Report layout",REPORT_RENDERER_VERSION]]);
  return structuredClone({version:REPORT_RENDERER_VERSION,...options,evaluationId:saved.evaluationId,evaluationDate:saved.createdAt,name,dataKind:saved.dataKind,ruleVersion:saved.ruleVersion,
    scores:Object.entries(saved.scores).map(([label,value])=>({label:label==="carat"?"Size":label,value:value===null?"Not recorded":`${value}/10`})),priceRange:saved.priceRange,sections,
    disclaimer:"Estimated decision-support result only. Not a laboratory valuation, certification, authentication, legally binding valuation or guaranteed selling price."});
}
