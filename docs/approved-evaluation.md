# Approved rules, real pricing and catalogue integration

## What changed

User `/catalogue` and `/evaluate` now use managed catalogue entries and approved rule definitions. New `/api/evaluations` submissions cannot silently fall back to mock rules, retail listings or invented prices. Existing mock evaluations remain readable and the admin sample-rule calculator remains available separately.

## Administrator workflow

1. Open `/admin/approved-rules`. Create a Ruby or Sapphire draft. Draft templates contain development values, clearly labelled as unapproved; review or replace every value. No numeric values in a template establish CAGS approval.
2. Record a change summary and methodology/CAGS evidence. Edit the scoring, matching and pricing parameters using the form. Currency must be USD or LKR; reference-age limits are explicit. The version identifies immutable definitions once approved.
3. Save the draft and submit it. The creator and last editor cannot approve it. Another authorised administrator must inspect the parameters and evidence, enter review notes and explicitly confirm domain review.
4. Approval atomically archives the previous active version for that variety and activates the new version. Audit records commit with the changes. An active version can be retired; it cannot be edited. Create a revised draft for changes.
5. In Catalogue integration, map existing gemstone entries explicitly to Ruby or Sapphire and configure supported shapes/hues. The entry must be ACTIVE, Sri Lankan, corundum, and within the approved rule's hues. Star and padparadscha specialty grading remain unavailable. Existing unmapped catalogue entries are not automatically guessed or activated.
6. Add complete observations and a dated B2B quotation at `/admin/reference-gemstones`. An independent administrator must verify the reference and confirm quality and permitted use. Review remains administrative evidence, not laboratory authentication.
7. Check `/catalogue`. A ready entry enables scoring; sufficient eligible comparables also enable a price range. Missing references result in saved scores with an explicit price-unavailable reason.

## Pricing policy

Only independently verified REFERENCE records with a B2B_QUOTE price basis, complete supported observations, known treatment, positive prices, matching currency and an acceptable source date are eligible. Retail estimates and public asking-price market collections remain excluded. Completed sales are excluded because the current schema does not establish their B2B trade channel. No exchange rate is invented.

Matching uses variety, hue, shape, treatment, relative weight and 4C score tolerances. Eligible quotations are ranked deterministically. The configured minimum/maximum counts apply. Each quote's price per carat receives the approved capped quality adjustment; the median adjusted price per carat is multiplied by the evaluated weight. The approved percentage defines the displayed range, not statistical confidence. No additional origin or treatment premium is invented. The pricing methodology itself must be reviewed before activation.

Current scoring vocabulary and algorithms are restricted to the existing engine. This workflow does not implement inclusion-type/location scoring, color similarity, new specialty varieties, new modifier families or arbitrary formulas. Approvals record administrator attestations and evidence; the software does not independently authenticate CAGS documents.

## Persistence and access

New evaluations retain input, complete result, rule definition and review evidence, selected reference snapshots (including revision and verification), catalogue snapshot, category and timestamps. Rules, references and catalogue eligibility are read in the same MongoDB snapshot transaction as the evaluation insert. Later changes do not recompute old results. Retry keys remain owner-specific and retain catalogue identity in the input fingerprint.

Administrative writes require current active admin access and same-origin checks. Rule/currency definitions are validated server-side. Draft edits use revision checks; mapping edits check the catalogue modification timestamp. One active approved version per variety is enforced by an index. No database seed, source import or actual approval is performed by this change.

## APIs

- `GET /api/catalogue`: authenticated managed catalogue/readiness plus usable rule definitions.
- `GET/POST /api/admin/approved-rules`: inspect rules, explicit unapproved templates and mappings; create a draft.
- `PATCH /api/admin/approved-rules/[id]`: UPDATE, SUBMIT, RETURN, APPROVE or RETIRE with revision checks.
- `PATCH /api/admin/catalogue/[id]`: explicit engine variety, supported shapes and hues with modification-time checks.
- Existing reference management performs complete observation entry and independent verification.

Use a MongoDB replica set/Atlas deployment supporting transactions. The new collection and its unique indexes are initialized when the admin workflow is used. No existing records are migrated automatically.

## Checks

`node --test tests/*.test.mjs`

`npx tsc --noEmit --incremental false`

The new tests use synthetic records only. They cover review independence, transitions, configuration gates, retail/mock/currency/date exclusions, no-price outcomes, matching, median calculations, capped adjustments and immutable snapshots. Live authenticated multi-administrator workflows and database transaction checks require separate environment verification.

Rollback-only database integration check: `node scripts/check-approved-workflow.mjs`. It creates synthetic records inside one transaction, checks the workflow and aborts, then verifies no test records or approvals remain. Collection/index initialization may create schema metadata.
