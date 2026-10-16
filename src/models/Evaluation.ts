import mongoose, { Schema } from "mongoose";

const EvaluationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    gemstoneId: {
      type: Schema.Types.ObjectId,
      ref: "Gemstone",
      required: true,
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

const Evaluation =
  mongoose.models.Evaluation ||
  mongoose.model("Evaluation", EvaluationSchema);

export default Evaluation;
