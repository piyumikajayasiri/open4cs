import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { connectToDatabase } from "@/lib/mongodb";
import GemstoneVariety from "@/models/GemstoneVariety";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _request: Request,
  context: RouteContext
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    if (user.role !== "CAGS_ADMIN") {
      return NextResponse.json(
        { error: "CAGS Admin access required." },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid gemstone variety ID." },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const gemstoneVariety = await GemstoneVariety.findById(id).lean();

    if (!gemstoneVariety) {
      return NextResponse.json(
        { error: "Gemstone variety not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ gemstoneVariety });
  } catch (error) {
    console.error("Failed to fetch gemstone variety:", error);
    return NextResponse.json(
      { error: "Failed to fetch gemstone variety." },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  context: RouteContext
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    if (user.role !== "CAGS_ADMIN") {
      return NextResponse.json(
        { error: "CAGS Admin access required." },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid gemstone variety ID." },
        { status: 400 }
      );
    }

    const data = await request.json();
    const updates: Record<string, unknown> = {};

    if (typeof data.description === "string") {
      const cleanDescription = data.description.trim();
      if (cleanDescription.length > 500) {
        return NextResponse.json(
          { error: "Description must be 500 characters or fewer." },
          { status: 400 }
        );
      }
      updates.description = cleanDescription;
    }

    if (typeof data.isActive === "boolean") {
      updates.isActive = data.isActive;
    }

    if (typeof data.status === "string") {
      updates.isActive = data.status === "Supported";
    }

    if (typeof data.species === "string" && data.species.trim()) {
      updates.species = data.species.trim();
    }

    if (typeof data.ruleVersion === "string") {
      updates.ruleVersion = data.ruleVersion.trim();
    }

    if (Array.isArray(data.supportedShapes)) {
      updates.supportedShapes = data.supportedShapes;
    } else if (typeof data.shapes === "string") {
      updates.supportedShapes = data.shapes.split("/").map((s: string) => s.trim()).filter(Boolean);
    }

    if (typeof data.engineSupported === "boolean") {
      updates.engineSupported = data.engineSupported;
    }

    await connectToDatabase();

    const gemstoneVariety = await GemstoneVariety.findByIdAndUpdate(
      id,
      { $set: updates },
      {
        new: true,
        runValidators: true,
      }
    ).lean();

    if (!gemstoneVariety) {
      return NextResponse.json(
        { error: "Gemstone variety not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Gemstone variety updated successfully.",
      gemstoneVariety,
    });
  } catch (error) {
    console.error("Failed to update gemstone variety:", error);
    return NextResponse.json(
      { error: "Failed to update gemstone variety." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: RouteContext
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    if (user.role !== "CAGS_ADMIN") {
      return NextResponse.json(
        { error: "CAGS Admin access required." },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid gemstone variety ID." },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const result = await GemstoneVariety.findByIdAndDelete(id);

    if (!result) {
      return NextResponse.json(
        { error: "Gemstone variety not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Gemstone variety deleted successfully.",
    });
  } catch (error) {
    console.error("Failed to delete gemstone variety:", error);
    return NextResponse.json(
      { error: "Failed to delete gemstone variety." },
      { status: 500 }
    );
  }
}
