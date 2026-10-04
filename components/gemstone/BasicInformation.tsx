type BasicInformationProps = {
  variety: string;
  caratWeight: string;
  onVarietyChange: (value: string) => void;
  onCaratWeightChange: (value: string) => void;
};

export default function BasicInformation({
  variety,
  caratWeight,
  onVarietyChange,
  onCaratWeightChange,
}: BasicInformationProps) {
  return (
    <section className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm sm:p-7">
      <div className="mb-6">
        <span className="inline-flex rounded-full bg-[var(--primary-soft)] px-3 py-1 text-sm font-semibold text-[var(--primary-dark)]">
          Step 1
        </span>

        <h2 className="mt-3 text-2xl font-bold">
          Tell us about your gemstone
        </h2>

        <p className="mt-2 max-w-2xl leading-7 text-[var(--muted)]">
          Start with the type of gemstone and its weight. Don&apos;t worry
          about color, clarity, or cut yet — we&apos;ll guide you through
          those next.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label htmlFor="gemstone-variety" className="block text-base font-semibold">
            What type of gemstone are you evaluating?
          </label>

          <p className="mt-1 text-sm text-[var(--muted)]">
            Choose the gemstone variety that best matches your stone.
          </p>

          <select
            id="gemstone-variety"
            value={variety}
            onChange={(event) => onVarietyChange(event.target.value)}
            className="mt-3 w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--primary)]"
          >
            <option value="">Select variety</option>
            <option value="Blue Sapphire">Blue Sapphire</option>
            <option value="Padparadscha">Padparadscha</option>
            <option value="Ruby">Ruby</option>
          </select>

          <p className="mt-2 text-xs text-[var(--muted)]">
            Open 4Cs currently supports selected cut and polished corundum gemstones.
          </p>
        </div>

        <div>
          <label htmlFor="carat-weight" className="block text-base font-semibold">
            What is the gemstone&apos;s weight?
          </label>

          <p className="mt-1 text-sm text-[var(--muted)]">
            Gemstone weight is measured in carats, written as &quot;ct&quot;.
          </p>

          <div className="mt-3 flex items-center rounded-xl border border-[var(--border)] bg-white focus-within:border-[var(--primary)]">
            <input
              id="carat-weight"
              type="number"
              step="0.01"
              min="0"
              placeholder="Example: 1.50"
              value={caratWeight}
              onChange={(event) => onCaratWeightChange(event.target.value)}
              className="min-w-0 flex-1 bg-transparent px-4 py-3 outline-none"
            />

            <span className="border-l border-[var(--border)] px-4 py-3 font-semibold text-[var(--muted)]">
              ct
            </span>
          </div>

          <div className="mt-3 rounded-xl bg-[var(--surface-soft)] p-4">
            <p className="font-semibold text-[var(--foreground)]">
              💡 What is a carat?
            </p>

            <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
              A carat is a unit used to measure gemstone weight. For example,
              a gemstone weighing 1.50 carats can be written as 1.50 ct.
            </p>

            <p className="mt-2 text-sm font-medium text-[var(--primary-dark)]">
              Use the weight from a reliable scale, seller information, or
              gemstone report when available.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
