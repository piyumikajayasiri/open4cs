import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI is missing from .env.local");
}

await mongoose.connect(uri);
console.log("Connected to MongoDB for data seeding...");

// 1. Gemstone Varieties (7 Canonical Varieties)
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

// Clean up duplicate legacy names
await GemstoneVariety.deleteMany({
  name: { $in: ["Ceylon Blue Sapphire", "Padparadscha Sapphire"] }
});

const varieties = [
  {
    name: "Blue Sapphire",
    description: "Premier Ceylon benchmark variety with comprehensive color, clarity, and cut rule calibration.",
    species: "Corundum",
    supportedShapes: ["Oval", "Round"],
    ruleVersion: "v4.2",
    referenceCount: 214,
    engineSupported: true,
    isActive: true,
  },
  {
    name: "Padparadscha",
    description: "Delicate pinkish-orange corundum with strict spectral saturation bounds.",
    species: "Corundum",
    supportedShapes: ["Oval"],
    ruleVersion: "v4.2",
    referenceCount: 88,
    engineSupported: true,
    isActive: true,
  },
  {
    name: "Ruby",
    description: "Chromium red corundum calibrated for standard market valuation.",
    species: "Corundum",
    supportedShapes: ["Oval", "Cushion"],
    ruleVersion: "v4.2",
    referenceCount: 45,
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
    isActive: false, // Suspended / In Review
  },
];

for (const v of varieties) {
  await GemstoneVariety.findOneAndUpdate({ name: v.name }, v, { upsert: true });
}
const countVarieties = await GemstoneVariety.countDocuments();
console.log(`Seeded exactly ${countVarieties} canonical gemstone varieties.`);

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
        dataClassification: { type: String, enum: ["Real", "Demo"], default: "Demo" },
        sourceEvidence: { type: String, default: "" },
        observationDate: { type: String, default: "" },
        transactionContext: { type: String, enum: ["Completed Sale", "Asking Price", "Dealer Estimate"], default: "Dealer Estimate" },
        marketContext: { type: String, enum: ["Wholesale", "Retail", "Auction"], default: "Wholesale" },
        originalCurrency: { type: String, default: "LKR" },
        originalPrice: { type: Number, default: null },
        originalCaratWeight: { type: Number, default: null },
        treatmentEvidence: { type: String, default: "" },
        originEvidence: { type: String, default: "" },
        reviewer: { type: String, default: "" },
        reviewDate: { type: String, default: "" },
      },
      { timestamps: true }
    )
  );

// Non-destructive idempotent benchmark seeding (upsert by referenceId)

