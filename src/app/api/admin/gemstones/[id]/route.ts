import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import Gemstone from "@/models/Gemstone";

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

// GET ONE GEMSTONE
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid gemstone ID.",
        },
        { status: 400 },
      );
    }

    await connectDB();

    const gemstone = await Gemstone.findById(id).lean();

    if (!gemstone) {
      return NextResponse.json(
        {
          success: false,
          message: "Gemstone variety not found.",
        },
        { status: 404 },
      );
    }

    const normalizedGemstone = {
      ...gemstone,
      code: gemstone.code ?? "",
      name: gemstone.name ?? "",
      species: gemstone.species ?? "",
      supportedShapes: gemstone.supportedShapes ?? [],
      supportedOrigin: gemstone.supportedOrigin ?? "Sri Lanka",
      description: gemstone.description ?? "",
      status: gemstone.status ?? "ACTIVE",
    };

    return NextResponse.json({
      success: true,
      gemstone: normalizedGemstone,
    });
  } catch (error) {
    console.error("Get gemstone error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to retrieve gemstone variety.",
      },
      { status: 500 },
    );
  }
}

// UPDATE GEMSTONE
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid gemstone ID.",
        },
        { status: 400 },
      );
    }

    const body = await request.json();

    const {
      code,
      name,
      species,
      supportedShapes,
      supportedOrigin,
      description,
      status,
    } = body;

    if (!code || !name || !species) {
      return NextResponse.json(
        {
          success: false,
          message: "Code, name and species are required.",
        },
        { status: 400 },
      );
    }

    if (!["ACTIVE", "INACTIVE"].includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid gemstone status.",
        },
        { status: 400 },
      );
    }

    await connectDB();

    const normalizedCode = String(code).trim().toUpperCase();

    const existing = await Gemstone.findOne({
      code: normalizedCode,
      _id: { $ne: id },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Another gemstone variety already uses this code.",
        },
        { status: 409 },
      );
    }

    const gemstone = await Gemstone.findByIdAndUpdate(
      id,
      {
        code: normalizedCode,
        name: String(name).trim(),
        species: String(species).trim(),

        supportedShapes: Array.isArray(supportedShapes)
          ? supportedShapes.map((shape) => String(shape).trim()).filter(Boolean)
          : [],

        supportedOrigin:
          String(supportedOrigin || "Sri Lanka").trim() || "Sri Lanka",

        description: description ? String(description).trim() : "",

        status,
      },
      {
        new: true,
        runValidators: true,
      },
    ).lean();

    if (!gemstone) {
      return NextResponse.json(
        {
          success: false,
          message: "Gemstone variety not found.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Gemstone variety updated successfully.",
      gemstone,
    });
  } catch (error) {
    console.error("Update gemstone error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update gemstone variety.",
      },
      { status: 500 },
    );
  }
}

// DELETE = DEACTIVATE
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid gemstone ID.",
        },
        { status: 400 },
      );
    }

    await connectDB();

    const gemstone = await Gemstone.findByIdAndUpdate(
      id,
      {
        status: "INACTIVE",
      },
      {
        new: true,
        runValidators: true,
      },
    ).lean();

    if (!gemstone) {
      return NextResponse.json(
        {
          success: false,
          message: "Gemstone variety not found.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Gemstone variety deactivated successfully.",
      gemstone,
    });
  } catch (error) {
    console.error("Deactivate gemstone error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to deactivate gemstone variety.",
      },
      { status: 500 },
    );
  }
}
