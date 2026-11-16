import { NextResponse } from "next/server";
import Evaluation from "@/models/Evaluation";
import { evaluationRoute } from "@/lib/evaluation/user-route";
import { ownedEvaluationFilter } from "@/lib/evaluation/submission";
import { buildPricingHistory } from "@/lib/evaluation/comparison-history";
export async function GET(request:Request,context:{params:Promise<{id:string}>}){return evaluationRoute(request,async(user)=>{
  const {id}=await context.params;
  if(!/^[0-9a-f]{24}$/i.test(id))return NextResponse.json({message:"Invalid evaluation identifier."},{status:400});
  const months=Number(new URL(request.url).searchParams.get("months")||12);
  const document=await Evaluation.findOne(ownedEvaluationFilter(user.id,id)).lean();
  if(!document)return NextResponse.json({message:"Evaluation was not found."},{status:404});
  return NextResponse.json(buildPricingHistory(document,months));
});}
