import mongoose, { Schema } from "mongoose";

const EvaluationSchema = new Schema(
  {
    schemaVersion: { type: Number, default: 1 },
    evaluationId: { type: String, required: true },
    submissionKey: { type: String, required: true },
    inputHash: { type: String, required: true },
    dataKind: { type: String, enum: ["MOCK"], default: "MOCK", required: true },
    inputSnapshot: { type: Schema.Types.Mixed, required: true },
    ruleSnapshot: { type: Schema.Types.Mixed, required: true },
    recordSnapshots: { type: [Schema.Types.Mixed], default: [] },
    userCategory: String,
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    gemstoneId: {
      type: Schema.Types.ObjectId,
      ref: "Gemstone",
      default: null,
    },

    ruleVersion: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      required: true,
    },

    result: {
      type: Schema.Types.Mixed,
      required: true,
    },

    referenceDataSufficiency: {
      type: Schema.Types.Mixed,
      default: null,
    },

    bestReferenceMatch: {
      type: Schema.Types.Mixed,
      default: null,
    },

    priceSuggestion: {
      type: Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

EvaluationSchema.index({ evaluationId: 1 }, { name: "evaluation_public_id", unique: true, sparse: true });
EvaluationSchema.index({ userId: 1, submissionKey: 1 }, { name: "evaluation_owner_submission", unique: true, partialFilterExpression: { submissionKey: { $type: "string" } } });
EvaluationSchema.index({ userId: 1, createdAt: -1, _id: -1 });

const Evaluation =
  mongoose.models.Evaluation ||
  mongoose.model("Evaluation", EvaluationSchema);

export default Evaluation;
