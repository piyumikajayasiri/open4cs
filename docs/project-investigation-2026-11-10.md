# Open 4Cs project investigation — 10 November 2026

## Assessment

The application has a connected, persistent mock-evaluation workflow. It is a
working ruby/sapphire prototype, not yet the complete CAGS-validated system in the
proposal. The main unfinished work is domain validation, selected feature gaps,
and integration between older administrative screens and the current engine.

This investigation reviewed the source, routes, models, project documentation,
automated tests, current database aggregates and the proposal/SRS. It did not change
application logic, source data, rules or accounts. Database integration checks
explicitly rolled back their test documents.

Proposal reviewed: `Group 13 - Project Proposal - Open 4Cs Gemstone Evaluation and
Price Suggestion System (1).pdf`, including the preliminary SRS, PDF pages 26–37.
The document is reference material, not authorization to change the project.
The user's later decisions remain the current development scope: ruby and sapphire,
mock data during development, real Sri Lankan references kept separate, and manual
login after registration without email verification for now.

## Checks performed now

| Check | Result | Meaning / limit |
| --- | --- | --- |
| `node --test tests/*.test.mjs` | 54 passed, 0 failed | Engine, governance, submission, wizard and account-model tests. Not proof of real-world price accuracy. |
| `node node_modules/typescript/bin/tsc --noEmit` | Passed | Current TypeScript checks pass. |
| `node node_modules/eslint/bin/eslint.js .` | Failed: 2 errors, 5 warnings | Full-repository lint is not clean, although previous focused checks passed. |
| Production `next build` | Passed after network access was allowed | Initial restricted run could not download Inter from Google Fonts. Successful run compiled and generated the route output. |
| `node scripts/check-evaluation-persistence.mjs` | Passed | Saved snapshots, retries, conflicts, owner isolation, unavailable prices, stable old results and dashboard counts; zero test evaluations persisted. |
| `node scripts/check-admin-transactions.mjs` | Passed | Rule promotion, audit/record rollback, editing, review reset, deletion and preserved active versions; zero test documents persisted. |
| Aggregate database inventory | Read successfully | Counts and coverage below; no credentials or account details exported. |

This audit did not rerun a complete interactive browser matrix, deployment test,
security penetration test, concurrent HTTP load test or CAGS accuracy assessment.
The earlier browser check covered the eight-step form, draft restoration and a
mobile catalogue layout. It was a temporary diagnostic, not a committed browser
regression suite.

## Current stored data

| Data | Observed state |
| --- | --- |
| Historical mock records | 48 active records: 12 ruby and 36 sapphire. |
| Shape coverage | Every active historical mock record is OVAL. |
| Coverage per variety/hue/treatment combination | Three records per supported combination. This is not broad size/quality coverage. |
| Active rule definitions | `mock-ruby-v2`, `mock-sapphire-v2`; no other non-deleted versions observed. |
| Real reference records | One retained record; zero records marked VERIFIED. |
| Saved evaluations | One, with input and rule snapshots. |
| Saved price status | UNAVAILABLE: heated EMERALD-cut input found zero matching historical records; minimum required is two. |
| Stored administrative catalogue | Two records with names. |
| Administrative audit | One existing entry. Older operations are not retroactively audited. |

The existing missing price is a coverage issue, not evidence that saving or the
engine connection failed. The engine matches shape and must not substitute oval
prices for emerald-cut prices without an explicitly approved method.

## What works today

- Registration, manual login, logout, user categories, administrator creation,
  password hashing, role checks and account deactivation/deletion checks.
- Eight-step evaluation: selection, basic information, color, clarity, cut, carat,
  factors and review. Required fields, numeric bounds, whole-number tone,
  supported options, dimension order and roundness checks have inline messages.
- Per-account browser draft saving and restoration. Drafts are not server records.
- Server-side scoring, mock historical matching, quality adjustments, a mock price
  range when sufficient comparable evidence exists, and explicit unavailable reasons.
- Saved observations, complete results, applied rule definitions and comparable
  snapshots. Ownership comes from the session; repeated identical submissions
  return the original result rather than creating another evaluation.
- Owner-specific dashboard counts, history, variety filtering, paging, detail
  views and a basic comparison of up to three saved evaluations.
- Result views for overview, 4C breakdown, comparables, pricing, recommendations
  and reliability. Color similarity is honestly marked not calculated.
