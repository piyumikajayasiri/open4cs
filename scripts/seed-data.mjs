import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI is missing from .env.local");
}

await mongoose.connect(uri);
console.log("Connected to MongoDB for data seeding...");

// 1. Gemstone Varieties
const GemstoneVariety =
  mongoose.models.GemstoneVariety ||
  mongoose.model(
    "GemstoneVariety",
    new mongoose.Schema(
      {
        name: { type: String, required: true, unique: true },
        description: { type: String, default: "" },
        isActive: { type: Boolean, default: true },
        engineSupported: { type: Boolean, default: false },
      },
      { timestamps: true }
    )
  );

const varieties = [
  { name: "Blue Sapphire", description: "Corundum - Sri Lanka benchmark variety", engineSupported: true, isActive: true },
  { name: "Padparadscha", description: "Corundum - rare pink-orange Ceylon variety", engineSupported: true, isActive: true },
  { name: "Ruby", description: "Corundum - chromium red variety", engineSupported: true, isActive: true },
  { name: "Yellow Sapphire", description: "Corundum - canary and golden tones", engineSupported: false, isActive: true },
  { name: "Pink Sapphire", description: "Corundum - pastel to vivid pink tones", engineSupported: false, isActive: true },
  { name: "White Sapphire", description: "Corundum - colorless variety", engineSupported: false, isActive: true },
  { name: "Star Sapphire", description: "Corundum - asterism cabochon variety", engineSupported: false, isActive: true },
];

for (const v of varieties) {
  await GemstoneVariety.findOneAndUpdate({ name: v.name }, v, { upsert: true });
}
console.log(`Seeded ${varieties.length} gemstone varieties.`);

// 2. Origins
const OriginOption =
  mongoose.models.OriginOption ||
  mongoose.model(
    "OriginOption",
    new mongoose.Schema(
      {
        name: { type: String, required: true, unique: true },
        description: { type: String, default: "" },
        isActive: { type: Boolean, default: true },
        engineSupported: { type: Boolean, default: false },
      },
      { timestamps: true }
    )
  );

const origins = [
  { name: "Sri Lanka", description: "Ceylon origin, historic Ratnapura / Elahera source", engineSupported: true, isActive: true },
  { name: "Myanmar", description: "Burmese origin, Mogok valley source", engineSupported: true, isActive: true },
  { name: "Madagascar", description: "Ilakaka deposit source", engineSupported: true, isActive: true },
  { name: "Mozambique", description: "Montepuez deposit source", engineSupported: false, isActive: true },
  { name: "Other", description: "Other geographical origins", engineSupported: true, isActive: true },
  { name: "Unknown", description: "Unconfirmed origin", engineSupported: true, isActive: true },
];

for (const o of origins) {
  await OriginOption.findOneAndUpdate({ name: o.name }, o, { upsert: true });
}
console.log(`Seeded ${origins.length} origin options.`);

// 3. Treatment Options
const TreatmentOption =
  mongoose.models.TreatmentOption ||
  mongoose.model(
    "TreatmentOption",
    new mongoose.Schema(
      {
        name: { type: String, required: true, unique: true },
        description: { type: String, default: "" },
        isActive: { type: Boolean, default: true },
        engineSupported: { type: Boolean, default: false },
      },
      { timestamps: true }
    )
  );

const treatments = [
  { name: "Untreated", description: "Natural unheated gemstone without thermal enhancement", engineSupported: true, isActive: true },
  { name: "Heated", description: "Traditional thermal enhancement without foreign substance additives", engineSupported: true, isActive: true },
  { name: "Diffusion", description: "Lattice diffusion treatment (beryllium, titanium)", engineSupported: false, isActive: true },
  { name: "Lead Glass Filled", description: "Clarity enhancement with lead glass composite", engineSupported: false, isActive: true },
  { name: "Unknown", description: "Treatment status unverified", engineSupported: true, isActive: true },
];

for (const t of treatments) {
  await TreatmentOption.findOneAndUpdate({ name: t.name }, t, { upsert: true });
}
console.log(`Seeded ${treatments.length} treatment options.`);

