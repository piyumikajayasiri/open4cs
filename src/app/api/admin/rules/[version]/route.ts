import { NextResponse } from "next/server";
import mongoose from "mongoose";
import MockEvaluationRule from "@/models/MockEvaluationRule";
import AdminAudit from "@/models/AdminAudit";
import { adminRoute, AdminError, bodyObject } from "@/lib/admin/server";
import { applyRuleChanges, requireRuleDeletion, requireRuleTransition } from "@/lib/admin/policy";
import { validateRuleCatalog } from "@/lib/evaluation/engine";
import { MOCK_RULES } from "@/lib/evaluation/mock-rules";

export async function PATCH(request: Request, context: { params: Promise<{ version: string }> }) {
  return adminRoute(request, async (actor) => {
    const { version } = await context.params;
    const body = await bodyObject(request);
    if (!Number.isInteger(body.revision) || typeof body.action !== "string") throw new AdminError("Refresh the version before changing it.");
    await Promise.all([MockEvaluationRule.init(), AdminAudit.init()]);
    const session = await mongoose.startSession();
    try {
      const updated = await session.withTransaction(async () => {
        const proposal = await MockEvaluationRule.findOne({ version, dataKind: "MOCK", deletedAt: null }).session(session);
        if (!proposal) throw new AdminError("Rule version was not found.", 404);
        if ((proposal.revision ?? 0) !== body.revision) throw new AdminError("This version has changed. Refresh before editing.", 409);
        let target;
        try { target = requireRuleTransition(proposal.status, String(body.action), [proposal.createdBy || "", proposal.lastEditedBy || ""], actor.id); }
        catch (error) { throw new AdminError(error instanceof Error ? error.message : "Invalid transition.", 409); }
        const before = proposal.toObject();
        if (body.action === "UPDATE") {
          const summary = typeof body.summary === "string" ? body.summary.trim() : "";
          if (summary.length < 10 || summary.length > 1000) throw new AdminError("Explain the proposal in 10–1000 characters.");
          try { proposal.definition = applyRuleChanges(proposal.definition, body.changes); }
          catch (error) { throw new AdminError(error instanceof Error ? error.message : "Invalid rule values."); }
          proposal.summary = summary;
          proposal.lastEditedBy = actor.id; proposal.lastEditedByName = actor.name;
        }
        try { validateRuleCatalog({ ...MOCK_RULES, [proposal.variety]: proposal.definition }); }
        catch { throw new AdminError("The proposed rules contain invalid values."); }
        if (body.action === "SUBMIT") proposal.submittedAt = new Date();
        if (body.action === "ACTIVATE") {
          const previous = await MockEvaluationRule.find({ variety: proposal.variety, dataKind: "MOCK", status: "ACTIVE" }).session(session).lean();
          await MockEvaluationRule.updateMany({ variety: proposal.variety, dataKind: "MOCK", status: "ACTIVE" }, { $set: { status: "ARCHIVED" }, $inc: { revision: 1 } }, { session });
          for (const archived of previous) await AdminAudit.create([{ actorId: actor.id, actorName: actor.name, action: "RULE_ARCHIVED", entity: "RULE", entityId: archived.version,
            summary: `${archived.version} superseded by ${version}.`, before: archived, after: { ...archived, status: "ARCHIVED", revision: (archived.revision ?? 0) + 1 } }], { session });
          proposal.approvedBy = actor.id; proposal.approvedByName = actor.name; proposal.activatedAt = new Date();
        }
        proposal.status = target;
        proposal.revision = (proposal.revision ?? 0) + 1;
        await proposal.save({ session });
        await AdminAudit.create([{ actorId: actor.id, actorName: actor.name, action: `RULE_${body.action}`, entity: "RULE", entityId: version,
          summary: `${version}: ${before.status} → ${target}. ${proposal.summary}`, before, after: proposal.toObject() }], { session });
        return proposal.toObject();
      });
      return NextResponse.json({ version: updated });
    } finally { await session.endSession(); }
  });
}

export async function DELETE(request: Request, context: { params: Promise<{ version: string }> }) {
  return adminRoute(request, async (actor) => {
    const { version } = await context.params;
    const body = await bodyObject(request);
    if (!Number.isInteger(body.revision)) throw new AdminError("Refresh the draft before deleting it.", 409);
    await AdminAudit.init();
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        const proposal = await MockEvaluationRule.findOne({ version, dataKind: "MOCK", deletedAt: null }).session(session);
        if (!proposal) throw new AdminError("Draft was not found or has already been deleted.", 404);
        if ((proposal.revision ?? 0) !== body.revision) throw new AdminError("This draft has changed. Refresh before deleting it.", 409);
        try { requireRuleDeletion(proposal.status); } catch (error) { throw new AdminError(error instanceof Error ? error.message : "This version cannot be deleted.", 409); }
        const before = proposal.toObject();
        proposal.deletedAt = new Date(); proposal.deletedBy = actor.id; proposal.revision = (proposal.revision ?? 0) + 1;
        await proposal.save({ session });
        await AdminAudit.create([{ actorId: actor.id, actorName: actor.name, action: "RULE_DELETED", entity: "RULE", entityId: version,
          summary: `Deleted draft ${version}.`, before, after: proposal.toObject() }], { session });
      });
      return NextResponse.json({ success: true });
    } finally { await session.endSession(); }
  });
}
