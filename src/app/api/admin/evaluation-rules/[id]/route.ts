import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import EvaluationRule from "@/models/EvaluationRule";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const VALID_TYPES = ["GRADING", "PRICING"];
const VALID_STATUSES = ["DRAFT", "ACTIVE", "INACTIVE"];

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

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const session = await auth();

    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Administrator access required." },
        { status: 403 },
      );
    }

    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { message: "Invalid rule ID." },
        { status: 400 },
      );
    }

    await connectDB();

    const rule = await EvaluationRule.findById(id).lean();

    if (!rule) {
      return NextResponse.json(
        { message: "Evaluation rule not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ rule });
  } catch (error) {
    console.error("GET evaluation rule error:", error);

    return NextResponse.json(
      { message: "Unable to load evaluation rule." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const session = await auth();

    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Administrator access required." },
        { status: 403 },
      );
    }

    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { message: "Invalid rule ID." },
        { status: 400 },
      );
    }

    const body = await request.json();

    const allowedFields = [
      "name",
      "code",
      "description",
      "configuration",
      "status",
    ];

    const suppliedFields = Object.keys(body);

    if (
      suppliedFields.length === 0 ||
      suppliedFields.some((key) => !allowedFields.includes(key))
    ) {
      return NextResponse.json(
        { message: "Invalid or missing update fields." },
        { status: 400 },
      );
    }

    await connectDB();

    const rule = await EvaluationRule.findById(id);

    if (!rule) {
      return NextResponse.json(
        { message: "Evaluation rule not found." },
        { status: 404 },
      );
    }

    if (body.name !== undefined) {
      if (
        typeof body.name !== "string" ||
        body.name.trim().length < 2 ||
        body.name.trim().length > 150
      ) {
        return NextResponse.json(
          { message: "Name must contain 2–150 characters." },
          { status: 400 },
        );
      }

      rule.name = body.name.trim();
    }

    if (body.code !== undefined) {
      if (
        typeof body.code !== "string" ||
        !/^[A-Za-z0-9_-]{2,100}$/.test(body.code.trim())
      ) {
        return NextResponse.json(
          { message: "Invalid rule code." },
          { status: 400 },
        );
      }

      rule.code = body.code.trim().toUpperCase();
    }

    if (body.description !== undefined) {
      if (
        typeof body.description !== "string" ||
        body.description.length > 1000
      ) {
        return NextResponse.json(
          { message: "Description must be at most 1000 characters." },
          { status: 400 },
        );
      }

      rule.description = body.description.trim();
    }

    if (body.configuration !== undefined) {
      if (!isValidConfiguration(rule.type, body.configuration)) {
        return NextResponse.json(
          { message: "Invalid configuration for this rule type." },
          { status: 400 },
        );
      }

      rule.configuration = body.configuration;
      rule.markModified("configuration");
    }

    if (body.status !== undefined) {
      if (
        typeof body.status !== "string" ||
        !VALID_STATUSES.includes(body.status)
      ) {
        return NextResponse.json(
          { message: "Invalid rule status." },
          { status: 400 },
        );
      }

      if (body.status === "ACTIVE") {
        const configuration = body.configuration ?? rule.configuration;

        if (!isValidConfiguration(rule.type, configuration)) {
          return NextResponse.json(
            {
              message:
                "A valid configuration is required before activating a rule.",
            },
            { status: 400 },
          );
        }
      }

      rule.status = body.status as "DRAFT" | "ACTIVE" | "INACTIVE";
    }

    await rule.save();

    return NextResponse.json({
      message: "Evaluation rule updated successfully.",
      rule,
    });
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

    console.error("PATCH evaluation rule error:", error);

    return NextResponse.json(
      { message: "Unable to update evaluation rule." },
      { status: 500 },
    );
  }
}
