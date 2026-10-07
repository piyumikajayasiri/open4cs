import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { connectToDatabase } from "@/lib/mongodb";
import TreatmentOption from "@/models/TreatmentOption";
import { ENGINE_SUPPORTED_TREATMENTS } from "@/lib/evaluation/rules";

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

    const treatmentOptions = await TreatmentOption.find({})
      .sort({ name: 1 })
      .lean();

    return NextResponse.json(
      { treatmentOptions },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to fetch treatment options:", error);
    return NextResponse.json(
      { error: "Failed to fetch treatment options." },
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
        { error: "Treatment option name is required." },
        { status: 400 }
      );
    }

    const canonicalName = ENGINE_SUPPORTED_TREATMENTS.find(
      (supportedName) => supportedName.toLowerCase() === rawName.toLowerCase()
    );

    if (!canonicalName) {
      return NextResponse.json(
        {
          error:
            "This treatment option is not supported by the current evaluation rules.",
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const existing = await TreatmentOption.findOne({
      name: { $regex: `^${canonicalName}$`, $options: "i" },
    });

    if (existing) {
      return NextResponse.json(
        { error: "This treatment option already exists." },
        { status: 409 }
      );
    }

    const treatmentOption = await TreatmentOption.create({
      name: canonicalName,
      description,
      isActive: true,
      engineSupported: true,
    });

    return NextResponse.json(
      {
        message: "Treatment option created successfully.",
        treatmentOption,
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error?.code === 11000) {
      return NextResponse.json(
        { error: "This treatment option already exists." },
        { status: 409 }
      );
    }

    console.error("Failed to create treatment option:", error);
    return NextResponse.json(
      { error: "Failed to create treatment option." },
      { status: 500 }
    );
  }
}
