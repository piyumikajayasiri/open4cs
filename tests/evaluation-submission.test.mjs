import assert from "node:assert/strict";
import test from "node:test";
import { randomUUID } from "node:crypto";
import { parseSubmission, SubmissionError, snapshotEvaluation, ownedEvaluationFilter, evaluationSummary, sriLankanMonthStart } from "../src/lib/evaluation/submission.ts";
import { evaluateMock } from "../src/lib/evaluation/engine.ts";
import { hashInput } from "../src/lib/evaluation/persistence.ts";
import { MOCK_EXAMPLES, MOCK_GEMSTONE_RECORDS } from "../src/lib/evaluation/mock-data.ts";
import { MOCK_RULES } from "../src/lib/evaluation/mock-rules.ts";

test("submission accepts observations only and strips supplied owners/results from saved inputs", () => {
  const input = { ...structuredClone(MOCK_EXAMPLES.RUBY), userId: "another-user", result: { overall: 10 } };
  const parsed = parseSubmission({ observations: input, submissionKey: randomUUID(), userId: "another-user", result: { price: 999999 } });
  assert.deepEqual(parsed.input, MOCK_EXAMPLES.RUBY);
  assert.equal(parsed.input.userId, undefined);
  assert.equal(parsed.input.result, undefined);
});

test("invalid or partial inputs and invalid submission keys are rejected before saving", () => {
  for (const body of [null, [], {}, { observations: MOCK_EXAMPLES.RUBY, submissionKey: "bad" }, { observations: {}, submissionKey: randomUUID() }]) assert.throws(() => parseSubmission(body), SubmissionError);
  const input = structuredClone(MOCK_EXAMPLES.RUBY); input.caratWeight = -1;
  assert.throws(() => parseSubmission({ observations: input, submissionKey: randomUUID() }), (error) => Boolean(error.errors?.caratWeight));
});

test("snapshots preserve inputs, applied rule and full selected historical records independently", () => {
  const input = structuredClone(MOCK_EXAMPLES.RUBY), rules = structuredClone(MOCK_RULES), records = structuredClone(MOCK_GEMSTONE_RECORDS);
  const result = evaluateMock(input, records, rules);
  const saved = snapshotEvaluation(input, result, rules.RUBY, records);
  assert.equal(saved.recordSnapshots.length, result.comparables.length);
  assert.ok(saved.recordSnapshots.every((record) => record.observations && record.totalPrice && record.source));
  const before = JSON.stringify(saved);
  input.color.tone = 0; rules.RUBY.rangePercentage = 50; records[0].totalPrice = 999999;
  assert.equal(JSON.stringify(saved), before);
});

test("missing or mismatched snapshot evidence cannot be saved", () => {
  const result = evaluateMock(MOCK_EXAMPLES.RUBY);
  assert.throws(() => snapshotEvaluation(MOCK_EXAMPLES.RUBY, result, { ...MOCK_RULES.RUBY, version: "mock-ruby-v99" }, MOCK_GEMSTONE_RECORDS));
  assert.throws(() => snapshotEvaluation(MOCK_EXAMPLES.RUBY, result, MOCK_RULES.RUBY, []));
});

test("valid grading without a price is saved as completed with the unavailability reason", () => {
  const input = structuredClone(MOCK_EXAMPLES.RUBY); input.treatment = "UNKNOWN";
  const result = evaluateMock(input);
  const saved = snapshotEvaluation(input, result, MOCK_RULES.RUBY, MOCK_GEMSTONE_RECORDS);
  assert.equal(saved.status, "COMPLETED");
  assert.equal(saved.priceSuggestion.status, "UNAVAILABLE");
  assert.ok(saved.priceSuggestion.reason.includes("Treatment"));
});

test("ownership filters cannot be replaced by client-supplied fields", () => {
  assert.deepEqual(ownedEvaluationFilter("ABCDEF0123456789ABCDEF01", "111111111111111111111111"), { userId: "abcdef0123456789abcdef01", _id: "111111111111111111111111" });
  assert.throws(() => ownedEvaluationFilter("bad-owner"));
  assert.throws(() => ownedEvaluationFilter("abcdef0123456789abcdef01", { $ne: null }));
});

test("input fingerprint is order-independent and changes when observations change", () => {
  const first = structuredClone(MOCK_EXAMPLES.RUBY);
  const reordered = Object.fromEntries(Object.entries(first).reverse());
  assert.equal(hashInput(first), hashInput(reordered));
  first.caratWeight = 2;
  assert.notEqual(hashInput(first), hashInput(MOCK_EXAMPLES.RUBY));
});

test("dashboard summaries show persisted prices/scores and handle legacy or unavailable data", () => {
  const result = evaluateMock(MOCK_EXAMPLES.RUBY);
  const summary = evaluationSummary({ _id: "id", evaluationId: "EVAL-test", inputSnapshot: MOCK_EXAMPLES.RUBY, result, priceSuggestion: result.priceSuggestion, ruleVersion: result.ruleVersion, dataKind: "MOCK", createdAt: new Date("2026-11-09T00:00:00Z") });
  assert.equal(summary.scores.overall, 7.5);
  assert.equal(summary.priceRange, "USD 1,080.00 – 1,620.00");
  assert.equal(summary.variety, "RUBY");
  const legacy = evaluationSummary({ _id: "legacy", result: { overall4C: { score: 0 } }, priceSuggestion: { status: "UNAVAILABLE", reason: "Missing records" } });
  assert.equal(legacy.scores.overall, 0);
  assert.equal(legacy.priceRange, "Price unavailable");
  assert.equal(legacy.priceReason, "Missing records");
  assert.equal(legacy.dataKind, "LEGACY");
});

test("monthly dashboard counts use Sri Lankan calendar boundaries", () => {
  assert.equal(sriLankanMonthStart(new Date("2026-10-31T18:30:00Z")).toISOString(), "2026-10-31T18:30:00.000Z");
  assert.equal(sriLankanMonthStart(new Date("2026-10-31T18:29:59Z")).toISOString(), "2026-09-30T18:30:00.000Z");
});
