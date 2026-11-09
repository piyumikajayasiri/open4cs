type EvaluationResultSummaryProps = {
  overallScore: number;
  colorScore: number;
  clarityScore: number;
  cutScore: number;
  caratScore: number;
};

export default function EvaluationResultSummary({
  overallScore,
  colorScore,
  clarityScore,
  cutScore,
  caratScore,
}: EvaluationResultSummaryProps) {
  return (
    <section className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm sm:p-7">
      <div className="text-center">
        <span className="inline-flex rounded-full bg-[var(--primary-soft)] px-3 py-1 text-sm font-semibold text-[var(--primary-dark)]">
          Evaluation Complete
        </span>

        <h2 className="mt-4 text-3xl font-bold">
          Your Gemstone Evaluation
        </h2>

        <p className="mx-auto mt-2 max-w-2xl leading-7 text-[var(--muted)]">
          Here&apos;s a simple summary of how the information you
          provided performed across the four evaluation areas.
        </p>
      </div>

      <div className="mx-auto mt-8 max-w-sm rounded-2xl bg-[var(--primary)] p-6 text-center text-white">
        <p className="text-sm font-semibold uppercase tracking-wider text-white/80">
          Overall 4C Score
        </p>

        <p className="mt-2 text-5xl font-bold">
          {formatScore(overallScore)}
        </p>

        <p className="mt-2 text-sm text-white/80">
          out of 100
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ScoreCard
          title="Color"
          score={colorScore}
          description="Visible color characteristics"
        />

        <ScoreCard
          title="Clarity"
          score={clarityScore}
          description="Visibility of inclusions"
        />

        <ScoreCard
          title="Cut"
          score={cutScore}
          description="Proportions and finish"
        />

        <ScoreCard
          title="Carat Weight"
          score={caratScore}
          description="Weight and size-related evaluation"
        />
      </div>

      <div className="mt-6 rounded-xl bg-[var(--surface-soft)] p-4">
        <p className="text-sm leading-6 text-[var(--muted)]">
          <strong className="text-[var(--foreground)]">
            What do these scores mean?
          </strong>{" "}
          They are rule-based educational evaluation scores generated
          from the information you entered. They are not laboratory
          grades or gemstone certification results.
        </p>
      </div>
    </section>
  );
}

function ScoreCard({
  title,
  score,
  description,
}: {
  title: string;
  score: number;
  description: string;
}) {
  const safeScore = Math.max(0, Math.min(100, score));

  return (
    <div className="rounded-2xl border border-[var(--border)] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-bold">
            {title}
          </h3>

          <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
            {description}
          </p>
        </div>

        <span className="text-xl font-bold text-[var(--primary)]">
          {formatScore(score)}
        </span>
      </div>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-[var(--surface-soft)]">
        <div
          className="h-full rounded-full bg-[var(--primary)]"
          style={{ width: `${safeScore}%` }}
        />
      </div>

      <p className="mt-2 text-right text-xs text-[var(--muted)]">
        / 100
      </p>
    </div>
  );
}

function formatScore(score: number) {
  return Number.isInteger(score)
    ? score.toString()
    : score.toFixed(1);
}
