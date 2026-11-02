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
