import mongoose from "mongoose";
import bcrypt from "bcryptjs";
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
    status: String,
  },
  { timestamps: true },
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

await mongoose.connect(uri);

const email = "admin@open4cs.local";
const password = "ChangeMe123!";

const existing = await User.findOne({ email });

if (existing) {
  existing.role = "CAGS_ADMIN";
  existing.category = "Professional";
  existing.isActive = true;
  await existing.save();
  console.log("Admin account already existed; synchronized role to CAGS_ADMIN and category to Professional.");
} else {
  const passwordHash = await bcrypt.hash(password, 12);

  await User.create({
    name: "CAGS Administrator",
    email,
    passwordHash,
    category: "Professional",
    role: "CAGS_ADMIN",
    isActive: true,
  });

  console.log("CAGS Admin created successfully.");
  console.log("Email:", email);
  console.log("Password:", password);
  console.log("Role: CAGS_ADMIN");
  console.log("Category: Professional");
}

await mongoose.disconnect();
