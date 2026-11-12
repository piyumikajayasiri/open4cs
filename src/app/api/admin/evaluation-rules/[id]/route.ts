import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { connectToDatabase } from "@/lib/mongodb";
import EvaluationRule from "@/models/EvaluationRule";
import AuditLog from "@/models/AuditLog";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "CAGS_ADMIN") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();

    const body = await request.json();
    const query = mongoose.Types.ObjectId.isValid(id)
      ? { _id: id }
      : { ruleId: id.toUpperCase() };

    const updateDoc: Record<string, unknown> = {};

    if (typeof body.description === "string") updateDoc.description = body.description.trim();
    if (typeof body.effect === "string") {
      updateDoc.effect = body.effect.trim();
      updateDoc.effectType = body.effect.trim().startsWith("-") ? "negative" : "positive";
    }
    if (typeof body.status === "string" && ["Active", "Pending", "Archived"].includes(body.status)) {
      updateDoc.status = body.status;
    }
    if (typeof body.rationale === "string") updateDoc.rationale = body.rationale.trim();
    if (typeof body.triggerCondition === "string") updateDoc.triggerCondition = body.triggerCondition.trim();

    updateDoc.lastUpdated = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const updated = await EvaluationRule.findOneAndUpdate(
      query,
      { $set: updateDoc },
      { new: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ success: false, message: "Rule not found" }, { status: 404 });
    }

    await AuditLog.create({
      action: "RULE_UPDATED",
      performedBy: {
        userId: user.id,
        name: user.name,
        email: user.email,
      },
      targetType: "EvaluationRule",
      targetId: updated._id.toString(),
      summary: `${user.name} updated rule ${updated.ruleId}`,
      details: updateDoc,
    });

    return NextResponse.json({
      success: true,
      message: "Rule updated successfully.",
      rule: updated,
    });
  } catch (error) {
    console.error("PUT evaluation rule error:", error);
    return NextResponse.json({ success: false, message: "Failed to update rule" }, { status: 500 });
  }
}
