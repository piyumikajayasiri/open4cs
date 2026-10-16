"use client";

import React from "react";

export type ReferencePriceRecord = {
  id: string;
  source: string;
  date: string;
  pricePerCarat: string;
};

type HistoricalPricingViewProps = {
  stoneCategory?: string;
  currencyUnit?: string;
  timeframe?: string;
  recordsCount?: number;
  referenceRangeMin?: string;
  referenceRangeMax?: string;
  yourPositionMin?: string;
  yourPositionMax?: string;
  twelveMonthMovement?: string;
  movementContext?: string;
  referenceRecords?: ReferencePriceRecord[];
};

const DEFAULT_RECORDS: ReferencePriceRecord[] = [
  {
    id: "REF-1182",
    source: "Beruwala desk",
    date: "Aug 2026",
    pricePerCarat: "LKR 640K/ct",
  },
  {
    id: "REF-0934",
    source: "Member report",
    date: "Jul 2026",
    pricePerCarat: "LKR 612K/ct",
  },
  {
    id: "REF-0771",
    source: "Auction sheet",
    date: "May 2026",
    pricePerCarat: "LKR 545K/ct",
  },
];

const MONTHLY_DATA = [
  { month: "O", height: "45%", type: "band" },
  { month: "N", height: "48%", type: "band" },
  { month: "D", height: "50%", type: "band" },
  { month: "J", height: "52%", type: "band" },
  { month: "F", height: "55%", type: "band" },
  { month: "M", height: "58%", type: "band" },
  { month: "A", height: "62%", type: "band" },
  { month: "M", height: "66%", type: "band" },
  { month: "J", height: "70%", type: "band" },
  { month: "J", height: "82%", type: "median" },
  { month: "A", height: "85%", type: "median" },
  { month: "S", height: "84%", type: "median" },
];

export default function HistoricalPricingView({
  stoneCategory = "Heated Ceylon blue 2.0–3.0 ct",
  currencyUnit = "LKR per carat",
  timeframe = "12 months to Sep 2026",
  recordsCount = 14,
  referenceRangeMin = "545K",
  referenceRangeMax = "640K",
  yourPositionMin = "580K",
  yourPositionMax = "686K",
  twelveMonthMovement = "+8.4%",
  movementContext = "Seasonal B2B demand",
  referenceRecords = DEFAULT_RECORDS,
}: HistoricalPricingViewProps) {
  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Reference & Historical Pricing
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {stoneCategory} · {currencyUnit} · {timeframe}
          </p>
        </div>

        <div className="self-start sm:self-auto">
          <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80">
            {recordsCount} records · CAGS desk + member reports
          </span>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Historical Chart & 3 Cards (8 cols) */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-6">
          {/* Chart Header with Legend */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Historical price per carat
            </h3>

            <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1E564F]" />
                <span>Median</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                <span>Your band</span>
              </div>
            </div>
          </div>

          {/* Bar Chart Container */}
          <div className="h-56 w-full flex items-end justify-between gap-2 sm:gap-3 px-2 pt-6 pb-2 border-b border-slate-100">
            {MONTHLY_DATA.map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end gap-2 group">
                <div
                  className={`w-full max-w-[32px] rounded-t-md transition-all duration-300 ${
                    item.type === "median"
                      ? "bg-[#1E564F] hover:bg-[#16423C]"
                      : "bg-[#E2E8F0] hover:bg-slate-300"
                  }`}
                  style={{ height: item.height }}
                />
                <span className="text-[11px] font-semibold text-slate-400 group-hover:text-slate-700">
                  {item.month}
                </span>
              </div>
            ))}
          </div>

          {/* Bottom 3 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
            {/* Card 1: Reference Range */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                REFERENCE RANGE
              </span>
              <p className="text-sm sm:text-base font-extrabold text-slate-900">
                LKR {referenceRangeMin} – {referenceRangeMax}/ct
              </p>
              <p className="text-[10px] text-slate-500 font-medium">
                5-record median band
              </p>
            </div>

            {/* Card 2: Your Position */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                YOUR POSITION
              </span>
              <p className="text-sm sm:text-base font-extrabold text-slate-900">
                LKR {yourPositionMin} – {yourPositionMax}/ct
              </p>
              <p className="text-[10px] text-slate-500 font-medium">
                Upper-mid · colour-led
              </p>
            </div>

            {/* Card 3: 12-Month Movement */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                12-MO MOVEMENT
              </span>
              <p className="text-sm sm:text-base font-extrabold text-slate-900">
                {twelveMonthMovement}
              </p>
              <p className="text-[10px] text-slate-500 font-medium">
                {movementContext}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Reference Records & Disclaimer (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Reference Records Card */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-900 tracking-tight">
              Reference records used
            </h3>

            <div className="space-y-2.5">
              {referenceRecords.map((rec) => (
                <div
                  key={rec.id}
                  className="rounded-xl bg-slate-50/70 border border-slate-100 p-3.5 space-y-1 hover:bg-slate-50 transition"
                >
                  <p className="text-xs font-bold text-slate-900">
                    {rec.id} · {rec.source}
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {rec.date} · {rec.pricePerCarat}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Yellow Disclaimer Banner */}
          <div className="rounded-2xl border border-[#F6E7C4] bg-[#FEF9EE] p-4 flex items-start gap-3">
            <span className="text-sm text-amber-600 flex-shrink-0 mt-0.5">⚠️</span>
            <p className="text-xs text-amber-900/90 leading-relaxed font-medium">
              Historical prices describe past B2B observations. They do not guarantee any future selling price.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
