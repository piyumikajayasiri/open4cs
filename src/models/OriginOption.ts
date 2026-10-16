import mongoose, { Schema, models } from "mongoose";

const OriginOptionSchema = new Schema(
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

const OriginOption =
  models.OriginOption ||
  mongoose.model("OriginOption", OriginOptionSchema);

export default OriginOption;
