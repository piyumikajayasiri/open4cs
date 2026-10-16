export default function CutMeasurementGuide() {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-5">
      <div className="mb-5">
        <p className="font-semibold">
          📏 How do I measure the gemstone?
        </p>

        <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
          Measurements are usually recorded in millimetres (mm).
          Use reliable measurements when available rather than guessing.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top view */}
        <div className="rounded-xl bg-white p-5">
          <p className="text-center text-sm font-semibold">
            Top View
          </p>

          <div className="relative mx-auto mt-8 h-44 max-w-64">
            {/* Length arrow */}
            <div className="absolute left-5 right-5 top-0 text-center">
              <p className="text-xs font-semibold text-[var(--primary)]">
                ← Length →
              </p>
            </div>

            {/* Gem */}
            <div className="absolute left-1/2 top-1/2 h-28 w-44 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-3xl border-2 border-[var(--primary)] bg-[var(--primary-soft)]" />

            {/* Width */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 text-center">
              <p className="text-xs font-semibold text-[var(--primary)]">
                ↑
                <br />
                Width
                <br />
                ↓
              </p>
            </div>
          </div>

          <p className="mt-2 text-center text-xs leading-5 text-[var(--muted)]">
            Length is the longer face-up measurement. Width is measured
            across the gemstone.
          </p>
        </div>

        {/* Side view */}
        <div className="rounded-xl bg-white p-5">
          <p className="text-center text-sm font-semibold">
            Side View
          </p>

          <div className="relative mx-auto mt-8 flex h-44 max-w-64 items-center justify-center">
            <div
              className="h-24 w-44 border-2 border-[var(--primary)] bg-[var(--primary-soft)]"
              style={{
                clipPath:
                  "polygon(0 20%, 100% 20%, 75% 45%, 50% 100%, 25% 45%)",
              }}
            />

            <div className="absolute right-0 top-1/2 -translate-y-1/2 text-center">
              <p className="text-xs font-semibold text-[var(--primary)]">
                ↑
                <br />
                Depth
                <br />
                ↓
              </p>
            </div>
          </div>

          <p className="mt-2 text-center text-xs leading-5 text-[var(--muted)]">
            Depth measures the gemstone from its upper surface to its
            lowest point.
          </p>
        </div>
      </div>

      <p className="mt-5 text-xs leading-5 text-[var(--muted)]">
        This is a simplified educational diagram. Actual gemstone shapes
        and measurement points can vary.
      </p>
    </div>
  );
}
