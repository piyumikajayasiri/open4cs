import mongoose, { Document, Model, Schema } from "mongoose";

export type UserRole = "USER" | "ADMIN";

export type UserCategory = "STUDENT" | "TRADER" | "GEMOLOGIST" | "PROFESSIONAL";

export type UserStatus = "ACTIVE" | "INACTIVE";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  category: UserCategory;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
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
    },

    passwordHash: {
      type: String,
      required: true,
      select: false,
    },

    category: {
      type: String,
      enum: ["STUDENT", "TRADER", "GEMOLOGIST", "PROFESSIONAL"],
      required: true,
    },

    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
      required: true,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;

// the default user type is "USER" and the registration form doesnt have an admin option
