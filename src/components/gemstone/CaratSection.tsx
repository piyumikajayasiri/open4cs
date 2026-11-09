"use client";

import React from "react";

type CaratSectionProps = {
  caratWeight: string;
  length?: string;
  width?: string;
  depth?: string;
  onCaratWeightChange: (value: string) => void;
};

export default function CaratSection({
  caratWeight,
  length = "8.42",
  width = "6.31",
  depth = "4.55",
  onCaratWeightChange,
}: CaratSectionProps) {
  const cw = parseFloat(caratWeight) || 2.45;

  // Determine weight band display
  const getWeightBandLabel = (weight: number) => {
    if (weight < 0.5) return "0.01 – 0.49 ct band";
    if (weight < 1.0) return "0.50 – 0.99 ct band";
    if (weight < 2.0) return "1.00 – 1.99 ct band";
    if (weight < 3.0) return "2.00 – 2.99 ct band";
    if (weight < 5.0) return "3.00 – 4.99 ct band";
    return "5.00+ ct band";
  };

  const getMarketCategory = (weight: number) => {
    if (weight < 1.0) return { title: "Commercial accent range", sub: "Standard retail & accent demand" };
    if (weight < 3.0) return { title: "Liquid commercial range", sub: "Strong B2B demand in Colombo & Beruwala" };
    if (weight < 5.0) return { title: "High-tier commercial range", sub: "Premium trade & collector demand" };
    return { title: "Investment / Collector tier", sub: "Rare market availability" };
  };

  const weightBandLabel = getWeightBandLabel(cw);
  const marketCategory = getMarketCategory(cw);
  const displayLength = length || "8.42";
  const displayWidth = width || "6.31";
  const displayDepth = depth || "4.55";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Left Card Container (2 cols on large screens) */}
      <div className="lg:col-span-2 space-y-6">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-6">
          {/* Input & Subtext */}
          <div className="space-y-2">
            <label
              htmlFor="carat-weight-input"
              className="block text-xs font-bold text-slate-700"
            >
              Carat Weight (ct)
            </label>
            <div className="relative max-w-sm">
              <input
                id="carat-weight-input"
                type="number"
                step="0.01"
                min="0.01"
                value={caratWeight || "2.45"}
                onChange={(e) => onCaratWeightChange(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base font-extrabold text-slate-900 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600 pr-12"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                ct
              </span>
            </div>

            <p className="text-xs text-slate-500 flex items-center gap-1.5 pt-1">
              <span>📏</span>
              <span>
                Dimensions on record: {displayLength} × {displayWidth} × {displayDepth} mm
              </span>
            </p>
          </div>

          {/* Stack of 3 Sub-Cards */}
          <div className="space-y-3">
            {/* Card 1: WEIGHT CLASS */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                WEIGHT CLASS
              </p>
              <p className="text-sm font-bold text-slate-900">
                {weightBandLabel}
              </p>
            </div>

            {/* Card 2: SIZE CHARACTERISTICS */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                SIZE CHARACTERISTICS
              </p>
              <p className="text-sm font-bold text-slate-900">
                Faces up true to weight · no belly excess
              </p>
            </div>

            {/* Card 3: MARKET-SIZE CATEGORY */}
            <div className="rounded-xl border border-blue-100 bg-[#F4F8FF] p-4">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 mb-1">
                MARKET-SIZE CATEGORY
              </p>
              <p className="text-sm font-bold text-slate-900">
                {marketCategory.title}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {marketCategory.sub}
              </p>
            </div>
          </div>

          {/* Bottom Green Info Alert */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 flex items-start gap-3">
            <div className="w-5 h-5 rounded-full border border-emerald-400 bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold">i</span>
            </div>
            <p className="text-xs text-emerald-900 leading-relaxed">
              Carat Weight is evaluated together with gemstone dimensions and relevant market characteristics rather than being treated as a simple linear price multiplier.
            </p>
          </div>
        </div>
      </div>

      {/* Right Column Auxiliary Cards (1 col on large screens) */}
      <div className="space-y-6">
        {/* Card 1: CARAT PREVIEW Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
            CARAT PREVIEW
          </p>
          <p className="text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
            {cw.toFixed(2)} ct
          </p>

          <span className="inline-block rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold px-3 py-1">
            Well-proportioned for weight
          </span>
        </div>

        {/* Card 2: Amber Disclaimer Card */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-5 shadow-xs flex items-start gap-3">
          <span className="text-sm flex-shrink-0 mt-0.5">⚠️</span>
          <p className="text-xs text-amber-900 leading-relaxed font-medium">
            Suggested B2B Market Price Range only — not an official valuation, certification, or guaranteed selling price.
          </p>
        </div>
      </div>
    </div>
  );
}
