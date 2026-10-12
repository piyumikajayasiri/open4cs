import mongoose, { Schema, models } from "mongoose";

const HistoricalPriceSchema = new Schema(
  {
    referenceGemstoneId: {
      type: Schema.Types.ObjectId,
      ref: "ReferenceGemstone",
      required: true,
      index: true,
    },

    variety: {
      type: String,
      required: true,
      trim: true,
    },

    caratWeight: {
      type: Number,
      required: true,
      min: 0.01,
    },

    price: {
      type: Number,
      required: true,
      min: 0.01,
    },

    currency: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      match: /^[A-Z]{3}$/,
    },

    recordedAt: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },

    source: {
      type: String,
      required: true,
      enum: ["REFERENCE_CREATED", "REFERENCE_UPDATED"],
    },

    note: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

const HistoricalPrice =
  models.HistoricalPrice ||
  mongoose.model("HistoricalPrice", HistoricalPriceSchema);

export default HistoricalPrice;
