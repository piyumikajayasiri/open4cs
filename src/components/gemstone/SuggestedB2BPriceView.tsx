"use client";

import React, { useState } from "react";

export type PriceBreakdownRow = {
  label: string;
  subInfo: string;
  adjustment: string;
  adjustmentType?: "positive" | "negative" | "neutral" | "capped";
  runningValue: string;
  ruleCitation: string;
};

type SuggestedB2BPriceViewProps = {
  stoneId?: string;
  ruleVersion?: string;
  snapshotDate?: string;
  priceRangeMin?: string;
  priceRangeMax?: string;
  pricePerCaratMin?: string;
  pricePerCaratMax?: string;
  caratWeight?: string | number;
  finalRangeText?: string;
  rows?: PriceBreakdownRow[];
};

const DEFAULT_ROWS: PriceBreakdownRow[] = [
  {
    label: "Reference Value",
    subInfo: "LKR 612K/ct median",
    adjustment: "—",
    adjustmentType: "neutral",
    runningValue: "LKR 1.499M",
    ruleCitation: "PM-4.2 · 5 heated records",
  },
  {
    label: "Color Adjustment",
    subInfo: "Vivid Blue T6 · 8.6",
    adjustment: "+9%",
    adjustmentType: "positive",
    runningValue: "LKR 1.634M",
    ruleCitation: "Rule COL-03",
  },
  {
    label: "Clarity Adjustment",
    subInfo: "Eye-clean · 7.9",
    adjustment: "+3%",
    adjustmentType: "positive",
    runningValue: "LKR 1.683M",
    ruleCitation: "Rule CLA-02",
  },
  {
    label: "Cut Adjustment",
    subInfo: "Depth 72.1% deep",
    adjustment: "-2%",
    adjustmentType: "negative",
    runningValue: "LKR 1.649M",
    ruleCitation: "Rule CUT-02",
  },
  {
    label: "Treatment Modifier",
    subInfo: "Heated (H) verified",
    adjustment: "-4%",
    adjustmentType: "negative",
    runningValue: "LKR 1.583M",
    ruleCitation: "Rule TRT-01",
  },
  {
    label: "Origin Modifier",
    subInfo: "Ceylon, unverified",
    adjustment: "+0% capped",
    adjustmentType: "capped",
    runningValue: "LKR 1.583M",
    ruleCitation: "Rule ORG-02 · verify to unlock +5%",
  },
];

