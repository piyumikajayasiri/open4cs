import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local", quiet: true });
if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is required.");

// Preview by default. Use --apply after reviewing the affected account count.
const apply = process.argv.includes("--apply");
try {
  await mongoose.connect(process.env.MONGODB_URI);
  const users = mongoose.connection.collection("users");
  const filter = { $or: [
    { role: "CAGS_ADMIN" },
    { category: { $in: ["Student", "Trader", "Gemologist", "Professional"] } },
    { status: { $exists: false } },
  ] };
  console.log(`Accounts requiring normalization: ${await users.countDocuments(filter)}`);
  if (apply) {
    const result = await users.updateMany(filter, [{ $set: {
      role: { $cond: [{ $eq: ["$role", "CAGS_ADMIN"] }, "ADMIN", "$role"] },
      category: { $toUpper: "$category" },
      status: { $ifNull: ["$status", { $cond: [{ $eq: ["$isActive", false] }, "INACTIVE", "ACTIVE"] }] },
    } }]);
    console.log(`Accounts updated: ${result.modifiedCount}`);
  } else {
    console.log("Preview only. Run with --apply to update these accounts.");
  }
} finally {
  await mongoose.disconnect();
}
