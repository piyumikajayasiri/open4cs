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
      select: false,
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

    status: {
      type: String,
      enum: ["ACTIVE", "SUSPENDED"],
      default: "ACTIVE",
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

export interface SafeUserDTO {
  id: string;
  name: string;
  email: string;
  category: string;
  organization?: string;
  preferredLanguage?: string;
  reportCurrency?: string;
  role: "USER" | "CAGS_ADMIN";
  status: "ACTIVE" | "SUSPENDED";
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export function toSafeUserDTO(user: {
  _id?: unknown;
  id?: unknown;
  name?: string;
  email?: string;
  category?: string;
  organization?: string;
  preferredLanguage?: string;
  reportCurrency?: string;
  role?: string;
  status?: string;
  isActive?: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}): SafeUserDTO {
  return {
    id: user._id ? String(user._id) : String(user.id || ""),
    name: user.name || "",
    email: user.email || "",
    category: user.category || "Professional",
    organization: user.organization || "",
    preferredLanguage: user.preferredLanguage || "English",
    reportCurrency: user.reportCurrency || "LKR — Sri Lankan Rupee",
    role: (user.role as "USER" | "CAGS_ADMIN") || "USER",
    status: (user.status as "ACTIVE" | "SUSPENDED") || "ACTIVE",
    isActive: user.isActive !== false,
    createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : undefined,
    updatedAt: user.updatedAt ? new Date(user.updatedAt).toISOString() : undefined,
  };
}

export default User;
