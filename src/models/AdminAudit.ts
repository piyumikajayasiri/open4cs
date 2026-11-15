import mongoose, { Schema } from "mongoose";

const schema = new Schema({
  actorId: { type: String, required: true }, actorName: { type: String, required: true },
  action: { type: String, required: true }, entity: { type: String, required: true }, entityId: { type: String, required: true },
  summary: { type: String, required: true }, before: Schema.Types.Mixed, after: Schema.Types.Mixed,
}, { timestamps: true, collection: "admin_audit" });
schema.index({ createdAt: -1 });
export default mongoose.models.AdminAudit || mongoose.model("AdminAudit", schema);
