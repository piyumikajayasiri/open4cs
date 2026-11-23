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

    species: {
      type: String,
      default: "Corundum",
      trim: true,
    },

    supportedShapes: {
      type: [String],
      default: ["Oval", "Round"],
    },

    ruleVersion: {
      type: String,
      default: "v4.2",
      trim: true,
    },

    referenceCount: {
      type: Number,
      default: 0,
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
