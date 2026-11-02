import mongoose, { Schema, models } from "mongoose";

const RecommendationRuleSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      enum: [
        "COLOR",
        "CLARITY",
        "CUT",
        "MEASUREMENT",
        "VERIFICATION",
      ],
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },

    engineSupported: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const RecommendationRule =
  models.RecommendationRule ||
  mongoose.model("RecommendationRule", RecommendationRuleSchema);

export default RecommendationRule;
