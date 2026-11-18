import { NextResponse } from "next/server";
import mongoose from "mongoose";
import ApprovedEvaluationRule from "@/models/ApprovedEvaluationRule";
import AdminAudit from "@/models/AdminAudit";
import { adminRoute,AdminError,bodyObject } from "@/lib/admin/server";
import { recordedCandidate,reviewPackSummary,REVIEW_PACK_ID,REVIEW_PACK_FINGERPRINT } from "@/lib/evaluation/review-pack";
export async function GET(request:Request){return adminRoute(request,async()=>{
 const imports=await ApprovedEvaluationRule.find({sourcePackId:REVIEW_PACK_ID}).select("version status sourceCandidateId sourcePackFingerprint").lean();
 return NextResponse.json({...reviewPackSummary(),imports:imports.map(rule=>({id:String(rule._id),candidateId:rule.sourceCandidateId,version:rule.version,status:rule.status}))},{headers:{"Cache-Control":"private, no-store"}});
});}
export async function POST(request:Request){return adminRoute(request,async(actor)=>{
 const body=await bodyObject(request);if(body.fingerprint!==REVIEW_PACK_FINGERPRINT)throw new AdminError("The source pack changed. Reload before creating versions.",409);
 await Promise.all([ApprovedEvaluationRule.init(),AdminAudit.init()]);const session=await mongoose.startSession();
 try{
  const versions=await session.withTransaction(async()=>{
   const result=[];
   for(const candidate of reviewPackSummary().candidates){
    const existing=await ApprovedEvaluationRule.findOne({sourcePackId:REVIEW_PACK_ID,sourceCandidateId:candidate.id}).session(session);
    if(existing){if(existing.sourcePackFingerprint!==REVIEW_PACK_FINGERPRINT)throw new AdminError("This candidate was already imported from different source content. Review it instead of overwriting.",409);result.push({version:existing.version,reused:true});continue;}
    const history=await ApprovedEvaluationRule.find({variety:candidate.variety}).select("version").session(session).lean();
    const next=1+Math.max(0,...history.map(item=>Number(item.version.match(/v(\d+)$/)?.[1]||0)));
    const version=`cags-${candidate.variety.toLowerCase()}-v${next}`,source=recordedCandidate(candidate.id,version);
    const [created]=await ApprovedEvaluationRule.create([{...source,version,variety:candidate.variety,status:"PENDING",createdBy:actor.id,createdByName:actor.name,lastEditedBy:actor.id,lastEditedByName:actor.name}],{session});
    await AdminAudit.create([{actorId:actor.id,actorName:actor.name,action:"RECORDED_RULE_IMPORT",entity:"APPROVED_RULE",entityId:version,summary:`Created ${version} from user-reported CAGS approval; awaiting independent system review`,after:created.toObject()}],{session});result.push({version,reused:false});
   }
   return result;
  },{readConcern:{level:"snapshot"},writeConcern:{w:"majority"}});
  return NextResponse.json({success:true,versions,activated:false});
 }finally{await session.endSession();}
});}
