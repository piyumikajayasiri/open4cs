export default function ClarityVisualGuide() {
  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-[var(--border)] p-4">
        <p className="font-semibold">
          How visible are the inclusions?
        </p>

        <p className="mt-1 text-sm text-[var(--muted)]">
          These simple diagrams show the idea of increasing visibility.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <ClarityExample
            label="Clean"
            marks={0}
          />

          <ClarityExample
            label="Slight"
            marks={2}
          />

          <ClarityExample
            label="Noticeable"
            marks={4}
          />

          <ClarityExample
            label="Obvious"
            marks={7}
          />
        </div>

        <p className="mt-4 text-xs leading-5 text-[var(--muted)]">
          These are simplified learning examples only. Real gemstone
          inclusions vary in type, size, position, visibility, and
          appearance.
        </p>
      </div>

      <div className="rounded-xl border border-[var(--border)] p-4">
        <p className="font-semibold">
          👁 Naked eye vs 🔍 10× loupe
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-[var(--surface-soft)] p-4">
            <p className="font-semibold">
              👁 Naked eye
            </p>

            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Observe the gemstone normally without magnification.
              Record what you can actually see.
            </p>
          </div>

          <div className="rounded-xl bg-[var(--surface-soft)] p-4">
            <p className="font-semibold">
              🔍 10× loupe
            </p>

            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              A loupe magnifies the gemstone and may make smaller
              features easier to observe.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ClarityExample({
  label,
  marks,
}: {
  label: string;
  marks: number;
}) {
  const positions = [
    "left-[48%] top-[25%]",
    "left-[30%] top-[45%]",
    "left-[63%] top-[55%]",
    "left-[45%] top-[67%]",
    "left-[67%] top-[35%]",
    "left-[25%] top-[67%]",
    "left-[52%] top-[43%]",
  ];

  return (
    <div className="text-center">
      <div className="relative mx-auto h-24 w-20 overflow-hidden rounded-[45%] border-2 border-blue-300 bg-blue-100 shadow-inner">
        <div className="absolute inset-3 rounded-[45%] border border-blue-300" />

        {positions.slice(0, marks).map((position, index) => (
          <span
            key={index}
            className={`absolute h-1.5 w-1.5 rounded-full bg-slate-700 ${position}`}
          />
        ))}
      </div>

      <p className="mt-2 text-sm font-semibold">
        {label}
      </p>
    </div>
  );
}
