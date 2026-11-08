export default function CutMeasurementGuide() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 shadow-xs">
      <div className="mb-5">
        <p className="text-base font-bold text-slate-900">
          📏 How do I measure the gemstone?
        </p>

        <p className="mt-1 text-xs leading-relaxed text-slate-600">
          Measurements are usually recorded in millimetres (mm).
          Use reliable measurements when available rather than guessing.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top view */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <p className="text-center text-sm font-bold text-slate-900">
            Top View
          </p>

          <div className="relative mx-auto mt-8 h-44 max-w-64">
            {/* Length arrow */}
            <div className="absolute left-5 right-5 top-0 text-center">
              <span className="inline-block rounded-md border border-blue-200 bg-white/95 px-2.5 py-0.5 text-xs font-bold text-blue-700 shadow-2xs">
                ← Length →
              </span>
            </div>

            {/* Gem */}
            <div className="absolute left-1/2 top-1/2 h-28 w-44 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-3xl border-2 border-blue-500 bg-blue-100/70 shadow-xs" />

            {/* Width */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 text-center">
              <span className="inline-block rounded-md border border-blue-200 bg-white/95 px-2 py-1 text-xs font-bold text-blue-700 shadow-2xs leading-tight">
                ↑
                <br />
                Width
                <br />
                ↓
              </span>
            </div>
          </div>

          <p className="mt-4 text-center text-xs leading-5 text-slate-600">
            Length is the longer face-up measurement. Width is measured
            across the gemstone.
          </p>
        </div>

        {/* Side view */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <p className="text-center text-sm font-bold text-slate-900">
            Side View
          </p>

          <div className="relative mx-auto mt-8 flex h-44 max-w-64 items-center justify-center">
            <div
              className="h-24 w-44 border-2 border-blue-500 bg-blue-100/70 shadow-xs"
              style={{
                clipPath:
                  "polygon(0 20%, 100% 20%, 75% 45%, 50% 100%, 25% 45%)",
              }}
            />

            <div className="absolute right-0 top-1/2 -translate-y-1/2 text-center">
              <span className="inline-block rounded-md border border-blue-200 bg-white/95 px-2 py-1 text-xs font-bold text-blue-700 shadow-2xs leading-tight">
                ↑
                <br />
                Depth
                <br />
                ↓
              </span>
            </div>
          </div>

          <p className="mt-4 text-center text-xs leading-5 text-slate-600">
            Depth measures the gemstone from its upper surface to its
            lowest point.
          </p>
        </div>
      </div>

      <p className="mt-5 text-xs leading-5 text-slate-500">
        This is a simplified educational diagram. Actual gemstone shapes
        and measurement points can vary.
      </p>
    </div>
  );
}