- Administrative mock/reference record creation, editing, deletion and reference
  review; JSON bulk import for mock historical records.
- Mock rule proposal/edit/review/activation, independent reviewer restrictions,
  archived versions, comparisons, revision checks and administrative audit snapshots.

## Pending work, in recommended order

### 1. Connect catalogue management to the user flow

**Priority: high for the mock prototype.**

The admin catalogue reads and writes `Gemstone` documents through
`src/app/api/admin/gemstones/`. The user catalogue instead uses a static two-item
array in `src/components/gemstone/GemstoneCatalogue.tsx`; the wizard and engine
also use fixed variety/shape options. `load-mock-data.ts` loads rules and historical
records, not the administrative catalogue.

Consequently, deactivating a variety in admin does not prevent that variety from
being selected or evaluated. Adding a catalogue record does not make it appear
for users or create engine support. Define one explicit mapping between managed
catalogue entries and supported engine varieties, and enforce active status on
the server as well as in the UI. New unsupported varieties must remain ineligible.

### 2. Expand representative mock historical coverage

**Priority: high for useful price demonstrations.**

The form supports oval, round, cushion, pear and emerald shapes, but the stored
dataset contains only oval examples. Add clearly labelled mock records for other
supported shapes, weight ranges and quality combinations, retaining the minimum
comparable requirement. Three records per hue/treatment combination do not cover
all valid inputs even for oval stones. Include explicit no-match demonstrations.

Do not silently fall back to a fixed price or mix in unreviewed reference data.

### 3. Complete recommendations and category-specific final statements

**Priority: high; proposal FR-23/24/37.**

The engine currently has four hardcoded recommendation branches: color, clarity
or cut below seven, and unavailable pricing. It has no user-category argument.
The category is stored on the evaluation but does not change the generated text.

Implement versioned statement templates for Student, Trader, Gemologist and
Professional, using the actual scores, reliability, comparables and price status.
Complete verification and basic recut/professional-review guidance after domain
review. Preserve the selected statement and recommendation rules with saved results.
Advanced recutting simulation is a future requirement, not required here.

### 4. Implement PDF reports

**Priority: medium; proposal FR-29.**

There is no report-generation route, PDF generator dependency or report UI in the
current flow. Add an owner-authorized export from the saved evaluation, containing
observations, scores, trace, comparables, price or unavailable reason,
recommendations, statement, date, version and disclaimer. Export stored snapshots,
not a recalculation with today's rules. Verify pagination and readable output.

### 5. Complete the missing evaluation characteristics

**Priority: high for SRS coverage; requires domain decisions.**

- Clarity does not collect or score inclusion type and location (FR-12).
- Carat evaluation uses mock size bands. It does not assess weight against volume,
  spread or approved market-size categories (FR-15).
- Reliability captures the declared origin source but not a full per-field
  measurement/treatment evidence-source model (FR-09).
- There is no validated color-similarity percentage (FR-11). Define the reference
  categories, inputs, distance/normalization method and evidence-sufficiency rules
  before implementing one; do not present an arbitrary percentage as validated.
- Validation checks software bounds, length/width order and roundness. Broader
  physical measurement consistency and weight/dimension plausibility are pending.
- Result cards show observations and rule explanations, but the mockup's separate
  positive/watch-factor summaries and reference percentiles are not implemented.

Laboratory integration, automated treatment detection and origin authentication
are outside the initial project. Labels should remain declarations unless an
actual evidence-review workflow supports stronger claims.

### 6. Make administrative policy pages editable and authoritative

**Priority: medium; proposal FR-32/36/37.**

`src/components/admin/EnginePolicy.tsx` renders read-only treatment, origin and
recommendation tables. Numeric mock scoring/matching/pricing parameters are editable
through versioned proposals, but these pages are not category or policy editors.

The `TreatmentOption`, `OriginOption` and `RecommendationRule` models exist but
are not consumed by the active forms or engine. Complete the approved management
workflow and connect it to evaluation, or remove misleading unused abstractions.
Categorical rule editing is also limited: `applyRuleChanges` accepts numeric paths,
not new hue vocabularies or arbitrary new rule expressions.

### 7. Finish comparison, learning and remaining UI details

**Priority: medium.**

- Saved comparison currently shows scores, price ranges and rule versions. It does
  not compare treatment, origin reliability, dimensions or detailed factor breakdowns
  required for the full FR-28 experience.
