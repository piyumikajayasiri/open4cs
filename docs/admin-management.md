# Admin management implementation

The three supplied mockups define the navigation and visual structure. Displayed
counts, dates, people, price bands and statuses come from the database; screenshot
examples such as +9% and “42 approved” are not treated as approved domain rules.

## Screens

| Route | Behaviour |
| --- | --- |
| `/admin/evaluation-rules` | Rule table, category/variety/version filters, parameter details, draft editing/deletion, proposals, review submission, activation and return to draft. |
| `/admin/evaluation-rules/test` | Separate calculator for the selected active database rules. |
| `/admin/pricing` | Price-per-carat ranges calculated from active mock historical records, grouped by variety, hue, treatment and weight band. These are summaries, not fixed engine base prices. |
| `/admin/reference-gemstones` | Sri Lankan references; add/edit/delete sourced records, inspect evidence and independently verify/reject records. Editing clears verification and returns the record to PENDING. |
| `/admin/historical-pricing` | Mock historical records; add/edit/delete, import a reviewed JSON batch, and include/exclude records from the engine. |
| `/admin/rule-versions` | Current/draft/pending/archived versions, numeric version comparison, latest audit events and user management links. |
| `/admin/audit` | Latest 100 recorded administrative changes with actor and Sri Lanka timestamps. |
| `/admin/treatment-data`, `/admin/origin-data`, `/admin/recommendations` | Current engine-policy summaries. These are not standalone editors or claims of CAGS approval. |

Existing user list/create/edit pages remain available; administrator-created users
and account changes now write safe audit snapshots without password hashes or
other credential fields. Existing sessions recheck current role and active status.
User Management also supports deletion: sign-in is disabled, the account is hidden
from active lists, and evaluation/audit links are retained. Self-deletion is blocked
and the email remains reserved by the retained account record.

## Rule lifecycle

1. Propose a new `mock-ruby-vN` or `mock-sapphire-vN` from an existing definition.
2. Edit known numeric parameters and provide a reason. Definitions are validated
   before saving. Unrecognized paths and non-finite values are rejected.
3. Submit a draft: `DRAFT → PENDING`. Pending definitions cannot be edited.
4. An administrator who is neither the creator nor the latest editor may activate
   the pending proposal. Return-to-draft is also available for further changes.
5. Activation atomically archives the previous active version for that variety,
   activates the new one, and writes audit entries. A partial unique index allows
   at most one active mock version per variety. Revision checks reject stale edits.

ACTIVE means selected for the mock engine. It is not CAGS approval. Active and
archived definitions are immutable through the management APIs. Seeded versions
show that no approval has been recorded; no past events are invented.
Only DRAFT versions may be deleted. Return PENDING versions to draft first. Active
and archived versions remain available for traceability. Deleted draft numbers are
reserved, and new proposals skip those numbers automatically.

## Data and provenance

Mock historical records remain in `mock_historical_gemstones`; real reference
records remain in `referencegemstones`. Rules remain in `mock_evaluation_rules`.
No reference record is read by the mock engine, even after verification.

New references require manually entered observations, an explicit Sri Lankan
origin, source/date, currency, total price and price basis. The form never fills
reference observations from mock examples. They start PENDING; verification needs
an independent administrator plus explicit quality and permitted-use confirmations.
“Thailand/Vietnam/Sri Lanka” is not accepted as explicit Sri Lankan origin.

Mock imports accept a JSON array of 1–200 records matching the seeded record shape:
`id`, `dataKind: MOCK`, `observations`, `currency: USD`, `priceBasis: MOCK_B2B`,
`totalPrice`, `recordedAt` (YYYY-MM-DD), `source`, and `description`. The server
selects the dataset version and active flag. All records are validated first;
duplicates or any failed insert abort the complete batch and its audit entry.
Records are not automatically imported when a file is selected: the admin reviews
the count and confirms the batch.

Record edits use the same complete validation as creation and preserve previous
values in the audit history. Identifiers, dataset membership, activation/deletion
flags and author fields cannot be reassigned through edited form payloads. Editing
a reference clears its verification details and requires a new independent review;
neither the original author nor latest editor can verify it.

Delete actions use shadcn confirmation dialogs. Records and drafts are removed
from normal lists using a retained deletion marker; deleted mock records are
excluded from the engine. Before/after snapshots, original documents and their IDs
remain available for audit traceability. Edit, review and delete operations check
the record revision, rejecting stale changes with 409 rather than overwriting them.

Legacy reference write endpoints return an explanatory 409 response, closing the
previous bypass that could directly assign verification status. Existing detail
and edit URLs now open the managed reference-review view.

## Audit and atomicity

`admin_audit` stores actor ID/name, action, entity, summary, date and before/after
snapshots. Rules, record imports/reviews, and admin user creation/updates commit
with their audit entries in MongoDB transactions. There is no audit edit/delete API.
Old seed events and activity counts are not fabricated. This is application-level
append-only history, not an independently tamper-proof ledger.

Management APIs require an active administrator, recheck current database access,
and reject state changes from a different Origin. Lists load up to 500 source
records, and governance loads the latest 100 users/events; the UI discloses list
limits. Full server pagination and audit-history export are future improvements.

## Checks

```powershell
node --test tests/admin-governance.test.mjs tests/evaluation-rules.test.mjs tests/user-model.test.mjs
node scripts/check-admin-transactions.mjs
```

The database check performs a mock version switch, record insert and audit insert
inside a transaction, then explicitly aborts and verifies that no test documents
persist and the original active version remains selected. It also checks record
editing/deletion, verification reset and account deletion using rollback-only test
records. No test accounts or source records persist.
