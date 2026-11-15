import { NextResponse } from "next/server";
import { adminRoute } from "@/lib/admin/server";
import MockEvaluationRule from "@/models/MockEvaluationRule";
import AdminAudit from "@/models/AdminAudit";
import User from "@/models/User";

export async function GET(request: Request) {
  return adminRoute(request, async () => {
    const [versions, audits, users] = await Promise.all([
      MockEvaluationRule.find({ dataKind: "MOCK", deletedAt: null }).sort({ activatedAt: -1, createdAt: -1 }).lean(),
      AdminAudit.find().sort({ createdAt: -1 }).limit(100).lean(),
      User.find({ deletedAt: null }).select("name email category role status isActive").sort({ createdAt: -1 }).limit(100).lean(),
    ]);
    return NextResponse.json({ versions, audits, users });
  });
}
