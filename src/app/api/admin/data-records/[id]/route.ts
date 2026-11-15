import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { adminRoute, AdminError, bodyObject } from "@/lib/admin/server";
import { recordUpdateFields, RecordValidationError, requireReferenceVerification, type Dataset } from "@/lib/admin/data";
import MockHistoricalGemstone from "@/models/MockHistoricalGemstone";
import ReferenceGemstone from "@/models/ReferenceGemstone";
import AdminAudit from "@/models/AdminAudit";

type Context = { params: Promise<{ id: string }> };
async function mutate(request: Request, context: Context, deleting: boolean) {
  return adminRoute(request, async (actor) => {
    const { id } = await context.params;
    if (!mongoose.Types.ObjectId.isValid(id)) throw new AdminError("Invalid record ID.");
    const body = await bodyObject(request);
    if (body.dataset !== "MOCK" && body.dataset !== "REFERENCE") throw new AdminError("Choose a dataset.");
    if (!Number.isInteger(body.revision)) throw new AdminError("Refresh this record before changing it.", 409);
    const dataset: Dataset = body.dataset;
    const action = deleting ? "DELETE" : String(body.action);
    const model = dataset === "MOCK" ? MockHistoricalGemstone : ReferenceGemstone;
    await AdminAudit.init();
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        const record = await model.findOne({ _id: id, deletedAt: null }).session(session);
        if (!record) throw new AdminError("Record was not found or has been deleted.", 404);
        if ((record.revision ?? 0) !== body.revision) throw new AdminError("This record has changed. Refresh before editing or deleting it.", 409);
        const before = record.toObject();
        if (deleting) {
          record.deletedAt = new Date(); record.deletedBy = actor.id;
          if (dataset === "MOCK") record.isActive = false;
        } else if (action === "UPDATE") {
          if (!body.record || typeof body.record !== "object" || Array.isArray(body.record)) throw new AdminError("Provide the edited record fields.");
          const input = body.record as Record<string, unknown>;
          if (dataset === "MOCK" && input.id !== record.id) throw new AdminError("The historical record identifier cannot be changed.");
          try { record.set(recordUpdateFields(input, dataset)); }
          catch (error) {
            if (error instanceof RecordValidationError) throw new AdminError(error.message, 400, error.errors);
            throw error;
          }
          if (dataset === "REFERENCE") { record.lastEditedBy = actor.id; record.lastEditedByName = actor.name; }
        } else if (dataset === "MOCK") {
          if (!["ACTIVATE", "DEACTIVATE"].includes(action)) throw new AdminError("Choose edit, activate, deactivate or delete.");
          record.isActive = action === "ACTIVATE";
        } else {
          const fullyVerified = record.verificationStatus === "VERIFIED" && record.qualityReviewed && record.permittedUseConfirmed;
          if (!["VERIFY", "REJECT"].includes(action) || fullyVerified) throw new AdminError("Only unverified references can be reviewed.", 409);
          if (action === "VERIFY") {
            try { requireReferenceVerification(record, actor.id, body.qualityReviewed, body.permittedUseConfirmed); }
            catch (error) { throw new AdminError(error instanceof Error ? error.message : "Verification requirements not met."); }
            record.qualityReviewed = true; record.permittedUseConfirmed = true;
            record.verifiedBy = actor.id; record.verifiedByName = actor.name; record.verifiedAt = new Date();
          }
          record.verificationStatus = action === "VERIFY" ? "VERIFIED" : "REJECTED";
        }
        record.revision = (record.revision ?? 0) + 1;
        await record.save({ session });
        const recordId = dataset === "MOCK" ? record.id : record.referenceId || id;
        await AdminAudit.create([{ actorId: actor.id, actorName: actor.name, action: `RECORD_${action}`, entity: dataset, entityId: String(recordId),
          summary: `${action.toLowerCase()} ${recordId}${dataset === "REFERENCE" && action === "UPDATE" ? "; returned to pending review" : ""}`, before, after: record.toObject() }], { session });
      });
      return NextResponse.json({ success: true });
    } finally { await session.endSession(); }
  });
}
export async function PATCH(request: Request, context: Context) { return mutate(request, context, false); }
export async function DELETE(request: Request, context: Context) { return mutate(request, context, true); }
