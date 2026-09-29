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
    category: String,
    role: String,
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
  console.log("Admin already exists.");
} else {
  const passwordHash = await bcrypt.hash(password, 12);

  await User.create({
    name: "CAGS Administrator",
    email,
    passwordHash,
    category: "PROFESSIONAL",
    role: "ADMIN",
    status: "ACTIVE",
  });

  console.log("Admin created successfully.");
  console.log("Email:", email);
  console.log("Password:", password);
}

await mongoose.disconnect();
