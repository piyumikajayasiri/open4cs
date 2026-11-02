import mongoose, { Schema, models } from "mongoose";

const GemstoneVarietySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      required: true,
    },

    engineSupported: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const GemstoneVariety =
  models.GemstoneVariety ||
  mongoose.model("GemstoneVariety", GemstoneVarietySchema);

export default GemstoneVariety;
