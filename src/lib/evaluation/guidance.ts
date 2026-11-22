import type { EngineResult } from "./submission";
import type { EvaluationInput, RuleSet } from "./types";

export const GUIDANCE_VERSION = "guidance-v1";
export const STATEMENT_CATEGORIES = ["STUDENT", "TRADER", "GEMOLOGIST", "PROFESSIONAL"] as const;
export type StatementCategory = typeof STATEMENT_CATEGORIES[number];
export type RecommendationGroup = "STRENGTH" | "VERIFICATION" | "CONCERN" | "ASSESSMENT";
export interface StructuredRecommendation {
  id: string; group: RecommendationGroup; title: string; explanation: string;
  evidence: { field: string; value: string }[]; relatedRules: string[];
  actions: Record<StatementCategory, string>;
}
export interface PersonalisedStatement {
  category: StatementCategory; text: string; recommendationIds: string[];
}
export interface GuidanceSnapshot {
  version: string; status: "SYSTEM_GUIDANCE"; defaultCategory: StatementCategory;
  evaluationRuleVersion: string; recommendations: StructuredRecommendation[];
  statements: Record<StatementCategory, PersonalisedStatement>;
  disclaimer: string; methodology: string;
}
const words = (value: string) => value.toLowerCase().replaceAll("_", " ");
const disclaimer = "This is an estimated decision-support result, not a laboratory valuation, gemstone certification, authentication, legally binding valuation or guaranteed selling price.";
export function buildGuidance(input: EvaluationInput, result: EngineResult, rule: RuleSet, userCategory: string, catalogueName?: string): GuidanceSnapshot {
  if (rule.version !== result.ruleVersion || rule.variety !== input.variety || result.variety !== input.variety) throw new Error("Guidance must use the saved evaluation's rules and observations.");
  const defaultCategory = STATEMENT_CATEGORIES.includes(userCategory as StatementCategory) ? userCategory as StatementCategory : "PROFESSIONAL";
  const recommendations: StructuredRecommendation[] = [];
  function add(id:string,group:RecommendationGroup,title:string,explanation:string,evidence:StructuredRecommendation["evidence"],components:string[],actions:Record<StatementCategory,string>) {
    recommendations.push({id:`${GUIDANCE_VERSION}:${id}`,group,title,explanation,evidence,relatedRules:components.map((component)=>`${rule.version}:${component}`),actions});
  }
  if (["STRONG","VIVID"].includes(input.color.saturation) && input.color.distribution === "EVEN" && input.color.zoning === "NONE" && input.color.hue !== "COLORLESS")
    add("COLOR-STRENGTH","STRENGTH","Strong saturation and even colour","The recorded observations describe strong or vivid saturation, even distribution and no zoning. This does not establish a premium or a colour-similarity percentage.",[{field:"Saturation",value:words(input.color.saturation)},{field:"Distribution",value:"even"},{field:"Zoning",value:"none observed"}],["COLOR"],{
      STUDENT:"Compare these observations under consistent lighting and relate them to the colour score.",TRADER:"Describe the observed saturation and distribution accurately; confirm them before using them in a quotation.",GEMOLOGIST:"Confirm the observation conditions and record any zoning not visible face-up.",PROFESSIONAL:"Retain consistent observation conditions and supporting records when describing colour."});
  if (input.clarity.nakedEye === "CLEAN")
    add("CLARITY-STRENGTH","STRENGTH","Clean appearance to the naked eye","The user recorded a clean naked-eye appearance. This does not mean inclusion-free or establish durability.",[{field:"Naked-eye appearance",value:"clean"},{field:"10× observations",value:words(input.clarity.loupe10x)}],["CLARITY"],{
      STUDENT:"Compare naked-eye and 10× observations; a clean appearance does not imply no inclusions.",TRADER:"Keep naked-eye appearance separate from laboratory clarity or durability claims.",GEMOLOGIST:"Document the 10× findings and any features requiring further examination.",PROFESSIONAL:"Describe the observation method alongside the clarity result."});
  if (input.cut.symmetry === "EXCELLENT" && input.cut.polish === "EXCELLENT")
    add("FINISH-STRENGTH","STRENGTH","Excellent recorded symmetry and polish","Both finish observations were entered as excellent. Dimensions and other cut concerns remain separate factors.",[{field:"Symmetry",value:"excellent"},{field:"Polish",value:"excellent"}],["CUT"],{
      STUDENT:"See how the finish observations contribute to cut alongside depth and visible concerns.",TRADER:"Confirm finish observations before describing them in a commercial discussion.",GEMOLOGIST:"Review finish separately from proportions, windowing and extinction.",PROFESSIONAL:"Document finish and proportions separately in the evaluation record."});
  add("ORIGIN-VERIFY","VERIFICATION","Confirm origin evidence",input.originReliability === "LAB_VERIFIED" ? "Laboratory-verified origin was declared by the user. No laboratory report has been attached or authenticated by this system." : "Sri Lankan origin is declared; the system has not independently authenticated it.",[{field:"Origin",value:input.origin},{field:"Declared evidence",value:words(input.originReliability)}],[],{
    STUDENT:"Distinguish an origin declaration from an authenticated laboratory conclusion.",TRADER:"Check supporting origin documentation before relying on origin in a transaction.",GEMOLOGIST:"Review the original report and its scope before making an origin conclusion.",PROFESSIONAL:"Retain and verify the supporting provenance documentation."});
  add("TREATMENT-VERIFY","VERIFICATION",input.treatment === "UNKNOWN" ? "Treatment information is incomplete" : "Verify treatment information",input.treatment === "UNKNOWN" ? "Treatment is unknown, so the evaluation cannot support a price suggestion." : "Treatment is user-declared. Matching the same treatment group does not authenticate that declaration.",[{field:"Treatment",value:words(input.treatment)}],["MATCH"],{
    STUDENT:"Learn how treatment affects which gemstones can be compared; do not guess treatment.",TRADER:"Confirm treatment evidence before using the suggested range in negotiations.",GEMOLOGIST:"Review appropriate treatment evidence and refer for laboratory assessment where needed.",PROFESSIONAL:"Record treatment evidence and resolve uncertainty before relying on pricing."});
  if (input.color.distribution === "UNEVEN" || input.color.zoning !== "NONE")
    add("COLOR-CONCERN","CONCERN","Review colour distribution and zoning","The recorded distribution or zoning may affect the colour result. Verify the observations under consistent lighting.",[{field:"Distribution",value:words(input.color.distribution)},{field:"Zoning",value:words(input.color.zoning)}],["COLOR"],{
      STUDENT:"Compare face-up appearance and zoning under consistent light.",TRADER:"Disclose the observed unevenness and verify its visibility before quoting.",GEMOLOGIST:"Document zoning and observation conditions before finalising the grading record.",PROFESSIONAL:"Retain the observed distribution and zoning in the supporting description."});
  if (input.clarity.nakedEye !== "CLEAN" || input.clarity.severity !== "NONE" || input.clarity.loupe10x !== "MINOR")
    add("CLARITY-REVIEW","ASSESSMENT","Review inclusion observations","The recorded inclusion observations require interpretation by a trained observer. Inclusion type, location and durability have not been established by this engine.",[{field:"Naked-eye appearance",value:words(input.clarity.nakedEye)},{field:"10× observations",value:words(input.clarity.loupe10x)},{field:"Severity",value:words(input.clarity.severity)}],["CLARITY"],{
      STUDENT:"Review the observations with an instructor; record inclusion type and location separately.",TRADER:"Seek professional clarification before making clarity or durability assurances.",GEMOLOGIST:"Assess inclusion type, location and potential durability implications directly.",PROFESSIONAL:"Obtain qualified assessment where inclusion observations affect the intended use."});
  if (input.clarity.durabilityConcern === "POSSIBLE")
    add("DURABILITY-VERIFY","ASSESSMENT","A possible durability concern was reported","This is the observer's concern, not a diagnosis. Seek qualified assessment before relying on the stone's suitability or making a cutting decision.",[{field:"Reported concern",value:"possible"},{field:"Recorded inclusion type",value:input.clarity.inclusionType||"not recorded"},{field:"Recorded inclusion location",value:input.clarity.inclusionLocation||"not recorded"}],["CLARITY"],{
      STUDENT:"Discuss the observation with an instructor; do not infer durability from the overall score.",TRADER:"Obtain qualified assessment before making durability assurances.",GEMOLOGIST:"Examine the recorded inclusion location and nature directly; escalate when laboratory work is appropriate.",PROFESSIONAL:"Resolve the concern with a qualified specialist before deciding suitability for the intended use."});
  const denominator = input.shape === "ROUND" ? (input.cut.length+input.cut.width)/2 : input.cut.width;
  const rawDepth = input.cut.depth/denominator*100;
  const [minimum,maximum] = rule.depthRanges[input.shape];
  const depthOutside = rule.scoring.depthPenalty > 0 && (rawDepth < minimum-1e-9 || rawDepth > maximum+1e-9);
  const cutConcerns = ["windowing","extinction","bulging"] as const;
  if (depthOutside || cutConcerns.some((key)=>input.cut[key] !== "NONE"))
    add("CUT-ASSESSMENT","ASSESSMENT","Recheck proportions and visible cut concerns","Depth or visible cut concerns were recorded. Re-measure first and seek a cutter's opinion if appropriate. The system does not estimate recutting yield, financial benefit or recommend removing material.",[{field:"Depth",value:`${result.measurements.depthPercentage}%`},{field:"Depth scoring",value:rule.scoring.depthPenalty > 0 ? `Configured range ${minimum}–${maximum}%` : "Disabled; dimensions remain recorded"},...cutConcerns.map((key)=>({field:key,value:words(input.cut[key])}))],["CUT","DIMENSIONS"],{
      STUDENT:"Recalculate depth from the measurements and discuss visible cut concerns with an instructor.",TRADER:"Seek a cutter's assessment before assuming that recutting would increase value.",GEMOLOGIST:"Confirm proportions and visible effects, then refer for cutting assessment if warranted.",PROFESSIONAL:"Weigh any cutting proposal against specialist assessment; no yield or price gain is predicted."});
  if (result.priceSuggestion.status === "UNAVAILABLE")
    add("PRICE-UNAVAILABLE","VERIFICATION","Price evidence is insufficient",result.priceSuggestion.reason,[{field:"Matching comparables",value:String(result.comparables.length)},{field:"Required minimum",value:String(rule.matching.minimumComparables)}],["MATCH","PRICE"],{
      STUDENT:"Review why scoring can be available while pricing is withheld.",TRADER:"Do not infer a selling price from the score; obtain sufficient eligible evidence.",GEMOLOGIST:"Resolve missing treatment information or reference sufficiency before interpreting a market range.",PROFESSIONAL:"Report the unavailable price explicitly rather than substituting a fixed estimate."});
  const price = result.priceSuggestion;
  const formattedPrice = price.status === "UNAVAILABLE" ? `A price suggestion is unavailable: ${price.reason}` : `The ${result.dataKind === "MOCK" ? "sample" : "suggested B2B"} range is ${new Intl.NumberFormat("en-US",{style:"currency",currency:price.currency}).format(price.minimumPrice)}–${new Intl.NumberFormat("en-US",{style:"currency",currency:price.currency}).format(price.maximumPrice)}.`;
  const name = catalogueName?.trim() || words(input.variety);
  const base = `This ${input.caratWeight} ct ${name} (${words(input.shape)}, ${input.treatment === "UNKNOWN" ? "treatment unknown" : words(input.treatment)}) received ${result.scores.overall}/10 overall: colour ${result.scores.color}, clarity ${result.scores.clarity}, cut ${result.scores.cut}${rule.weights.carat > 0 ? ` and size ${result.scores.carat}. The size score is separate from quality.` : ". Size grading is disabled; weight is used for matching and pricing."} ${formattedPrice} ${result.comparables.length} ${result.dataKind === "MOCK" ? "sample" : "reviewed B2B"} comparable records were selected. Origin (${input.origin}) and treatment remain user declarations, including any declared laboratory verification.`;
  const strengths = recommendations.filter((item)=>item.group === "STRENGTH");
  const followUps = recommendations.filter((item)=>item.group !== "STRENGTH");
  const recommendationSummary = `${strengths.length ? `Recorded strengths: ${strengths.map((item)=>item.title.toLowerCase()).join("; ")}. ` : ""}Follow-up checks: ${followUps.map((item)=>item.title.toLowerCase()).join("; ")}.`;
  const contexts: Record<StatementCategory,string> = {
    STUDENT:"Use the score breakdown to connect your observations to each calculation. Check measurement methods and compare the recorded evidence before drawing conclusions.",
    TRADER:"Use any available range as a quotation reference only. Confirm treatment, provenance and current commercial conditions before negotiating; the range is not a guaranteed transaction price.",
    GEMOLOGIST:"Interpret the grading trace alongside direct observations and original reports. The engine does not determine inclusion type, inclusion location, durability, origin or treatment authenticity.",
    PROFESSIONAL:"Retain the evaluation inputs, applied version and comparable evidence with your decision record. Obtain specialist verification where the intended use requires it."
  };
  const caveat = result.dataKind === "MOCK" ? "Sample rules and prices are development fixtures, not validated market evidence. " : "Scoring uses the recorded approved rule; this guidance is explanatory system wording, not a separate CAGS-approved recommendation policy. ";
  const statements = Object.fromEntries(STATEMENT_CATEGORIES.map((category)=>[category,{category,text:`${base} ${recommendationSummary} ${contexts[category]} ${caveat}${disclaimer}`,recommendationIds:recommendations.map((item)=>item.id)}])) as Record<StatementCategory,PersonalisedStatement>;
  return {version:GUIDANCE_VERSION,status:"SYSTEM_GUIDANCE",defaultCategory,evaluationRuleVersion:rule.version,recommendations,statements,disclaimer,methodology:"Generated deterministically from saved observations, 4C scores, price availability and comparable evidence. Guidance conditions are explanatory software rules; they do not add grading thresholds, price modifiers, colour similarity or laboratory verification."};
}
