import { NextResponse } from "next/server";
import EvaluationReport from "@/models/EvaluationReport";
import { evaluationRoute } from "@/lib/evaluation/user-route";
import { SubmissionError } from "@/lib/evaluation/submission";
import { createReport, reportSummary, reportOwner, ReportNotFound, reportHeaders } from "@/lib/reports/server";
export const runtime="nodejs";
export async function GET(request:Request){return evaluationRoute(request,async(user)=>{
  const params=new URL(request.url).searchParams,page=Number(params.get("page")||1),pageSize=Number(params.get("pageSize")||10),evaluationId=params.get("evaluationId");
  if(!Number.isInteger(page)||page<1||page>10000||!Number.isInteger(pageSize)||pageSize<1||pageSize>50||evaluationId&&!/^[0-9a-f]{24}$/i.test(evaluationId))throw new SubmissionError("Choose valid report filters.");
  const filter={...reportOwner(user.id),...(evaluationId?{evaluationId}:{} )};
  const [documents,total]=await Promise.all([EvaluationReport.find(filter).select("-snapshot").sort({createdAt:-1,_id:-1}).skip((page-1)*pageSize).limit(pageSize).lean(),EvaluationReport.countDocuments(filter)]);
  return NextResponse.json({reports:documents.map(reportSummary),pagination:{page,pageSize,total,totalPages:Math.max(1,Math.ceil(total/pageSize))}},{headers:reportHeaders});
});}
export async function POST(request:Request){return evaluationRoute(request,async(user)=>{
  let body:unknown;try{body=await request.json();}catch{throw new SubmissionError("Invalid report request.");}
  try{const result=await createReport(user.id,body);return NextResponse.json(result,{status:result.replayed?200:201,headers:reportHeaders});}
  catch(error){if(error instanceof ReportNotFound)return NextResponse.json({message:error.message},{status:404,headers:reportHeaders});throw error;}
});}
