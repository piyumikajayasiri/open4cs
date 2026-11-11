import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI is missing from .env.local");
}

await mongoose.connect(uri);
console.log("Connected to MongoDB for data seeding...");

// 1. Gemstone Varieties (Catalogue)
const GemstoneVariety =
  mongoose.models.GemstoneVariety ||
  mongoose.model(
    "GemstoneVariety",
    new mongoose.Schema(
      {
        name: { type: String, required: true, unique: true },
        description: { type: String, default: "" },
        species: { type: String, default: "Corundum" },
        supportedShapes: { type: [String], default: ["Oval", "Round"] },
        ruleVersion: { type: String, default: "v4.2" },
        referenceCount: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
        engineSupported: { type: Boolean, default: false },
      },
      { timestamps: true }
    )
  );

const varieties = [
  {
    name: "Ceylon Blue Sapphire",
    description: "Premier benchmark variety with comprehensive color, clarity, and cut rule calibration.",
    species: "Corundum",
    supportedShapes: ["Oval", "Round"],
    ruleVersion: "v4.2",
    referenceCount: 214,
    engineSupported: true,
    isActive: true,
  },
  {
    name: "Padparadscha Sapphire",
    description: "Delicate pinkish-orange corundum with strict spectral saturation bounds.",
    species: "Corundum",
    supportedShapes: ["Oval"],
    ruleVersion: "v4.2",
    referenceCount: 88,
    engineSupported: true,
    isActive: true,
  },
  {
    name: "Pink Sapphire",
    description: "Vibrant hot-to-pastel pink corundum calibrated under Rule Version 4.1 standards.",
    species: "Corundum",
    supportedShapes: ["Oval", "Cushion"],
    ruleVersion: "v4.1",
    referenceCount: 132,
    engineSupported: false,
    isActive: true,
  },
  {
    name: "Yellow Sapphire",
    description: "Canary and golden yellow corundum with iron trace element modifiers.",
    species: "Corundum",
    supportedShapes: ["Oval"],
    ruleVersion: "v4.2",
    referenceCount: 98,
    engineSupported: false,
    isActive: true,
  },
  {
    name: "White Sapphire",
    description: "Colorless natural sapphire frequently cut into brilliant rounds for diamond alternatives.",
    species: "Corundum",
    supportedShapes: ["Round"],
    ruleVersion: "v4.0",
    referenceCount: 64,
    engineSupported: false,
    isActive: true,
  },
  {
    name: "Star Sapphire",
    description: "Phenomenal corundum exhibiting 6-ray asterism; pending CAGS board rule sign-off.",
    species: "Corundum",
    supportedShapes: ["Cabochon"],
    ruleVersion: "—",
    referenceCount: 21,
    engineSupported: false,
    isActive: true,
  },
  // Engine canonical references:
  {
    name: "Blue Sapphire",
    description: "Corundum - Sri Lanka benchmark variety",
    species: "Corundum",
    supportedShapes: ["Oval", "Round"],
    ruleVersion: "v4.2",
    referenceCount: 214,
    engineSupported: true,
    isActive: true,
  },
  {
    name: "Padparadscha",
    description: "Corundum - rare pink-orange Ceylon variety",
    species: "Corundum",
    supportedShapes: ["Oval"],
    ruleVersion: "v4.2",
    referenceCount: 88,
    engineSupported: true,
    isActive: true,
  },
  {
    name: "Ruby",
    description: "Corundum - chromium red variety",
    species: "Corundum",
    supportedShapes: ["Oval", "Cushion"],
    ruleVersion: "v4.2",
    referenceCount: 45,
    engineSupported: true,
    isActive: true,
  },
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
        referenceId: { type: String, unique: true, sparse: true },
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
        source: { type: String, default: "Desk" },
        sourceType: { type: String, default: "Desk" },
        verificationStatus: { type: String, default: "Verified" },
        labCertificate: { type: String, default: "" },
        verifiedBy: { type: String, default: "" },
        verifiedAt: { type: String, default: "" },
      },
      { timestamps: true }
    )
  );

