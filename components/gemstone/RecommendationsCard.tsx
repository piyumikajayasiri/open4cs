type RecommendationsCardProps = {
  recommendations: string[];
};

export default function RecommendationsCard({
  recommendations,
}: RecommendationsCardProps) {
  if (recommendations.length === 0) {
    return (
      <div className="rounded-xl bg-[var(--surface-soft)] p-5">
        <p className="font-semibold">
          No additional recommendations
        </p>

        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          The current evaluation did not generate any additional
          recommendations for the information you provided.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-[var(--primary-soft)] p-5">
        <h3 className="font-bold text-[var(--primary-dark)]">
          What should I do next?
        </h3>

        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          These suggestions are generated from the evaluation rules
          based on the information you entered.
        </p>
      </div>

      <div className="space-y-3">
        {recommendations.map((recommendation, index) => (
          <div
            key={`${index}-${recommendation}`}
            className="flex gap-4 rounded-xl border border-[var(--border)] p-4"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--primary-soft)] text-sm font-bold text-[var(--primary-dark)]">
              {index + 1}
            </div>

            <div>
              <p className="font-semibold">
                Recommendation {index + 1}
              </p>

              <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                {recommendation}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-[var(--border)] p-4">
        <p className="text-sm leading-6 text-[var(--muted)]">
          <strong className="text-[var(--foreground)]">
            Remember:
          </strong>{" "}
          These are educational, rule-based suggestions. They do not
          replace advice from a qualified gemmologist or a professional
          laboratory examination.
        </p>
      </div>
    </div>
  );
}