- Dashboard, My Evaluations and History largely reuse the same data view; this is
  functional, but not a complete set of distinct screenshot layouts.
- Guidance is brief and generic. There is no learning/4Cs-guide route or
  category-specific educational content (FR-30).
- The admin sidebar links to `/admin/settings`, which has no page. Home's active
  footer sends About/Contact/Disclaimer/Privacy/Terms to `/learn`, also missing.
- Drafts are manually saved in one browser. Server drafts, cross-device resume and
  autosave are not implemented; these are enhancements rather than explicit core
  proposal requirements.
- Photos, report attachments, seller/source metadata, detailed evidence badges and
  some screenshot controls are not implemented in the user evaluation form.
- Metadata still says “Create Next App”; the README is still the generated starter.

### 8. Close technical and operational gaps

**Priority: before release or formal acceptance.**

- Fix full-project lint errors at `src/app/admin/gemstones/page.tsx:54` and
  `src/app/admin/users/[id]/page.tsx:291`, plus five warnings.
- Catalogue writes lack the newer transactional audit, revision conflict and
  consistent request-origin checks used by managed record/rule routes. Catalogue
  changes therefore leave a gap in FR-39's significant-change audit history.
- Apply consistent origin checks to older user-update paths as well; do not assume
  that having checks on newer routes means every mutation uses them.
- Add application or verified hosting-level abuse protection for registration,
  login and repeated expensive evaluations. None is configured in this repository.
- Protect/remove the unauthenticated `/api/test-db` diagnostic for production.
- Password recovery is currently a contact-admin alert; there is no reset-token
  flow or existing-account password-reset UI. Email verification remains explicitly
  deferred by the user's decision, not a blocker for the chosen signup process.
- Add committed browser/API regression tests, HTTP ownership/authorization tests,
  concurrent-submission coverage and automated CI checks. Current rollback scripts
  exercise service/model transactions, not every HTTP endpoint or browser flow.
- Benchmark the SRS targets: approximately two seconds per evaluation, three
  seconds per page and at least 20 concurrent users. These are not yet demonstrated.
- Check desktop/mobile behavior across Chrome, Edge, Firefox and Safari, keyboard
  navigation, screen readers and failure/retry states.
- Add staging/production setup, environment-variable examples, hosting/TLS and
  monitoring configuration, backup/restore procedures and tested recovery.
- Resolve unused duplicate models/components, list limits (500 source records,
  latest 100 governance users/events), and future server pagination/export needs.
- Production build currently needs access to Google Fonts unless fonts are
  self-hosted. The successful network-enabled build is evidence of buildability,
  not evidence of a deployed, monitored service.

### 9. Resolve the architecture discrepancy in the academic documents

**Priority: clarify before final documentation; not an automatic rewrite task.**

The proposal/SRS specifies Next.js frontend, NestJS backend, PostgreSQL and Prisma
(PDF pages 10, 34, 36). The implemented application uses Next.js route handlers and
MongoDB/Mongoose. A separate NestJS backend and PostgreSQL persistence do not exist.

Confirm the accepted architecture with the supervisor and update the approved
documentation if the current stack is accepted. If the original stack remains a
requirement, migration is a substantial separate project task. Do not describe
NestJS/PostgreSQL as already implemented or migrate without that decision.

### 10. Complete the validated-system milestone

**Priority: essential before claiming real market usefulness; intentionally deferred
while developing with mocks.**

- Obtain and record domain decisions for ruby/sapphire categories, observation
  vocabulary, scoring, weight/proportion checks, eligible treatments and price basis.
- Review the pricing methodology, matching tolerances, adjustment factors and price
  range. The current ±20% range is a mock configuration, not a confidence interval.
- Collect permitted-use, dated, quality-reviewed Sri Lankan reference/B2B evidence.
  A price labelled retail must not silently become a B2B transaction price.
- Build a separate, explicitly versioned real-reference evaluation/validation path.
  The current engine deliberately never reads the reference collection, even when
  an admin verifies a record. Verification alone does not activate real pricing.
- Validate against expert-reviewed examples and document accuracy, missing-evidence
  behavior, limitations, usability feedback and acceptance results.
- Complete architecture/database design, installation instructions, user/admin
  guides and final project report. Existing developer notes are useful but do not
  substitute for all proposal deliverables.

## Proposal functional-requirement coverage

