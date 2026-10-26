import mongoose, { Document, Model, Schema, Types } from "mongoose";

export type EvaluationStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "COMPLETED"
  | "REJECTED";

export interface EvaluationObservations {
  origin?: string;
  color?: string;
  clarity?: string;
  cut?: string;
  caratWeight?: number;
  treatment?: string;
  notes?: string;
}

export interface IEvaluation extends Document {
  evaluationId: string;

  submittedBy: Types.ObjectId;
  gemstoneId: Types.ObjectId;

  observations: EvaluationObservations;

  status: EvaluationStatus;

  gradingResult?: Record<string, unknown>;
  pricingResult?: Record<string, unknown>;

  reviewerId?: Types.ObjectId;
  reviewNotes?: string;

  submittedAt?: Date;
  completedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const EvaluationSchema = new Schema<IEvaluation>(
  {
    evaluationId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      minlength: 2,
      maxlength: 50,
    },

    submittedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    gemstoneId: {
      type: Schema.Types.ObjectId,
      ref: "Gemstone",
      required: true,
    },

    observations: {
      origin: {
        type: String,
        trim: true,
        maxlength: 100,
      },

      color: {
        type: String,
        trim: true,
        maxlength: 100,
      },

      clarity: {
        type: String,
        trim: true,
        maxlength: 100,
      },

      cut: {
        type: String,
        trim: true,
        maxlength: 100,
      },

      caratWeight: {
        type: Number,
        min: 0,
      },

      treatment: {
        type: String,
        trim: true,
        maxlength: 100,
      },

      notes: {
        type: String,
        trim: true,
        maxlength: 2000,
      },
    },

    status: {
      type: String,
      enum: ["DRAFT", "SUBMITTED", "UNDER_REVIEW", "COMPLETED", "REJECTED"],
      default: "DRAFT",
      required: true,
      index: true,
    },

    // Results are populated by the future grading/pricing workflow.
    gradingResult: {
      type: Schema.Types.Mixed,
      default: undefined,
    },

    pricingResult: {
      type: Schema.Types.Mixed,
      default: undefined,
    },

    reviewerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    reviewNotes: {
      type: String,
      trim: true,
      maxlength: 2000,
    },

    submittedAt: {
      type: Date,
    },

    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    collection: "evaluations",
  },
);

EvaluationSchema.index({ createdAt: -1 });
EvaluationSchema.index({ status: 1, createdAt: -1 });
EvaluationSchema.index({ submittedBy: 1, createdAt: -1 });

const Evaluation: Model<IEvaluation> =
  mongoose.models.Evaluation ||
  mongoose.model<IEvaluation>("Evaluation", EvaluationSchema);

export default Evaluation;
