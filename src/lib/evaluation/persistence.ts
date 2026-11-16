import { createHash, randomUUID } from "node:crypto";
import type { ClientSession } from "mongoose";
import { Types } from "mongoose";
import Evaluation from "../../models/Evaluation.ts";
import { buildGuidance } from "./guidance.ts";
import { evaluateMock } from "./engine.ts";
import { snapshotApprovedEvaluation } from "./approved-submission.ts";
import type { loadApprovedEvaluation } from "./approved-data";
import { canonicalInput, ownedEvaluationFilter, snapshotEvaluation, sriLankanMonthStart } from "./submission.ts";
import type { EvaluationInput, MockGemstoneRecord, RuleSet, Variety } from "./types";

export class SubmissionConflict extends Error {}
export const hashInput = (input: EvaluationInput) => createHash("sha256").update(JSON.stringify(canonicalInput(input))).digest("hex");
export async function existingSubmission(userId: string, submissionKey: string, input: EvaluationInput, session?: ClientSession) {
  const document = await Evaluation.findOne({ ...ownedEvaluationFilter(userId), submissionKey }).session(session || null).lean();
  if (document && document.inputHash !== hashInput(input)) throw new SubmissionConflict("This submission key was already used for different observations. Start a new evaluation.");
  return document;
}

export async function persistEvaluation({ userId, userCategory, submissionKey, input, records, rules, approved, session }: {
  userId: string; userCategory: string; submissionKey: string; input: EvaluationInput; records?: readonly MockGemstoneRecord[]; rules?: Record<Variety, RuleSet>; approved?: Awaited<ReturnType<typeof loadApprovedEvaluation>>; session: ClientSession;
}) {
  const existing = await existingSubmission(userId, submissionKey, input, session);
  if (existing) return { document: existing, replayed: true };
  if (!approved && (!records || !rules)) throw new Error("Evaluation evidence is required.");
  const result = approved?.result || evaluateMock(input, records!, rules!);
  const snapshot = approved ? snapshotApprovedEvaluation(input, approved.result, approved.rule, approved.records, approved.catalogueSnapshot)
    : snapshotEvaluation(input, result, rules![input.variety], records!);
  const guidanceSnapshot = buildGuidance(input, result, approved?.rule.definition || rules![input.variety], userCategory, approved?.catalogueSnapshot.name);
  const [saved] = await Evaluation.create([{ ...snapshot, guidanceSnapshot, userId: ownedEvaluationFilter(userId).userId, userCategory,
    submissionKey, inputHash: hashInput(input), evaluationId: `EVAL-${randomUUID()}` }], { session });
  return { document: saved.toObject(), replayed: false };
}

export async function evaluationStats(userId: string, session?: ClientSession) {
  const owner = ownedEvaluationFilter(userId);
  const rows = await Evaluation.aggregate([
    { $match: { userId: new Types.ObjectId(owner.userId) } },
    { $group: { _id: null, total: { $sum: 1 }, thisMonth: { $sum: { $cond: [{ $gte: ["$createdAt", sriLankanMonthStart()] }, 1, 0] } },
      priced: { $sum: { $cond: [{ $and: [{ $isNumber: "$priceSuggestion.minimumPrice" }, { $isNumber: "$priceSuggestion.maximumPrice" }, { $gte: ["$priceSuggestion.minimumPrice", 0] }, { $gte: ["$priceSuggestion.maximumPrice", "$priceSuggestion.minimumPrice"] }, { $ne: ["$priceSuggestion.status", "UNAVAILABLE"] }] }, 1, 0] } } } },
  ]).session(session || null);
  return { total: Number(rows[0]?.total || 0), priced: Number(rows[0]?.priced || 0), thisMonth: Number(rows[0]?.thisMonth || 0) };
}
