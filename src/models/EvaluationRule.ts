import mongoose, { Schema } from "mongoose";

export interface IEvaluationRule {
  ruleId: string;
  category: "Color" | "Clarity" | "Cut" | "Pricing";
  description: string;
  effect: string;
  effectType: "positive" | "negative";
  version: string;
  status: "Active" | "Pending" | "Archived";
  triggerCondition: string;
  rationale: string;
  author: string;
  lastUpdated: string;
  sourceUrl?: string;
  isEngineBacked?: boolean;
}

const EvaluationRuleSchema = new Schema(
  {
    ruleId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["Color", "Clarity", "Cut", "Pricing"],
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    effect: {
      type: String,
      required: true,
      trim: true,
    },
    effectType: {
      type: String,
      enum: ["positive", "negative"],
      default: "positive",
    },
    version: {
      type: String,
      required: true,
      default: "v4.2",
      index: true,
    },
    status: {
      type: String,
      enum: ["Active", "Pending", "Archived"],
      default: "Active",
      index: true,
    },
    triggerCondition: {
      type: String,
      required: true,
    },
    rationale: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      default: "CAGS Pricing Board",
    },
    lastUpdated: {
      type: String,
      default: () => new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    },
    sourceUrl: {
      type: String,
      default: "https://www.gia.edu/sapphire-quality-factor",
    },
    isEngineBacked: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const EvaluationRule =
  mongoose.models.EvaluationRule ||
  mongoose.model<IEvaluationRule>("EvaluationRule", EvaluationRuleSchema);

export default EvaluationRule;
