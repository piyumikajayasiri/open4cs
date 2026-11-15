# Source-derived market references

The user-supplied price-list text is retained in
`data/references/ceylon-gem-market-2026.source.txt`; its SHA-256 identifies the
immutable generated dataset. The original guide is Ceylon Gem Market's
[Sri Lanka gems price list](https://www.ceylongemmarket.com/sri-lanka-gems-price-list/),
accessed 10 November 2026. The webpage says last updated September 2026; no exact
publication day is invented.

The JSON dataset contains 11 source-derived records: four broad sapphire color
ranges, four approximate blue-sapphire weight ranges, one 10+ ct individual-assessment
note without a price, and two pink-sapphire listing examples reported in the guide.
There are no ruby prices in this source. Unsupported gemstone and specialty
sapphire categories are excluded rather than mapped to supported hues.

These are **retail estimates and reported asking prices**, not completed sales,
B2B quotations or complete gemstone records. A “+” is preserved as an open-ended
quoted upper figure, not a price ceiling. The guide also allows prices below its
quoted ranges. Approximate weights and prices retain their qualifiers. Listing
examples are not independently verified listings; missing clarity, dimensions,
cut quality, tone, saturation and certificate details remain null. No total sale
prices, hypothetical stones, fixed treatment premiums or grading scores are generated.

Records are stored in a distinct `market_reference_records` collection. They do
not go into `referencegemstones`, whose schema requires complete observations,
or either mock collection. They remain PENDING, quality/permitted-use review is
false, and engine eligibility is false. Confirming the source location is not
expert validation or permission to republish. No current engine query reads them.

```powershell
node scripts/generate-market-references.mjs
node scripts/import-market-references.mjs --dry-run
node scripts/import-market-references.mjs --apply
node --test tests/market-references.test.mjs
```

The import validates before connecting, inserts only missing records in a
transaction, preserves existing versions, and writes a system-labelled audit entry
when new records are inserted. Repeating the same import creates no duplicates.
A changed source fingerprint creates a separate dataset version. The generated
JSON is available at `data/references/ceylon-gem-market-2026.json`.

Administrators can inspect the imported records at `/admin/market-references`.
This read-only view is separate from the existing complete-gemstone review editor.
Before real B2B pricing development, obtain permitted-use confirmation, domain
review and appropriate complete comparable records; do not treat these broad
ranges as enough evidence to assign per-stone grades or a validated B2B price.
