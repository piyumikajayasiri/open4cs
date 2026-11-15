import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { adminRoute, AdminError, bodyObject } from "@/lib/admin/server";
import Gemstone from "@/models/Gemstone";
import AdminAudit from "@/models/AdminAudit";
import { MOCK_RULES } from "@/lib/evaluation/mock-rules";
import { SHAPES } from "@/lib/evaluation/approved-policy";
import type { Variety } from "@/lib/evaluation/types";
export async function PATCH(request:Request,context:{params:Promise<{id:string}>}) {
  return adminRoute(request,async(actor)=>{
    const {id}=await context.params,body=await bodyObject(request);
    if (!/^[0-9a-f]{24}$/i.test(id) || !["RUBY","SAPPHIRE"].includes(String(body.evaluationVariety)) || typeof body.updatedAt!=="string") throw new AdminError("Choose a valid catalogue entry and evaluation variety.");
    const variety=body.evaluationVariety as Variety;
    const shapes=body.supportedShapes,hues=body.supportedHues;
    if (!Array.isArray(shapes)||!shapes.length||shapes.length>5||shapes.some((shape)=>!SHAPES.includes(shape))||new Set(shapes).size!==shapes.length
      || !Array.isArray(hues)||!hues.length||hues.length>8||hues.some((hue)=>!MOCK_RULES[variety].hues.includes(hue))||new Set(hues).size!==hues.length) throw new AdminError("Choose supported shapes and hues without duplicates.");
    await AdminAudit.init();const session=await mongoose.startSession();
    try {
      await session.withTransaction(async()=>{
        const entry=await Gemstone.findById(id).session(session);
        if (!entry) throw new AdminError("Catalogue entry not found.",404);
        if (entry.updatedAt.toISOString()!==body.updatedAt) throw new AdminError("The catalogue entry changed. Reload before saving.",409);
        if (/star|padparadscha/i.test(`${entry.code} ${entry.name}`)) throw new AdminError("Specialty grading is not supported by this engine.");
        const before=entry.toObject();entry.evaluationVariety=variety;entry.supportedShapes=shapes;entry.supportedHues=hues;await entry.save({session});
        await AdminAudit.create([{actorId:actor.id,actorName:actor.name,action:"CATALOGUE_ENGINE_CONFIGURE",entity:"CATALOGUE",entityId:id,summary:`Configured evaluation eligibility for ${entry.name}`,before,after:entry.toObject()}],{session});
      });return NextResponse.json({success:true});
    } finally {await session.endSession();}
  });
}
