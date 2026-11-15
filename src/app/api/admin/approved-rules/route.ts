import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { adminRoute, AdminError, bodyObject } from "@/lib/admin/server";
import ApprovedEvaluationRule from "@/models/ApprovedEvaluationRule";
import AdminAudit from "@/models/AdminAudit";
import Gemstone from "@/models/Gemstone";
import { validateApprovedDefinition } from "@/lib/evaluation/approved-policy";
import { MOCK_RULES } from "@/lib/evaluation/mock-rules";
import type { Variety } from "@/lib/evaluation/types";
export async function GET(request: Request) {
  return adminRoute(request, async(actor)=>{
    const [rules,catalogue] = await Promise.all([ApprovedEvaluationRule.find().sort({createdAt:-1}).lean(),Gemstone.find({name:{$type:"string"}}).sort({name:1}).lean()]);
    const templates = Object.fromEntries((["RUBY","SAPPHIRE"] as const).map((variety)=>[variety,{...MOCK_RULES[variety],version:`cags-${variety.toLowerCase()}-v1`,dataKind:"REFERENCE",approval:"PENDING",currency:"USD",maximumReferenceAgeDays:365}]));
    return NextResponse.json({rules,catalogue,actorId:actor.id,templates});
  });
}
export async function POST(request: Request) {
  return adminRoute(request, async(actor)=>{
    const body=await bodyObject(request);
    if (!["RUBY","SAPPHIRE"].includes(String(body.variety)) || typeof body.version!=="string") throw new AdminError("Choose a variety and version.");
    if (typeof body.summary!=="string" || body.summary.trim().length<10 || body.summary.length>1000 || typeof body.evidence!=="string" || body.evidence.trim().length<20 || body.evidence.length>4000) throw new AdminError("Provide a summary (10–1000 characters) and review evidence (20–4000 characters).");
    const summary = body.summary.trim(), evidence = body.evidence.trim();
    let definition;
    try { definition=validateApprovedDefinition(body.definition,body.variety as Variety,body.version); } catch(error) { throw new AdminError(error instanceof Error?error.message:"Invalid definition."); }
    if (definition.approval!=="PENDING") throw new AdminError("New definitions must await review.");
    await Promise.all([ApprovedEvaluationRule.init(),AdminAudit.init()]);
    const session=await mongoose.startSession();
    try {
      const rule=await session.withTransaction(async()=>{
        const [created]=await ApprovedEvaluationRule.create([{version:body.version,variety:body.variety,definition,status:"DRAFT",summary,evidence,createdBy:actor.id,createdByName:actor.name,lastEditedBy:actor.id,lastEditedByName:actor.name}],{session});
        await AdminAudit.create([{actorId:actor.id,actorName:actor.name,action:"APPROVED_RULE_CREATE",entity:"APPROVED_RULE",entityId:created.version,summary:`Created unapproved draft ${created.version}`,after:created.toObject()}],{session});
        return created.toObject();
      });
      return NextResponse.json({success:true,rule},{status:201});
    } finally {await session.endSession();}
  });
}
