import mongoose, { Schema } from "mongoose";

const schema = new Schema({
  version: { type: String, required: true, unique: true },
  variety: { type: String, enum: ["RUBY", "SAPPHIRE"], required: true },
  dataKind: { type: String, enum: ["MOCK"], required: true },
  // ACTIVE means selected for mock previews, never domain approval.
  status: { type: String, enum: ["ACTIVE", "DRAFT", "PENDING", "ARCHIVED"], required: true },
  definition: { type: Schema.Types.Mixed, required: true },
  summary: { type: String, default: "Seeded provisional mock rules", maxlength: 1000 },
  createdBy: String, createdByName: String, approvedBy: String, approvedByName: String,
  lastEditedBy: String, lastEditedByName: String,
  submittedAt: Date, activatedAt: Date,
  revision: { type: Number, default: 0 },
  deletedAt: { type: Date, default: null }, deletedBy: String,
}, { timestamps: true, collection: "mock_evaluation_rules" });
schema.index({ variety: 1 }, { unique: true, partialFilterExpression: { status: "ACTIVE", dataKind: "MOCK" }, name: "one_active_mock_rule_per_variety" });

export default mongoose.models.MockEvaluationRule || mongoose.model("MockEvaluationRule", schema);
