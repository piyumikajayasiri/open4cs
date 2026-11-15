import mongoose, { Schema } from "mongoose";

// Aggregate guide ranges are not complete gemstone observations or engine comparables.
const schema = new Schema({
  recordId: { type: String, required: true }, datasetVersion: { type: String, required: true },
  dataKind: { type: String, enum: ["MARKET_REFERENCE"], required: true },
  recordType: { type: String, enum: ["CATEGORY_RANGE", "WEIGHT_RANGE", "REPORTED_LISTING", "INDIVIDUAL_ASSESSMENT_NOTE", "INDIVIDUAL_LISTING"], required: true },
  variety: { type: String, enum: ["SAPPHIRE", "RUBY"], required: true }, hue: { type: String, required: true },
  sourceProductId: String, sourceUrl: String, retrievedAt: String, sourceTreatment: String, selection: String, availability: String,
  source: { type: Schema.Types.Mixed, required: true }, sourceSection: { type: String, required: true },
  verificationStatus: { type: String, enum: ["PENDING"], default: "PENDING", required: true },
  engineEligible: { type: Boolean, default: false, required: true, validate: { validator: (value: boolean) => value === false, message: "Market guide records are not engine comparables." } },
  currency: { type: String, enum: ["USD"], required: true },
  priceBasis: { type: String, enum: ["RETAIL_ESTIMATE", "RETAIL_ASKING_PRICE"], required: true },
  origin: Schema.Types.Mixed, weight: Schema.Types.Mixed, price: Schema.Types.Mixed,
  treatment: { type: String, default: null }, treatmentEvidence: String,
  shape: { type: String, default: null }, clarity: { type: Schema.Types.Mixed, default: null }, cut: { type: Schema.Types.Mixed, default: null },
  tone: { type: Number, default: null }, saturation: { type: String, default: null }, certification: { type: String, default: null },
  sourceColorDescription: String, note: String,
}, { timestamps: true, collection: "market_reference_records" });
schema.index({ datasetVersion: 1, recordId: 1 }, { unique: true });
export default mongoose.models.MarketReference || mongoose.model("MarketReference", schema);
