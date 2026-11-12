import mongoose, { Schema } from "mongoose";

export interface IAuditLog {
  action: string;
  performedBy: {
    userId: string;
    name: string;
    email: string;
  };
  targetType: string;
  targetId?: string;
  summary: string;
  details?: Record<string, unknown>;
  createdAt: Date;
}

const AuditLogSchema = new Schema(
  {
    action: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    performedBy: {
      userId: { type: String, required: true },
      name: { type: String, required: true },
      email: { type: String, required: true },
    },
    targetType: {
      type: String,
      required: true,
      enum: ["ReferenceGemstone", "GemstoneVariety", "EvaluationRule", "User", "System"],
      index: true,
    },
    targetId: {
      type: String,
      default: "",
    },
    summary: {
      type: String,
      required: true,
      trim: true,
    },
    details: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

const AuditLog =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);

export default AuditLog;
