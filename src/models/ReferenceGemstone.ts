import mongoose, { Schema } from "mongoose";

const ReferenceGemstoneSchema = new Schema(
  {
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

const ReferenceGemstone =
  mongoose.models.ReferenceGemstone ||
  mongoose.model(
    "ReferenceGemstone",
    ReferenceGemstoneSchema
  );

export default ReferenceGemstone;
