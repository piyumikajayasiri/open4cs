import { evaluationDetail, SubmissionError } from "./submission.ts";
import { referenceEligibility, type ApprovedDefinition, type ReferenceQuote } from "./approved-policy.ts";
import { validateEvaluation } from "./engine.ts";
import type { RuleSet, Variety } from "./types";
export function parseComparisonIds(value:string|null):string[]{
  const ids=(value||"").split(",").filter(Boolean).map((id)=>id.toLowerCase());
  if(ids.length<1||ids.length>3||ids.some((id)=>!/^[0-9a-f]{24}$/.test(id))||new Set(ids).size!==ids.length)throw new SubmissionError("Select one to three distinct saved evaluations.");
  return ids;
}
const pretty=(value:unknown)=>typeof value==="string"&&value?value.replaceAll("_"," ").toLowerCase():"Not recorded";
const number=(value:unknown,suffix="")=>typeof value==="number"&&Number.isFinite(value)?`${value}${suffix}`:"Not recorded";
const object=(value:unknown):Record<string,unknown>=>value&&typeof value==="object"?value as Record<string,unknown>:{};
export function buildComparison(documents:Record<string,unknown>[]){
  const evaluations=documents.map((document)=>{const detail=evaluationDetail(document);return {...detail,name:typeof object(document.catalogueSnapshot).name==="string"?String(object(document.catalogueSnapshot).name):detail.variety};});
  const rows:{section:string;label:string;values:string[];different:boolean}[]=[];
  function row(section:string,label:string,value:(item:typeof evaluations[number])=>string){const values=evaluations.map(value);rows.push({section,label,values,different:new Set(values).size>1});}
  row("Gemstone","Variety",e=>e.name);row("Gemstone","Carat weight",e=>number(e.caratWeight," ct"));row("Gemstone","Shape",e=>pretty(e.inputSnapshot?.shape));
  row("Reliability","Origin",e=>e.inputSnapshot?.origin||"Not recorded");row("Reliability","Declared origin evidence",e=>pretty(e.inputSnapshot?.originReliability));
  row("Reliability","Treatment (user declared)",e=>pretty(e.inputSnapshot?.treatment));row("Reliability","Measurements and observations",e=>e.inputSnapshot?"User entered; not independently verified":"Not recorded");
  row("Reliability","Reference evidence",e=>e.dataKind==="REFERENCE"?"Reviewed B2B quotations":e.dataKind==="MOCK"?"Invented sample records":"Legacy / not recorded");
  for(const key of ["overall","color","clarity","cut","carat"] as const)row("Scores",key==="carat"?"Size score (separate from quality)":`${key==="color"?"Colour":key} score`,e=>key==="carat"&&e.result?.weights?.carat===0?"Not graded; weight used for matching":number(e.scores[key]," / 10"));
  for(const key of ["hue","tone","saturation","distribution","zoning"] as const)row("Colour",key,e=>key==="tone"?number(e.inputSnapshot?.color?.tone):pretty(e.inputSnapshot?.color?.[key]));
  row("Colour","Reference colour similarity",()=>"Not calculated");
  for(const key of ["nakedEye","loupe10x","severity"] as const)row("Clarity",key==="nakedEye"?"Naked-eye appearance":key==="loupe10x"?"10× observations":"Inclusion severity",e=>pretty(e.inputSnapshot?.clarity?.[key]));
  row("Clarity","Observed inclusion type",e=>e.inputSnapshot?.clarity?.inclusionType||"Not recorded");row("Clarity","Observed inclusion location",e=>e.inputSnapshot?.clarity?.inclusionLocation||"Not recorded");row("Clarity","Reported durability concern",e=>pretty(e.inputSnapshot?.clarity?.durabilityConcern));
  for(const key of ["length","width","depth"] as const)row("Cut",key,e=>number(e.inputSnapshot?.cut?.[key]," mm"));
  row("Cut","Depth percentage",e=>number(e.result?.measurements?.depthPercentage,"%"));row("Cut","Length / width",e=>number(e.result?.measurements?.lengthWidthRatio));
  for(const key of ["symmetry","polish","windowing","extinction","bulging"] as const)row("Cut",key,e=>pretty(e.inputSnapshot?.cut?.[key]));
  row("Price and evidence","Saved suggested range",e=>e.priceRange);row("Price and evidence","Price availability",e=>e.priceStatus==="UNAVAILABLE"?e.priceReason:"Available as saved");
  row("Price and evidence","Selected comparables",e=>e.result?.comparables?String(e.result.comparables.length):"Not recorded");
  row("Price and evidence","Evaluation rules",e=>e.ruleVersion);row("Price and evidence","Dataset",e=>e.dataKind);row("Price and evidence","Score weighting",e=>e.result?.weights?Object.entries(e.result.weights).map(([key,value])=>`${key} ${Math.round(value*100)}%`).join(" · "):"Not recorded");
  row("Guidance","Follow-up checks",e=>e.guidanceSnapshot?e.guidanceSnapshot.recommendations.filter(item=>item.group!=="STRENGTH").map(item=>item.title).join("; ")||"None recorded":"Structured guidance not saved");
  const notices=["Differences describe recorded characteristics; the system does not declare a winner or recalculate saved evaluations."];
  if(new Set(evaluations.map(e=>e.ruleVersion)).size>1)notices.push("Different rule versions or scoring weights may make scores unsuitable for direct ranking.");
  if(new Set(evaluations.map(e=>e.dataKind)).size>1)notices.push("Sample and real-reference evaluations are shown together. Sample prices are not market evidence.");
  const currencies=new Set(evaluations.map(e=>object(e.priceStatus!=="UNAVAILABLE"?e.result?.priceSuggestion:null).currency).filter(Boolean));
  if(currencies.size>1)notices.push("Prices use different currencies. No currency conversion or numerical price ranking is applied.");
  return {evaluations:evaluations.map(e=>({id:e._id,evaluationId:e.evaluationId,name:e.name,weight:e.caratWeight,createdAt:e.createdAt,dataKind:e.dataKind,ruleVersion:e.ruleVersion})),rows,notices};
}
const median=(values:number[])=>{const sorted=[...values].sort((a,b)=>a-b),middle=Math.floor(sorted.length/2);return sorted.length%2?sorted[middle]:(sorted[middle-1]+sorted[middle])/2;};
const round=(value:number)=>Math.round(value*100)/100;
export function buildPricingHistory(document:Record<string,unknown>,months:number){
  if(![3,6,12].includes(months))throw new SubmissionError("Choose a 3, 6 or 12 month period.");
  const saved=evaluationDetail(document),asOf=new Date(saved.createdAt),rule=saved.ruleSnapshot,input=saved.inputSnapshot;
  const validAsOf=Number.isFinite(asOf.getTime());
  const parts=validAsOf?new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Colombo",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(asOf):[];
  const part=(name:string)=>parts.find(item=>item.type===name)?.value||"";
  const asOfDate=validAsOf?`${part("year")}-${part("month")}-${part("day")}`:null;
  const keys=validAsOf?Array.from({length:months},(_,index)=>new Date(Date.UTC(Number(part("year")),Number(part("month"))-months+index,1)).toISOString().slice(0,7)):[];
  const currency=saved.result?.priceSuggestion?.status!=="UNAVAILABLE"?saved.result?.priceSuggestion?.currency:rule?.currency||(saved.dataKind==="MOCK"?"USD":null);
  const selectedIds=new Set(saved.result?.comparables?.map(item=>item.id)||[]);
  const idCounts=new Map<string,number>();for(const record of saved.recordSnapshots)idCounts.set(record.id,(idCounts.get(record.id)||0)+1);
  const records=saved.recordSnapshots.filter(record=>{
    if(!input||!rule||!asOfDate||!currency||!selectedIds.has(record.id)||idCounts.get(record.id)!==1||!keys.includes(record.recordedAt?.slice(0,7))||record.currency!==currency)return false;
    if(!/^\d{4}-\d{2}-\d{2}$/.test(record.recordedAt)||!Number.isFinite(Date.parse(record.recordedAt))||new Date(record.recordedAt).toISOString().slice(0,10)!==record.recordedAt||record.recordedAt>asOfDate||!Number.isFinite(record.totalPrice)||record.totalPrice<=0||!record.observations)return false;
    const other=record.observations;
    if(other.variety!==input.variety||other.origin!==input.origin||other.shape!==input.shape||other.color?.hue!==input.color.hue||other.treatment!==input.treatment||!Number.isFinite(other.caratWeight)||other.caratWeight<=0)return false;
    if(saved.dataKind==="REFERENCE")return record.dataKind==="REFERENCE"&&!referenceEligibility(record as ReferenceQuote,rule as ApprovedDefinition,asOf);
    return saved.dataKind==="MOCK"&&record.dataKind==="MOCK"&&record.priceBasis==="MOCK_B2B"&&record.isActive!==false&&!record.deletedAt
      &&!Object.keys(validateEvaluation(other,{[input.variety]:rule} as Record<Variety,RuleSet>)).length;
  }).map(record=>({id:record.id,date:record.recordedAt,source:record.source,description:record.description,weight:record.observations.caratWeight,totalPrice:record.totalPrice,pricePerCarat:round(record.totalPrice/record.observations.caratWeight),datasetVersion:record.datasetVersion,priceBasis:record.priceBasis})).sort((a,b)=>a.date.localeCompare(b.date)||a.id.localeCompare(b.id));
  const buckets=keys.map(month=>{const values=records.filter(record=>record.date.startsWith(month)).map(record=>record.totalPrice/record.weight);return {month,count:values.length,median:values.length?median(values):null,minimum:values.length?Math.min(...values):null,maximum:values.length?Math.max(...values):null};});
  const observed=buckets.filter(item=>item.median!==null);
  const change=observed.length>1?round((observed[observed.length-1].median!/observed[0].median!-1)*100):null;
  const values=records.map(record=>record.totalPrice/record.weight);
  const price=saved.result?.priceSuggestion;
  const savedRange=price&&price.status!=="UNAVAILABLE"&&input&&input.caratWeight>0?{minimum:round(price.minimumPrice/input.caratWeight),maximum:round(price.maximumPrice/input.caratWeight)}:null;
  return {evaluationId:saved.evaluationId,id:saved._id,variety:saved.variety,shape:input?.shape||null,hue:input?.color.hue||null,treatment:input?.treatment||null,weight:input?.caratWeight||null,
    dataKind:saved.dataKind,currency:currency||null,asOf:saved.createdAt,ruleVersion:saved.ruleVersion,months,buckets:buckets.map(bucket=>({...bucket,median:bucket.median===null?null:round(bucket.median),minimum:bucket.minimum===null?null:round(bucket.minimum),maximum:bucket.maximum===null?null:round(bucket.maximum)})),records,
    summary:{recordCount:records.length,observedMonths:observed.length,minimum:values.length?round(Math.min(...values)):null,maximum:values.length?round(Math.max(...values)):null,median:values.length?round(median(values)):null,change,firstObservedMonth:observed[0]?.month||null,lastObservedMonth:observed[observed.length-1]?.month||null,savedRange},
    notice:saved.dataKind==="MOCK"?"These are invented sample historical prices, not real market evidence.":"These are selected reviewed B2B quotations saved with this evaluation, not completed sales or a market-wide index.",
    methodology:"Monthly medians use raw total quotation price divided by carat weight, before quality adjustments. Empty months remain empty. Observed change compares the first and last months with evidence; it may reflect different gemstones, rather than market movement. Saved evaluations are never recalculated."};
}
export type ComparisonData=ReturnType<typeof buildComparison>;
export type PricingHistoryData=ReturnType<typeof buildPricingHistory>;
