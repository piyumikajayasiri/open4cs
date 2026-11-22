# Settings, learning guide and dashboards

Settings are available at `/settings` and `/admin/settings`. The account API reads the current authenticated account and allows only explicitly supported self-service fields. Profiles include name, email, organization, category and two meaningful display preferences: dashboard activity and learning hints. Email changes require the current password. Category changes affect future defaults, not role privileges or saved snapshots. Concurrent profile edits use the modification timestamp to avoid overwriting newer changes.

Password changes require the current password and a new password meeting the existing length/complexity policy, capped at bcrypt's 72 UTF-8 byte boundary. A session version is incremented, invalidating existing sessions; the user signs in again. Current names, emails and categories are refreshed from the database during authentication.

Account export streams owned profile, evaluations and report snapshots as JSON Lines. It omits password hashes, session version and PDF binary data. PDF files remain downloadable individually from Reports. Deactivation requires a current password and explicit DEACTIVATE confirmation, disables sign-in, and retains evaluations, reports, reserved email and audit links. It is not permanent data erasure. Administrators cannot deactivate themselves through settings.

The `/learning` guide covers scope, colour, clarity, cut/measurements, carat weight, reliability, pricing and saved results. Content is educational software guidance, not an approved grading standard. Search and categories help navigation. Reviewed/unread state is saved to the authenticated user's account with atomic set operations. It is not a qualification or certification. No mail delivery, multilingual UI or currency conversion is implied by settings.

The main user dashboard shows actual saved-evaluation totals, priced counts, Sri Lankan month counts, report totals, recent evaluations and creation activity. A browser-local draft is labelled separately and is not counted as a completed evaluation. Quick links lead to existing workflows; saved preferences control activity and learning hints. The original evaluation list/history routes remain available.

The admin dashboard uses protected queries for ready catalogue entries, reviewed references, sample historical records, approved rule versions, pending reviews, active users and recent audit events. Sample/retail data is explicitly separate from approved B2B evidence. It displays limited pending queues and links to their management pages. No invented people, growth percentages or audit activity is used.

Verification is intentionally minimal: three focused settings/session/learning/dashboard tests and one type check. No database test or full suite is run. The user's existing .gitignore changes are preserved.
