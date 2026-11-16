import { NextResponse } from "next/server";
import Evaluation from "@/models/Evaluation";
import { evaluationRoute } from "@/lib/evaluation/user-route";
import { ownedEvaluationFilter } from "@/lib/evaluation/submission";
import { parseComparisonIds, buildComparison } from "@/lib/evaluation/comparison-history";
export async function GET(request:Request){return evaluationRoute(request,async(user)=>{
  const ids=parseComparisonIds(new URL(request.url).searchParams.get("ids"));
  const documents=await Evaluation.find({...ownedEvaluationFilter(user.id),_id:{$in:ids}}).lean();
  if(documents.length!==ids.length)return NextResponse.json({message:"One or more selected evaluations were not found."},{status:404});
  return NextResponse.json(buildComparison(ids.map(id=>documents.find(document=>String(document._id)===id)!)));
});}
