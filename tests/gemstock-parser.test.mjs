import test from "node:test";
import assert from "node:assert/strict";
import { normalizeTreatment, parseGemstock, productLinks } from "../scripts/gemstock-parser.mjs";
const html = (changes = {}) => {
  const facts = { Weight: "3.78 ct", Selection: "Loose stone", Origin: "Sri Lanka (Ceylon)", Treatment: "none", Shape: "Pear", Dimensions: "11.02 × 7.50 × 6.22 mm", "Basic color": "Blue", "Clarity grade": "Eye-clean", ...changes.facts };
  return `<script type="application/ld+json">${JSON.stringify({ "@type": "Product", name: changes.title || "Unheated blue sapphire", offers: [{ "@id": "12564", priceCurrency: changes.currency || "USD", price: changes.price || "25448" }] })}</script>` + Object.entries(facts).map(([key, value]) => `<div class="list__var">${key}</div><div class="list__val value">${value}</div>`).join("");
};
const parse = (changes) => parseGemstock(html(changes), "https://gemstock.org/product/11519/", "2026-11-11T00:00:00Z");
test("listing facts preserve provenance, missing observations and derived price", () => {
  const record = parse().record;
  assert.equal(record.recordId, "GEMSTOCK-12564"); assert.equal(record.price.quotedTotal, 25448);
  assert.equal(record.price.derivedPerCarat, 6732.28); assert.equal(record.price.perCaratIsDerived, true);
  assert.deepEqual(record.cut.dimensions, { length: 11.02, width: 7.5, depth: 6.22, unit: "mm" });
  assert.equal(record.clarity.sourceGrade, "Eye-clean"); assert.equal(record.clarity.loupe10x, null);
  assert.equal(record.saturation, null); assert.equal(record.tone, null); assert.equal(record.engineEligible, false);
});
test("foreign, multi-stone, unsupported and unknown-currency evidence is rejected", () => {
  for (const change of [{ facts: { Origin: "Thailand" } }, { facts: { Selection: "Pair" } }, { title: "Pair of blue sapphires" }, { title: "Padparadscha sapphire" }, { title: "Blue spinel" }, { facts: { "Basic color": "Orange" } }, { currency: "RUB" }]) assert.ok(parse(change).rejected);
});
test("unknown treatment and missing dimensions are not invented or guessed", () => {
  const record = parse({ facts: { Treatment: "Not specified", Dimensions: "not supplied" } }).record;
  assert.equal(record.treatment, null); assert.equal(record.sourceTreatment, "Not specified"); assert.equal(record.cut.dimensions, null);
});
test("explicit low-temperature heating is normalized without treating diffusion as heat-only", () => {
  assert.equal(normalizeTreatment("low temperature heating"), "HEATED");
  assert.equal(normalizeTreatment("heating, heating with beryllium diffusion"), null);
});
test("product links come only from collection cards and are deduplicated", () => {
  const page = '<a class="product s-product-wrapper" href="/product/1/">stone</a><a class="product s-product-wrapper" href="/product/1/">stone</a><a href="/product/2/">unrelated</a>';
  assert.deepEqual(productLinks(page), ["https://gemstock.org/product/1/"]);
});
