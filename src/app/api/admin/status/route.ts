import { getCurrentUser } from "@/lib/auth/currentUser";
import { connectToDatabase } from "@/lib/mongodb";
import GemstoneVariety from "@/models/GemstoneVariety";
import ReferenceGemstone from "@/models/ReferenceGemstone";
import User from "@/models/User";
import AuditLog from "@/models/AuditLog";
import RuleVersion from "@/models/RuleVersion";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return Response.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    if (user.role !== "CAGS_ADMIN") {
      return Response.json(
        { error: "CAGS Admin access required." },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const [
      varietiesCount,
      referencesCount,
      pendingReferencesCount,
      usersCount,
      auditLogsCount,
      recentAuditLogs,
      ruleVersions,
    ] = await Promise.all([
      GemstoneVariety.countDocuments(),
      ReferenceGemstone.countDocuments(),
      ReferenceGemstone.countDocuments({ verificationStatus: "Pending" }),
      User.countDocuments(),
      AuditLog.countDocuments(),
      AuditLog.find().sort({ createdAt: -1 }).limit(6).lean(),
      RuleVersion.find().sort({ createdAt: -1 }).lean(),
    ]);

    return Response.json({
      message: "CAGS Admin access granted.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        category: user.category,
        role: user.role,
      },
      metrics: {
        varietiesCount,
        referencesCount,
        pendingReferencesCount,
        usersCount,
        auditLogsCount,
        activeRuleset: "v4.2 Production Locked",
      },
      recentAuditLogs,
      ruleVersions,
    });
  } catch (error) {
    console.error("Admin status check failed:", error);

    return Response.json(
      { error: "Failed to verify admin access." },
      { status: 500 }
    );
  }
}
