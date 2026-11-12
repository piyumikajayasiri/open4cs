import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import AuditLog from "@/models/AuditLog";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== "CAGS_ADMIN") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "Invalid user ID" }, { status: 400 });
    }

    await connectToDatabase();
    const body = await request.json();

    const updateDoc: Record<string, unknown> = {};

    if (typeof body.status === "string" && ["ACTIVE", "SUSPENDED"].includes(body.status.toUpperCase())) {
      updateDoc.status = body.status.toUpperCase();
    }

    if (typeof body.role === "string" && ["USER", "CAGS_ADMIN"].includes(body.role.toUpperCase())) {
      updateDoc.role = body.role.toUpperCase();
    }

    if (typeof body.category === "string") {
      updateDoc.category = body.category.trim();
    }

    if (Object.keys(updateDoc).length === 0) {
      return NextResponse.json({ success: false, message: "No valid update fields" }, { status: 400 });
    }

    const updated = await User.findByIdAndUpdate(
      id,
      { $set: updateDoc },
      { new: true }
    )
      .select("-password")
      .lean();

    if (!updated) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    await AuditLog.create({
      action: "USER_STATUS_CHANGED",
      performedBy: {
        userId: admin.id,
        name: admin.name,
        email: admin.email,
      },
      targetType: "User",
      targetId: id,
      summary: `${admin.name} updated user ${updated.name}: ${Object.keys(updateDoc).join(", ")}`,
      details: updateDoc,
    });

    return NextResponse.json({
      success: true,
      message: `User ${updated.name} updated.`,
      user: updated,
    });
  } catch (error) {
    console.error("PATCH admin user error:", error);
    return NextResponse.json({ success: false, message: "Failed to update user" }, { status: 500 });
  }
}
