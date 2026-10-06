import mongoose, { Document, Model, Schema } from "mongoose";

export type ReferenceGemstoneStatus = "ACTIVE" | "INACTIVE";

export interface IReferenceGemstone extends Document {
  referenceId: string;
  gemstoneId: mongoose.Types.ObjectId;

  origin?: string;
  originVerification?: string;

  color?: string;
  clarity?: string;
  cut?: string;
  caratWeight?: number;

  treatment?: string;
  treatmentVerification?: string;

  referencePrice?: number;
  pricePerCarat?: number;
  priceCurrency?: string;

  verificationStatus?: string;
  source?: string;
  notes?: string;

  status: ReferenceGemstoneStatus;

  createdAt: Date;
  updatedAt: Date;
}

const ReferenceGemstoneSchema = new Schema<IReferenceGemstone>(
  {
    referenceId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      minlength: 2,
      maxlength: 50,
    },

    gemstoneId: {
      type: Schema.Types.ObjectId,
      ref: "Gemstone",
      required: true,
    },

    origin: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    originVerification: {
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

    treatmentVerification: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    referencePrice: {
      type: Number,
      min: 0,
    },

    pricePerCarat: {
      type: Number,
      min: 0,
    },

    priceCurrency: {
      type: String,
      trim: true,
      uppercase: true,
      maxlength: 10,
    },

    verificationStatus: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    source: {
      type: String,
      trim: true,
      maxlength: 300,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 2000,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const ReferenceGemstone: Model<IReferenceGemstone> =
  mongoose.models.ReferenceGemstone ||
  mongoose.model<IReferenceGemstone>(
    "ReferenceGemstone",
    ReferenceGemstoneSchema,
  );

export default ReferenceGemstone;
