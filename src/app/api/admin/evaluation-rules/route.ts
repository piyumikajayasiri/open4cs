import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import EvaluationRule from "@/models/EvaluationRule";

const VALID_TYPES = ["GRADING", "PRICING"] as const;

function isValidConfiguration(type: string, configuration: unknown): boolean {
  if (
    !configuration ||
    typeof configuration !== "object" ||
    Array.isArray(configuration)
  ) {
    return false;
  }

  const config = configuration as Record<string, unknown>;

  if (type === "GRADING") {
    return (
      typeof config.attribute === "string" &&
      config.attribute.trim().length > 0 &&
      ["CATEGORICAL", "NUMERIC", "BOOLEAN"].includes(String(config.method)) &&
      Array.isArray(config.criteria) &&
      config.criteria.every((item: unknown) => {
        if (!item || typeof item !== "object" || Array.isArray(item)) {
          return false;
        }

        const criterion = item as Record<string, unknown>;

        return (
          typeof criterion.code === "string" &&
          criterion.code.trim().length > 0 &&
          typeof criterion.label === "string" &&
          criterion.label.trim().length > 0 &&
          (criterion.minValue === undefined ||
            (typeof criterion.minValue === "number" &&
              Number.isFinite(criterion.minValue))) &&
          (criterion.maxValue === undefined ||
            (typeof criterion.maxValue === "number" &&
              Number.isFinite(criterion.maxValue)))
        );
      })
    );
  }

  if (type === "PRICING") {
    return (
      ["REFERENCE_BASED", "FIXED_FORMULA", "RANGE_ESTIMATE"].includes(
        String(config.method),
      ) &&
      (config.currency === undefined || typeof config.currency === "string") &&
      !!config.parameters &&
      typeof config.parameters === "object" &&
      !Array.isArray(config.parameters)
    );
  }

  return false;
}

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Forbidden: administrator access required." },
        { status: 403 },
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const search = searchParams.get("search")?.trim();

    const filter: Record<string, unknown> = {};

    if (type) {
      if (!VALID_TYPES.includes(type as (typeof VALID_TYPES)[number])) {
        return NextResponse.json(
          { message: "Invalid rule type." },
          { status: 400 },
        );
      }
      filter.type = type;
    }

    if (status) {
      if (!["DRAFT", "ACTIVE", "INACTIVE"].includes(status)) {
        return NextResponse.json(
          { message: "Invalid rule status." },
          { status: 400 },
        );
      }
      filter.status = status;
    }

    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      filter.$or = [
        { name: { $regex: escapedSearch, $options: "i" } },
        { code: { $regex: escapedSearch, $options: "i" } },
      ];
    }

    const rules = await EvaluationRule.find(filter)
      .sort({ updatedAt: -1 })
      .lean();

    return NextResponse.json({ rules });
  } catch (error) {
    console.error("GET evaluation rules error:", error);

    return NextResponse.json(
      { message: "Unable to load evaluation rules." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Forbidden: administrator access required." },
        { status: 403 },
      );
    }

    const body = await request.json();

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const code =
      typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
    const type = body.type;
    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : undefined;
    const configuration = body.configuration;

    if (name.length < 2 || name.length > 150) {
      return NextResponse.json(
        { message: "Name must contain 2–150 characters." },
        { status: 400 },
      );
    }

    if (!/^[A-Z0-9_-]{2,100}$/.test(code)) {
      return NextResponse.json(
        {
          message:
            "Code must contain 2–100 uppercase letters, numbers, underscores or hyphens.",
        },
        { status: 400 },
      );
    }

    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json(
        { message: "Type must be GRADING or PRICING." },
        { status: 400 },
      );
    }

    if (description && description.length > 1000) {
      return NextResponse.json(
        { message: "Description cannot exceed 1000 characters." },
        { status: 400 },
      );
    }

    if (!isValidConfiguration(type, configuration)) {
      return NextResponse.json(
        { message: "Invalid configuration for this rule type." },
        { status: 400 },
      );
    }

    await connectDB();

    const existingRule = await EvaluationRule.findOne({ code });

    if (existingRule) {
      return NextResponse.json(
        { message: "A rule with this code already exists." },
        { status: 409 },
      );
    }

    const rule = await EvaluationRule.create({
      name,
      code,
      type,
      description,
      configuration,
      status: "DRAFT",
      version: 1,
      createdBy: session.user.id,
    });

    return NextResponse.json(
      {
        message: "Draft evaluation rule created successfully.",
        rule,
      },
      { status: 201 },
    );
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === 11000
    ) {
      return NextResponse.json(
        { message: "A rule with this code already exists." },
        { status: 409 },
      );
    }

    console.error("POST evaluation rules error:", error);

    return NextResponse.json(
      { message: "Unable to create evaluation rule." },
      { status: 500 },
    );
  }
}
