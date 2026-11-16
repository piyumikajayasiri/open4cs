# Reports, PDF generation and preview

## User workflow

Open Reports from the sidebar or Generate PDF Report from a saved evaluation. Select Full Evaluation + Price or Summary Statement and an audience. Generation opens the stored PDF preview. Reports can be downloaded, revisited and regenerated. Regeneration creates a new retained revision; it never replaces a previous PDF or reruns the gemstone engine. The preview lists the latest 50 reports in the revision family.

Full reports contain saved gemstone observations, 4C scores, breakdown and weighting, declared reliability, comparable source records and observations, pricing calculations, historical monthly evidence, recommendations, a category-specific statement and disclaimers. Summary reports retain essential observations, results, price availability, recommendations and statement. Missing legacy evidence is explicit. Existing sample results remain clearly labelled as invented development evidence. No colour similarity or laboratory verification is invented. No PDF/A compliance claim is made.

## Backend

`GET /api/reports` lists owned report metadata with pagination and optional evaluationId filtering. `POST /api/reports` accepts either an owned evaluationId, FULL/SUMMARY type and audience, or an owned parentReportId for regeneration. Each request requires a UUID generationKey. Repeated identical keys return the existing report; conflicting reuse is rejected. Concurrent duplicate submissions are handled with an owner/key unique index.

`GET /api/reports/[id]` returns owned metadata and retained revisions. `GET /api/reports/[id]/pdf` returns stored PDF bytes inline; `?download=1` returns an attachment. PDF access uses the same ownership checks as metadata and preview. Other users' IDs are indistinguishable from nonexistent reports. Responses are private/no-store. There are no public sharing links or report update/delete endpoints.

The evaluation_reports collection stores the report content snapshot, exact PDF bytes, SHA-256, page count, renderer version and parent/root links. Binary PDF data is excluded from normal queries. One document insert atomically persists content and bytes, so incomplete reports are not listed. An 8 MB PDF limit stays below MongoDB's document-size ceiling. Existing evaluation records are not modified. Regeneration uses the parent report snapshot, not mutable source data.

## Rendering

PDFKit runs on the Node server. A4 pages include repeated branding, snapshot identifiers, page numbers and a disclaimer on every page. The browser preview embeds the authenticated PDF endpoint, so preview and download use identical stored bytes. Browsers without an embedded viewer can download instead.

Minimal verification: three focused report tests, one type check and a visual render of a synthetic sample PDF. No full suite or database test is needed. Synthetic preview material is not actual pricing or CAGS approval.