export default function SuggestedB2BPriceView({
  stoneId = "CEY-2026-0847",
  ruleVersion = "v4.2",
  snapshotDate = "24 Sep 2026",
  priceRangeMin = "1.42M",
  priceRangeMax = "1.68M",
  pricePerCaratMin = "580K",
  pricePerCaratMax = "686K",
  caratWeight = "2.45",
  finalRangeText = "LKR 1.42M – 1.68M",
  rows = DEFAULT_ROWS,
}: SuggestedB2BPriceViewProps) {
  const [isExplanationOpen, setIsExplanationOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Suggested B2B Market Price
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {stoneId} · Computed deterministically from the rows below — no hidden models
          </p>
        </div>

        <div className="self-start sm:self-auto">
          <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-semibold bg-white text-slate-600 border border-slate-200/80 shadow-2xs">
            Rule {ruleVersion} · Snapshot {snapshotDate}
          </span>
        </div>
      </div>

      {/* Hero Banner: Dark Container with Headline Price Range */}
      <div className="rounded-2xl bg-[#0B1528] text-white p-8 sm:p-10 text-center shadow-md space-y-3">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
          ESTIMATED B2B MARKET PRICE RANGE
        </span>

        <p className="text-3xl sm:text-5xl font-black text-white tracking-tight flex items-center justify-center gap-3">
          <span>LKR {priceRangeMin}</span>
          <span className="text-lg sm:text-2xl font-semibold text-slate-400 lowercase">to</span>
          <span>LKR {priceRangeMax}</span>
        </p>

        <div className="pt-1">
          <span className="inline-block rounded-full bg-slate-800/90 border border-slate-700/60 px-4 py-1.5 text-xs font-semibold text-slate-200">
            LKR {pricePerCaratMin} – {pricePerCaratMax} per carat · {caratWeight} ct
          </span>
        </div>

        <p className="text-[11px] text-slate-400 pt-2 max-w-2xl mx-auto leading-relaxed">
          Based on: 4C Evaluation · Comparable Gemstones · Reference Pricing · Historical Data · Approved Pricing Rules · Applicable Adjustments
        </p>
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Price Breakdown Table (8 cols) */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Price breakdown
          </h3>

          <div className="divide-y divide-slate-100 text-xs">
            {rows.map((row, index) => (
              <div
                key={index}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                {/* Left: Factor and sub-info */}
                <div className="w-48 shrink-0">
                  <p className="font-bold text-slate-900">{row.label}</p>
                  <p className="text-[11px] text-slate-500">{row.subInfo}</p>
                </div>

                {/* Adjustment badge */}
                <div className="w-24 text-left sm:text-center shrink-0">
                  <span
                    className={`font-extrabold ${
                      row.adjustmentType === "positive"
                        ? "text-emerald-600"
                        : row.adjustmentType === "negative"
                        ? "text-red-500"
                        : row.adjustmentType === "capped"
                        ? "text-emerald-600"
                        : "text-slate-400"
                    }`}
                  >
                    {row.adjustment}
                  </span>
                </div>

                {/* Running Value */}
                <div className="w-28 text-left sm:text-right shrink-0">
                  <span className="font-extrabold text-slate-900">
                    {row.runningValue}
                  </span>
                </div>

                {/* Rule Citation */}
                <div className="flex-1 text-left sm:text-right">
                  <span className="text-[11px] text-slate-400 font-medium">
                    {row.ruleCitation}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Final Range Highlight Box */}
          <div className="rounded-xl bg-slate-50/80 border border-slate-200/60 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-4">
            <span className="text-xs font-semibold text-slate-600">
              Final suggested range (±6% market tolerance)
            </span>
            <span className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
              {finalRangeText}
            </span>
          </div>

          {/* Collapsible calculation explanation */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setIsExplanationOpen(!isExplanationOpen)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 transition"
            >
              <span>{isExplanationOpen ? "▴" : "▾"}</span>
              <span>How was this price suggestion calculated?</span>
            </button>
            {isExplanationOpen && (
              <p className="mt-3 text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                Formula applies standard sequential adjustments against the verified median baseline reference: Base Reference Price × (1 + Color Adj + Clarity Adj + Cut Adj + Treatment Mod + Origin Mod). The resulting figure establishes the central benchmark, expanded by ±6% to reflect local market liquidity tolerance.
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Calculation Flow & Disclaimer (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Calculation Flow Card */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-900 tracking-tight">
              Calculation flow
            </h3>

            <div className="space-y-2 text-center text-xs font-semibold text-slate-700">
              <div className="py-2.5 px-3 rounded-xl bg-slate-50/90 border border-slate-200/60">
                Reference Value
              </div>
              <div className="text-slate-400 text-xs">↓</div>
              <div className="py-2.5 px-3 rounded-xl bg-slate-50/90 border border-slate-200/60">
                4C Evaluation
              </div>
              <div className="text-slate-400 text-xs">↓</div>
              <div className="py-2.5 px-3 rounded-xl bg-slate-50/90 border border-slate-200/60">
                Comparable Gemstones
              </div>
              <div className="text-slate-400 text-xs">↓</div>
              <div className="py-2.5 px-3 rounded-xl bg-slate-50/90 border border-slate-200/60">
                Pricing Adjustments
              </div>
              <div className="text-slate-400 text-xs">↓</div>
              <div className="py-2.5 px-3 rounded-xl bg-[#1E564F] text-white font-bold shadow-xs">
                Suggested B2B Price Range
              </div>
            </div>
          </div>

          {/* Yellow Disclaimer Banner */}
          <div className="rounded-2xl border border-[#F6E7C4] bg-[#FEF9EE] p-4 flex items-start gap-3">
            <span className="text-sm text-amber-600 flex-shrink-0 mt-0.5">⚠️</span>
            <p className="text-[11px] text-amber-900/90 leading-relaxed font-medium">
              This system provides an estimated B2B price suggestion based on the information provided, predefined evaluation and pricing rules, comparable gemstone data, and available reference information. It is not a professional laboratory valuation, gemstone certification, authentication, legally binding valuation, or guaranteed selling price.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
