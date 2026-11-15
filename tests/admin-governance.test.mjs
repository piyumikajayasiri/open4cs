import assert from "node:assert/strict";
import test from "node:test";
import { applyRuleChanges, compareRules, requireRuleDeletion, requireRuleTransition, requireUserDeletion, ruleRows, userAuditSnapshot } from "../src/lib/admin/policy.ts";
import { recordUpdateFields, referenceObservations, RecordValidationError, requireReferenceVerification, validateHistoricalRecord } from "../src/lib/admin/data.ts";
import { MOCK_RULES } from "../src/lib/evaluation/mock-rules.ts";
import { MOCK_GEMSTONE_RECORDS } from "../src/lib/evaluation/mock-data.ts";

test("proposals change only known numeric fields without mutating active definitions", () => {
  const before = structuredClone(MOCK_RULES.RUBY);
  const next = applyRuleChanges(MOCK_RULES.RUBY, { "pricing.adjustmentPerScorePoint": 0.06 });
  assert.equal(next.pricing.adjustmentPerScorePoint, 0.06);
  assert.deepEqual(MOCK_RULES.RUBY, before);
  for (const changes of [{ version: "overwrite" }, { "__proto__.polluted": 1 }, { "pricing.adjustmentPerScorePoint": null }, { "weights.color": NaN }]) assert.throws(() => applyRuleChanges(before, changes));
});
test("active and archived versions cannot be edited or submitted again", () => {
  for (const status of ["ACTIVE", "ARCHIVED"]) for (const action of ["UPDATE", "SUBMIT", "ACTIVATE", "RETURN"]) assert.throws(() => requireRuleTransition(status, action, "creator", "reviewer"));
  assert.equal(requireRuleTransition("DRAFT", "UPDATE", "creator", "creator"), "DRAFT");
  assert.equal(requireRuleTransition("DRAFT", "SUBMIT", "creator", "creator"), "PENDING");
  assert.equal(requireRuleTransition("PENDING", "RETURN", "creator", "reviewer"), "DRAFT");
});
test("activation requires a submitted version and an independent reviewer", () => {
  assert.throws(() => requireRuleTransition("PENDING", "ACTIVATE", "same", "same"), /different administrator/);
  assert.throws(() => requireRuleTransition("DRAFT", "ACTIVATE", "creator", "reviewer"));
  assert.equal(requireRuleTransition("PENDING", "ACTIVATE", "creator", "reviewer"), "ACTIVE");
  assert.throws(() => requireRuleTransition("PENDING", "ACTIVATE", ["creator", "editor"], "creator"));
  assert.throws(() => requireRuleTransition("PENDING", "ACTIVATE", ["creator", "editor"], "editor"));
});
test("version comparisons show actual changed parameters", () => {
  const next = applyRuleChanges(MOCK_RULES.RUBY, { rangePercentage: 15 });
  assert.deepEqual(compareRules(MOCK_RULES.RUBY, next), [{ path: "rangePercentage", before: 20, after: 15 }]);
  assert.ok(ruleRows(next).every((row) => row.id && row.category && row.description));
  const weight = ruleRows(next).find((row) => row.path === "weights.color");
  assert.equal(weight.effect, "45%");
  assert.equal(weight.value * weight.inputScale, 45);
  assert.equal(45 / weight.inputScale, 0.45);
});
test("bulk data validation prevents reference contamination and invalid source data", () => {
  const record = MOCK_GEMSTONE_RECORDS[0];
  assert.deepEqual(validateHistoricalRecord(record, "MOCK"), {});
  for (const change of [{ dataKind: "REFERENCE" }, { currency: "LKR" }, { priceBasis: "RETAIL_ESTIMATE" }]) assert.ok(validateHistoricalRecord({ ...record, ...change }, "MOCK").dataset);
  assert.ok(validateHistoricalRecord({ ...record, recordedAt: "2026-02-31" }, "MOCK").recordedAt);
  assert.ok(validateHistoricalRecord({ ...record, source: "" }, "MOCK").source);
});
test("reference verification requires explicit provenance, independent review and both confirmations", () => {
  const record = { source: "CAGS reviewed record", sourceDate: "2026-10-10", origin: { value: "Sri Lanka" }, createdBy: "creator" };
  assert.doesNotThrow(() => requireReferenceVerification(record, "reviewer", true, true));
  assert.throws(() => requireReferenceVerification(record, "creator", true, true), /different administrator/);
  assert.throws(() => requireReferenceVerification(record, "reviewer", false, true));
  assert.throws(() => requireReferenceVerification(record, "reviewer", true, false));
  assert.throws(() => requireReferenceVerification({ ...record, source: "" }, "reviewer", true, true));
  assert.throws(() => requireReferenceVerification({ ...record, origin: { value: "Thailand/Vietnam/Sri Lanka" } }, "reviewer", true, true));
});