// Benchmark Reference Gemstones (Unvalidated sample trade data for testing)
const referenceGemstones = [
  {
    "referenceId": "REF-1207",
    "variety": "Blue Sapphire",
    "caratWeight": 2.61,
    "color": {
      "hue": "Royal Blue",
      "tone": "6",
      "saturation": "Vivid",
      "distribution": "Even",
      "zoning": "None"
    },
    "clarity": {
      "nakedEye": "Clean",
      "loupe10x": "Very Slight",
      "inclusionType": "Minor silk",
      "inclusionLocation": "Off-table",
      "severity": "Minor"
    },
    "cut": {
      "length": 8.5,
      "width": 6.9,
      "depth": 4.3,
      "symmetry": "Very Good",
      "polish": "Very Good",
      "windowing": "None",
      "extinction": "None",
      "bulging": "None"
    },
    "treatment": {
      "status": "Untreated"
    },
    "origin": {
      "value": "Sri Lanka",
      "reliability": "High"
    },
    "referencePrice": 2322900,
    "currency": "LKR",
    "source": "Colombo Fort Dealer Lot",
    "sourceType": "Dealer Observation",
    "verificationStatus": "Verified",
    "labCertificate": "Pedagogical Benchmark Standard (Demo Data)",
    "verifiedBy": "Open 4Cs Academic Research Team",
    "verifiedAt": "Oct 24, 2026",
    "dataClassification": "Demo",
    "sourceEvidence": "Modeled after loose unheated Ceylon Blue Sapphire dealer lots in Colombo Fort.",
    "observationDate": "2026-10-18",
    "transactionContext": "Dealer Estimate",
    "marketContext": "Wholesale",
    "originalCurrency": "LKR",
    "originalPrice": 2322900,
    "originalCaratWeight": 2.61,
    "treatmentEvidence": "Unaltered intersecting rutile silk needle arrays without discoidal thermal tension haloes.",
    "originEvidence": "Classic Ratnapura alluvial corundum suite: rutile silk, liquid feathers, rounded zircon crystals.",
    "reviewer": "Open 4Cs Academic Evaluator",
    "reviewDate": "2026-10-24"
  },
  {
    "referenceId": "REF-1182",
    "variety": "Blue Sapphire",
    "caratWeight": 2.52,
    "color": {
      "hue": "Vivid Blue",
      "tone": "6",
      "saturation": "Vivid",
      "distribution": "Even",
      "zoning": "None"
    },
    "clarity": {
      "nakedEye": "Clean",
      "loupe10x": "Very Slight",
      "inclusionType": "Fine silk",
      "inclusionLocation": "Off-table",
      "severity": "Minor"
    },
    "cut": {
      "length": 8.3,
      "width": 6.7,
      "depth": 4.2,
      "symmetry": "Good",
      "polish": "Good",
      "windowing": "None",
      "extinction": "None",
      "bulging": "None"
    },
    "treatment": {
      "status": "Heated"
    },
    "origin": {
      "value": "Sri Lanka",
      "reliability": "High"
    },
    "referencePrice": 1612800,
    "currency": "LKR",
    "source": "Beruwala Gem Market Parcel",
    "sourceType": "Dealer Observation",
    "verificationStatus": "Verified",
    "labCertificate": "Pedagogical Benchmark Standard (Demo Data)",
    "verifiedBy": "Open 4Cs Academic Research Team",
    "verifiedAt": "Oct 19, 2026",
    "dataClassification": "Demo",
    "sourceEvidence": "Modeled after traditional thermally treated Ceylon Blue Sapphire trade parcel clearing observations.",
    "observationDate": "2026-10-15",
    "transactionContext": "Dealer Estimate",
    "marketContext": "Wholesale",
    "originalCurrency": "LKR",
    "originalPrice": 1612800,
    "originalCaratWeight": 2.52,
    "treatmentEvidence": "Partially resorbed rutile silk and discoidal thermal stress fractures surrounding mineral inclusions.",
    "originEvidence": "Mineralogical suite consistent with Sri Lankan highland corundum.",
    "reviewer": "Open 4Cs Academic Evaluator",
    "reviewDate": "2026-10-19"
  },
  {
    "referenceId": "REF-0934",
    "variety": "Blue Sapphire",
    "caratWeight": 2.38,
    "color": {
      "hue": "Vivid Blue",
      "tone": "5",
      "saturation": "Strong",
      "distribution": "Even",
      "zoning": "None"
    },
    "clarity": {
      "nakedEye": "Clean",
      "loupe10x": "Slight",
      "inclusionType": "Peripheral feather",
      "inclusionLocation": "Off-table",
      "severity": "Minor"
    },
    "cut": {
      "length": 8,
      "width": 6.5,
      "depth": 4,
      "symmetry": "Good",
      "polish": "Good",
      "windowing": "None",
      "extinction": "None",
      "bulging": "None"
    },
    "treatment": {
      "status": "Heated"
    },
    "origin": {
      "value": "Sri Lanka",
      "reliability": "Medium"
    },
    "referencePrice": 1456560,
    "currency": "LKR",
    "source": "Ratnapura Gem Exchange",
    "sourceType": "Dealer Observation",
    "verificationStatus": "Verified",
    "labCertificate": "Pedagogical Benchmark Standard (Demo Data)",
    "verifiedBy": "Open 4Cs Academic Research Team",
    "verifiedAt": "Oct 12, 2026",
    "dataClassification": "Demo",
    "sourceEvidence": "Modeled after medium-tone heated Ceylon sapphire trade parcel lots.",
    "observationDate": "2026-10-10",
    "transactionContext": "Dealer Estimate",
    "marketContext": "Wholesale",
    "originalCurrency": "LKR",
    "originalPrice": 1456560,
    "originalCaratWeight": 2.38,
    "treatmentEvidence": "Thermal alteration confirmed by internal reflective stress haloes.",
    "originEvidence": "Seller declared Ceylon origin; diagnostic inclusions support Sri Lankan geological provenance.",
    "reviewer": "Open 4Cs Academic Evaluator",
    "reviewDate": "2026-10-12"
  },
  {
    "referenceId": "REF-1099",
    "variety": "Blue Sapphire",
    "caratWeight": 2.74,
    "color": {
      "hue": "Vivid Blue",
      "tone": "5",
      "saturation": "Strong",
      "distribution": "Even",
      "zoning": "None"
    },
    "clarity": {
      "nakedEye": "Slightly Included",
      "loupe10x": "Moderate",
      "inclusionType": "Silk needles",
      "inclusionLocation": "Pavilion",
      "severity": "Minor"
    },
    "cut": {
      "length": 8.6,
      "width": 7,
      "depth": 4.4,
      "symmetry": "Good",
      "polish": "Good",
      "windowing": "None",
      "extinction": "None",
      "bulging": "None"
    },
    "treatment": {
      "status": "Heated"
    },
    "origin": {
      "value": "Sri Lanka",
      "reliability": "Medium"
    },
    "referencePrice": 1638520,
    "currency": "LKR",
    "source": "Trader Submission",
    "sourceType": "Trader Submission",
    "verificationStatus": "Pending",
    "labCertificate": "Trader Submission - Pending Sign-off",
    "verifiedBy": "Pending Board Sign-off",
    "verifiedAt": "Submitted Oct 29, 2026",
    "dataClassification": "Demo",
    "sourceEvidence": "Unverified trader submission record pending independent gemmological audit.",
    "observationDate": "2026-10-29",
    "transactionContext": "Asking Price",
    "marketContext": "Wholesale",
    "originalCurrency": "LKR",
    "originalPrice": 1638520,
    "originalCaratWeight": 2.74,
    "treatmentEvidence": "Visual inspection notes indicate heating; formal FTIR/microscopy pending.",
    "originEvidence": "Seller declared Sri Lanka; unverified.",
    "reviewer": "Pending Reviewer",
    "reviewDate": "2026-10-29"
  },
  {
    "referenceId": "HIST-Q2-31",
    "variety": "Padparadscha",
    "caratWeight": 1.75,
    "color": {
      "hue": "Pinkish Orange",
      "tone": "5",
      "saturation": "Strong",
      "distribution": "Even",
      "zoning": "None"
    },
    "clarity": {
      "nakedEye": "Clean",
      "loupe10x": "Very Slight",
      "inclusionType": "Minor crystals",
      "inclusionLocation": "Off-table",
      "severity": "Minor"
    },
    "cut": {
      "length": 7.2,
      "width": 5.8,
      "depth": 3.7,
      "symmetry": "Very Good",
      "polish": "Very Good",
      "windowing": "None",
      "extinction": "None",
      "bulging": "None"
    },
    "treatment": {
      "status": "Untreated"
    },
    "origin": {
      "value": "Sri Lanka",
      "reliability": "High"
    },
    "referencePrice": 1925000,
    "currency": "LKR",
    "source": "Colombo Auction Aggregate",
    "sourceType": "Dealer Observation",
    "verificationStatus": "Verified",
    "labCertificate": "Pedagogical Benchmark Standard (Demo Data)",
    "verifiedBy": "Open 4Cs Academic Research Team",
    "verifiedAt": "Sep 30, 2026",
    "dataClassification": "Demo",
    "sourceEvidence": "Modeled after untreated Ceylon Padparadscha auction specimens exhibiting balanced pink-orange color.",
    "observationDate": "2026-09-25",
    "transactionContext": "Dealer Estimate",
    "marketContext": "Wholesale",
    "originalCurrency": "LKR",
    "originalPrice": 1925000,
    "originalCaratWeight": 1.75,
    "treatmentEvidence": "Intact silk needles and natural color distribution without beryllium lattice diffusion.",
    "originEvidence": "Classic Sri Lankan alluvial corundum inclusion suite.",
    "reviewer": "Open 4Cs Academic Evaluator",
    "reviewDate": "2026-09-30"
  },
  {
    "referenceId": "REF-PAD-02",
    "variety": "Padparadscha",
    "caratWeight": 2.15,
    "color": {
      "hue": "Orangish Pink",
      "tone": "6",
      "saturation": "Strong",
      "distribution": "Even",
      "zoning": "None"
    },
    "clarity": {
      "nakedEye": "Clean",
      "loupe10x": "Slight",
      "inclusionType": "Fine silk",
      "inclusionLocation": "Near edge",
      "severity": "Minor"
    },
    "cut": {
      "length": 8.1,
      "width": 6.2,
      "depth": 4,
      "symmetry": "Good",
      "polish": "Good",
      "windowing": "None",
      "extinction": "None",
      "bulging": "None"
    },
    "treatment": {
      "status": "Heated"
    },
    "origin": {
      "value": "Sri Lanka",
      "reliability": "High"
    },
    "referencePrice": 1827500,
    "currency": "LKR",
    "source": "Beruwala Trade Lot",
    "sourceType": "Dealer Observation",
    "verificationStatus": "Verified",
    "labCertificate": "Pedagogical Benchmark Standard (Demo Data)",
    "verifiedBy": "Open 4Cs Academic Research Team",
    "verifiedAt": "Aug 15, 2026",
    "dataClassification": "Demo",
    "sourceEvidence": "Modeled after heated Ceylon Padparadscha corundum trade samples.",
    "observationDate": "2026-08-10",
    "transactionContext": "Dealer Estimate",
    "marketContext": "Wholesale",
    "originalCurrency": "LKR",
    "originalPrice": 1827500,
    "originalCaratWeight": 2.15,
    "treatmentEvidence": "Thermal alteration evident in partially dissolved rutile needles.",
    "originEvidence": "Inclusion profile confirms Sri Lankan geological source.",
    "reviewer": "Open 4Cs Academic Evaluator",
    "reviewDate": "2026-08-15"
  },
  {
    "referenceId": "REF-PAD-03",
    "variety": "Padparadscha",
    "caratWeight": 1.95,
    "color": {
      "hue": "Pinkish Orange",
      "tone": "5",
      "saturation": "Strong",
      "distribution": "Even",
      "zoning": "None"
    },
    "clarity": {
      "nakedEye": "Clean",
      "loupe10x": "Very Slight",
      "inclusionType": "Minor crystals",
      "inclusionLocation": "Off-table",
      "severity": "Minor"
    },
    "cut": {
      "length": 7.6,
      "width": 6,
      "depth": 3.8,
      "symmetry": "Very Good",
      "polish": "Good",
      "windowing": "None",
      "extinction": "None",
      "bulging": "None"
    },
    "treatment": {
      "status": "Untreated"
    },
    "origin": {
      "value": "Sri Lanka",
      "reliability": "High"
    },
    "referencePrice": 2145000,
    "currency": "LKR",
    "source": "Ratnapura Dealer Parcel",
    "sourceType": "Dealer Observation",
    "verificationStatus": "Verified",
    "labCertificate": "Pedagogical Benchmark Standard (Demo Data)",
    "verifiedBy": "Open 4Cs Academic Research Team",
    "verifiedAt": "Nov 02, 2026",
    "dataClassification": "Demo",
    "sourceEvidence": "Modeled after untreated Ratnapura dealer parcel observations.",
    "observationDate": "2026-10-28",
    "transactionContext": "Dealer Estimate",
    "marketContext": "Wholesale",
    "originalCurrency": "LKR",
    "originalPrice": 2145000,
    "originalCaratWeight": 1.95,
    "treatmentEvidence": "Unaltered silk needles and prismatic apatite crystals without heat-induced halos.",
    "originEvidence": "Documented provenance from Ratnapura gravel pit lot.",
    "reviewer": "Open 4Cs Academic Evaluator",
    "reviewDate": "2026-11-02"
  },
  {
    "referenceId": "REF-RUBY-01",
    "variety": "Ruby",
    "caratWeight": 1.6,
    "color": {
      "hue": "Red",
      "tone": "6",
      "saturation": "Vivid",
      "distribution": "Even",
      "zoning": "None"
    },
    "clarity": {
      "nakedEye": "Clean",
      "loupe10x": "Very Slight",
      "inclusionType": "Minor needles",
      "inclusionLocation": "Off-table",
      "severity": "Minor"
    },
    "cut": {
      "length": 6.9,
      "width": 5.4,
      "depth": 3.5,
      "symmetry": "Good",
      "polish": "Good",
      "windowing": "None",
      "extinction": "None",
      "bulging": "None"
    },
    "treatment": {
      "status": "Untreated"
    },
    "origin": {
      "value": "Myanmar",
      "reliability": "High"
    },
    "referencePrice": 1440000,
    "currency": "LKR",
    "source": "Mogok Trade Lot",
    "sourceType": "Dealer Observation",
    "verificationStatus": "Verified",
    "labCertificate": "Pedagogical Benchmark Standard (Demo Data)",
    "verifiedBy": "Open 4Cs Academic Research Team",
    "verifiedAt": "Jul 10, 2026",
    "dataClassification": "Demo",
    "sourceEvidence": "Modeled after natural untreated Mogok/Burma red corundum trade parcel observations.",
    "observationDate": "2026-07-01",
    "transactionContext": "Dealer Estimate",
    "marketContext": "Wholesale",
    "originalCurrency": "LKR",
    "originalPrice": 1440000,
    "originalCaratWeight": 1.6,
    "treatmentEvidence": "Dense short rutile silk needles undisturbed by high-temperature heat treatment.",
    "originEvidence": "Calcite and swirl growth zoning diagnostic of marble-hosted Mogok ruby.",
    "reviewer": "Open 4Cs Academic Evaluator",
    "reviewDate": "2026-07-10"
  },
  {
    "referenceId": "REF-RUBY-02",
    "variety": "Ruby",
    "caratWeight": 2.1,
    "color": {
      "hue": "Purplish Red",
      "tone": "6",
      "saturation": "Strong",
      "distribution": "Even",
      "zoning": "None"
    },
    "clarity": {
      "nakedEye": "Clean",
      "loupe10x": "Slight",
      "inclusionType": "Fine silk",
      "inclusionLocation": "Girdle",
      "severity": "Minor"
    },
    "cut": {
      "length": 7.7,
      "width": 6,
      "depth": 3.9,
      "symmetry": "Good",
      "polish": "Good",
      "windowing": "None",
      "extinction": "Slight",
      "bulging": "None"
    },
    "treatment": {
      "status": "Heated"
    },
    "origin": {
      "value": "Myanmar",
      "reliability": "High"
    },
    "referencePrice": 1512000,
    "currency": "LKR",
    "source": "Burmese Ruby Trade Parcel",
    "sourceType": "Dealer Observation",
    "verificationStatus": "Verified",
    "labCertificate": "Pedagogical Benchmark Standard (Demo Data)",
    "verifiedBy": "Open 4Cs Academic Research Team",
    "verifiedAt": "Jun 28, 2026",
    "dataClassification": "Demo",
    "sourceEvidence": "Modeled after thermally treated Burma ruby trade parcel clearing observations.",
    "observationDate": "2026-06-20",
    "transactionContext": "Dealer Estimate",
    "marketContext": "Wholesale",
    "originalCurrency": "LKR",
    "originalPrice": 1512000,
    "originalCaratWeight": 2.1,
    "treatmentEvidence": "Thermal alteration in silk needles and melted calcite edges.",
    "originEvidence": "Inclusion suite diagnostic of Burmese marble origin.",
    "reviewer": "Open 4Cs Academic Evaluator",
    "reviewDate": "2026-06-28"
  },
  {
    "referenceId": "REF-RUBY-03",
    "variety": "Ruby",
    "caratWeight": 1.85,
    "color": {
      "hue": "Pigeon Blood Red",
      "tone": "6",
      "saturation": "Vivid",
      "distribution": "Even",
      "zoning": "None"
    },
    "clarity": {
      "nakedEye": "Clean",
      "loupe10x": "Very Slight",
      "inclusionType": "Fine silk",
      "inclusionLocation": "Off-table",
      "severity": "Minor"
    },
    "cut": {
      "length": 7.3,
      "width": 5.7,
      "depth": 3.7,
      "symmetry": "Very Good",
      "polish": "Good",
      "windowing": "None",
      "extinction": "None",
      "bulging": "None"
    },
    "treatment": {
      "status": "Untreated"
    },
    "origin": {
      "value": "Myanmar",
      "reliability": "High"
    },
    "referencePrice": 1980000,
    "currency": "LKR",
    "source": "Colombo Wholesale Trade Benchmark",
    "sourceType": "Dealer Observation",
    "verificationStatus": "Verified",
    "labCertificate": "Pedagogical Benchmark Standard (Demo Data)",
    "verifiedBy": "Open 4Cs Academic Research Team",
    "verifiedAt": "Nov 04, 2026",
    "dataClassification": "Demo",
    "sourceEvidence": "Modeled after unheated Pigeon Blood ruby trade parcel clearing observations.",
    "observationDate": "2026-10-30",
    "transactionContext": "Dealer Estimate",
    "marketContext": "Wholesale",
    "originalCurrency": "LKR",
    "originalPrice": 1980000,
    "originalCaratWeight": 1.85,
    "treatmentEvidence": "Unaltered rutile silk, unexpanded negative crystals, absence of glass residue or flux.",
    "originEvidence": "High chromium fluorescence and marble-hosted inclusion morphology typical of Mogok.",
    "reviewer": "Open 4Cs Academic Evaluator",
    "reviewDate": "2026-11-04"
  }
];

