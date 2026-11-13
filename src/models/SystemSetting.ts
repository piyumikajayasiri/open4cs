import mongoose, { Schema } from "mongoose";

export interface ISystemSetting {
  key: string;
  orgName: string;
  adminEmail: string;
  baseCurrency: string;
  activeRuleset: string;
  updatedBy?: string;
  updatedAt?: Date;
}

const SystemSettingSchema = new Schema<ISystemSetting>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: "default_cags_governance",
    },
    orgName: {
      type: String,
      required: true,
      default: "Ceylon Academy of Gemmological Science (CAGS)",
      trim: true,
    },
    adminEmail: {
      type: String,
      required: true,
      default: "admin@cags.lk",
      trim: true,
    },
    baseCurrency: {
      type: String,
      required: true,
      default: "LKR — Sri Lankan Rupee",
    },
    activeRuleset: {
      type: String,
      required: true,
      default: "v4.2 (Color 35% · Clarity 25% · Cut 20% · Carat 20%)",
    },
    updatedBy: {
      type: String,
      default: "System Initializer",
    },
  },
  {
    timestamps: true,
  }
);

const SystemSetting =
  mongoose.models.SystemSetting ||
  mongoose.model<ISystemSetting>("SystemSetting", SystemSettingSchema);

export default SystemSetting;