test("user audit snapshots never include credential fields", () => {
  const snapshot = userAuditSnapshot({ name: "Test", email: "test@example.com", role: "ADMIN", passwordHash: "secret", password: "secret", resetToken: "secret" });
  assert.equal(snapshot.passwordHash, undefined);
  assert.equal(snapshot.password, undefined);
  assert.equal(snapshot.resetToken, undefined);
  assert.equal(snapshot.role, "ADMIN");
});

test("only draft versions can be deleted", () => {
  assert.doesNotThrow(() => requireRuleDeletion("DRAFT"));
  for (const status of ["ACTIVE", "PENDING", "ARCHIVED"]) assert.throws(() => requireRuleDeletion(status));
});

test("reference edits reset verification and cannot assign protected provenance fields", () => {
  const input = { ...structuredClone(MOCK_GEMSTONE_RECORDS[0]), dataKind: "REFERENCE", currency: "LKR", priceBasis: "B2B_QUOTE",
    qualityReviewed: true, permittedUseConfirmed: true, verificationStatus: "VERIFIED", verifiedBy: "attacker", createdBy: "attacker", revision: 500, deletedAt: "2026-11-01" };
  const fields = recordUpdateFields(input, "REFERENCE");
  assert.equal(fields.verificationStatus, "PENDING");
  assert.equal(fields.qualityReviewed, false);
  assert.equal(fields.permittedUseConfirmed, false);
  assert.equal(fields.verifiedBy, undefined);
  assert.equal(fields.createdBy, undefined);
  assert.equal(fields.revision, undefined);
  assert.equal(fields.deletedAt, undefined);
  assert.equal(fields.currency, "LKR");
  assert.equal(fields.referencePrice, input.totalPrice);
});

test("mock edits validate complete observations and do not modify identifiers or activation flags", () => {
  const input = { ...structuredClone(MOCK_GEMSTONE_RECORDS[0]), totalPrice: 777, isActive: false, datasetVersion: "foreign", revision: 9 };
  const fields = recordUpdateFields(input, "MOCK");
  assert.equal(fields.totalPrice, 777);
  assert.equal(fields.id, undefined);
  assert.equal(fields.datasetVersion, undefined);
  assert.equal(fields.isActive, undefined);
  assert.equal(fields.revision, undefined);
  assert.throws(() => recordUpdateFields({ ...input, totalPrice: -1 }, "MOCK"), RecordValidationError);
  assert.throws(() => recordUpdateFields({ ...input, dataKind: "REFERENCE" }, "MOCK"), RecordValidationError);
  fields.observations.cut.length = 99;
  assert.notEqual(input.observations.cut.length, 99);
});

test("incomplete legacy reference observations are never replaced with mock values", () => {
  const observations = referenceObservations({ variety: "RUBY", color: { hue: "RED" }, origin: { value: "Madagascar" } });
  assert.equal(observations.origin, "Madagascar");
  assert.equal(observations.color.hue, "RED");
  assert.ok(Number.isNaN(observations.cut.length));
  assert.ok(Number.isNaN(observations.caratWeight));
  assert.equal(observations.shape, "");
});

test("a reference editor cannot verify their own updated evidence", () => {
  const record = { source: "Reviewed source", sourceDate: "2026-10-10", origin: { value: "Sri Lanka" }, createdBy: "author", lastEditedBy: "editor" };
  assert.throws(() => requireReferenceVerification(record, "editor", true, true));
  assert.throws(() => requireReferenceVerification(record, "author", true, true));
  assert.doesNotThrow(() => requireReferenceVerification(record, "reviewer", true, true));
});

test("administrators cannot delete their own account", () => {
  assert.throws(() => requireUserDeletion("self", "self"), /own administrator account/);
  assert.throws(() => requireUserDeletion("ABCDEF0123456789ABCDEF01", "abcdef0123456789abcdef01"));
  assert.doesNotThrow(() => requireUserDeletion("another-user", "admin"));
});
