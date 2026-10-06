import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import ReferenceGemstone from "@/models/ReferenceGemstone";
import Gemstone from "@/models/Gemstone";

async function requireAdmin() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return null;
  }

  return session;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAdmin();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid reference gemstone ID" },
        { status: 400 },
      );
    }

    await connectDB();

    const reference = await ReferenceGemstone.findById(id)
      .populate(
        "gemstoneId",
        "code name species supportedOrigin supportedShapes",
      )
      .lean();

    if (!reference) {
      return NextResponse.json(
        { success: false, message: "Reference gemstone not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      reference,
    });
  } catch (error) {
    console.error("GET reference gemstone error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve reference gemstone",
      },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAdmin();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid reference gemstone ID" },
        { status: 400 },
      );
    }

    const body = await request.json();

    await connectDB();

    const existing = await ReferenceGemstone.findById(id);

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Reference gemstone not found" },
        { status: 404 },
      );
    }

    if (body.referenceId !== undefined) {
      const referenceId = String(body.referenceId).trim().toUpperCase();

      if (!referenceId) {
        return NextResponse.json(
          { success: false, message: "Reference ID is required" },
          { status: 400 },
        );
      }

      const duplicate = await ReferenceGemstone.findOne({
        referenceId,
        _id: { $ne: id },
      });

      if (duplicate) {
        return NextResponse.json(
          {
            success: false,
            message: "A reference gemstone with this ID already exists",
          },
          { status: 409 },
        );
      }

      existing.referenceId = referenceId;
    }

    if (body.gemstoneId !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(body.gemstoneId)) {
        return NextResponse.json(
          { success: false, message: "Invalid gemstone" },
          { status: 400 },
        );
      }

      const gemstone = await Gemstone.findById(body.gemstoneId);

      if (!gemstone) {
        return NextResponse.json(
          { success: false, message: "Selected gemstone does not exist" },
          { status: 400 },
        );
      }

      existing.gemstoneId = gemstone._id;
    }

    const stringFields = [
      "origin",
      "originVerification",
      "color",
      "clarity",
      "cut",
      "treatment",
      "treatmentVerification",
      "priceCurrency",
      "verificationStatus",
      "source",
      "notes",
    ] as const;

    for (const field of stringFields) {
      if (body[field] !== undefined) {
        existing[field] =
          body[field] === null ? "" : String(body[field]).trim();
      }
    }

    const numberFields = [
      "caratWeight",
      "referencePrice",
      "pricePerCarat",
    ] as const;

    for (const field of numberFields) {
      if (body[field] !== undefined) {
        if (
          body[field] === "" ||
          body[field] === null ||
          body[field] === undefined
        ) {
          existing[field] = undefined;
          continue;
        }

        const value = Number(body[field]);

        if (!Number.isFinite(value) || value < 0) {
          return NextResponse.json(
            {
              success: false,
              message: `${field} must be a valid non-negative number`,
            },
            { status: 400 },
          );
        }

        existing[field] = value;
      }
    }

    if (body.status !== undefined) {
      if (!["ACTIVE", "INACTIVE"].includes(body.status)) {
        return NextResponse.json(
          { success: false, message: "Invalid status" },
          { status: 400 },
        );
      }

      existing.status = body.status;
    }

    await existing.save();

    const updatedReference = await ReferenceGemstone.findById(existing._id)
      .populate(
        "gemstoneId",
        "code name species supportedOrigin supportedShapes",
      )
      .lean();

    return NextResponse.json({
      success: true,
      reference: updatedReference,
    });
  } catch (error) {
    console.error("PUT reference gemstone error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update reference gemstone",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAdmin();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid reference gemstone ID" },
        { status: 400 },
      );
    }

    await connectDB();

    const reference = await ReferenceGemstone.findById(id);

    if (!reference) {
      return NextResponse.json(
        { success: false, message: "Reference gemstone not found" },
        { status: 404 },
      );
    }

    // Soft delete / deactivate
    reference.status = "INACTIVE";
    await reference.save();

    return NextResponse.json({
      success: true,
      message: "Reference gemstone deactivated successfully",
    });
  } catch (error) {
    console.error("DELETE reference gemstone error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to deactivate reference gemstone",
      },
      { status: 500 },
    );
  }
}
