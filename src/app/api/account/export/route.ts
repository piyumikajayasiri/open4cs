import User from "@/models/User";
import Evaluation from "@/models/Evaluation";
import EvaluationReport from "@/models/EvaluationReport";
import { evaluationRoute } from "@/lib/evaluation/user-route";
import { settingsView } from "@/lib/account-settings";
export const runtime="nodejs";
export async function GET(request:Request){return evaluationRoute(request,async(actor)=>{
 const user=await User.findOne({_id:actor.id,status:"ACTIVE",deletedAt:null}).lean();if(!user)return new Response("Account unavailable",{status:403});
 const encoder=new TextEncoder();
 const stream=new ReadableStream({async start(controller){try{
  controller.enqueue(encoder.encode(JSON.stringify({kind:"account",data:settingsView(user)})+"\n"));
  const evaluations=Evaluation.find({userId:actor.id}).sort({_id:1}).lean().cursor();
  for await(const document of evaluations)controller.enqueue(encoder.encode(JSON.stringify({kind:"evaluation",data:document})+"\n"));
  const reports=EvaluationReport.find({userId:actor.id}).select("-pdf").sort({_id:1}).lean().cursor();
  for await(const document of reports)controller.enqueue(encoder.encode(JSON.stringify({kind:"report",data:document})+"\n"));
  controller.close();
 }catch{controller.error(new Error("Export could not be completed."));}}});
 return new Response(stream,{headers:{"Content-Type":"application/x-ndjson; charset=utf-8","Content-Disposition":"attachment; filename=open4cs-account-export.jsonl","Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"}});
});}
