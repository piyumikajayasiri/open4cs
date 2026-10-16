import mongoose, { Schema, models } from "mongoose";

const TreatmentOptionSchema = new Schema(
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
      maxlength: 500,
    },

    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },

    engineSupported: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const TreatmentOption =
  models.TreatmentOption ||
  mongoose.model("TreatmentOption", TreatmentOptionSchema);

export default TreatmentOption;
