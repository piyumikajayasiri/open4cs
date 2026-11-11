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
  { name: "Padparadscha Sapphire", description: "Corundum - rare pink-orange variety", engineSupported: true, isActive: true },
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

console.log("Database seeding completed successfully.");
await mongoose.disconnect();
