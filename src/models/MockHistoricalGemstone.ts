import mongoose, { Schema } from "mongoose";

const schema = new Schema({
  id: { type: String, required: true, unique: true },
  dataKind: { type: String, enum: ["MOCK"], required: true },
  datasetVersion: { type: String, required: true, index: true },
  observations: { type: Schema.Types.Mixed, required: true },
  currency: { type: String, enum: ["USD"], required: true },
  priceBasis: { type: String, enum: ["MOCK_B2B"], required: true },
  totalPrice: { type: Number, required: true, min: 0.01 },
  recordedAt: { type: String, required: true },
  source: { type: String, required: true },
  description: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  revision: { type: Number, default: 0 }, deletedAt: { type: Date, default: null }, deletedBy: String,
}, { timestamps: true, collection: "mock_historical_gemstones" });

export default mongoose.models.MockHistoricalGemstone || mongoose.model("MockHistoricalGemstone", schema);
