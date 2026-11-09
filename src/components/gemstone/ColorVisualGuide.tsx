export default function ColorVisualGuide() {
  return (
    <div className="space-y-5">
      {/* Tone */}
      <div className="rounded-xl border border-[var(--border)] p-4">
        <p className="font-semibold">Tone — light or dark?</p>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <ToneExample label="Light" opacity="35%" />
          <ToneExample label="Medium" opacity="65%" />
          <ToneExample label="Dark" opacity="95%" />
        </div>

        <p className="mt-3 text-xs leading-5 text-[var(--muted)]">
          These are simplified learning examples, not gemstone grading
          standards.
        </p>
      </div>

      {/* Saturation */}
      <div className="rounded-xl border border-[var(--border)] p-4">
        <p className="font-semibold">
          Saturation — how strong is the color?
        </p>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <ColorExample
            label="Weak"
            className="bg-blue-200"
          />

          <ColorExample
            label="Moderate"
            className="bg-blue-500"
          />

          <ColorExample
            label="Strong"
            className="bg-blue-800"
          />
        </div>

        <p className="mt-3 text-xs leading-5 text-[var(--muted)]">
          Use these only to understand the idea of increasing color
          intensity.
        </p>
      </div>

      {/* Distribution and zoning */}
      <div className="rounded-xl border border-[var(--border)] p-4">
        <p className="font-semibold">
          Distribution &amp; zoning
        </p>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="mx-auto h-24 max-w-40 rounded-2xl bg-blue-600" />

            <p className="mt-2 text-sm font-semibold">
              More Even
            </p>

            <p className="mt-1 text-xs text-[var(--muted)]">
              Similar color across the area
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto flex h-24 max-w-40 overflow-hidden rounded-2xl">
              <div className="w-1/3 bg-blue-300" />
              <div className="w-1/3 bg-blue-700" />
              <div className="w-1/3 bg-blue-400" />
            </div>

            <p className="mt-2 text-sm font-semibold">
              Visible Zoning
            </p>

            <p className="mt-1 text-xs text-[var(--muted)]">
              Noticeably different color areas
            </p>
          </div>
        </div>

        <p className="mt-4 text-xs leading-5 text-[var(--muted)]">
          Real gemstones can be much more complex. These diagrams only
          explain what the terms mean.
        </p>
      </div>
    </div>
  );
}

function ToneExample({
  label,
  opacity,
}: {
  label: string;
  opacity: string;
}) {
  return (
    <div className="text-center">
      <div
        className="mx-auto h-16 w-full rounded-xl bg-blue-700"
        style={{ opacity }}
      />

      <p className="mt-2 text-sm font-medium">{label}</p>
    </div>
  );
}

function ColorExample({
  label,
  className,
}: {
  label: string;
  className: string;
}) {
  return (
    <div className="text-center">
      <div className={`h-16 rounded-xl ${className}`} />
      <p className="mt-2 text-sm font-medium">{label}</p>
    </div>
  );
}
