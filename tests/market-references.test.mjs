import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import MarketReference from "../src/models/MarketReference.ts";
const dataset = JSON.parse(await readFile(new URL("../data/references/ceylon-gem-market-2026.json", import.meta.url), "utf8"));
test("source-derived references have traceable provenance and no fabricated ruby records", async () => {
  assert.equal(dataset.records.length, 11);
  assert.equal(new Set(dataset.records.map((record) => record.recordId)).size, 11);
  assert.ok(dataset.records.every((record) => record.variety === "SAPPHIRE"));
  const source = await readFile(new URL("../data/references/ceylon-gem-market-2026.source.txt", import.meta.url), "utf8");
  assert.equal(dataset.source.inputSha256, createHash("sha256").update(source).digest("hex"));
  assert.equal(dataset.source.updatedPeriod, "2026-09");
  assert.equal(dataset.source.updatedPeriodPrecision, "MONTH");
});
test("category ranges preserve actual source values and open-ended qualifiers", () => {
  const categories = dataset.records.filter((record) => record.recordType === "CATEGORY_RANGE");
  assert.deepEqual(categories.map((record) => [record.hue, record.price.quotedLowerPerCarat, record.price.quotedUpperPerCarat]), [["BLUE", 300, 6000], ["YELLOW", 30, 1200], ["PINK", 400, 6000], ["PURPLE", 100, 4000]]);
  for (const record of dataset.records.filter((record) => record.price?.kind === "INDICATIVE_RANGE")) {
    assert.equal(record.price.upperOpenEnded, true);
    assert.equal(record.price.guaranteedBounds, false);
  }
});
test("approximate carat categories are not converted into fabricated exact specimen weights", () => {
  const rows = dataset.records.filter((record) => record.recordType === "WEIGHT_RANGE");
  assert.equal(rows.length, 4);
  assert.deepEqual(rows.map((record) => record.price.quotedUpperPerCarat), [3000, 6000, 8000, 10000]);
  assert.equal(rows[0].weight.kind, "APPROXIMATE_VALUE");
  assert.deepEqual(rows[2].weight, { kind: "APPROXIMATE_RANGE", lower: 3, upper: 4 });
  const large = dataset.records.find((record) => record.recordType === "INDIVIDUAL_ASSESSMENT_NOTE");
  assert.equal(large.weight.lower, 10); assert.equal(large.price, null);
});
test("reported pink examples retain approximate asking prices and unverified treatment", () => {
  const rows = dataset.records.filter((record) => record.recordType === "REPORTED_LISTING");
  assert.deepEqual(rows.map((record) => [record.weight.value, record.price.quotedPerCarat, record.treatment]), [[2.54, 3357, "HEATED"], [4.01, 2035, "UNHEATED"]]);
  assert.ok(rows.every((record) => record.priceBasis === "RETAIL_ASKING_PRICE" && record.treatmentEvidence === "SOURCE_REPORTED_NOT_LAB_VERIFIED"));
});
test("missing observations stay null and all records stay pending outside the engine", async () => {
  for (const record of dataset.records) {
    assert.equal(record.dataKind, "MARKET_REFERENCE"); assert.equal(record.engineEligible, false); assert.equal(record.verificationStatus, "PENDING");
    for (const field of ["shape", "clarity", "cut", "tone", "saturation", "certification"]) assert.equal(record[field], null);
    assert.equal(record.totalPrice, undefined);
    await new MarketReference({ ...record, source: dataset.source, datasetVersion: dataset.datasetVersion }).validate();
  }
  await assert.rejects(new MarketReference({ ...dataset.records[0], source: dataset.source, datasetVersion: dataset.datasetVersion, engineEligible: true }).validate());
});
