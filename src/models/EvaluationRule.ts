import mongoose, { Document, Model, Schema, Types } from "mongoose";

export type EvaluationRuleType = "GRADING" | "PRICING";

export type EvaluationRuleStatus = "DRAFT" | "ACTIVE" | "INACTIVE";

export interface GradingRuleConfiguration {
  attribute: string;
  method: "CATEGORICAL" | "NUMERIC" | "BOOLEAN";
  criteria: Array<{
    code: string;
    label: string;
    description?: string;
    minValue?: number;
    maxValue?: number;
  }>;
}

export interface PricingRuleConfiguration {
  method: "REFERENCE_BASED" | "FIXED_FORMULA" | "RANGE_ESTIMATE";
  currency?: string;
  parameters: Record<string, unknown>;
}

export type EvaluationRuleConfiguration =
  | GradingRuleConfiguration
  | PricingRuleConfiguration;

export interface IEvaluationRule extends Document {
  name: string;
  code: string;
  type: EvaluationRuleType;
  description?: string;
  configuration: EvaluationRuleConfiguration;
  status: EvaluationRuleStatus;
  version: number;
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const EvaluationRuleSchema = new Schema<IEvaluationRule>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 150,
    },

    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      minlength: 2,
      maxlength: 100,
    },

    type: {
      type: String,
      enum: ["GRADING", "PRICING"],
      required: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    configuration: {
      type: Schema.Types.Mixed,
      required: true,
      default: () => ({}),
    },

    status: {
      type: String,
      enum: ["DRAFT", "ACTIVE", "INACTIVE"],
      default: "DRAFT",
      required: true,
    },

    version: {
      type: Number,
      default: 1,
      min: 1,
      required: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    collection: "evaluationrules",
  },
);

EvaluationRuleSchema.index({ code: 1 }, { unique: true });

EvaluationRuleSchema.index({ type: 1, status: 1 });
EvaluationRuleSchema.index({ updatedAt: -1 });

const EvaluationRule: Model<IEvaluationRule> =
  mongoose.models.EvaluationRule ||
  mongoose.model<IEvaluationRule>("EvaluationRule", EvaluationRuleSchema);

export default EvaluationRule;
