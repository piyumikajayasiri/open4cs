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
      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 shadow-xs">
        <h3 className="text-base font-bold text-slate-900">
          How reliable is the information?
        </h3>

        <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-slate-600">
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

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs leading-relaxed text-slate-600">
          <strong className="font-bold text-slate-900">
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
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 transition">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {title}
      </p>

      <p className="mt-2 text-lg sm:text-xl font-extrabold text-blue-700">
        {formatReliability(value)}
      </p>

      <p className="mt-3 text-xs leading-5 text-slate-600">
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
