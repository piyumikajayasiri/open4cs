type InformationReliabilityCardProps = {
  measurementReliability: string;
  treatmentReliability: string;
  originReliability: string;
};

export default function InformationReliabilityCard({
  measurementReliability,
  treatmentReliability,
  originReliability,
}: InformationReliabilityCardProps) {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-[var(--surface-soft)] p-5">
        <h3 className="font-bold">
          How reliable is the information?
        </h3>

        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          These labels describe where the information came from. They
          help you understand how much confidence to place in the
          information used for this evaluation.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <ReliabilityItem
          title="Measurements"
          value={measurementReliability}
          description="Length, width, depth, and related measurement information."
        />

        <ReliabilityItem
          title="Treatment"
          value={treatmentReliability}
          description="Information about whether the gemstone may have received treatment."
        />

        <ReliabilityItem
          title="Origin"
          value={originReliability}
          description="Information about the gemstone's reported geographic origin."
        />
      </div>

      <div className="rounded-xl border border-[var(--border)] p-4">
        <p className="text-sm leading-6 text-[var(--muted)]">
          <strong className="text-[var(--foreground)]">
            Important:
          </strong>{" "}
          Reliability describes the source of the information. It does
          not mean the system independently verified the gemstone.
        </p>
      </div>
    </div>
  );
}

function ReliabilityItem({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] p-5">
      <p className="text-sm font-semibold text-[var(--muted)]">
        {title}
      </p>

      <p className="mt-2 text-lg font-bold text-[var(--primary-dark)]">
        {formatReliability(value)}
      </p>

      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
        {description}
      </p>
    </div>
  );
}

function formatReliability(value: string) {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ");

  if (!normalized) {
    return "Not provided";
  }

  return normalized.replace(/\b\w/g, (letter) =>
    letter.toUpperCase()
  );
}
