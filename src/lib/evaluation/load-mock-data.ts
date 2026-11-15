import { connectDB } from "@/lib/mongodb";
import MockHistoricalGemstone from "@/models/MockHistoricalGemstone";
import MockEvaluationRule from "@/models/MockEvaluationRule";
import { MockDataError, validateRuleCatalog } from "./engine";
import type { MockGemstoneRecord, RuleSet, Variety } from "./types";
import { MOCK_DATASET_VERSION } from "./mock-data";
import type { ClientSession } from "mongoose";

export async function loadMockData(session?: ClientSession) {
  await connectDB();
  const recordQuery = MockHistoricalGemstone.find({ dataKind: "MOCK", datasetVersion: MOCK_DATASET_VERSION, isActive: { $ne: false }, deletedAt: null }).select("-_id -__v -createdAt -updatedAt").lean();
  const ruleQuery = MockEvaluationRule.find({ dataKind: "MOCK", status: "ACTIVE", deletedAt: null }).select("version variety definition").lean();
  // MongoDB transactions require sequential operations on a shared session.
  const [records, definitions] = session ? [await recordQuery.session(session), await ruleQuery.session(session)] : await Promise.all([recordQuery, ruleQuery]);
  const rules = {} as Record<Variety, RuleSet>;
  for (const variety of ["RUBY", "SAPPHIRE"] as const) {
    const matching = definitions.filter((item) => item.variety === variety);
    if (matching.length !== 1 || matching[0].version !== matching[0].definition?.version) throw new MockDataError("Exactly one active mock rule version is required for each variety. Load the test dataset or review active versions.");
    rules[variety] = matching[0].definition;
  }
  validateRuleCatalog(rules);
  if (!records.length) throw new MockDataError("No mock historical records are available. Load the test dataset first.");
  return { records: records as unknown as MockGemstoneRecord[], rules };
}
