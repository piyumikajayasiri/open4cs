import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config({ path: ".env.local" });

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("MONGODB_URI is missing from .env.local");
}

await mongoose.connect(uri);
console.log("Connected to MongoDB for schema migration...");

const db = mongoose.connection.db;
const refCollection = db.collection("referencegemstones");
const evalCollection = db.collection("evaluations");

// 1. Backfill existing records
const existingRefs = await refCollection.find({}).toArray();
console.log(`Found ${existingRefs.length} existing reference gemstones to backfill...`);

for (const ref of existingRefs) {
  const carat = Number(ref.caratWeight) || 1.0;
  const price = Number(ref.referencePrice) || 0;
  const pricePerCarat = ref.pricePerCarat || Math.round(price / carat);

  const updates = {
    species: ref.species || "Corundum",
    naturalStatus: ref.naturalStatus || "Natural",
    shape: ref.shape || (ref.cut?.length && ref.cut?.width && Math.abs(ref.cut.length - ref.cut.width) < 0.2 ? "Round" : "Oval"),
    dimensions: ref.dimensions || {
      length: ref.cut?.length || null,
      width: ref.cut?.width || null,
      depth: ref.cut?.depth || null,
    },
    pricePerCarat,
    priceAmount: ref.priceAmount || price,
    priceUnit: ref.priceUnit || "total",
    claritySystem: ref.claritySystem || "CAGS / GIA Corundum Scale",
    claimedOrigin: ref.claimedOrigin || ref.origin?.value || "Sri Lanka",
    labOrigin: ref.labOrigin || (ref.origin?.reliability === "High" ? ref.origin?.value : ""),
    feesDisclosed: ref.feesDisclosed || "Net dealer settlement",
    taxesDisclosed: ref.taxesDisclosed || "None",
    version: ref.version || 1,
    photoReusePermitted: ref.photoReusePermitted !== undefined ? ref.photoReusePermitted : true,
    missingFields: ref.missingFields || [],
    evidenceAttachments: ref.evidenceAttachments || [],
  };

  // If record was Demo and transactionContext was Dealer Estimate, keep explicit
  if (ref.dataClassification === "Demo" && ref.transactionContext === "Dealer Estimate") {
    updates.transactionContext = "Demonstration Data";
  }

  await refCollection.updateOne({ _id: ref._id }, { $set: updates });
}
console.log("Existing references backfilled successfully.");

// 2. Load and upsert verified real market evidence references
const evidenceFilePath = path.resolve("data", "market-references-evidence.json");
if (fs.existsSync(evidenceFilePath)) {
  const evidenceData = JSON.parse(fs.readFileSync(evidenceFilePath, "utf8"));
  console.log(`Loaded ${evidenceData.length} market evidence records from ${evidenceFilePath}`);

  let insertedCount = 0;
  let updatedCount = 0;

  for (const item of evidenceData) {
    const filter = { referenceId: item.referenceId };
    const existing = await refCollection.findOne(filter);

    const docToSave = {
      ...item,
      referencePrice: item.priceAmount,
      updatedAt: new Date(),
    };

    if (!existing) {
      docToSave.createdAt = new Date();
      await refCollection.insertOne(docToSave);
      insertedCount++;
    } else {
      await refCollection.updateOne(filter, { $set: docToSave });
      updatedCount++;
    }
  }

  console.log(`Ingestion complete: ${insertedCount} inserted, ${updatedCount} updated.`);
} else {
  console.warn(`Evidence file not found at ${evidenceFilePath}`);
}

// 3. Verify total references and existing evaluations count
const totalRefs = await refCollection.countDocuments();
const realRefsCount = await refCollection.countDocuments({ dataClassification: "Real", status: "ACTIVE" });
const wholesaleRealCount = await refCollection.countDocuments({
  dataClassification: "Real",
  status: "ACTIVE",
  transactionContext: "Completed Sale",
  marketContext: "Wholesale",
});
const totalEvals = await evalCollection.countDocuments();

console.log("\n--- Migration Verification Summary ---");
console.log(`Total Reference Gemstones in DB: ${totalRefs}`);
console.log(`Active Real-Market References: ${realRefsCount}`);
console.log(`Active Real Wholesale Completed Sales: ${wholesaleRealCount}`);
console.log(`Preserved Historical Evaluations: ${totalEvals}`);

await mongoose.disconnect();
