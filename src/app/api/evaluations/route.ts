import mongoose from "mongoose";
import { NextResponse } from "next/server";
import Evaluation from "@/models/Evaluation";
import { evaluationRoute } from "@/lib/evaluation/user-route";
import { evaluationDetail, evaluationSummary, ownedEvaluationFilter, parseSubmission, SubmissionError } from "@/lib/evaluation/submission";
import { evaluationStats, existingSubmission, persistEvaluation } from "@/lib/evaluation/persistence";
import { loadApprovedEvaluation } from "@/lib/evaluation/approved-data";

export async function GET(request: Request) {
  return evaluationRoute(request, async (user) => {
    const params = new URL(request.url).searchParams;
    const page = Number(params.get("page") || 1), pageSize = Number(params.get("pageSize") || 10);
    const variety = params.get("variety");
    if (!Number.isInteger(page) || page < 1 || page > 10000 || !Number.isInteger(pageSize) || pageSize < 1 || pageSize > 50) throw new SubmissionError("Choose a valid evaluation page.");
    if (variety && !["RUBY", "SAPPHIRE"].includes(variety)) throw new SubmissionError("Choose ruby or sapphire.");
    const owner = ownedEvaluationFilter(user.id);
    const filter = { ...owner, ...(variety ? { "inputSnapshot.variety": variety } : {}) };
    const [documents, total, stats] = await Promise.all([
      Evaluation.find(filter).sort({ createdAt: -1, _id: -1 }).skip((page - 1) * pageSize).limit(pageSize).select("evaluationId inputSnapshot ruleVersion status createdAt dataKind result.variety result.scores result.overall4C result.color result.clarity result.cut result.carat priceSuggestion").lean(),
      Evaluation.countDocuments(filter),
      evaluationStats(user.id),
    ]);
    return NextResponse.json({ evaluations: documents.map((document) => evaluationSummary(document)), stats,
      pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) } });
  });
}

export async function POST(request: Request) {
  return evaluationRoute(request, async (user) => {
    let body: unknown;
    try { body = await request.json(); } catch { throw new SubmissionError("Invalid JSON request body."); }
    const { submissionKey, input } = parseSubmission(body);
    const previous = await existingSubmission(user.id, submissionKey, input);
    if (previous) return NextResponse.json({ success: true, replayed: true, evaluation: evaluationDetail(previous) });
    await Evaluation.init();
    const session = await mongoose.startSession();
    try {
      const saved = await session.withTransaction(async () => {
        const existing = await existingSubmission(user.id, submissionKey, input, session);
        if (existing) return { document: existing, replayed: true };
        const approved = await loadApprovedEvaluation(input, session);
        return persistEvaluation({ userId: user.id, userCategory: user.category, submissionKey, input, approved, session });
      }, { readConcern: { level: "snapshot" }, writeConcern: { w: "majority" } });
      return NextResponse.json({ success: true, replayed: saved.replayed, evaluation: evaluationDetail(saved.document) }, { status: saved.replayed ? 200 : 201 });
    } catch (error) {
      // A simultaneous retry may lose the unique-key race; return the committed original.
      if (error && typeof error === "object" && "code" in error && error.code === 11000) {
        const existing = await existingSubmission(user.id, submissionKey, input);
        if (existing) return NextResponse.json({ success: true, replayed: true, evaluation: evaluationDetail(existing) });
      }
      throw error;
    } finally { await session.endSession(); }
  });
}
