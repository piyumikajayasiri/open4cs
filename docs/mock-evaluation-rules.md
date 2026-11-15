# Ruby and sapphire mock evaluation rules

These rules and all numeric values are invented development fixtures. They are not
CAGS-approved grading standards, verified prices, or an implementation of Gemval's
methodology. No Gemval records have been copied or imported.

## Access and scope

- Admin rule management: `/admin/evaluation-rules`; calculator: `/admin/evaluation-rules/test`.
- User evaluation and saving: `/evaluate`; owner dashboard: `/dashboard`.
- Authenticated preview API: `GET /api/evaluations/preview` loads database rules and
  record counts; `POST /api/evaluations/preview` evaluates observations.
- Both varieties require `origin: "Sri Lanka"`. Origin reliability is declared
  separately; selecting a label does not establish provenance.
- The sapphire prototype supports blue, pink, yellow, green, purple and colourless.
  These categories are provisional; ruby supports red and purplish red.
- Mock supported shapes: oval, round, cushion, pear and emerald. Cabochon and star
  effects are not included in this version.
- Admin previews do not save evaluations. User submissions save result snapshots
  through `/api/evaluations`; see `evaluation-submission.md`. The seed script stores historical records and
  separate versioned definitions. Draft/review/activation screens manage rule
  versions; active documents are loaded and validated by the engine API. See
  `admin-management.md` for workflow and provenance handling.

## Load the historical mock dataset

```powershell
npm run seed:mock -- --dry-run
npm run seed:mock -- --apply
```

The preview is offline. Applying uses `MONGODB_URI` in `.env.local` and inserts:

- 48 labelled historical test records (12 ruby, 36 sapphire), with complete
  observations, invented total prices in USD, dates and source labels.
- Two independent rule definitions: `mock-ruby-v2` and `mock-sapphire-v2`.

Records go to `mock_historical_gemstones`; rules go to `mock_evaluation_rules`.
The script uses unique IDs and insert-only upserts. Rerunning inserts missing
records without overwriting prices, observations, rules, or activation settings.
It verifies both sample evaluations from the stored data. A connection failure
can leave a partial seed; rerunning completes missing inserts safely.

Fixtures currently cover oval shapes only, across both treatment groups and all
listed hues. Other supported shapes can be graded, but cannot be priced until
sufficient matching historical records exist.

## Scores (0–10)

All results include versioned rule identifiers and explanations.

| Component | Provisional calculation |
| --- | --- |
| Colour | Saturation weak/medium/strong/vivid = 4/6/8/10. Tone outside inclusive 4–6 deducts 0.75 per step. Uneven distribution deducts 1; zoning deducts a severity penalty. Colourless sapphire starts at 10 and skips tone/saturation preferences. |
| Clarity | Average naked-eye scores clean/slightly included/included = 10/8/5 and 10× inclusion scores minor/moderate/heavy = 10/7/4; deduct severity penalty. |
| Cut | Average symmetry and polish scores excellent/good/fair/poor = 10/8/5/2. Deduct 2 if depth percentage is outside the shape's range, then severity penalties for windowing, extinction and bulging. |
| Size | Weight bands <1, 1–<2, 2–<3, 3–<5, ≥5 ct score 5/6/7/8/9. This is a mock size convention, not an assertion that larger stones have better quality. |

Severity penalties: none 0, minor 0.5, moderate 1.5, severe 3. Scores are clamped to
0–10. Ruby overall weights: colour 45%, clarity 20%, cut 25%, size 10%. Sapphire:
40%, 25%, 25%, 10%. These weights are explicitly provisional.

Depth percentage = depth / width × 100, except round uses depth / mean(length,
width) × 100. Mock preferred ranges: round 55–70%; other supported shapes 55–75%,
inclusive. Round length/width must not exceed 1.10. Length must be at least width.
Dimensions and carats must be finite numbers from 0.01–100; tone is an integer 0–10.
These limits are software test bounds. No weight-volume plausibility check is claimed.

## Mock pricing and comparison

There is no fixed base price. Historical records supply the baseline:

1. Match variety, Sri Lankan origin, hue, shape and treatment; require weight to be
   within 50% of the input weight. Grade historical observations with the same
   active rule version as the input; reject component score differences above 3.
2. Rank by relative weight difference plus the sum of absolute colour, clarity
   and cut score differences divided by 10; break ties by record ID. Select at
   most five and require at least two matches.
3. Normalize each historical total price by its weight to get price per carat.
4. Compute weighted colour/clarity/cut score differences, normalized by the sum
   of those three weights. Adjust each price per carat by 5% per score point,
   capped at ±25%. The carat score is excluded from this adjustment because
   similar weight is already required and prices are normalized per carat.
5. Use the median adjusted price per carat × input carats as the suggested total.
   Also expose the unadjusted median baseline and each historical adjustment.
6. Return a ±20% range, an arbitrary test range rather than a confidence interval.

Unknown treatment, fewer than two matches, or a missing dataset withholds pricing.
No treatment multiplier is applied after matching the treatment group, and no
origin premium is applied. Every price, date and trade basis in these fixtures is
invented; `MOCK_B2B` is a test label, not a verified B2B transaction.

No colour similarity percentage, market-date adjustment, weight-volume
plausibility analysis or real reference validation is claimed in this first engine.

## Data separation

- `src/lib/evaluation/mock-data.ts` contains invented records and example inputs.
- `src/lib/evaluation/mock-rules.ts` contains separate scoring, matching and
  pricing parameters. The API uses seeded database definitions, not source
  defaults; missing database data never silently falls back to source fixtures.
- `src/lib/evaluation/reference-data.ts` is a distinct, empty reference dataset.
- Existing `ReferenceGemstone` database documents are untouched. The mock engine
  does not query that collection, import the reference dataset, or accept a
  caller-supplied dataset through its API.
- The engine rejects records labelled REFERENCE, records outside Sri Lanka,
  unknown treatment, duplicate IDs, invalid prices, and non-USD/non-mock price bases.
- A future reference import must record source/date, quality review, permitted
  use, currency and price basis. Retail estimates must not silently become B2B
  quotes. An origin grouping containing Sri Lanka is not verified Sri Lankan origin.
- Keep externally sourced records in the reference collection/import workflow;
  never seed them using mock fixtures or overwrite existing reference documents.

## Pending CAGS decisions

Confirm hue categories, treatment eligibility, observation vocabulary, clarity
inclusion type/location handling, shape-specific proportions, grading thresholds,
size interpretation, overall weights, price adjustment parameters, matching methodology
and evidence requirements. Keep mock and real evaluation versions distinct when
introducing approved rules; retain the original version for saved results.

## Verification

Run `node --test tests/evaluation-rules.test.mjs` to check calculations, boundaries,
input validation, unavailable pricing, deterministic outputs and dataset separation.
The suite also checks that historical price changes change suggestions, configured
rules change scores/adjustments, and an extreme quote does not dominate the median.