// Benchmark Reference Gemstones aligned with CAGS Evidence Data
const referenceGemstones = [
  {
    referenceId: "REF-1207",
    variety: "Blue Sapphire",
    caratWeight: 2.61,
    color: {
      hue: "Royal Blue",
      tone: "6",
      saturation: "Vivid",
      distribution: "Even",
      zoning: "None",
    },
    clarity: {
      nakedEye: "Clean",
      loupe10x: "Very Slight",
      inclusionType: "Minor silk",
      inclusionLocation: "Off-table",
      severity: "Minor",
    },
    cut: {
      length: 8.5,
      width: 6.9,
      depth: 4.3,
      symmetry: "Very Good",
      polish: "Very Good",
      windowing: "None",
      extinction: "None",
      bulging: "None",
    },
    treatment: { status: "Untreated" },
    origin: { value: "Sri Lanka", reliability: "High" },
    referencePrice: 2322900,
    currency: "LKR",
    source: "Unheated · Lab",
    sourceType: "Lab",
    verificationStatus: "Verified",
    labCertificate: "GIA Report #64829104 - Certified Natural Unheated",
    verifiedBy: "Dr. K. Mendis",
    verifiedAt: "Oct 24, 2026",
  },
  {
    referenceId: "REF-1182",
    variety: "Blue Sapphire",
    caratWeight: 2.52,
    color: {
      hue: "Vivid Blue",
      tone: "6",
      saturation: "Vivid",
      distribution: "Even",
      zoning: "None",
    },
    clarity: {
      nakedEye: "Clean",
      loupe10x: "Very Slight",
      inclusionType: "Fine silk",
      inclusionLocation: "Off-table",
      severity: "Minor",
    },
    cut: {
      length: 8.3,
      width: 6.7,
      depth: 4.2,
      symmetry: "Good",
      polish: "Good",
      windowing: "None",
      extinction: "None",
      bulging: "None",
    },
    treatment: { status: "Heated" },
    origin: { value: "Sri Lanka", reliability: "High" },
    referencePrice: 1612800,
    currency: "LKR",
    source: "Heated · Lab",
    sourceType: "Lab",
    verificationStatus: "Verified",
    labCertificate: "SSEF Report #119402 - Thermal Enhancement (H)",
    verifiedBy: "Prof. S. Wickramasinghe",
    verifiedAt: "Oct 19, 2026",
  },
  {
    referenceId: "REF-0934",
    variety: "Blue Sapphire",
    caratWeight: 2.38,
    color: {
      hue: "Vivid Blue",
      tone: "5",
      saturation: "Strong",
      distribution: "Even",
      zoning: "None",
    },
    clarity: {
      nakedEye: "Clean",
      loupe10x: "Slight",
      inclusionType: "Peripheral feather",
      inclusionLocation: "Off-table",
      severity: "Minor",
    },
    cut: {
      length: 8.0,
      width: 6.5,
      depth: 4.0,
      symmetry: "Good",
      polish: "Good",
      windowing: "None",
      extinction: "None",
      bulging: "None",
    },
    treatment: { status: "Heated" },
    origin: { value: "Sri Lanka", reliability: "Medium" },
    referencePrice: 1456560,
    currency: "LKR",
    source: "Heated · Desk",
    sourceType: "Desk",
    verificationStatus: "Verified",
    labCertificate: "CAGS Colombo Verification Standard #CV-934",
    verifiedBy: "Data Desk (E. Alwis)",
    verifiedAt: "Oct 12, 2026",
  },
  {
    referenceId: "REF-1099",
    variety: "Blue Sapphire",
    caratWeight: 2.74,
    color: {
      hue: "Vivid Blue",
      tone: "5",
      saturation: "Strong",
      distribution: "Even",
      zoning: "None",
    },
    clarity: {
      nakedEye: "Slightly Included",
      loupe10x: "Moderate",
      inclusionType: "Silk needles",
      inclusionLocation: "Pavilion",
      severity: "Minor",
    },
    cut: {
      length: 8.6,
      width: 7.0,
      depth: 4.4,
      symmetry: "Good",
      polish: "Good",
      windowing: "None",
      extinction: "None",
      bulging: "None",
    },
    treatment: { status: "Heated" },
    origin: { value: "Sri Lanka", reliability: "Medium" },
    referencePrice: 1638520,
    currency: "LKR",
    source: "Heated · Member",
    sourceType: "Member",
    verificationStatus: "Pending",
    labCertificate: "Trader Submission - Pending 2nd Gemologist Sign-off",
    verifiedBy: "Pending Board Sign-off",
    verifiedAt: "Submitted Oct 29, 2026",
  },
  {
    referenceId: "HIST-Q2-31",
    variety: "Padparadscha",
    caratWeight: 1.75,
    color: {
      hue: "Pinkish Orange",
      tone: "5",
      saturation: "Strong",
      distribution: "Even",
      zoning: "None",
    },
    clarity: {
      nakedEye: "Clean",
      loupe10x: "Very Slight",
      inclusionType: "Minor crystals",
      inclusionLocation: "Off-table",
      severity: "Minor",
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
    referencePrice: 1925000,
    currency: "LKR",
    source: "Desk + members",
    sourceType: "Desk + members",
    verificationStatus: "Verified",
    labCertificate: "Colombo B2B Auction Clearing Benchmark Matrix Q2",
    verifiedBy: "CAGS Pricing Board",
    verifiedAt: "Sep 30, 2026",
  },
  {
    referenceId: "REF-PAD-02",
    variety: "Padparadscha",
    caratWeight: 2.15,
    color: {
      hue: "Orangish Pink",
      tone: "6",
      saturation: "Strong",
      distribution: "Even",
      zoning: "None",
    },
    clarity: {
      nakedEye: "Clean",
      loupe10x: "Slight",
      inclusionType: "Fine silk",
      inclusionLocation: "Near edge",
      severity: "Minor",
    },
    cut: {
      length: 8.1,
      width: 6.2,
      depth: 4.0,
      symmetry: "Good",
      polish: "Good",
      windowing: "None",
      extinction: "None",
      bulging: "None",
    },
    treatment: { status: "Heated" },
    origin: { value: "Sri Lanka", reliability: "High" },
    referencePrice: 1827500,
    currency: "LKR",
    source: "Heated · Desk",
    sourceType: "Desk",
    verificationStatus: "Verified",
    labCertificate: "SSEF Report #120341 - Heated Padparadscha",
    verifiedBy: "Dr. K. Mendis",
    verifiedAt: "Aug 15, 2026",
  },
  {
    referenceId: "REF-RUBY-01",
    variety: "Ruby",
    caratWeight: 1.6,
    color: {
      hue: "Red",
      tone: "6",
      saturation: "Vivid",
      distribution: "Even",
      zoning: "None",
    },
    clarity: {
      nakedEye: "Clean",
      loupe10x: "Very Slight",
      inclusionType: "Minor needles",
      inclusionLocation: "Off-table",
      severity: "Minor",
    },
    cut: {
      length: 6.9,
      width: 5.4,
      depth: 3.5,
      symmetry: "Good",
      polish: "Good",
      windowing: "None",
      extinction: "None",
      bulging: "None",
    },
    treatment: { status: "Untreated" },
    origin: { value: "Myanmar", reliability: "High" },
    referencePrice: 1440000,
    currency: "LKR",
    source: "Unheated · Lab",
    sourceType: "Lab",
    verificationStatus: "Verified",
    labCertificate: "GIA Report #5192841 - Mogok Natural Ruby",
    verifiedBy: "Dr. K. Mendis",
    verifiedAt: "Jul 10, 2026",
  },
  {
    referenceId: "REF-RUBY-02",
    variety: "Ruby",
    caratWeight: 2.1,
    color: {
      hue: "Purplish Red",
      tone: "6",
      saturation: "Strong",
      distribution: "Even",
      zoning: "None",
    },
    clarity: {
      nakedEye: "Clean",
      loupe10x: "Slight",
      inclusionType: "Fine silk",
      inclusionLocation: "Girdle",
      severity: "Minor",
    },
    cut: {
      length: 7.7,
      width: 6.0,
      depth: 3.9,
      symmetry: "Good",
      polish: "Good",
      windowing: "None",
      extinction: "Slight",
      bulging: "None",
    },
    treatment: { status: "Heated" },
    origin: { value: "Myanmar", reliability: "High" },
    referencePrice: 1512000,
    currency: "LKR",
    source: "Heated · Desk",
    sourceType: "Desk",
    verificationStatus: "Verified",
    labCertificate: "CAGS Colombo Verification Standard #CV-Ruby-210",
    verifiedBy: "Data Desk (E. Alwis)",
    verifiedAt: "Jun 28, 2026",
  },
];

for (const ref of referenceGemstones) {
  await ReferenceGemstone.findOneAndUpdate(
    { referenceId: ref.referenceId },
    ref,
    { upsert: true }
  );
}
console.log(`Seeded ${referenceGemstones.length} reference gemstones for pricing.`);

console.log("Database seeding completed successfully.");
await mongoose.disconnect();
