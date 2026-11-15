import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { adminRoute, AdminError, bodyObject } from "@/lib/admin/server";
import ApprovedEvaluationRule from "@/models/ApprovedEvaluationRule";
import AdminAudit from "@/models/AdminAudit";
import { requireRuleTransition, validateApprovedDefinition } from "@/lib/evaluation/approved-policy";
export async function PATCH(request: Request, context:{params:Promise<{id:string}>}) {
  return adminRoute(request,async(actor)=>{
    const {id}=await context.params;
    if (!/^[0-9a-f]{24}$/i.test(id)) throw new AdminError("Invalid rule ID.");
    const body=await bodyObject(request),action=String(body.action);
    if (!Number.isInteger(body.revision)) throw new AdminError("Reload the current version.",409);
    await Promise.all([ApprovedEvaluationRule.init(),AdminAudit.init()]);
    const session=await mongoose.startSession();
    try {
      await session.withTransaction(async()=>{
        const rule=await ApprovedEvaluationRule.findById(id).session(session);
        if (!rule) throw new AdminError("Rule not found.",404);
        if (rule.revision!==body.revision) throw new AdminError("The rule has changed. Reload before continuing.",409);
        try { requireRuleTransition(rule,action,actor.id,body.domainReviewConfirmed,body.reviewNotes); }
        catch(error) {throw new AdminError(error instanceof Error?error.message:"Transition unavailable.",409);}
        const before=rule.toObject();
        if (action==="UPDATE") {
          if (typeof body.summary!=="string" || body.summary.trim().length<10 || body.summary.length>1000 || typeof body.evidence!=="string" || body.evidence.trim().length<20 || body.evidence.length>4000) throw new AdminError("Provide a complete summary and evidence.");
          try {rule.definition=validateApprovedDefinition(body.definition,rule.variety,rule.version);} catch(error) {throw new AdminError(error instanceof Error?error.message:"Invalid definition.");}
          if (rule.definition.approval!=="PENDING") throw new AdminError("Drafts cannot declare approval.");
          rule.summary=body.summary.trim();rule.evidence=body.evidence.trim();rule.lastEditedBy=actor.id;rule.lastEditedByName=actor.name;
        } else if (action==="SUBMIT") {
          try {validateApprovedDefinition(rule.definition,rule.variety,rule.version);} catch(error) {throw new AdminError(error instanceof Error?error.message:"Invalid definition.");}
          rule.status="PENDING";
        } else if (action==="RETURN") {rule.status="DRAFT";}
        else if (action==="RETIRE") {rule.status="ARCHIVED";}
        else if (action==="APPROVE") {
          try {validateApprovedDefinition(rule.definition,rule.variety,rule.version);} catch(error) {throw new AdminError(error instanceof Error?error.message:"Invalid definition.");}
          const previous=await ApprovedEvaluationRule.findOne({variety:rule.variety,status:"ACTIVE"}).session(session);
          if (previous) {
            const old=previous.toObject();previous.status="ARCHIVED";previous.revision+=1;await previous.save({session});
            await AdminAudit.create([{actorId:actor.id,actorName:actor.name,action:"APPROVED_RULE_ARCHIVE",entity:"APPROVED_RULE",entityId:previous.version,summary:`Superseded ${previous.version} with ${rule.version}`,before:old,after:previous.toObject()}],{session});
          }
          rule.status="ACTIVE";rule.domainReviewConfirmed=true;rule.definition={...rule.definition,approval:"APPROVED"};rule.approvedBy=actor.id;rule.approvedByName=actor.name;rule.approvedAt=new Date();rule.reviewNotes=String(body.reviewNotes).trim();
        }
        rule.revision+=1;await rule.save({session});
        await AdminAudit.create([{actorId:actor.id,actorName:actor.name,action:`APPROVED_RULE_${action}`,entity:"APPROVED_RULE",entityId:rule.version,summary:`${action.toLowerCase()} ${rule.version}`,before,after:rule.toObject()}],{session});
      },{readConcern:{level:"snapshot"},writeConcern:{w:"majority"}});
      return NextResponse.json({success:true});
    } finally {await session.endSession();}
  });
}
