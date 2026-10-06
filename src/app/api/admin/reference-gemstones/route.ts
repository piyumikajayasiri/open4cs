import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import Gemstone from "@/models/Gemstone";
import ReferenceGemstone from "@/models/ReferenceGemstone";

async function checkAdmin() {
  const session = await auth();

  if (!session?.user) {
    return {
      authorized: false,
      status: 401,
      message: "Authentication required.",
    };
  }

  if (session.user.role !== "ADMIN") {
    return {
      authorized: false,
      status: 403,
      message: "Admin access required.",
    };
  }

  return {
    authorized: true,
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
      .populate({
        path: "gemstoneId",
        select: "code name species supportedOrigin",
      })
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
      originVerification,
      color,
      clarity,
      cut,
      caratWeight,
      treatment,
      treatmentVerification,
      referencePrice,
      pricePerCarat,
      priceCurrency,
      verificationStatus,
      source,
      notes,
      status,
    } = body;

    if (!referenceId || !gemstoneId) {
      return NextResponse.json(
        {
          success: false,
          message: "Reference ID and gemstone variety are required.",
        },
        { status: 400 },
      );
    }

    await connectDB();

    // Check gemstone exists
    const gemstone = await Gemstone.findById(gemstoneId);

    if (!gemstone) {
      return NextResponse.json(
        {
          success: false,
          message: "Selected gemstone variety was not found.",
        },
        { status: 404 },
      );
    }

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

    if (
      pricePerCarat !== undefined &&
      pricePerCarat !== null &&
      (Number.isNaN(Number(pricePerCarat)) || Number(pricePerCarat) < 0)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Price per carat must be a valid positive number.",
        },
        { status: 400 },
      );
    }

    const finalStatus = status === "INACTIVE" ? "INACTIVE" : "ACTIVE";

    const reference = await ReferenceGemstone.create({
      referenceId: normalizedReferenceId,
      gemstoneId,

      origin: origin ? String(origin).trim() : undefined,
      originVerification: originVerification
        ? String(originVerification).trim()
        : undefined,

      color: color ? String(color).trim() : undefined,
      clarity: clarity ? String(clarity).trim() : undefined,
      cut: cut ? String(cut).trim() : undefined,

      caratWeight:
        caratWeight !== undefined && caratWeight !== null && caratWeight !== ""
          ? Number(caratWeight)
          : undefined,

      treatment: treatment ? String(treatment).trim() : undefined,

      treatmentVerification: treatmentVerification
        ? String(treatmentVerification).trim()
        : undefined,

      referencePrice:
        referencePrice !== undefined &&
        referencePrice !== null &&
        referencePrice !== ""
          ? Number(referencePrice)
          : undefined,

      pricePerCarat:
        pricePerCarat !== undefined &&
        pricePerCarat !== null &&
        pricePerCarat !== ""
          ? Number(pricePerCarat)
          : undefined,

      priceCurrency: priceCurrency
        ? String(priceCurrency).trim().toUpperCase()
        : undefined,

      verificationStatus: verificationStatus
        ? String(verificationStatus).trim()
        : undefined,

      source: source ? String(source).trim() : undefined,

      notes: notes ? String(notes).trim() : undefined,

      status: finalStatus,
    });

    const populatedReference = await ReferenceGemstone.findById(reference._id)
      .populate({
        path: "gemstoneId",
        select: "code name species supportedOrigin",
      })
      .lean();

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
