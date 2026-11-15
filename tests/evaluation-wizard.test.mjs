import test from "node:test";
import assert from "node:assert/strict";
import { blankDraft, draftErrors, firstErrorStep, observationsFromDraft, STEP_FIELDS } from "../src/lib/evaluation/wizard.ts";
import { MOCK_EXAMPLES } from "../src/lib/evaluation/mock-data.ts";
import { MOCK_RULES } from "../src/lib/evaluation/mock-rules.ts";
const draftOf = (input) => Object.fromEntries(Object.entries(input).flatMap(([key, value]) => typeof value === "object" ? Object.entries(value).map(([field, item]) => [`${key}.${field}`, String(item)]) : [[key, String(value)]]));
test("blank form does not silently assume gemstone observations", () => {
  const draft = blankDraft();
  assert.deepEqual(draft, { origin: "Sri Lanka" });
  assert.ok(Number.isNaN(observationsFromDraft(draft).caratWeight));
  assert.ok(draftErrors(draft, MOCK_RULES, 0).variety);
  assert.equal(firstErrorStep(draftErrors(draft, MOCK_RULES)), 0);
});
test("steps validate only their own fields but review validates everything", () => {
  const draft = { ...blankDraft(), variety: "RUBY" };
  assert.deepEqual(draftErrors(draft, MOCK_RULES, 0), {});
  assert.deepEqual(Object.keys(draftErrors(draft, MOCK_RULES, 1)), ["shape"]);
  assert.ok(draftErrors(draft, MOCK_RULES, 7).caratWeight);
  assert.ok(draftErrors(draft, MOCK_RULES, 7)["cut.depth"]);
});
test("all engine observations have a step and valid observations round trip", () => {
  for (const input of Object.values(MOCK_EXAMPLES)) {
    const draft = draftOf(input);
    assert.deepEqual(observationsFromDraft(draft), input);
    assert.deepEqual(draftErrors(draft, MOCK_RULES), {});
    for (const path of Object.keys(draft)) assert.ok(STEP_FIELDS.some((fields) => fields.includes(path)), path);
  }
});
test("cut cross-field validation catches reversed dimensions and non-round ratios", () => {
  const draft = draftOf(MOCK_EXAMPLES.RUBY);
  draft["cut.length"] = "2"; draft["cut.width"] = "3";
  assert.match(draftErrors(draft, MOCK_RULES, 4)["cut.length"], /at least width/);
  draft.shape = "ROUND"; draft["cut.length"] = "4";
  assert.match(draftErrors(draft, MOCK_RULES, 4)["cut.width"], /1.10/);
  assert.equal(firstErrorStep(draftErrors(draft, MOCK_RULES)), 4);
});
test("numeric messages reject empty, non-finite, fractional tone and out-of-range values", () => {
  const draft = draftOf(MOCK_EXAMPLES.RUBY);
  for (const invalid of ["", " ", "Infinity", "abc", "0", "101", "-1"]) {
    draft.caratWeight = invalid;
    assert.ok(draftErrors(draft, MOCK_RULES, 5).caratWeight, invalid);
  }
  draft["color.tone"] = "5.5";
  assert.match(draftErrors(draft, MOCK_RULES, 2)["color.tone"], /whole number/);
});
test("review rejects stale hues after changing variety and allows unknown treatment", () => {
  const draft = draftOf(MOCK_EXAMPLES.RUBY);
  draft.variety = "SAPPHIRE";
  assert.ok(draftErrors(draft, MOCK_RULES)["color.hue"]);
  draft["color.hue"] = "BLUE"; draft.treatment = "UNKNOWN";
  assert.deepEqual(draftErrors(draft, MOCK_RULES), {});
});
