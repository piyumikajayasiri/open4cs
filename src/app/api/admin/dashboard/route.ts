import { NextResponse } from "next/server";
import User from "@/models/User";
import ApprovedEvaluationRule from "@/models/ApprovedEvaluationRule";
import ReferenceGemstone from "@/models/ReferenceGemstone";
import MockHistoricalGemstone from "@/models/MockHistoricalGemstone";
import MarketReference from "@/models/MarketReference";
import AdminAudit from "@/models/AdminAudit";
import { adminRoute } from "@/lib/admin/server";
import { approvedCatalogue } from "@/lib/evaluation/approved-data";
export async function GET(request:Request){return adminRoute(request,async(actor)=>{
 const referencePending={deletedAt:null,$or:[{verificationStatus:"PENDING"},{verificationStatus:"VERIFIED",qualityReviewed:{$ne:true}},{verificationStatus:"VERIFIED",permittedUseConfirmed:{$ne:true}}]};
 const [catalogue,verifiedReferences,pendingReferences,sampleRecords,marketRecords,activeRules,pendingRuleCount,users,pendingRules,references,audits]=await Promise.all([
  approvedCatalogue(),ReferenceGemstone.countDocuments({deletedAt:null,verificationStatus:"VERIFIED",qualityReviewed:true,permittedUseConfirmed:true}),ReferenceGemstone.countDocuments(referencePending),MockHistoricalGemstone.countDocuments({deletedAt:null,isActive:{$ne:false}}),MarketReference.countDocuments({}),ApprovedEvaluationRule.countDocuments({status:"ACTIVE"}),ApprovedEvaluationRule.countDocuments({status:"PENDING"}),User.countDocuments({deletedAt:null,status:"ACTIVE"}),ApprovedEvaluationRule.find({status:"PENDING"}).sort({updatedAt:-1}).limit(10).select("version variety summary createdBy lastEditedBy updatedAt").lean(),ReferenceGemstone.find(referencePending).sort({updatedAt:-1}).limit(5).select("referenceId variety source updatedAt").lean(),AdminAudit.find().sort({createdAt:-1,_id:-1}).limit(8).select("summary actorName createdAt entity").lean()
 ]);
 return NextResponse.json({stats:{readyEntries:catalogue.catalogue.filter(item=>item.evaluationReady).length,catalogueEntries:catalogue.catalogue.length,verifiedReferences,pendingReferences,sampleRecords,marketRecords,activeRules,pendingRules:pendingRuleCount,activeUsers:users},pendingRules:pendingRules.map(rule=>({id:String(rule._id),version:rule.version,variety:rule.variety,summary:rule.summary,canReview:rule.createdBy!==actor.id&&rule.lastEditedBy!==actor.id})),references:references.map(record=>({id:String(record._id),referenceId:record.referenceId||String(record._id),variety:record.variety})),activity:audits.map(event=>({id:String(event._id),summary:event.summary,actor:event.actorName,createdAt:event.createdAt.toISOString(),entity:event.entity})),asOf:new Date().toISOString()},{headers:{"Cache-Control":"private, no-store"}});
});}
