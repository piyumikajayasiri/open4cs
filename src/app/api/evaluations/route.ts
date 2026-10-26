import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { randomUUID } from "node:crypto";

import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import Evaluation, { type EvaluationStatus } from "@/models/Evaluation";
import Gemstone from "@/models/Gemstone";

const allowedStatuses: EvaluationStatus[] = ["DRAFT", "SUBMITTED"];

function errorResponse(message: string, status: number) {
  return NextResponse.json({ success: false, message }, { status });
}

// GET: Users see their own evaluations; admins see all.
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return errorResponse("Authentication required.", 401);
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search")?.trim();

    if (
      status &&
      !["DRAFT", "SUBMITTED", "UNDER_REVIEW", "COMPLETED", "REJECTED"].includes(
        status,
      )
    ) {
      return errorResponse("Invalid evaluation status.", 400);
    }

    const filter: Record<string, unknown> = {};

    if (session.user.role !== "ADMIN") {
      filter.submittedBy = session.user.id;
    }

    if (status) {
      filter.status = status;
    }

    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      filter.evaluationId = {
        $regex: escapedSearch,
        $options: "i",
      };
    }

    const evaluations = await Evaluation.find(filter)
      .populate("gemstoneId", "code name species")
      .populate("submittedBy", "name email")
      .populate("reviewerId", "name email")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      evaluations,
    });
  } catch (error) {
    console.error("Get evaluations error:", error);

    return errorResponse("Unable to retrieve evaluations.", 500);
  }
}

// POST: An authenticated user can create an evaluation for themselves.
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return errorResponse("Authentication required.", 401);
    }

    let body: Record<string, unknown>;

    try {
      body = await request.json();
    } catch {
      return errorResponse("Invalid JSON request body.", 400);
    }

    const gemstoneId = body.gemstoneId;

    if (
      typeof gemstoneId !== "string" ||
      !mongoose.Types.ObjectId.isValid(gemstoneId)
    ) {
      return errorResponse("A valid gemstone variety is required.", 400);
    }

    const rawStatus = body.status === undefined ? "DRAFT" : body.status;

    if (
      typeof rawStatus !== "string" ||
      !allowedStatuses.includes(rawStatus as EvaluationStatus)
    ) {
      return errorResponse(
        "New evaluations can only be DRAFT or SUBMITTED.",
        400,
      );
    }

    const status: EvaluationStatus = rawStatus as EvaluationStatus;

    const rawObservations = body.observations;

    if (
      rawObservations !== undefined &&
      (typeof rawObservations !== "object" ||
        rawObservations === null ||
        Array.isArray(rawObservations))
    ) {
      return errorResponse("Observations must be an object.", 400);
    }

    const inputObservations = (rawObservations ?? {}) as Record<
      string,
      unknown
    >;

    const stringFields = [
      "origin",
      "color",
      "clarity",
      "cut",
      "treatment",
      "notes",
    ] as const;

    const observations: Record<string, string | number> = {};

    for (const field of stringFields) {
      const value = inputObservations[field];

      if (value === undefined || value === null || value === "") {
        continue;
      }

      if (typeof value !== "string") {
        return errorResponse(`${field} must be text.`, 400);
      }

      const maxLength = field === "notes" ? 2000 : 100;

      if (value.trim().length > maxLength) {
        return errorResponse(
          `${field} must not exceed ${maxLength} characters.`,
          400,
        );
      }

      observations[field] = value.trim();
    }

    const weight = inputObservations.caratWeight;

    if (weight !== undefined && weight !== null && weight !== "") {
      const numericWeight = Number(weight);

      if (!Number.isFinite(numericWeight) || numericWeight < 0) {
        return errorResponse(
          "Carat weight must be a valid non-negative number.",
          400,
        );
      }

      observations.caratWeight = numericWeight;
    }

    await connectDB();

    const gemstone = await Gemstone.findById(gemstoneId).select("_id");

    if (!gemstone) {
      return errorResponse("Selected gemstone variety was not found.", 404);
    }

    const now = new Date();

    const evaluation = await Evaluation.create({
      evaluationId: `EVAL-${randomUUID()}`,
      submittedBy: session.user.id,
      gemstoneId: gemstone._id,
      observations,
      status,
      submittedAt: status === "SUBMITTED" ? now : undefined,
    });

    const populatedEvaluation = await Evaluation.findById(evaluation._id)
      .populate("gemstoneId", "code name species")
      .populate("submittedBy", "name email")
      .lean();

    return NextResponse.json(
      {
        success: true,
        message:
          status === "SUBMITTED"
            ? "Evaluation submitted successfully."
            : "Evaluation draft created successfully.",
        evaluation: populatedEvaluation,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create evaluation error:", error);

    return errorResponse("Unable to create evaluation.", 500);
  }
}
