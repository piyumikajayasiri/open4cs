import React from "react";

export default function CutVisualGuide() {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <GuideCard
          title="Symmetry"
          description="Look for a balanced shape where corresponding sides and facets appear reasonably even."
        >
          <div className="flex items-center justify-center gap-5">
            <GemShape />
            <span className="text-xl">↔</span>
            <GemShape />
          </div>
        </GuideCard>

        <GuideCard
          title="Windowing"
          description="A window can look like a pale or transparent area where you seem to see through the gemstone."
        >
          <div className="relative mx-auto h-28 w-28 rotate-45 rounded-3xl border-2 border-blue-500 bg-blue-200">
            <div className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white/80" />
          </div>
        </GuideCard>

        <GuideCard
          title="Extinction"
          description="Extinction appears as dark areas where little visible light seems to return to your eye."
        >
          <div className="relative mx-auto h-28 w-28 rotate-45 overflow-hidden rounded-3xl border-2 border-blue-500 bg-blue-300">
            <div className="absolute bottom-0 right-0 h-20 w-20 bg-slate-800/80" />
          </div>
        </GuideCard>

        <GuideCard
          title="Bulging"
          description="From the side, an overly rounded or deep lower section may appear more pronounced."
        >
          <div className="flex h-28 items-center justify-center">
            <div
              className="h-24 w-36 border-2 border-[var(--primary)] bg-[var(--primary-soft)]"
              style={{
                clipPath:
                  "polygon(0 15%, 100% 15%, 90% 35%, 72% 70%, 50% 100%, 28% 70%, 10% 35%)",
              }}
            />
          </div>
        </GuideCard>
      </div>

      <div className="rounded-xl bg-[var(--surface-soft)] p-4">
        <p className="text-sm leading-6 text-[var(--muted)]">
          These diagrams explain the general meaning of the terms only.
          Real gemstones vary in shape, facet arrangement, proportions,
          lighting response, and appearance. Do not treat these drawings
          as professional grading standards.
        </p>
      </div>
    </div>
  );
}

function GuideCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-white p-5">
      <div className="mb-5 min-h-32 flex items-center justify-center">
        {children}
      </div>

      <h4 className="font-bold">
        {title}
      </h4>

      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
        {description}
      </p>
    </div>
  );
}

function GemShape() {
  return (
    <div className="h-16 w-16 rotate-45 rounded-2xl border-2 border-[var(--primary)] bg-[var(--primary-soft)]" />
  );
}
