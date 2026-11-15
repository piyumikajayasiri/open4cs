import { createHash, randomUUID } from "node:crypto";
import type { ClientSession } from "mongoose";
import { Types } from "mongoose";
import Evaluation from "../../models/Evaluation.ts";
import { evaluateMock } from "./engine.ts";
import { canonicalInput, ownedEvaluationFilter, snapshotEvaluation, sriLankanMonthStart } from "./submission.ts";
import type { EvaluationInput, MockGemstoneRecord, RuleSet, Variety } from "./types";

export class SubmissionConflict extends Error {}
export const hashInput = (input: EvaluationInput) => createHash("sha256").update(JSON.stringify(canonicalInput(input))).digest("hex");
export async function existingSubmission(userId: string, submissionKey: string, input: EvaluationInput, session?: ClientSession) {
  const document = await Evaluation.findOne({ ...ownedEvaluationFilter(userId), submissionKey }).session(session || null).lean();
  if (document && document.inputHash !== hashInput(input)) throw new SubmissionConflict("This submission key was already used for different observations. Start a new evaluation.");
  return document;
}

export async function persistEvaluation({ userId, userCategory, submissionKey, input, records, rules, session }: {
  userId: string; userCategory: string; submissionKey: string; input: EvaluationInput; records: readonly MockGemstoneRecord[]; rules: Record<Variety, RuleSet>; session: ClientSession;
}) {
  const existing = await existingSubmission(userId, submissionKey, input, session);
  if (existing) return { document: existing, replayed: true };
  const result = evaluateMock(input, records, rules);
  const snapshot = snapshotEvaluation(input, result, rules[input.variety], records);
  const [saved] = await Evaluation.create([{ ...snapshot, userId: ownedEvaluationFilter(userId).userId, userCategory,
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
