import mongoose, { Schema } from "mongoose";
const schema = new Schema({
  version: { type: String, required: true, unique: true },
  variety: { type: String, enum: ["RUBY", "SAPPHIRE"], required: true },
  status: { type: String, enum: ["DRAFT", "PENDING", "ACTIVE", "ARCHIVED"], default: "DRAFT", required: true },
  definition: { type: Schema.Types.Mixed, required: true },
  summary: { type: String, required: true, maxlength: 1000 },
  evidence: { type: String, required: true, maxlength: 4000 },
  createdBy: { type: String, required: true }, createdByName: String,
  lastEditedBy: { type: String, required: true }, lastEditedByName: String,
  revision: { type: Number, default: 0 },
  domainReviewConfirmed: { type: Boolean, default: false },
  approvedBy: String, approvedByName: String, approvedAt: Date, reviewNotes: String,
}, { timestamps: true, collection: "approved_evaluation_rules" });
schema.index({ variety: 1 }, { unique: true, partialFilterExpression: { status: "ACTIVE" }, name: "one_active_approved_rule_per_variety" });
export default mongoose.models.ApprovedEvaluationRule || mongoose.model("ApprovedEvaluationRule", schema);
