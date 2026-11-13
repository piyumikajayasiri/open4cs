import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { connectDB } from "@/lib/mongodb";
import Gemstone from "@/models/Gemstone";
import ReferenceGemstone from "@/models/ReferenceGemstone";
import AuditLog from "@/models/AuditLog";

async function checkAdmin(req?: NextRequest) {
  const user = await getCurrentUser(req);

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
export async function GET(req?: NextRequest) {
  try {
    const access = await checkAdmin(req);

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
    const access = await checkAdmin(request);

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

    // Strict validation of required fields — eliminate fabricated defaults
    if (caratWeight === undefined || caratWeight === null || Number.isNaN(Number(caratWeight)) || Number(caratWeight) <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Carat weight is required and must be a valid positive number.",
        },
        { status: 400 },
      );
    }

    if (referencePrice === undefined || referencePrice === null || Number.isNaN(Number(referencePrice)) || Number(referencePrice) <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Reference price is required and must be a valid positive number.",
        },
        { status: 400 },
      );
    }

    let varietyName = body.variety?.trim();
    if (gemstoneId && mongoose.Types.ObjectId.isValid(gemstoneId)) {
      const gemstone = await Gemstone.findById(gemstoneId);
      if (gemstone?.name) {
        varietyName = gemstone.name;
      }
    }
    if (!varietyName) {
      return NextResponse.json(
        { success: false, message: "Gemstone variety is required." },
        { status: 400 }
      );
    }

    if (!color || typeof color !== "object" || !color.hue) {
      return NextResponse.json(
        { success: false, message: "Color specifications (including hue) are required." },
        { status: 400 }
      );
    }

    if (!clarity || typeof clarity !== "object" || !clarity.severity) {
      return NextResponse.json(
        { success: false, message: "Clarity specifications (including severity) are required." },
        { status: 400 }
      );
    }

    if (!cut || typeof cut !== "object" || !cut.symmetry) {
      return NextResponse.json(
        { success: false, message: "Cut specifications (including symmetry) are required." },
        { status: 400 }
      );
    }

    const normTreatment = typeof treatment === "object" && treatment !== null && treatment.status
      ? { status: String(treatment.status).trim() }
      : typeof treatment === "string" && treatment.trim()
      ? { status: treatment.trim() }
      : null;

    if (!normTreatment) {
      return NextResponse.json(
        { success: false, message: "Treatment status is required." },
        { status: 400 }
      );
    }

    const normOrigin = typeof origin === "object" && origin !== null && origin.value
      ? { value: String(origin.value).trim(), reliability: origin.reliability || "Unknown" }
      : typeof origin === "string" && origin.trim()
      ? { value: origin.trim(), reliability: "Unknown" }
      : null;

    if (!normOrigin) {
      return NextResponse.json(
        { success: false, message: "Origin is required." },
        { status: 400 }
      );
    }

    const reference = await ReferenceGemstone.create({
      referenceId: normalizedReferenceId,
      variety: varietyName,
      caratWeight: Number(caratWeight),
      color: {
        hue: color.hue,
        tone: color.tone || "5",
        saturation: color.saturation || "Moderate",
        distribution: color.distribution || "Even",
        zoning: color.zoning || "None",
      },
      clarity: {
        nakedEye: clarity.nakedEye || "Slight",
        loupe10x: clarity.loupe10x || "Slight",
        inclusionType: clarity.inclusionType || "",
        inclusionLocation: clarity.inclusionLocation || "",
        severity: clarity.severity || "Minor",
      },
      cut: {
        length: Number(cut.length) || null,
        width: Number(cut.width) || null,
        depth: Number(cut.depth) || null,
        symmetry: cut.symmetry || "Good",
        polish: cut.polish || "Good",
        windowing: cut.windowing || "None",
        extinction: cut.extinction || "None",
        bulging: cut.bulging || "None",
      },
      treatment: normTreatment,
      origin: normOrigin,
      referencePrice: Number(referencePrice),
      currency: (priceCurrency || currency || "LKR").toUpperCase(),
      source: source ? String(source).trim() : "Market Reference",
      sourceType: body.sourceType || "Dealer Report",
      verificationStatus: verificationStatus === "Verified" ? "Verified" : "Pending",
      labCertificate: body.labCertificate || "",
      verifiedBy: verificationStatus === "Verified" ? (body.verifiedBy || access.user?.name || "CAGS Admin") : "",
      verifiedAt: verificationStatus === "Verified" ? (body.verifiedAt || new Date().toISOString()) : "",
      dataClassification: body.dataClassification === "Real" ? "Real" : "Demo",
      sourceEvidence: body.sourceEvidence || "",
      observationDate: body.observationDate || new Date().toISOString().split("T")[0],
      transactionContext: body.transactionContext || "Dealer Estimate",
      marketContext: body.marketContext || "Wholesale",
      originalCurrency: (body.originalCurrency || priceCurrency || currency || "LKR").toUpperCase(),
      originalPrice: Number(body.originalPrice) || Number(referencePrice),
      originalCaratWeight: Number(body.originalCaratWeight) || Number(caratWeight),
      treatmentEvidence: body.treatmentEvidence || "",
      originEvidence: body.originEvidence || "",
      reviewer: body.reviewer || access.user?.name || "CAGS Admin",
      reviewDate: body.reviewDate || new Date().toISOString().split("T")[0],
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