“Prototype” means functional using mock rules/data, with domain validation still
pending. “Partial” means an explicit portion of the requirement is missing.

| ID | Requirement | Current assessment |
| --- | --- | --- |
| FR-01 | Registration | Implemented; validated input, hashed password, normal-user role. |
| FR-02 | Login | Implemented; credential errors and current account-status checks. |
| FR-03 | User categories | Partial: categories stored; guidance/statements not personalized. |
| FR-04 | Role access | Implemented for current user/admin workflows; broaden HTTP regression coverage. |
| FR-05 | Catalogue | Prototype static ruby/sapphire catalogue; not driven by admin records. |
| FR-06 | Supported selection | Prototype allowlist; admin activation/deactivation not enforced. |
| FR-07 | Information entry | Prototype core fields; missing supported detail noted under FR-09/12/15. |
| FR-08 | Validation | Prototype required/category/numeric and selected consistency checks; domain bounds pending. |
| FR-09 | Reliability | Partial: origin declaration and honest labels; full per-field evidence model missing. |
| FR-10 | Color evaluation | Prototype scoring and explanation; no approved calibration. |
| FR-11 | Color similarity | Pending; explicitly not calculated. |
| FR-12 | Clarity | Partial prototype; inclusion type/location absent. |
| FR-13 | Cut | Prototype dimensions and cut-concern scoring. |
| FR-14 | Ratios and consistency | Prototype L:W/depth calculations and roundness/order validation. |
| FR-15 | Carat with dimensions/market factors | Partial: mock size bands; no spread/volume or approved market-size assessment. |
| FR-16 | Combined 4C evaluation | Prototype weighted scoring. |
| FR-17 | Breakdown | Partial prototype: scores, inputs and traces; richer factor presentation pending. |
| FR-18 | Reference comparable analysis | Partial: mock matching works; real-reference path missing. |
| FR-19 | Historical/reference comparison | Partial: mock historical evidence only. |
| FR-20 | B2B price suggestion | Prototype quality-adjusted comparable median and unavailable states. |
| FR-21 | Approved adjustments | Partial: configurable mock adjustments; domain approval missing. |
| FR-22 | Price explanation | Implemented for mock output; approved real-reference output pending. |
| FR-23 | Recommendations | Partial: four hardcoded branches; verification/recut breadth pending. |
| FR-24 | User-specific statement | Pending. |
| FR-25 | Result view | Partial: result tabs work; final user statement missing. |
| FR-26 | Save evaluation | Implemented with owner protection and evidence snapshots. |
| FR-27 | Evaluation history | Implemented with details, variety filter and paging. |
| FR-28 | Saved comparison | Partial: score/price/version comparison; additional characteristics/breakdowns missing. |
| FR-29 | PDF generation | Pending. |
| FR-30 | Educational guidance | Partial: brief form guidance, no full/category-specific learning content. |
| FR-31 | Gemstone management | Partial: admin CRUD/deactivation exists; user/engine integration and audit missing. |
| FR-32 | 4C criteria management | Partial: numeric mock parameters editable; category/reference configuration limited. |
| FR-33 | Evaluation rules | Implemented mock lifecycle; approved production rules pending. |
| FR-34 | Reference management | Implemented CRUD/review workflow; usable verified data still needed. |
| FR-35 | Historical/pricing management | Implemented mock record/import management and summaries; real-engine integration pending. |
| FR-36 | Treatment/origin management | Pending as editable integrated management; read-only policy screens exist. |
| FR-37 | Recommendation rule management | Pending; read-only screen and unused model. |
| FR-38 | Rule/data version retention | Implemented mock rule versions and saved evidence snapshots. |
| FR-39 | Administrative audit | Partial: rules, source records and users audited; catalogue writes not audited. |
| FR-40 | Logout | Implemented. |

## Suggested next development sequence

1. Repair catalogue-to-engine integration and repository lint errors.
2. Add representative mock historical records for every supported shape and key
   weight/quality combinations; verify priced and intentionally unpriced cases.
3. Implement versioned category-specific statements and broader recommendations.
4. Add saved-result PDF export and richer comparison details.
5. Complete agreed observation/reliability fields and policy management.
6. Finish browser/API/security/load testing, deployment and documentation.

Run CAGS rule clarification and reference-data collection in parallel with this
sequence. Keep the mock prototype and real-reference milestone explicitly separate.