// 4. Reference Gemstones for B2B Pricing & Similarity Engine
const ReferenceGemstone =
  mongoose.models.ReferenceGemstone ||
  mongoose.model(
    "ReferenceGemstone",
    new mongoose.Schema(
      {
        variety: { type: String, required: true },
        caratWeight: { type: Number, required: true },
        color: {
          hue: { type: String, required: true },
          tone: { type: String, required: true },
          saturation: { type: String, required: true },
          distribution: { type: String, required: true },
          zoning: { type: String, required: true },
        },
        clarity: {
          nakedEye: { type: String, required: true },
          loupe10x: { type: String, required: true },
          inclusionType: { type: String, default: "" },
          inclusionLocation: { type: String, default: "" },
          severity: { type: String, required: true },
        },
        cut: {
          length: { type: Number, default: null },
          width: { type: Number, default: null },
          depth: { type: Number, default: null },
          symmetry: { type: String, required: true },
          polish: { type: String, required: true },
          windowing: { type: String, required: true },
          extinction: { type: String, required: true },
          bulging: { type: String, required: true },
        },
        treatment: {
          status: { type: String, required: true },
        },
        origin: {
          value: { type: String, required: true },
          reliability: { type: String, required: true },
        },
        referencePrice: { type: Number, required: true },
        currency: { type: String, required: true, default: "LKR" },
      },
      { timestamps: true }
    )
  );

const referenceGemstones = [
  {
    variety: "Blue Sapphire",
    caratWeight: 2.5,
    color: {
      hue: "Cornflower Blue",
      tone: "Medium",
      saturation: "Vivid",
      distribution: "Even",
      zoning: "None",
    },
    clarity: {
      nakedEye: "Eye-clean",
      loupe10x: "Minor silk",
      severity: "Very Slight",
    },
    cut: {
      length: 8.4,
      width: 6.8,
      depth: 4.2,
      symmetry: "Good",
      polish: "Good",
      windowing: "None",
      extinction: "Slight",
      bulging: "None",
    },
    treatment: { status: "Untreated" },
    origin: { value: "Sri Lanka", reliability: "High" },
    referencePrice: 650000,
    currency: "LKR",
  },
  {
    variety: "Blue Sapphire",
    caratWeight: 2.1,
    color: {
      hue: "Royal Blue",
      tone: "Medium Dark",
      saturation: "Vivid",
      distribution: "Even",
      zoning: "None",
    },
    clarity: {
      nakedEye: "Eye-clean",
      loupe10x: "Slight silk",
      severity: "Slight",
    },
    cut: {
      length: 7.9,
      width: 6.3,
      depth: 4.1,
      symmetry: "Good",
      polish: "Good",
      windowing: "None",
      extinction: "Moderate",
      bulging: "None",
    },
    treatment: { status: "Heated" },
    origin: { value: "Sri Lanka", reliability: "High" },
    referencePrice: 520000,
    currency: "LKR",
  },
  {
    variety: "Padparadscha",
    caratWeight: 1.85,
    color: {
      hue: "Pinkish Orange",
      tone: "Medium",
      saturation: "Strong",
      distribution: "Even",
      zoning: "None",
    },
    clarity: {
      nakedEye: "Eye-clean",
      loupe10x: "Minor crystals",
      severity: "Slight",
    },
    cut: {
      length: 7.2,
      width: 5.8,
      depth: 3.7,
      symmetry: "Very Good",
      polish: "Very Good",
      windowing: "None",
      extinction: "None",
      bulging: "None",
    },
    treatment: { status: "Untreated" },
    origin: { value: "Sri Lanka", reliability: "High" },
    referencePrice: 1200000,
    currency: "LKR",
  },
  {
    variety: "Ruby",
    caratWeight: 1.6,
    color: {
      hue: "Pigeon Blood Red",
      tone: "Medium Dark",
      saturation: "Vivid",
      distribution: "Even",
      zoning: "None",
    },
    clarity: {
      nakedEye: "Eye-clean",
      loupe10x: "Minor needles",
      severity: "Slight",
    },
    cut: {
      length: 6.9,
      width: 5.4,
      depth: 3.5,
      symmetry: "Good",
      polish: "Good",
      windowing: "None",
      extinction: "Slight",
      bulging: "None",
    },
    treatment: { status: "Untreated" },
    origin: { value: "Myanmar", reliability: "High" },
    referencePrice: 950000,
    currency: "LKR",
  },
];

for (const ref of referenceGemstones) {
  await ReferenceGemstone.findOneAndUpdate(
    { variety: ref.variety, caratWeight: ref.caratWeight, "treatment.status": ref.treatment.status },
    ref,
    { upsert: true }
  );
}
console.log(`Seeded ${referenceGemstones.length} reference gemstones for pricing.`);

console.log("Database seeding completed successfully.");
await mongoose.disconnect();
