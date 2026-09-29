import { NextRequest, NextResponse } from "next/server";
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

// GET
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

    const gemstones = await Gemstone.find().sort({ name: 1 }).lean();

    const normalizedGemstones = gemstones.map((gemstone) => ({
      ...gemstone,

      code: gemstone.code ?? "",
      name: gemstone.name ?? "",
      species: gemstone.species ?? "",
      supportedShapes: gemstone.supportedShapes ?? [],
      supportedOrigin: gemstone.supportedOrigin ?? "Sri Lanka",
      description: gemstone.description ?? "",
      status: gemstone.status ?? "ACTIVE",
    }));

    return NextResponse.json({
      success: true,
      gemstones: normalizedGemstones,
    });
  } catch (error) {
    console.error("Get gemstones error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to retrieve gemstone catalogue.",
      },
      { status: 500 },
    );
  }
}

// POST
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

    const finalOrigin = supportedOrigin?.trim() || "Sri Lanka";

    const finalStatus = status || "ACTIVE";

    if (!["ACTIVE", "INACTIVE"].includes(finalStatus)) {
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
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: "A gemstone variety with this code already exists.",
        },
        { status: 409 },
      );
    }

    const gemstone = await Gemstone.create({
      code: normalizedCode,
      name: String(name).trim(),
      species: String(species).trim(),

      supportedShapes: Array.isArray(supportedShapes)
        ? supportedShapes.map((shape) => String(shape).trim()).filter(Boolean)
        : [],

      supportedOrigin: finalOrigin,

      description: description ? String(description).trim() : undefined,

      status: finalStatus,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Gemstone variety created successfully.",
        gemstone,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create gemstone error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to create gemstone variety.",
      },
      { status: 500 },
    );
  }
}
