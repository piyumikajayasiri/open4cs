# Browser walkthrough — 17 November 2026

Scope: short read-only walkthrough on localhost using the documented demo administrator. User-facing screens were visited with that administrator account; no separate ordinary-user credentials were provided. No account, rule, catalogue, pricing or evaluation records were changed.

## Completed checks

Opened 24 main pages: user dashboard, evaluations, history, new evaluation, comparison, reports, catalogue, learning and settings; admin dashboard, approved rules, catalogue, evaluation rules, pricing, reference gemstones, historical pricing, market references, treatment, origin, recommendations, versions, audit, users and settings. The final isolated-tab pass reported no page errors, nonempty alert messages or desktop horizontal overflow. This verifies page availability, not every write operation.

Mobile navigation at 390 px: menu initially hidden; opens on request; Escape closes; selecting Settings closes; Open user panel returns to the user dashboard. No horizontal overflow on the checked admin dashboard.

## Fixes

- PDF font resolution used a bundled require.resolve expression that made webpack parse binary WOFF files as JavaScript. Read fonts as filesystem assets and explicitly include them in report route deployment traces.
- Admin navigation now adapts to narrow screens and provides a link to the user panel.
- Removed nested main landmarks in the admin shell and corrected the crowded sign-out footer.
- Replaced the default framework browser-tab title with Open 4Cs branding.

## Current database readiness

- Catalogue entries: 2; ready entries: 0.
- Active approved rule versions: 0; pending versions: 0.
- Review-pack imports: none.
- Reviewed references: 0; pending references: 0.
- Sample historical records: 48; separate market references: 111. These are not verified B2B quotes.
- Saved evaluations and reports owned by the walkthrough account: 0.

## Still outstanding

Import the recorded rule pack, obtain independent administrator activation, link supported catalogue entries, and collect/review sufficient complete B2B quotation records. Separately verify ordinary-user access restrictions and, once suitable saved data exists, run one result/comparison/history/report generation-preview-download flow. No rule activation or fabricated price evidence was introduced during this walkthrough.

## Minimal validation

A focused in-memory sample PDF render produced a valid %PDF- document (one page). No report was saved to the database. TypeScript and diff whitespace checks were run. No full automated test suite was run.


## Completion follow-up

The recorded pack was imported through the authenticated admin endpoint. `cags-ruby-v1` and `cags-sapphire-v1` are now PENDING, with no fabricated reviewer and no activation. Existing Blue Sapphire already had the correct Sri Lankan corundum, BLUE and OVAL/ROUND mapping. Added Ruby (`RUBY-SL`) with RED/PURPLISH_RED and OVAL/ROUND mapping; its configuration was recorded in the admin audit. Existing unrelated catalogue records were preserved.

Added an idempotent local sample-preparation utility at `scripts/seed-sample-evaluations.mjs`. It defaults to preview, requires explicit existing owner IDs and `--apply` for writes, and never creates or approves real rules or pricing references. Two MOCK evaluations were saved for the demo admin and two for a temporary ordinary user. Samples remain visibly labelled and immutable; no live evaluation approval gate was bypassed.

Ordinary-user sign-in passed. Admin API access returned 403, admin page navigation returned to the user dashboard, and another owner's evaluation returned 404. Saved result, historical pricing and detailed comparison screens passed, including the differences-only control.

The browser found six form actions missing an explicit submit type: report generation, profile save, password update, deactivation, rule draft save and catalogue mapping save. Their buttons now declare `type="submit"`. Verified profile saving through the temporary user's settings form. Added a prominent sample-data warning and corrected the saved evaluation's back link to the evaluation list.

Generated reports through the user and admin browser forms, opened each preview iframe and downloaded valid PDF files. The user report has nine pages and the admin report eight pages, both labelled MOCK. Foreign report metadata and PDF requests returned 404. Browser page-error collection was empty. The temporary user was then deactivated through the account API; its sample records and report remain retained, as documented by the account-deactivation policy.

Final readiness: 3 catalogue entries, 0 ready entries, 2 pending rules, 0 active approved rules, 0 verified references, 48 sample historical records, 111 separate market references and 7 active accounts. Independent activation and complete reviewed B2B quotations remain outstanding external inputs. The new-valuation flow with real rules and quotations remains unavailable until those inputs exist.

Final TypeScript and whitespace checks passed. No full automated test suite was run.
