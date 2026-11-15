import { NextResponse } from "next/server";
import mongoose from "mongoose";
import MockEvaluationRule from "@/models/MockEvaluationRule";
import AdminAudit from "@/models/AdminAudit";
import { adminRoute, AdminError, bodyObject } from "@/lib/admin/server";
import { applyRuleChanges } from "@/lib/admin/policy";
import { validateRuleCatalog } from "@/lib/evaluation/engine";
import { MOCK_RULES } from "@/lib/evaluation/mock-rules";

export async function GET(request: Request) {
  return adminRoute(request, async () => {
    const all = await MockEvaluationRule.find({ dataKind: "MOCK" }).sort({ createdAt: -1, version: -1 }).lean();
    const nextVersions = Object.fromEntries(["RUBY", "SAPPHIRE"].map((variety) => [variety, Math.max(0, ...all.filter((item) => item.variety === variety).map((item) => Number(item.version.match(/v(\d+)$/)?.[1] || 0))) + 1]));
    return NextResponse.json({ versions: all.filter((item) => !item.deletedAt), nextVersions });
  });
}

export async function POST(request: Request) {
  return adminRoute(request, async (actor) => {
    const body = await bodyObject(request);
    if (typeof body.baseVersion !== "string") throw new AdminError("Choose a base rule version.");
    const summary = typeof body.summary === "string" ? body.summary.trim() : "";
    if (summary.length < 10 || summary.length > 1000) throw new AdminError("Explain the proposal in 10–1000 characters.", 400, { summary: "Use 10–1000 characters." });
    const base = await MockEvaluationRule.findOne({ version: body.baseVersion, dataKind: "MOCK", deletedAt: null });
    if (!base) throw new AdminError("Base rule version was not found.", 404);
    if (typeof body.version !== "string" || !new RegExp(`^mock-${String(base.variety).toLowerCase()}-v[1-9]\\d*$`).test(body.version)) throw new AdminError("Use a new version such as mock-ruby-v3.", 400, { version: "Use mock-ruby-vN or mock-sapphire-vN for the selected variety." });
    let definition;
    try {
      definition = applyRuleChanges(base.definition, body.changes);
      definition.version = body.version;
      validateRuleCatalog({ ...MOCK_RULES, [base.variety]: definition });
    } catch (error) { throw new AdminError(error instanceof Error ? error.message : "Invalid rule values."); }
    await Promise.all([MockEvaluationRule.init(), AdminAudit.init()]);
    const session = await mongoose.startSession();
    try {
      const version = await session.withTransaction(async () => {
        const [proposal] = await MockEvaluationRule.create([{ version: definition.version, variety: base.variety, dataKind: "MOCK", status: "DRAFT", definition, summary, createdBy: actor.id, createdByName: actor.name, revision: 0 }], { session });
        await AdminAudit.create([{ actorId: actor.id, actorName: actor.name, action: "RULE_PROPOSED", entity: "RULE", entityId: definition.version, summary, before: base.definition, after: definition }], { session });
        return proposal.toObject();
      });
      return NextResponse.json({ version }, { status: 201 });
    } finally { await session.endSession(); }
  });
}
