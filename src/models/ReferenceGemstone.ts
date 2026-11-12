import mongoose, { Schema } from "mongoose";

const ReferenceGemstoneSchema = new Schema(
  {
    referenceId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    variety: {
      type: String,
      required: true,
    },

    caratWeight: {
      type: Number,
      required: true,
    },

    color: {
      hue: {
        type: String,
        required: true,
      },
      tone: {
        type: String,
        required: true,
      },
      saturation: {
        type: String,
        required: true,
      },
      distribution: {
        type: String,
        required: true,
      },
      zoning: {
        type: String,
        required: true,
      },
    },

    clarity: {
      nakedEye: {
        type: String,
        required: true,
      },
      loupe10x: {
        type: String,
        required: true,
      },
      inclusionType: {
        type: String,
        default: "",
      },
      inclusionLocation: {
        type: String,
        default: "",
      },
      severity: {
        type: String,
        required: true,
      },
    },

    cut: {
      length: {
        type: Number,
        default: null,
      },
      width: {
        type: Number,
        default: null,
      },
      depth: {
        type: Number,
        default: null,
      },
      symmetry: {
        type: String,
        required: true,
      },
      polish: {
        type: String,
        required: true,
      },
      windowing: {
        type: String,
        required: true,
      },
      extinction: {
        type: String,
        required: true,
      },
      bulging: {
        type: String,
        required: true,
      },
    },

    treatment: {
      status: {
        type: String,
        required: true,
      },
    },

    origin: {
      value: {
        type: String,
        required: true,
      },
      reliability: {
        type: String,
        required: true,
      },
    },

    referencePrice: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      required: true,
      default: "LKR",
    },

    source: {
      type: String,
      default: "Desk",
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    sourceType: {
      type: String,
      default: "Desk",
    },

    verificationStatus: {
      type: String,
      enum: ["Verified", "Pending", "Rejected"],
      default: "Pending",
    },

    labCertificate: {
      type: String,
      default: "",
    },

    verifiedBy: {
      type: String,
      default: "",
    },

    verifiedAt: {
      type: String,
      default: "",
    },

    dataClassification: {
      type: String,
      enum: ["Real", "Demo"],
      default: "Demo",
      required: true,
    },

    sourceEvidence: {
      type: String,
      default: "",
    },

    observationDate: {
      type: String,
      default: "",
    },

    transactionContext: {
      type: String,
      enum: ["Completed Sale", "Asking Price", "Dealer Estimate"],
      default: "Dealer Estimate",
    },

    marketContext: {
      type: String,
      enum: ["Wholesale", "Retail", "Auction"],
      default: "Wholesale",
    },

    originalCurrency: {
      type: String,
      default: "LKR",
    },

    originalPrice: {
      type: Number,
      default: null,
    },

    originalCaratWeight: {
      type: Number,
      default: null,
    },

    treatmentEvidence: {
      type: String,
      default: "",
    },

    originEvidence: {
      type: String,
      default: "",
    },

    reviewer: {
      type: String,
      default: "",
    },

    reviewDate: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const ReferenceGemstone =
  mongoose.models.ReferenceGemstone ||
  mongoose.model(
    "ReferenceGemstone",
    ReferenceGemstoneSchema
  );

export default ReferenceGemstone;
