import mongoose, { Schema } from "mongoose";

const ReferenceGemstoneSchema = new Schema(
  {
    referenceId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    lotId: {
      type: String,
      default: "",
      trim: true,
    },

    species: {
      type: String,
      default: "Corundum",
      trim: true,
    },

    variety: {
      type: String,
      required: true,
      trim: true,
    },

    naturalStatus: {
      type: String,
      enum: ["Natural", "Synthetic", "Lab-Grown"],
      default: "Natural",
    },

    caratWeight: {
      type: Number,
      required: true,
    },

    shape: {
      type: String,
      default: "Oval",
      trim: true,
    },

    dimensions: {
      length: { type: Number, default: null },
      width: { type: Number, default: null },
      depth: { type: Number, default: null },
    },

    sourceColor: {
      type: String,
      default: "",
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

    claritySystem: {
      type: String,
      default: "CAGS / GIA Corundum Scale",
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

    treatmentEvidence: {
      type: String,
      default: "",
    },

    claimedOrigin: {
      type: String,
      default: "",
    },

    labOrigin: {
      type: String,
      default: "",
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

    originEvidence: {
      type: String,
      default: "",
    },

    labName: {
      type: String,
      default: "",
    },

    labReportNumber: {
      type: String,
      default: "",
    },

    labReportUrl: {
      type: String,
      default: "",
    },

    labCertificate: {
      type: String,
      default: "",
    },

    referencePrice: {
      type: Number,
      required: true,
    },

    priceAmount: {
      type: Number,
      default: null,
    },

    pricePerCarat: {
      type: Number,
      default: null,
    },

    priceUnit: {
      type: String,
      enum: ["total", "per_carat"],
      default: "total",
    },

    currency: {
      type: String,
      required: true,
      default: "LKR",
    },

    feesDisclosed: {
      type: String,
      default: "",
    },

    taxesDisclosed: {
      type: String,
      default: "",
    },

    netPrice: {
      type: Number,
      default: null,
    },

    source: {
      type: String,
      default: "Desk",
    },

    sourceType: {
      type: String,
      default: "Desk",
    },

    sourceUrl: {
      type: String,
      default: "",
    },

    publisher: {
      type: String,
      default: "",
    },

    evidenceNotes: {
      type: String,
      default: "",
    },

    evidenceAttachments: {
      type: [String],
      default: [],
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

    verificationStatus: {
      type: String,
      enum: ["Draft", "Pending", "Verified", "Rejected", "Archived"],
      default: "Pending",
    },

    rejectionReason: {
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

    reviewer: {
      type: String,
      default: "",
    },

    reviewDate: {
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

    saleDate: {
      type: String,
      default: "",
    },

    listingDate: {
      type: String,
      default: "",
    },

    retrievalDate: {
      type: String,
      default: "",
    },

    marketLocation: {
      type: String,
      default: "",
    },

    transactionContext: {
      type: String,
      enum: [
        "Completed Sale",
        "Auction Hammer",
        "Auction Realised (With Premium)",
        "Retail Asking Price",
        "Dealer Quotation",
        "Guide Estimate",
        "Demonstration Data",
        "Dealer Estimate",
      ],
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

    photoUrl: {
      type: String,
      default: "",
    },

    photoAttribution: {
      type: String,
      default: "",
    },

    photoReusePermitted: {
      type: Boolean,
      default: true,
    },

    limitations: {
      type: String,
      default: "",
    },

    missingFields: {
      type: [String],
      default: [],
    },

    version: {
      type: Number,
      default: 1,
    },

    previousVersionId: {
      type: Schema.Types.ObjectId,
      ref: "ReferenceGemstone",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

ReferenceGemstoneSchema.index({ variety: 1, dataClassification: 1, verificationStatus: 1 });
ReferenceGemstoneSchema.index({ referenceId: 1 }, { unique: true, sparse: true });

const ReferenceGemstone =
  mongoose.models.ReferenceGemstone ||
  mongoose.model("ReferenceGemstone", ReferenceGemstoneSchema);

export default ReferenceGemstone;
