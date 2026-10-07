import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { connectToDatabase } from "@/lib/mongodb";
import RuleVersion from "@/models/RuleVersion";

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

    const ruleVersions = await RuleVersion.find({})
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      { ruleVersions },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to fetch rule versions:", error);
    return NextResponse.json(
      { error: "Failed to fetch rule versions." },
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

    const version = typeof data.version === "string" ? data.version.trim() : "";
    const name = typeof data.name === "string" ? data.name.trim() : "";
    const description = typeof data.description === "string" ? data.description.trim() : "";
    const status = data.status || "DRAFT";

    if (!version) {
      return NextResponse.json(
        { error: "Rule version identifier is required." },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { error: "Rule version name is required." },
        { status: 400 }
      );
    }

    if (!description) {
      return NextResponse.json(
        { error: "Rule version description is required." },
        { status: 400 }
      );
    }

    if (!["DRAFT", "ACTIVE", "ARCHIVED"].includes(status)) {
      return NextResponse.json(
        { error: "Status must be DRAFT, ACTIVE, or ARCHIVED." },
        { status: 400 }
      );
    }

    if (status !== "DRAFT") {
      return NextResponse.json(
        {
          error:
            "New rule versions must be created as DRAFT. Activation is not available until the evaluation engine supports version-specific rule configurations.",
        },
        { status: 400 }
      );
    }

    const weights = data.fourCWeights;
    if (
      !weights ||
      typeof weights.color !== "number" ||
      typeof weights.clarity !== "number" ||
      typeof weights.cut !== "number" ||
      typeof weights.carat !== "number" ||
      weights.color < 0 || weights.color > 1 ||
      weights.clarity < 0 || weights.clarity > 1 ||
      weights.cut < 0 || weights.cut > 1 ||
      weights.carat < 0 || weights.carat > 1
    ) {
      return NextResponse.json(
        { error: "All 4C weights (color, clarity, cut, carat) must be numbers between 0 and 1." },
        { status: 400 }
      );
    }

    const totalWeight = weights.color + weights.clarity + weights.cut + weights.carat;
    if (Math.abs(totalWeight - 1) > 0.0001) {
      return NextResponse.json(
        { error: "The sum of 4C weights must equal 1.0." },
        { status: 400 }
      );
    }

    const priceRangePercentage = Number(data.priceRangePercentage);
    if (
      !Number.isFinite(priceRangePercentage) ||
      priceRangePercentage < 0 ||
      priceRangePercentage > 1
    ) {
      return NextResponse.json(
        { error: "Price range percentage must be a number between 0 and 1." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const existingVersion = await RuleVersion.findOne({ version });
    if (existingVersion) {
      return NextResponse.json(
        { error: "A rule version with this version identifier already exists." },
        { status: 409 }
      );
    }

    const ruleVersion = await RuleVersion.create({
      version,
      name,
      description,
      status: "DRAFT",
      fourCWeights: {
        color: weights.color,
        clarity: weights.clarity,
        cut: weights.cut,
        carat: weights.carat,
      },
      priceRangePercentage,
      notes: typeof data.notes === "string" ? data.notes.trim() : "",
      approvedBy: "",
      approvedAt: null,
    });

    return NextResponse.json(
      {
        message: "Rule version created successfully.",
        ruleVersion,
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error?.code === 11000) {
      return NextResponse.json(
        { error: "A rule version with this version identifier already exists." },
        { status: 409 }
      );
    }

    console.error("Failed to create rule version:", error);
    return NextResponse.json(
      { error: "Failed to create rule version." },
      { status: 500 }
    );
  }
}
