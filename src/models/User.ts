import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

export const USER_CATEGORIES = ["STUDENT", "TRADER", "GEMOLOGIST", "PROFESSIONAL"] as const;
export const USER_ROLES = ["USER", "ADMIN"] as const;
export const USER_STATUSES = ["ACTIVE", "INACTIVE"] as const;
export type UserCategory = (typeof USER_CATEGORIES)[number];

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },

    passwordHash: {
      type: String,
      required: true,
      select: false,
    },

    category: {
      type: String,
      enum: USER_CATEGORIES,
      trim: true,
      uppercase: true,
      required: true,
    },

    role: {
      type: String,
      enum: USER_ROLES,
      default: "USER",
      required: true,
    },

    // Retained while older account records are migrated.
    isActive: { type: Boolean },

    status: {
      type: String,
      enum: USER_STATUSES,
      default: function () {
        return this.isActive === false ? "INACTIVE" : "ACTIVE";
      },
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

type UserRecord = InferSchemaType<typeof UserSchema>;

const User: Model<UserRecord> =
  mongoose.models.User ||
  mongoose.model("User", UserSchema);

export default User;
