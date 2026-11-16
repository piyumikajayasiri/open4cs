import { NextResponse } from "next/server";
import EvaluationReport from "@/models/EvaluationReport";
import { evaluationRoute } from "@/lib/evaluation/user-route";
import { reportOwner, reportHeaders } from "@/lib/reports/server";
export const runtime="nodejs";
export async function GET(request:Request,context:{params:Promise<{id:string}>}){return evaluationRoute(request,async(user)=>{
  const {id}=await context.params;if(!/^[0-9a-f]{24}$/i.test(id))return NextResponse.json({message:"Invalid report identifier."},{status:400});
  const report=await EvaluationReport.findOne(reportOwner(user.id,id)).select("+pdf -snapshot");
  if(!report)return NextResponse.json({message:"Report was not found."},{status:404,headers:reportHeaders});
  const download=new URL(request.url).searchParams.get("download")==="1";
  return new Response(new Uint8Array(report.pdf),{headers:{...reportHeaders,"Content-Type":"application/pdf","Content-Length":String(report.byteLength),"Content-Disposition":`${download?"attachment":"inline"}; filename="${report.reportId}.pdf"`}});
});}
