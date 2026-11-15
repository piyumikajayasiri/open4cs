# Evaluate, save and review

## User journey

1. Sign in and open `/evaluate`.
2. Complete the eight steps: gemstone, basic information, color, clarity, cut,
   carat weight, additional factors and review. User forms start with empty
   observations. Inline messages use the engine's validation rules, and each
   step must be valid before continuing. Review checks the complete input again.
3. **Evaluate & Save** submits observations to `POST /api/evaluations`.
4. The server validates the observations, loads active mock rules and historical
   mock records, runs the engine, and stores a completed evaluation.
5. Successful submission opens the saved result. The dashboard loads
   owner-specific summaries, actual counters, history, variety filters and paging.
6. `/evaluations/[id]` displays the stored inputs, scores, price breakdown,
   recommendations, comparable evidence and rule version. It never reruns the
   current engine to display an older evaluation.

Admin `/admin/evaluation-rules/test` remains a preview and does not save user results.
The user catalogue lists ruby and sapphire and can preselect the variety in the
form. Unsupported specialty grading is not advertised as available.
Results use provisional mock data and remain visibly labelled as mock. Valid
evaluations with unknown treatment or insufficient matches are saved with scores
and a price-unavailable reason, rather than a fabricated price.

**Save Draft** stores observations in this browser, under an account-specific
local-storage key. Resume Draft restores them; drafts are not server evaluations
and do not affect dashboard counts. A draft includes the retry key after a submit
attempt, so retrying unchanged observations can recover a committed result.

Result sections provide overview, 4C breakdown, historical comparables, pricing,
recommendations and reliability. Reliability labels are declarations, not report
verification. Color similarity is explicitly unavailable until the engine supports
a validated calculation. Processing displays a real pending request, without
invented per-stage completion or fabricated reference counts.

## Stored evidence

Each new evaluation includes server-assigned `userId` and evaluation ID, user category,
canonical input snapshot, full engine output, applied rule-definition snapshot,
full selected historical-record snapshots, price suggestion and timestamps. The
legacy optional `gemstoneId` link is retained, but saving an evaluation does not
create a new admin catalogue entry. Input observations are stored on the evaluation.

Rule/record reads and the evaluation insert share a MongoDB snapshot transaction.
Later edits, deletion or activation of source records/rules do not change saved
results. Real Sri Lankan reference collections are not read by the mock engine.

## API and ownership

- `POST /api/evaluations`: `{ observations, submissionKey }`.
- `GET /api/evaluations?page=1&pageSize=10&variety=RUBY`: owner-only summaries,
  overall owner counters, and pagination metadata. Page sizes are limited to 50.
- `GET /api/evaluations/[id]`: owner-only saved detail.

Ownership is always taken from the authenticated session, including for admins.
Client-supplied owners, scores, prices and rule versions are ignored. Detail APIs
and pages treat another user's ID as not found. Account deactivation/deletion is
enforced by the current authentication checks. Cross-origin save requests are rejected.

Submissions use a client-generated UUID v4, unique per owner. Retrying identical
observations returns the original saved result. Reusing the key for different
observations returns 409. A unique compound index handles simultaneous duplicates;
the client retains its key after network failures and resets it when input changes.
No evaluation edit/delete endpoints are exposed by this workflow.

## Dashboard

Counters are calculated from saved records, not display placeholders: total,
with a saved price range, created in the current Sri Lankan calendar month, and
without a price. History is sorted by creation time and ID. Users can compare up
to three saved summaries. Dates are shown in Sri Lanka time; no live exchange-rate
conversion is performed. Legacy records without full snapshots are labelled and
rendered conservatively. No report button points to an unimplemented PDF endpoint.

## Verification

```powershell
node --test tests/evaluation-submission.test.mjs
node --test tests/evaluation-wizard.test.mjs
node scripts/check-evaluation-persistence.mjs
```

The database check inserts two temporary evaluations within a transaction, tests
retry/conflict behaviour, ownership isolation, unavailable pricing and immutable
snapshots, then aborts and verifies that no test evaluations remain.
