import { NextResponse } from "next/server";
import User from "@/models/User";
import Evaluation from "@/models/Evaluation";
import EvaluationReport from "@/models/EvaluationReport";
import { evaluationRoute } from "@/lib/evaluation/user-route";
import { evaluationSummary,ownedEvaluationFilter } from "@/lib/evaluation/submission";
import { evaluationStats } from "@/lib/evaluation/persistence";
import { settingsView } from "@/lib/account-settings";
import { recentActivity } from "@/lib/dashboard";
export async function GET(request:Request){return evaluationRoute(request,async(actor)=>{
 const owner=ownedEvaluationFilter(actor.id);
 const [user,stats,reportCount,evaluations,reports]=await Promise.all([User.findOne({_id:actor.id,status:"ACTIVE",deletedAt:null}).lean(),evaluationStats(actor.id),EvaluationReport.countDocuments(owner),Evaluation.find(owner).sort({createdAt:-1,_id:-1}).limit(6).select("evaluationId inputSnapshot ruleVersion status createdAt dataKind result.scores result.variety priceSuggestion").lean(),EvaluationReport.find(owner).sort({createdAt:-1,_id:-1}).limit(5).select("reportId createdAt").lean()]);
 if(!user)return NextResponse.json({message:"Account is not active."},{status:403});
 const summaries=evaluations.map(evaluationSummary),reportItems=reports.map(report=>({id:String(report._id),reportId:String(report.reportId),createdAt:report.createdAt.toISOString()}));
 return NextResponse.json({account:settingsView(user),stats:{...stats,reports:reportCount},evaluations:summaries,activity:recentActivity(summaries,reportItems),asOf:new Date().toISOString()},{headers:{"Cache-Control":"private, no-store"}});
});}
