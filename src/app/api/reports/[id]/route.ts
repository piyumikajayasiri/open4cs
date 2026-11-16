import { NextResponse } from "next/server";
import EvaluationReport from "@/models/EvaluationReport";
import { evaluationRoute } from "@/lib/evaluation/user-route";
import { reportOwner, reportSummary, reportHeaders } from "@/lib/reports/server";
export async function GET(request:Request,context:{params:Promise<{id:string}>}){return evaluationRoute(request,async(user)=>{
  const {id}=await context.params;if(!/^[0-9a-f]{24}$/i.test(id))return NextResponse.json({message:"Invalid report identifier."},{status:400});
  const report=await EvaluationReport.findOne(reportOwner(user.id,id)).select("-snapshot").lean();
  if(!report)return NextResponse.json({message:"Report was not found."},{status:404,headers:reportHeaders});
  const revisions=await EvaluationReport.find({...reportOwner(user.id),rootReportId:report.rootReportId}).select("-snapshot").sort({createdAt:-1,_id:-1}).limit(50).lean();
  return NextResponse.json({report:reportSummary(report),revisions:revisions.map(reportSummary)},{headers:reportHeaders});
});}
