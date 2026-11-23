import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { connectToDatabase } from "@/lib/mongodb";
import SystemSetting from "@/models/SystemSetting";
import AuditLog from "@/models/AuditLog";

export async function GET(request?: NextRequest) {
  try {
    const admin = await getCurrentUser(request);
    if (!admin || admin.role !== "CAGS_ADMIN") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    let settings = await SystemSetting.findOne({ key: "default_cags_governance" }).lean();
    if (!settings) {
      settings = await SystemSetting.create({
        key: "default_cags_governance",
        orgName: "Ceylon Academy of Gemmological Science (CAGS)",
        adminEmail: "admin@cags.lk",
        baseCurrency: "LKR — Sri Lankan Rupee",
        activeRuleset: "v4.2 (Color 35% · Clarity 25% · Cut 20% · Carat 20%)",
        updatedBy: admin.name,
      });
    }

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("GET admin settings error:", error);
    return NextResponse.json({ success: false, message: "Failed to load system settings" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentUser(request);
    if (!admin || admin.role !== "CAGS_ADMIN") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();

    const { orgName, adminEmail, baseCurrency } = body;

    if (!orgName || !adminEmail) {
      return NextResponse.json(
        { success: false, message: "Organization name and admin email are required." },
        { status: 400 }
      );
    }

    const updated = await SystemSetting.findOneAndUpdate(
      { key: "default_cags_governance" },
      {
        $set: {
          orgName: String(orgName).trim(),
          adminEmail: String(adminEmail).trim().toLowerCase(),
          baseCurrency: baseCurrency || "LKR — Sri Lankan Rupee",
          updatedBy: admin.name,
        },
      },
      { upsert: true, new: true }
    ).lean();

    await AuditLog.create({
      action: "SETTINGS_UPDATED",
      performedBy: {
        userId: admin.id,
        name: admin.name,
        email: admin.email,
      },
      targetType: "System",
      targetId: "default_cags_governance",
      summary: `${admin.name} updated CAGS system governance settings`,
      details: {
        orgName: updated.orgName,
        adminEmail: updated.adminEmail,
        baseCurrency: updated.baseCurrency,
      },
    });

    return NextResponse.json({
      success: true,
      message: "System settings saved and persisted to database.",
      settings: updated,
    });
  } catch (error) {
    console.error("POST admin settings error:", error);
    return NextResponse.json({ success: false, message: "Failed to save system settings" }, { status: 500 });
  }
}
