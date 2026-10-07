import ClarityVisualGuide from "./ClarityVisualGuide";

type ClaritySectionProps = {
  nakedEye: string;
  loupe10x: string;
  inclusionType: string;
  inclusionLocation: string;
  severity: string;
  onNakedEyeChange: (value: string) => void;
  onLoupe10xChange: (value: string) => void;
  onInclusionTypeChange: (value: string) => void;
  onInclusionLocationChange: (value: string) => void;
  onSeverityChange: (value: string) => void;
};

export default function ClaritySection({
  nakedEye,
  loupe10x,
  inclusionType,
  inclusionLocation,
  severity,
  onNakedEyeChange,
  onLoupe10xChange,
  onInclusionTypeChange,
  onInclusionLocationChange,
  onSeverityChange,
}: ClaritySectionProps) {
  return (
    <section className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm sm:p-7">
      <div className="mb-7">
        <span className="inline-flex rounded-full bg-[var(--primary-soft)] px-3 py-1 text-sm font-semibold text-[var(--primary-dark)]">
          Step 3
        </span>

        <h2 className="mt-3 text-2xl font-bold">
          Let&apos;s look at clarity
        </h2>

        <p className="mt-2 max-w-2xl leading-7 text-[var(--muted)]">
          Clarity describes how visible internal or external features are
          in your gemstone. These features are commonly called inclusions.
        </p>
      </div>

      <div className="mb-8 rounded-2xl bg-[var(--surface-soft)] p-5">
        <p className="font-semibold text-[var(--foreground)]">
          💡 What is an inclusion?
        </p>

        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          An inclusion is a feature that may be visible inside a gemstone,
          such as a small crystal, needle-like feature, cloud, or other
          internal characteristic.
        </p>

        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          You do not need to identify it perfectly. Record only what you can
          reasonably observe.
        </p>
      </div>

      <details className="mb-8 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)]">
        <summary className="cursor-pointer list-none p-4 font-semibold text-[var(--primary-dark)]">
          👁 Show me what clarity means
        </summary>

        <div className="border-t border-[var(--border)] bg-white p-4">
          <ClarityVisualGuide />
        </div>
      </details>

      <div className="space-y-8">
        {/* 1. Naked Eye */}
        <div>
          <label htmlFor="clarity-naked-eye" className="block text-base font-semibold">
            1. What can you see without magnification?
          </label>

          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
            Look at the gemstone normally, without a loupe or microscope.
            Choose the option that best describes how noticeable the internal
            features appear.
          </p>

          <select
            id="clarity-naked-eye"
            value={nakedEye}
            onChange={(event) => onNakedEyeChange(event.target.value)}
            className="mt-3 w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--primary)]"
          >
            <option value="">Select naked-eye observation</option>
            <option value="Clean">Clean</option>
            <option value="Very Slight">Very Slight</option>
            <option value="Slight">Slight</option>
            <option value="Noticeable">Noticeable</option>
            <option value="Obvious">Obvious</option>
          </select>
        </div>

        {/* 2. 10x Loupe */}
        <div>
          <label htmlFor="clarity-loupe10x" className="block text-base font-semibold">
            2. What can you see using a 10× loupe?
          </label>

          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
            A 10× loupe is a small magnifying tool used to examine gemstones.
            If you have used one, choose the closest observation.
          </p>

          <div className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
            <p className="text-sm font-semibold">
              🔍 Don&apos;t have a 10× loupe?
            </p>

            <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
              Do not pretend that you examined the stone under magnification.
              Use only information you actually observed or received from a
              reliable source.
            </p>
          </div>

          <select
            id="clarity-loupe10x"
            value={loupe10x}
            onChange={(event) => onLoupe10xChange(event.target.value)}
            className="mt-3 w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--primary)]"
          >
            <option value="">Select 10× loupe observation</option>
            <option value="Clean">Clean</option>
            <option value="Very Slight">Very Slight</option>
            <option value="Slight">Slight</option>
            <option value="Noticeable">Noticeable</option>
            <option value="Obvious">Obvious</option>
          </select>
        </div>

        {/* 3. Inclusion Type */}
        <div>
          <label htmlFor="clarity-inclusion-type" className="block text-base font-semibold">
            3. Do you know what type of inclusion you can see?
          </label>

          <p className="mt-1 text-sm text-[var(--muted)]">
            If known, enter a short description such as
            &quot;needle&quot;, &quot;crystal&quot;, or &quot;cloud&quot;.
            If you are unsure, you can leave this description empty.
          </p>

          <input
            id="clarity-inclusion-type"
            type="text"
            value={inclusionType}
            onChange={(event) => onInclusionTypeChange(event.target.value)}
            placeholder="Enter inclusion type"
            className="mt-3 w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--primary)]"
          />
        </div>

        {/* 4. Inclusion Location */}
        <div>
          <label htmlFor="clarity-inclusion-location" className="block text-base font-semibold">
            4. Where is the inclusion located?
          </label>

          <p className="mt-1 text-sm text-[var(--muted)]">
            Describe where you notice it, for example near the center or toward
            the side of the gemstone. Leave this empty if you cannot tell.
          </p>

          <input
            id="clarity-inclusion-location"
            type="text"
            value={inclusionLocation}
            onChange={(event) => onInclusionLocationChange(event.target.value)}
            placeholder="Enter inclusion location"
            className="mt-3 w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--primary)]"
          />
        </div>

        {/* 5. Severity */}
        <div>
          <label htmlFor="clarity-severity" className="block text-base font-semibold">
            5. How significant do the inclusions appear?
          </label>

          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
            Choose the closest overall level based on what you can observe.
          </p>

          <select
            id="clarity-severity"
            value={severity}
            onChange={(event) => onSeverityChange(event.target.value)}
            className="mt-3 w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--primary)]"
          >
            <option value="">Select inclusion severity</option>
            <option value="None">None</option>
            <option value="Minor">Minor</option>
            <option value="Moderate">Moderate</option>
            <option value="Severe">Severe</option>
          </select>
        </div>
      </div>
    </section>
  );
}
