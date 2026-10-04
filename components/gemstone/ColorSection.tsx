import ColorVisualGuide from "./ColorVisualGuide";

type ColorSectionProps = {
  hue: string;
  tone: string;
  saturation: string;
  distribution: string;
  zoning: string;
  onHueChange: (value: string) => void;
  onToneChange: (value: string) => void;
  onSaturationChange: (value: string) => void;
  onDistributionChange: (value: string) => void;
  onZoningChange: (value: string) => void;
};

export default function ColorSection({
  hue,
  tone,
  saturation,
  distribution,
  zoning,
  onHueChange,
  onToneChange,
  onSaturationChange,
  onDistributionChange,
  onZoningChange,
}: ColorSectionProps) {
  return (
    <section className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm sm:p-7">
      <div className="mb-7">
        <span className="inline-flex rounded-full bg-[var(--primary-soft)] px-3 py-1 text-sm font-semibold text-[var(--primary-dark)]">
          Step 2
        </span>

        <h2 className="mt-3 text-2xl font-bold">
          Let&apos;s look at the color
        </h2>

        <p className="mt-2 max-w-2xl leading-7 text-[var(--muted)]">
          Color is more than simply saying &quot;blue&quot; or
          &quot;red&quot;. Answer each question using the closest option
          you can observe.
        </p>
      </div>

      <details className="mb-8 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)]">
        <summary className="cursor-pointer list-none p-4 font-semibold text-[var(--primary-dark)]">
          👁 Show me how gemstone color works
        </summary>

        <div className="border-t border-[var(--border)] bg-white p-4">
          <p className="mb-4 text-sm leading-6 text-[var(--muted)]">
            Use these simple diagrams to understand the terms used in the
            questions below.
          </p>

          <ColorVisualGuide />
        </div>
      </details>

      <div className="space-y-8">
        {/* HUE */}
        <div>
          <label htmlFor="color-hue" className="block text-base font-semibold">
            1. What is the main color you see?
          </label>

          <p className="mt-1 text-sm text-[var(--muted)]">
            This is called <strong>hue</strong> — the basic visible color
            of the gemstone.
          </p>

          <input
            id="color-hue"
            type="text"
            value={hue}
            onChange={(event) => onHueChange(event.target.value)}
            placeholder="Enter hue (e.g. Blue, Violetish Blue, Red)"
            className="mt-3 w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--primary)]"
          />
        </div>

        {/* TONE */}
        <div>
          <label htmlFor="color-tone" className="block text-base font-semibold">
            2. How light or dark does the color look?
          </label>

          <p className="mt-1 text-sm text-[var(--muted)]">
            This is called <strong>tone</strong>.
          </p>

          <div className="mt-3 rounded-xl bg-[var(--surface-soft)] p-4 text-sm text-[var(--muted)]">
            Think of it as:
            <strong className="text-[var(--foreground)]">
              {" "}Light → Medium → Dark
            </strong>
          </div>

          <input
            id="color-tone"
            type="text"
            value={tone}
            onChange={(event) => onToneChange(event.target.value)}
            placeholder="Enter tone (e.g. Medium, Medium Dark, Light)"
            className="mt-3 w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--primary)]"
          />
        </div>

        {/* SATURATION */}
        <div>
          <label htmlFor="color-saturation" className="block text-base font-semibold">
            3. How strong or intense is the color?
          </label>

          <p className="mt-1 text-sm text-[var(--muted)]">
            This is called <strong>saturation</strong>. A weak color can
            look pale or grayish, while a strong color appears richer and
            more vivid.
          </p>

          <input
            id="color-saturation"
            type="text"
            value={saturation}
            onChange={(event) => onSaturationChange(event.target.value)}
            placeholder="Enter saturation (e.g. Strong, Vivid, Medium)"
            className="mt-3 w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--primary)]"
          />
        </div>

        {/* DISTRIBUTION */}
        <div>
          <label htmlFor="color-distribution" className="block text-base font-semibold">
            4. Is the color spread evenly across the gemstone?
          </label>

          <p className="mt-1 text-sm text-[var(--muted)]">
            Color distribution describes whether the visible color looks
            consistent across the stone.
          </p>

          <input
            id="color-distribution"
            type="text"
            value={distribution}
            onChange={(event) => onDistributionChange(event.target.value)}
            placeholder="Enter color distribution (e.g. Even, Slightly Uneven)"
            className="mt-3 w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--primary)]"
          />
        </div>

        {/* ZONING */}
        <div>
          <label htmlFor="color-zoning" className="block text-base font-semibold">
            5. Can you see separate areas or bands of different color?
          </label>

          <p className="mt-1 text-sm text-[var(--muted)]">
            This is called <strong>color zoning</strong>. Look for areas
            where the color noticeably changes in strength or appearance.
          </p>

          <div className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
            <p className="text-sm font-semibold">
              💡 Not sure?
            </p>

            <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
              View the gemstone in good neutral lighting and look across
              the entire face of the stone. If the color appears similar
              throughout, choose the option closest to no visible zoning.
            </p>
          </div>

          <input
            id="color-zoning"
            type="text"
            value={zoning}
            onChange={(event) => onZoningChange(event.target.value)}
            placeholder="Enter zoning (e.g. None, Slight, Noticeable)"
            className="mt-3 w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--primary)]"
          />
        </div>
      </div>
    </section>
  );
}
