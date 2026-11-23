import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI is missing from .env.local");
}

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: {
      type: String,
      unique: true,
    },
    passwordHash: String,
    category: {
      type: String,
      enum: ["Student", "Trader", "Gemologist", "Professional"],
      default: "Professional",
    },
    role: {
      type: String,
      enum: ["USER", "CAGS_ADMIN"],
      default: "CAGS_ADMIN",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      default: "ACTIVE",
    },
  },
  { timestamps: true },
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

await mongoose.connect(uri);

const email = (process.env.ADMIN_EMAIL || "admin@open4cs.local").trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD || crypto.randomBytes(12).toString("base64") + "!Aa1";

const existing = await User.findOne({ email });

if (existing) {
  existing.role = "CAGS_ADMIN";
  existing.category = "Professional";
  existing.isActive = true;
  existing.status = "ACTIVE";
  if (process.env.ADMIN_PASSWORD) {
    existing.passwordHash = await bcrypt.hash(password, 12);
  }
  await existing.save();
  console.log(`[SECURE PROVISIONING] Admin account ${email} synchronized (role: CAGS_ADMIN, status: ACTIVE).`);
} else {
  const passwordHash = await bcrypt.hash(password, 12);

  await User.create({
    name: process.env.ADMIN_NAME || "CAGS Administrator",
    email,
    passwordHash,
    category: "Professional",
    role: "CAGS_ADMIN",
    isActive: true,
    status: "ACTIVE",
  });

  console.log(`[SECURE PROVISIONING] CAGS Administrator provisioned successfully for ${email}.`);
  if (!process.env.ADMIN_PASSWORD) {
    // Only displayed once on initial setup when no env variable was supplied
    console.log(`[ONE-TIME INITIAL CREDENTIALS] Temporary password: ${password}`);
    console.log(`[ACTION REQUIRED] Store this securely and set ADMIN_PASSWORD in your environment.`);
  }
}

await mongoose.disconnect();
