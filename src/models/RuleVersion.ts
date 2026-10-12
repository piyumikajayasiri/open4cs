import mongoose, { Schema, models } from "mongoose";

const RuleVersionSchema = new Schema(
  {
    version: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    // ACTIVE is reserved for the future version-activation workflow.
    // The current evaluation engine still uses static rules from rules.ts.
    status: {
      type: String,
      enum: ["DRAFT", "ACTIVE", "ARCHIVED"],
      default: "DRAFT",
      required: true,
    },

    fourCWeights: {
      color: {
        type: Number,
        required: true,
      },
      clarity: {
        type: Number,
        required: true,
      },
      cut: {
        type: Number,
        required: true,
      },
      carat: {
        type: Number,
        required: true,
      },
    },

    priceRangePercentage: {
      type: Number,
      required: true,
    },

    notes: {
      type: String,
      default: "",
      trim: true,
    },

    approvedBy: {
      type: String,
      default: "",
      trim: true,
    },

    approvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const RuleVersion =
  models.RuleVersion ||
  mongoose.model("RuleVersion", RuleVersionSchema);

export default RuleVersion;
