import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { connectDB } from "@/lib/mongodb";
import Gemstone from "@/models/Gemstone";
import ReferenceGemstone from "@/models/ReferenceGemstone";

async function checkAdmin() {
  const user = await getCurrentUser();

  if (!user) {
    return {
      authorized: false,
      status: 401,
      message: "Authentication required.",
    };
  }

  if (user.role !== "CAGS_ADMIN") {
    return {
      authorized: false,
      status: 403,
      message: "CAGS Admin access required.",
    };
  }

  return {
    authorized: true,
    user,
  };
}

// GET ALL REFERENCE GEMSTONES
export async function GET() {
  try {
    const access = await checkAdmin();

    if (!access.authorized) {
      return NextResponse.json(
        {
          success: false,
          message: access.message,
        },
        { status: access.status },
      );
    }

    await connectDB();

    const references = await ReferenceGemstone.find()
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      references,
    });
  } catch (error) {
    console.error("Get reference gemstones error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to retrieve reference gemstones.",
      },
      { status: 500 },
    );
  }
}

// CREATE REFERENCE GEMSTONE
export async function POST(request: NextRequest) {
  try {
    const access = await checkAdmin();

    if (!access.authorized) {
      return NextResponse.json(
        {
          success: false,
          message: access.message,
        },
        { status: access.status },
      );
    }

    const body = await request.json();

    const {
      referenceId,
      gemstoneId,
      origin,
      color,
      clarity,
      cut,
      caratWeight,
      treatment,
      referencePrice,
      priceCurrency,
      currency,
      verificationStatus,
      source,
    } = body;

    if (!referenceId) {
      return NextResponse.json(
        {
          success: false,
          message: "Reference ID is required.",
        },
        { status: 400 },
      );
    }

    await connectDB();

    // Check duplicate reference ID
    const normalizedReferenceId = String(referenceId).trim().toUpperCase();

    const existingReference = await ReferenceGemstone.findOne({
      referenceId: normalizedReferenceId,
    });

    if (existingReference) {
      return NextResponse.json(
        {
          success: false,
          message: "A reference gemstone with this ID already exists.",
        },
        { status: 409 },
      );
    }

    // Validate numeric values
    if (
      caratWeight !== undefined &&
      caratWeight !== null &&
      (Number.isNaN(Number(caratWeight)) || Number(caratWeight) < 0)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Carat weight must be a valid positive number.",
        },
        { status: 400 },
      );
    }

    if (
      referencePrice !== undefined &&
      referencePrice !== null &&
      (Number.isNaN(Number(referencePrice)) || Number(referencePrice) < 0)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Reference price must be a valid positive number.",
        },
        { status: 400 },
      );
    }

    let varietyName = body.variety || "Blue Sapphire";
    if (gemstoneId && mongoose.Types.ObjectId.isValid(gemstoneId)) {
      const gemstone = await Gemstone.findById(gemstoneId);
      if (gemstone?.name) {
        varietyName = gemstone.name;
      }
    }

    const reference = await ReferenceGemstone.create({
      referenceId: normalizedReferenceId,
      variety: varietyName,
      caratWeight: Number(caratWeight) || 2.0,
      color: typeof color === "object" && color !== null ? color : {
        hue: typeof color === "string" ? color : "Royal Blue",
        tone: "6",
        saturation: "Vivid",
        distribution: "Even",
        zoning: "None",
      },
      clarity: typeof clarity === "object" && clarity !== null ? clarity : {
        nakedEye: typeof clarity === "string" ? clarity : "Clean",
        loupe10x: "Very Slight",
        inclusionType: "Minor silk",
        inclusionLocation: "Off-table",
        severity: "Minor",
      },
      cut: typeof cut === "object" && cut !== null ? cut : {
        length: 8.0,
        width: 6.5,
        depth: 4.0,
        symmetry: "Good",
        polish: "Good",
        windowing: "None",
        extinction: "None",
        bulging: "None",
      },
      treatment: typeof treatment === "object" && treatment !== null ? treatment : {
        status: typeof treatment === "string" ? treatment : "Untreated",
      },
      origin: typeof origin === "object" && origin !== null ? origin : {
        value: typeof origin === "string" ? origin : "Sri Lanka",
        reliability: "High",
      },
      referencePrice: Number(referencePrice) || 600000,
      currency: (priceCurrency || currency || "LKR").toUpperCase(),
      source: source ? String(source).trim() : "Desk",
      sourceType: body.sourceType || "Desk",
      verificationStatus: verificationStatus || "Verified",
      labCertificate: body.labCertificate || "",
      verifiedBy: body.verifiedBy || "CAGS Admin",
      verifiedAt: body.verifiedAt || new Date().toISOString(),
    });

    const populatedReference = await ReferenceGemstone.findById(reference._id).lean();

    return NextResponse.json(
      {
        success: true,
        message: "Reference gemstone created successfully.",
        reference: populatedReference,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create reference gemstone error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to create reference gemstone.",
      },
      { status: 500 },
    );
  }
}
