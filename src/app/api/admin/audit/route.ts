import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { connectToDatabase } from "@/lib/mongodb";
import AuditLog from "@/models/AuditLog";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "CAGS_ADMIN") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(100).lean();

    return NextResponse.json({
      success: true,
      logs,
    });
  } catch (error) {
    console.error("GET audit logs error:", error);
    return NextResponse.json({ success: false, message: "Failed to retrieve audit log" }, { status: 500 });
  }
}
