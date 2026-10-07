import mongoose, { Schema, Document, Model } from "mongoose";

export interface IGemstone extends Document {
  variety: string;
  caratWeight: number;
  
  color?: {
    hue?: string;
    tone?: string;
    saturation?: string;
    distribution?: string;
    zoning?: string;
  };
  
  clarity?: {
    nakedEye?: string;
    loupe10x?: string;
    inclusionType?: string;
    inclusionLocation?: string;
    severity?: string;
  };
  
  cut?: {
    length?: number;
    width?: number;
    depth?: number;
    symmetry?: string;
    polish?: string;
    windowing?: string;
    extinction?: string;
    bulging?: string;
  };
  
  treatment?: {
    status?: string;
    type?: string;
  };
  
  origin?: {
    value?: string;
    reliability?: string;
  };

  informationReliability?: {
    measurements?: string;
    treatment?: string;
    origin?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const gemstoneSchema = new Schema<IGemstone>(
  {
    variety: {
      type: String,
      required: true,
      trim: true,
    },

    caratWeight: {
      type: Number,
      required: true,
      min: 0,
    },
    
    color: {
      hue: String,
      tone: String,
      saturation: String,
      distribution: String,
      zoning: String,
    },
    
    clarity: {
      nakedEye: String,
      loupe10x: String,
      inclusionType: String,
      inclusionLocation: String,
      severity: String,
    },
    
    cut: {
      length: Number,
      width: Number,
      depth: Number,
      symmetry: String,
      polish: String,
      windowing: String,
      extinction: String,
      bulging: String,
    },
    
    treatment: {
      status: { type: String },
      type: { type: String },
    },
    
    origin: {
      value: String,
      reliability: String,
    },

    informationReliability: {
      measurements: {
        type: String,
        default: "Unverified",
      },
      treatment: {
        type: String,
        default: "Unverified",
      },
      origin: {
        type: String,
        default: "Unverified",
      },
    },
  },
  {
    timestamps: true,
  }
);

const Gemstone: Model<IGemstone> =
  mongoose.models.Gemstone ||
  mongoose.model<IGemstone>("Gemstone", gemstoneSchema);

export default Gemstone;
