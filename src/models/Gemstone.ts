import mongoose, { Document, Model, Schema } from "mongoose";

export type GemstoneStatus = "ACTIVE" | "INACTIVE";

export interface IGemstone extends Document {
  code: string;
  name: string;
  species: string;
  supportedShapes: string[];
  supportedOrigin: string;
  description?: string;
  status: GemstoneStatus;
  createdAt: Date;
  updatedAt: Date;
}

const GemstoneSchema = new Schema<IGemstone>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      minlength: 2,
      maxlength: 30,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    species: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    supportedShapes: {
      type: [String],
      default: [],
    },

    supportedOrigin: {
      type: String,
      required: true,
      trim: true,
      default: "Sri Lanka",
      maxlength: 100,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
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

const Gemstone: Model<IGemstone> =
  mongoose.models.Gemstone ||
  mongoose.model<IGemstone>("Gemstone", GemstoneSchema);

export default Gemstone;
