import { createHash, randomUUID } from "node:crypto";
import Evaluation from "@/models/Evaluation";
import EvaluationReport from "@/models/EvaluationReport";
import { ownedEvaluationFilter, SubmissionError } from "@/lib/evaluation/submission";
import { parseReportRequest, buildReportSnapshot, REPORT_RENDERER_VERSION, type ReportSnapshot } from "./snapshot";
import { renderReportPdf } from "./pdf";
export const reportHeaders={"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"};
export function reportSummary(document:Record<string,unknown>){return {
  id:String(document._id),reportId:String(document.reportId),evaluationId:String(document.evaluationId),evaluationPublicId:String(document.evaluationPublicId),
  name:String(document.gemstoneName),reportType:String(document.reportType),audience:String(document.audience),dataKind:String(document.dataKind),ruleVersion:String(document.ruleVersion),
  createdAt:document.createdAt instanceof Date?document.createdAt.toISOString():String(document.createdAt||""),evaluationDate:String(document.evaluationDate||""),
  pageCount:Number(document.pageCount),byteLength:Number(document.byteLength),sha256:String(document.sha256),rendererVersion:String(document.rendererVersion),
  parentReportId:document.parentReportId?String(document.parentReportId):null,rootReportId:String(document.rootReportId)
};}
export type ReportSummary=ReturnType<typeof reportSummary>;
export function reportOwner(userId:string,id?:string){return ownedEvaluationFilter(userId,id);}
export class ReportNotFound extends Error{}
export async function createReport(userId:string,body:unknown){
  const request=parseReportRequest(body);
  const {generationKey,...options}=request;
  const requestHash=createHash("sha256").update(JSON.stringify(options)).digest("hex");
  const previous=await EvaluationReport.findOne({...reportOwner(userId),generationKey}).lean();
  if(previous){if(previous.requestHash!==requestHash)throw new SubmissionError("This generation request was already used for different options. Start a new report request.");return {report:reportSummary(previous),replayed:true};}
  const reportId=`RG-${randomUUID()}`,generatedAt=new Date().toISOString();
  let snapshot:ReportSnapshot,evaluationId:string,parentReportId:string|null=null,rootReportId=reportId;
  if("parentReportId" in options&&options.parentReportId){
    const parent=await EvaluationReport.findOne(reportOwner(userId,options.parentReportId)).lean();
    if(!parent)throw new ReportNotFound("Report was not found.");
    snapshot=structuredClone({...parent.snapshot,reportId,generatedAt,version:REPORT_RENDERER_VERSION}) as ReportSnapshot;
    evaluationId=String(parent.evaluationId);parentReportId=String(parent._id);rootReportId=parent.rootReportId;
  }else if("evaluationId" in options&&options.evaluationId&&options.reportType&&options.audience){
    const evaluation=await Evaluation.findOne(ownedEvaluationFilter(userId,options.evaluationId)).lean();
    if(!evaluation)throw new ReportNotFound("Evaluation was not found.");
    evaluationId=String(evaluation._id);snapshot=buildReportSnapshot(evaluation,{reportId,generatedAt,reportType:options.reportType,audience:options.audience});
  }else throw new SubmissionError("Choose an evaluation or existing report.");
  const {pdf,pageCount}=await renderReportPdf(snapshot);
  await EvaluationReport.init();
  try{
    const report=await EvaluationReport.create({reportId,userId:reportOwner(userId).userId,evaluationId,evaluationPublicId:snapshot.evaluationId,generationKey,requestHash,rootReportId,parentReportId,
      reportType:snapshot.reportType,audience:snapshot.audience,gemstoneName:snapshot.name,dataKind:snapshot.dataKind,ruleVersion:snapshot.ruleVersion,evaluationDate:snapshot.evaluationDate,
      snapshot,pdf,pageCount,byteLength:pdf.length,sha256:createHash("sha256").update(pdf).digest("hex"),rendererVersion:REPORT_RENDERER_VERSION});
    return {report:reportSummary(report.toObject()),replayed:false};
  }catch(error){
    if(error&&typeof error==="object"&&"code" in error&&error.code===11000){const existing=await EvaluationReport.findOne({...reportOwner(userId),generationKey}).lean();if(existing&&existing.requestHash===requestHash)return {report:reportSummary(existing),replayed:true};}
    throw error;
  }
}
