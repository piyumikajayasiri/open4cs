import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { connectToDatabase } from "@/lib/mongodb";
import OriginOption from "@/models/OriginOption";
import { ENGINE_SUPPORTED_ORIGINS } from "@/lib/evaluation/rules";

export async function GET() {
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

    await connectToDatabase();

    const originOptions = await OriginOption.find({})
      .sort({ name: 1 })
      .lean();

    return NextResponse.json(
      { originOptions },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to fetch origin options:", error);
    return NextResponse.json(
      { error: "Failed to fetch origin options." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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

    const data = await request.json();

    const rawName = typeof data.name === "string" ? data.name.trim() : "";
    const description =
      typeof data.description === "string" ? data.description.trim() : "";

    if (!rawName) {
      return NextResponse.json(
        { error: "Origin option name is required." },
        { status: 400 }
      );
    }

    const canonicalName = ENGINE_SUPPORTED_ORIGINS.find(
      (supportedName) => supportedName.toLowerCase() === rawName.toLowerCase()
    );

    if (!canonicalName) {
      return NextResponse.json(
        {
          error:
            "This origin option is not supported by the current evaluation rules.",
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const existing = await OriginOption.findOne({
      name: { $regex: `^${canonicalName}$`, $options: "i" },
    });

    if (existing) {
      return NextResponse.json(
        { error: "This origin option already exists." },
        { status: 409 }
      );
    }

    const originOption = await OriginOption.create({
      name: canonicalName,
      description,
      isActive: true,
      engineSupported: true,
    });

    return NextResponse.json(
      {
        message: "Origin option created successfully.",
        originOption,
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error?.code === 11000) {
      return NextResponse.json(
        { error: "This origin option already exists." },
        { status: 409 }
      );
    }

    console.error("Failed to create origin option:", error);
    return NextResponse.json(
      { error: "Failed to create origin option." },
      { status: 500 }
    );
  }
}
