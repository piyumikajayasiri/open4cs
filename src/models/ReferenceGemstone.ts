import mongoose, { Schema } from "mongoose";

const ReferenceGemstoneSchema = new Schema(
  {
    referenceId: { type: String },
    dataKind: { type: String, enum: ["REFERENCE"], default: "REFERENCE" },
    shape: String,
    source: { type: String, default: "" }, sourceDate: String,
    description: { type: String, maxlength: 1000 },
    priceBasis: { type: String, enum: ["RETAIL_ESTIMATE", "B2B_QUOTE", "COMPLETED_SALE"] },
    verificationStatus: { type: String, enum: ["PENDING", "VERIFIED", "REJECTED"], default: "PENDING" },
    qualityReviewed: { type: Boolean, default: false }, permittedUseConfirmed: { type: Boolean, default: false },
    createdBy: String, verifiedBy: String, verifiedByName: String, verifiedAt: Date,
    lastEditedBy: String, lastEditedByName: String,
    revision: { type: Number, default: 0 }, deletedAt: { type: Date, default: null }, deletedBy: String,
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
      default: "USD",
    },
  },
  {
    timestamps: true,
  }
);

// A distinct name permits this sparse index to coexist with legacy referenceId_1 indexes.
ReferenceGemstoneSchema.index({ referenceId: 1 }, { unique: true, sparse: true, name: "referenceId_sparse_unique" });

const ReferenceGemstone =
  mongoose.models.ReferenceGemstone ||
  mongoose.model(
    "ReferenceGemstone",
    ReferenceGemstoneSchema
  );

export default ReferenceGemstone;
