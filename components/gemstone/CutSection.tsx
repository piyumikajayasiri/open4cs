import CutMeasurementGuide from "./CutMeasurementGuide";
import CutVisualGuide from "./CutVisualGuide";

type CutSectionProps = {
  length: string;
  width: string;
  depth: string;
  symmetry: string;
  polish: string;
  windowing: string;
  extinction: string;
  bulging: string;
  onLengthChange: (value: string) => void;
  onWidthChange: (value: string) => void;
  onDepthChange: (value: string) => void;
  onSymmetryChange: (value: string) => void;
  onPolishChange: (value: string) => void;
  onWindowingChange: (value: string) => void;
  onExtinctionChange: (value: string) => void;
  onBulgingChange: (value: string) => void;
};

export default function CutSection({
  length,
  width,
  depth,
  symmetry,
  polish,
  windowing,
  extinction,
  bulging,
  onLengthChange,
  onWidthChange,
  onDepthChange,
  onSymmetryChange,
  onPolishChange,
  onWindowingChange,
  onExtinctionChange,
  onBulgingChange,
}: CutSectionProps) {
  return (
    <section className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm sm:p-7">
      <div className="mb-7">
        <span className="inline-flex rounded-full bg-[var(--primary-soft)] px-3 py-1 text-sm font-semibold text-[var(--primary-dark)]">
          Step 4
        </span>

        <h2 className="mt-3 text-2xl font-bold">
          Let&apos;s look at the cut
        </h2>

        <p className="mt-2 max-w-2xl leading-7 text-[var(--muted)]">
          Cut describes the gemstone&apos;s proportions and how well its
          shape and surfaces have been finished.
        </p>
      </div>

      <details className="mb-8 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)]">
        <summary className="cursor-pointer list-none p-4 font-semibold text-[var(--primary-dark)]">
          📏 Show me how Length, Width and Depth work
        </summary>

        <div className="border-t border-[var(--border)] bg-white p-4">
          <CutMeasurementGuide />
        </div>
      </details>

      <details className="mb-8 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)]">
        <summary className="cursor-pointer list-none p-4 font-semibold text-[var(--primary-dark)]">
          👁 Show me what Cut quality features mean
        </summary>

        <div className="border-t border-[var(--border)] bg-white p-4">
          <CutVisualGuide />
        </div>
      </details>

      <div className="space-y-8">
        {/* Measurements */}
        <div>
          <h3 className="text-lg font-bold">
            Gemstone measurements
          </h3>

          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
            Enter the Length, Width and Depth in millimetres (mm) if you know
            them. Use measured or reliable reported values rather than guessing.
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="cut-length" className="block text-sm font-semibold">
                Length (mm)
              </label>

              <input
                id="cut-length"
                type="number"
                step="0.01"
                min="0"
                value={length}
                onChange={(event) => onLengthChange(event.target.value)}
                placeholder="Length in mm"
                className="mt-2 w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--primary)]"
              />
            </div>

            <div>
              <label htmlFor="cut-width" className="block text-sm font-semibold">
                Width (mm)
              </label>

              <input
                id="cut-width"
                type="number"
                step="0.01"
                min="0"
                value={width}
                onChange={(event) => onWidthChange(event.target.value)}
                placeholder="Width in mm"
                className="mt-2 w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--primary)]"
              />
            </div>

            <div>
              <label htmlFor="cut-depth" className="block text-sm font-semibold">
                Depth (mm)
              </label>

              <input
                id="cut-depth"
                type="number"
                step="0.01"
                min="0"
                value={depth}
                onChange={(event) => onDepthChange(event.target.value)}
                placeholder="Depth in mm"
                className="mt-2 w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--primary)]"
              />
            </div>
          </div>
        </div>

        {/* Symmetry */}
        <div>
          <label htmlFor="cut-symmetry" className="block text-base font-semibold">
            Symmetry
          </label>

          <p className="mt-1 text-sm text-[var(--muted)]">
            How balanced and even does the gemstone&apos;s shape appear?
          </p>

          <select
            id="cut-symmetry"
            value={symmetry}
            onChange={(event) => onSymmetryChange(event.target.value)}
            className="mt-3 w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--primary)]"
          >
            <option value="">Select symmetry</option>
            <option value="Excellent">Excellent</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
            <option value="Poor">Poor</option>
          </select>
        </div>

        {/* Polish */}
        <div>
          <label htmlFor="cut-polish" className="block text-base font-semibold">
            Polish
          </label>

          <p className="mt-1 text-sm text-[var(--muted)]">
            How smooth and well-finished do the gemstone&apos;s surfaces appear?
          </p>

          <select
            id="cut-polish"
            value={polish}
            onChange={(event) => onPolishChange(event.target.value)}
            className="mt-3 w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--primary)]"
          >
            <option value="">Select polish</option>
            <option value="Excellent">Excellent</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
            <option value="Poor">Poor</option>
          </select>
        </div>

        {/* Windowing */}
        <div>
          <label htmlFor="cut-windowing" className="block text-base font-semibold">
            Windowing
          </label>

          <p className="mt-1 text-sm text-[var(--muted)]">
            Can you see a transparent or washed-out area through the face of the stone?
          </p>

          <p className="mt-1 text-sm text-[var(--muted)]">
            Think of this as an area where you seem to look through the gemstone
            instead of seeing light return from it.
          </p>

          <select
            id="cut-windowing"
            value={windowing}
            onChange={(event) => onWindowingChange(event.target.value)}
            className="mt-3 w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--primary)]"
          >
            <option value="">Select windowing</option>
            <option value="None">None</option>
            <option value="Slight">Slight</option>
            <option value="Moderate">Moderate</option>
            <option value="Severe">Severe</option>
          </select>
        </div>

        {/* Extinction */}
        <div>
          <label htmlFor="cut-extinction" className="block text-base font-semibold">
            Extinction
          </label>

          <p className="mt-1 text-sm text-[var(--muted)]">
            Can you see unusually dark areas that remain dark when viewing the stone?
          </p>

          <p className="mt-1 text-sm text-[var(--muted)]">
            Look for dark areas where little visible light appears to return to
            your eye.
          </p>

          <select
            id="cut-extinction"
            value={extinction}
            onChange={(event) => onExtinctionChange(event.target.value)}
            className="mt-3 w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--primary)]"
          >
            <option value="">Select extinction</option>
            <option value="None">None</option>
            <option value="Slight">Slight</option>
            <option value="Moderate">Moderate</option>
            <option value="Severe">Severe</option>
          </select>
        </div>

        {/* Bulging */}
        <div>
          <label htmlFor="cut-bulging" className="block text-base font-semibold">
            Bulging
          </label>

          <p className="mt-1 text-sm text-[var(--muted)]">
            Does the lower part of the gemstone appear excessively deep or rounded?
          </p>

          <select
            id="cut-bulging"
            value={bulging}
            onChange={(event) => onBulgingChange(event.target.value)}
            className="mt-3 w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--primary)]"
          >
            <option value="">Select bulging</option>
            <option value="None">None</option>
            <option value="Slight">Slight</option>
            <option value="Moderate">Moderate</option>
            <option value="Severe">Severe</option>
          </select>
        </div>
      </div>
    </section>
  );
}
