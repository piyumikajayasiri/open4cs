import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    passwordHash: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      enum: [
        "Student",
        "Trader",
        "Gemologist",
        "Professional",
      ],
      required: true,
    },

    organization: {
      type: String,
      default: "Perera Gems · Beruwala",
      trim: true,
    },

    preferredLanguage: {
      type: String,
      default: "English",
    },

    reportCurrency: {
      type: String,
      default: "LKR — Sri Lankan Rupee",
    },

    notifications: {
      evaluationComplete: { type: Boolean, default: true },
      referenceDataUpdates: { type: Boolean, default: true },
      ruleVersionChanges: { type: Boolean, default: true },
      weeklyMarketDigest: { type: Boolean, default: false },
    },

    role: {
      type: String,
      enum: ["USER", "CAGS_ADMIN"],
      default: "USER",
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const User =
  mongoose.models.User ||
  mongoose.model("User", UserSchema);

export default User;
