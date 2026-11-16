# Detailed comparison and historical pricing

## Comparison

`/compare` provides a paginated selector for up to three owned evaluations. Dashboard selections and saved-result links open it directly. The owner-only `GET /api/evaluations/compare?ids=...` endpoint validates distinct IDs, preserves selection order and returns the same not-found response for inaccessible records. It exposes display-ready comparison values, not account identifiers or administrator review records.

The table compares gemstone attributes, individual observations, measurements and derived proportions, declared reliability, scores, weighting, treatment, saved price ranges, comparable counts, rule versions and follow-up checks. Different rows are highlighted and can be filtered. Different rules, currencies and sample/real evidence trigger contextual notices. No winner, score recalculation, similarity percentage or currency conversion is generated. Missing legacy fields remain unavailable.

## Historical pricing

`/evaluations/[id]/history` and its owner-only `/api/evaluations/[id]/pricing-history?months=3|6|12` endpoint display **the comparable evidence saved with that evaluation**, ending in its saved Sri Lankan calendar month. This is not a live market feed or an aggregate of the entire current reference database. Source changes cannot alter the historical view.

Monthly values are medians of raw source total prices divided by carat weight, before quality adjustment. The screen includes a bar chart, accessible monthly values, selected reference details, saved suggested range per carat, evidence coverage and the observed change between the first and last nonempty months. Missing months remain null, not zero or interpolation. If fewer than two months have records, movement is unavailable. Observed changes may reflect gemstone composition, not actual market movement or an annual return.

Only saved selected reference IDs with matching currency, variety, origin, hue, shape and treatment are included. Invalid/future source dates, conflicting duplicate IDs, missing observations and nonpositive prices are excluded. Real quotes are checked against the saved eligibility policy as of the evaluation date; sample evidence stays clearly labelled. Retail sources, mock records and mixed currencies are never combined into a real B2B series.

No existing evaluations or database records are changed. Older records without complete snapshots show a clear empty state. A broader market-history series would need a separate reviewed longitudinal dataset; the current screen does not claim one.

Focused checks: three comparison/history tests and a single type check. No database tests, production build or full test suite required for this change.