for (const ref of referenceGemstones) {
  await ReferenceGemstone.findOneAndUpdate(
    { referenceId: ref.referenceId },
    ref,
    { upsert: true }
  );
}
console.log(`Seeded ${referenceGemstones.length} reference gemstones for pricing.`);

// 5. Evaluation Rules Seeding
const EvaluationRule =
  mongoose.models.EvaluationRule ||
  mongoose.model(
    "EvaluationRule",
    new mongoose.Schema(
      {
        ruleId: { type: String, required: true, unique: true },
        category: { type: String, required: true },
        description: { type: String, required: true },
        effect: { type: String, required: true },
        effectType: { type: String, default: "positive" },
        version: { type: String, default: "v4.2" },
        status: { type: String, default: "Active" },
        triggerCondition: { type: String, required: true },
        rationale: { type: String, required: true },
        author: { type: String, default: "CAGS Pricing Board" },
        lastUpdated: { type: String, default: "Sep 22, 2026" },
        sourceUrl: { type: String, default: "https://www.gia.edu/sapphire-quality-factor" },
      },
      { timestamps: true }
    )
  );

const rulesToSeed = [
  {
    ruleId: "COL-03",
    category: "Color",
    description: "Vivid saturation + tone 5–6 premium",
    effect: "+9%",
    effectType: "positive",
    version: "v4.2",
    status: "Active",
    triggerCondition: "Tone between 5.0 and 6.0 AND Saturation === 'Vivid'",
    rationale: "Colombo lot data shows a consistent 9% price premium for medium-deep vivid blue corundum without extinction.",
    lastUpdated: "Sep 22, 2026",
    author: "Dr. K. Mendis",
  },
  {
    ruleId: "CLA-02",
    category: "Clarity",
    description: "Eye-clean with off-table silk",
    effect: "+3%",
    effectType: "positive",
    version: "v4.2",
    status: "Active",
    triggerCondition: "Naked eye clarity === 'Eye Clean' AND Rutile silk off-center",
    rationale: "Microscopic silk outside the central table facet softens dispersion positively without impeding light return.",
    lastUpdated: "Sep 18, 2026",
    author: "Prof. S. Wickramasinghe",
  },
  {
    ruleId: "CUT-02",
    category: "Cut",
    description: "Depth > 70% penalty",
    effect: "-2%",
    effectType: "negative",
    version: "v4.2",
    status: "Active",
    triggerCondition: "Depth percentage > 70.0%",
    rationale: "Excess pavilion depth traps dead weight that yields no face-up millimeter spread, resulting in trade discount.",
    lastUpdated: "Sep 14, 2026",
    author: "Master Cutter N. Perera",
  },
  {
    ruleId: "TRT-01",
    category: "Pricing",
    description: "Heated (H) verified modifier",
    effect: "-4%",
    effectType: "negative",
    version: "v4.2",
    status: "Active",
    triggerCondition: "Treatment === 'Heated (H)' without diffusion",
    rationale: "Traditional heat treatment benchmark baseline adjustment relative to prime natural unheated standard.",
    lastUpdated: "Sep 22, 2026",
    author: "CAGS Pricing Board",
  },
  {
    ruleId: "ORG-02",
    category: "Pricing",
    description: "Ceylon premium capped if unverified",
    effect: "+0-5%",
    effectType: "positive",
    version: "v4.2",
    status: "Active",
    triggerCondition: "Origin === 'Sri Lanka' AND Lab Report !== 'Accredited'",
    rationale: "Unverified trade origin declarations are restricted to conservative baseline ranges to maintain pricing integrity.",
    lastUpdated: "Aug 30, 2026",
    author: "CAGS Audit Committee",
  },
  {
    ruleId: "PM-4.3",
    category: "Pricing",
    description: "Unheated premium revision",
    effect: "+18%",
    effectType: "positive",
    version: "draft",
    status: "Pending",
    triggerCondition: "Treatment === 'Natural Unheated' AND Weight >= 2.00ct",
    rationale: "Elevates scarcity tier multiplier for verified untreated Ceylon blue sapphires following 2026 Q3 Colombo auction clearance.",
    lastUpdated: "Oct 28, 2026",
    author: "Dr. K. Mendis",
  },
];

for (const r of rulesToSeed) {
  await EvaluationRule.findOneAndUpdate({ ruleId: r.ruleId }, r, { upsert: true });
}
console.log(`Seeded ${rulesToSeed.length} evaluation rules.`);

console.log("Database seeding completed successfully.");
await mongoose.disconnect();
