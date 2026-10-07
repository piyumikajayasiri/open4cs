type ReferenceComparisonCardProps = {
  referenceName: string;
  similarity: number;
};

export default function ReferenceComparisonCard({
  referenceName,
  similarity,
}: ReferenceComparisonCardProps) {
  const safeSimilarity = Math.max(0, Math.min(100, similarity));

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-[var(--surface-soft)] p-5">
        <p className="text-sm font-semibold text-[var(--muted)]">
          Closest available reference
        </p>

        <h3 className="mt-2 text-xl font-bold">
          {referenceName}
        </h3>

        <div className="mt-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm text-[var(--muted)]">
              Similarity
            </p>

            <p className="mt-1 text-3xl font-bold text-[var(--primary)]">
              {formatSimilarity(similarity)}%
            </p>
          </div>

          <p className="max-w-xs text-right text-xs leading-5 text-[var(--muted)]">
            Based on the comparison rules used by this prototype.
          </p>
        </div>

        <div className="mt-4 h-3 overflow-hidden rounded-full bg-white">
          <div
            className="h-full rounded-full bg-[var(--primary)]"
            style={{ width: `${safeSimilarity}%` }}
          />
        </div>
      </div>

      <div className="rounded-xl border border-[var(--border)] p-5">
        <h4 className="font-bold">
          What does similarity mean?
        </h4>

        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          The system compares the information you entered with available
          reference gemstones. The percentage shows how closely this
          reference matched according to the system&apos;s comparison rules.
        </p>

        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
          A similarity percentage does not mean the gemstones are identical,
          and it is not a laboratory identification or authenticity result.
        </p>
      </div>

      <div className="rounded-xl bg-[var(--primary-soft)] p-4">
        <p className="text-sm leading-6 text-[var(--muted)]">
          <strong className="text-[var(--foreground)]">
            Why use reference gemstones?
          </strong>{" "}
          References help the system compare the evaluated gemstone with
          previously recorded examples when producing its educational
          evaluation and price suggestion.
        </p>
      </div>
    </div>
  );
}

function formatSimilarity(value: number) {
  return Number.isInteger(value)
    ? value.toString()
    : value.toFixed(1);
}
