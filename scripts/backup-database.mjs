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
console.log("Connected to MongoDB for database backup...");

const db = mongoose.connection.db;

const backupDir = path.resolve("backups");
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupFilePath = path.join(backupDir, `baseline-evidence-backup-${timestamp}.json`);

const referenceGemstones = await db.collection("referencegemstones").find({}).toArray();
const evaluations = await db.collection("evaluations").find({}).toArray();
const gemstonevarieties = await db.collection("gemstonevarieties").find({}).toArray();

const backupData = {
  timestamp: new Date().toISOString(),
  counts: {
    referencegemstones: referenceGemstones.length,
    evaluations: evaluations.length,
    gemstonevarieties: gemstonevarieties.length,
  },
  referenceGemstones,
  evaluations,
  gemstonevarieties,
};

fs.writeFileSync(backupFilePath, JSON.stringify(backupData, null, 2), "utf8");
console.log(`Backup completed successfully to ${backupFilePath}`);
console.log(`Saved ${referenceGemstones.length} reference gemstones, ${evaluations.length} evaluations.`);

await mongoose.disconnect();
