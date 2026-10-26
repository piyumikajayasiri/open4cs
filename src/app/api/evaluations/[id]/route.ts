import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import Evaluation, { type EvaluationStatus } from "@/models/Evaluation";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function checkAdmin() {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      authorized: false as const,
      status: 401,
      message: "Authentication required.",
    };
  }

  if (session.user.role !== "ADMIN") {
    return {
      authorized: false as const,
      status: 403,
      message: "Admin access required.",
    };
  }

  return {
    authorized: true as const,
    userId: session.user.id,
  };
}

function errorResponse(message: string, status: number) {
  return NextResponse.json({ success: false, message }, { status });
}

// GET: Retrieve one evaluation for administrative review.
export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const access = await checkAdmin();

    if (!access.authorized) {
      return errorResponse(access.message, access.status);
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid evaluation ID.", 400);
    }

    await connectDB();

    const evaluation = await Evaluation.findById(id)
      .populate("gemstoneId", "code name species supportedOrigin")
      .populate("submittedBy", "name email")
      .populate("reviewerId", "name email")
      .lean();

    if (!evaluation) {
      return errorResponse("Evaluation not found.", 404);
    }

    return NextResponse.json({
      success: true,
      evaluation,
    });
  } catch (error) {
    console.error("Get admin evaluation error:", error);

    return errorResponse("Unable to retrieve evaluation.", 500);
  }
}

// PATCH: Update workflow status and reviewer notes.
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const access = await checkAdmin();

    if (!access.authorized) {
      return errorResponse(access.message, access.status);
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid evaluation ID.", 400);
    }

    let body: Record<string, unknown>;

    try {
      body = await request.json();
    } catch {
      return errorResponse("Invalid JSON request body.", 400);
    }

    const requestedStatus = body.status;
    const reviewNotes = body.reviewNotes;

    if (
      requestedStatus !== undefined &&
      !["UNDER_REVIEW", "COMPLETED", "REJECTED"].includes(
        String(requestedStatus),
      )
    ) {
      return errorResponse("Invalid target evaluation status.", 400);
    }

    if (
      reviewNotes !== undefined &&
      reviewNotes !== null &&
      typeof reviewNotes !== "string"
    ) {
      return errorResponse("Review notes must be text.", 400);
    }

    if (typeof reviewNotes === "string" && reviewNotes.trim().length > 2000) {
      return errorResponse(
        "Review notes must not exceed 2000 characters.",
        400,
      );
    }

    if (requestedStatus === undefined && reviewNotes === undefined) {
      return errorResponse("Provide a status change or review notes.", 400);
    }

    await connectDB();

    const evaluation = await Evaluation.findById(id);

    if (!evaluation) {
      return errorResponse("Evaluation not found.", 404);
    }

    if (requestedStatus !== undefined) {
      const targetStatus = requestedStatus as EvaluationStatus;

      const allowedTransitions: Record<EvaluationStatus, EvaluationStatus[]> = {
        DRAFT: [],
        SUBMITTED: ["UNDER_REVIEW", "REJECTED"],
        UNDER_REVIEW: ["COMPLETED", "REJECTED"],
        COMPLETED: [],
        REJECTED: [],
      };

      if (!allowedTransitions[evaluation.status].includes(targetStatus)) {
        return errorResponse(
          `Cannot change evaluation status from ${evaluation.status} to ${targetStatus}.`,
          409,
        );
      }

      evaluation.status = targetStatus;
      evaluation.reviewerId = new mongoose.Types.ObjectId(access.userId);

      if (targetStatus === "COMPLETED") {
        evaluation.completedAt = new Date();
      }
    }

    if (reviewNotes !== undefined) {
      evaluation.reviewNotes =
        typeof reviewNotes === "string" ? reviewNotes.trim() : "";
    }

    await evaluation.save();

    const updatedEvaluation = await Evaluation.findById(evaluation._id)
      .populate("gemstoneId", "code name species supportedOrigin")
      .populate("submittedBy", "name email")
      .populate("reviewerId", "name email")
      .lean();

    return NextResponse.json({
      success: true,
      message: "Evaluation updated successfully.",
      evaluation: updatedEvaluation,
    });
  } catch (error) {
    console.error("Update admin evaluation error:", error);

    return errorResponse("Unable to update evaluation.", 500);
  }
}
