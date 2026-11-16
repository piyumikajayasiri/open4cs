# Structured recommendations and personalised statements

New saved evaluations include a `guidanceSnapshot` alongside the immutable evaluation result. The authenticated server uses the evaluation's exact input, scores, price availability, selected comparables, rule definition and account category. Client-supplied recommendations, statements or account categories are never accepted as evaluation output.

Guidance v1 groups recommendations into recorded strengths, verification requirements, potential concerns and further assessment. Each item has a stable identifier, supporting observations, relevant evaluation-rule references and an action for Student, Trader, Gemologist and Professional audiences. Guidance does not fabricate colour similarity, laboratory authentication, inclusion type/location, recutting yield or financial benefit.

All four statement variants are generated and saved at submission. The saved account category selects the initial audience. Switching audiences changes presentation only; it does not update the account, recalculate the evaluation, save new output or replace its original category. The statement includes 4C scores, treatment/origin declarations, comparable count, saved price range or unavailability reason, category context and a disclaimer. The Recommendations and Statement tabs render the stored snapshot. The statement can be copied.

`SYSTEM_GUIDANCE` is distinct from scoring approval. These deterministic, versioned explanations have not been independently approved as a CAGS recommendation policy. Their rules cannot alter scores, prices or reference eligibility. Configurable domain-approved recommendation policies remain a separate future workflow.

Existing evaluations are not rewritten or regenerated using newer wording. Legacy recommendation strings remain visible; the Statement tab explains when no statement snapshot was saved. New snapshots preserve wording when an account category, source reference or engine rule later changes. Existing idempotent submission retries return the original snapshot.

Focused verification: `node --test tests/guidance.test.mjs`; one TypeScript check. No database writes or broad test suites are needed for this change.
