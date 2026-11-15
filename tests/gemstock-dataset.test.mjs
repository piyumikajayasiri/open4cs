import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import MarketReference from "../src/models/MarketReference.ts";
const dataset = JSON.parse(await readFile(new URL("../data/references/gemstock-sri-lanka-listings.json", import.meta.url), "utf8"));
test("Gemstock export contains 100 distinct source products with no fabricated rubric balance", () => {
  assert.equal(dataset.records.length, 100);
  assert.equal(new Set(dataset.records.map((record) => record.recordId)).size, 100);
  assert.equal(new Set(dataset.records.map((record) => record.sourceUrl)).size, 100);
  for (const record of dataset.records) {
    assert.equal(new URL(record.sourceUrl).origin, "https://gemstock.org");
    assert.equal(record.recordType, "INDIVIDUAL_LISTING");
    assert.equal(record.variety, "SAPPHIRE");
    assert.equal(record.origin.value, "Sri Lanka");
    assert.equal(record.selection, "Loose stone");
    assert.ok(Number.isFinite(Date.parse(record.retrievedAt)));
  }
});
test("listing totals and derived price-per-carat preserve USD basis and missing 4Cs", () => {
  for (const record of dataset.records) {
    assert.equal(record.currency, "USD"); assert.equal(record.priceBasis, "RETAIL_ASKING_PRICE");
    assert.ok(record.price.quotedTotal > 0 && record.weight.value > 0);
    assert.equal(record.price.derivedPerCarat, Math.round(record.price.quotedTotal / record.weight.value * 100) / 100);
    assert.equal(record.price.perCaratIsDerived, true);
    assert.equal(record.tone, null); assert.equal(record.saturation, null);
    assert.equal(record.clarity?.loupe10x, null); assert.equal(record.cut.polish, null);
    if (record.sourceTreatment.includes("diffusion")) assert.equal(record.treatment, null);
  }
});
test("all exported listings validate as pending references outside the engine", async () => {
  assert.equal(dataset.source.qualityReviewed, false); assert.equal(dataset.source.permittedUseConfirmed, false);
  for (const record of dataset.records) {
    assert.equal(record.engineEligible, false); assert.equal(record.verificationStatus, "PENDING");
    await new MarketReference({ ...record, source: dataset.source, datasetVersion: dataset.datasetVersion }).validate();
  }
});
