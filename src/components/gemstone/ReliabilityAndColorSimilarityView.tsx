"use client";

import React from "react";

type ReliabilityAndColorSimilarityViewProps = {
  stoneId?: string;
  snapshotDate?: string;
  origin?: string;
  originReliability?: string;
  caratWeight?: string | number;
  caratReliability?: string;
  color?: string;
  colorReliability?: string;
  treatment?: string;
  treatmentReliability?: string;
  dimensionsReliability?: string;
  colorSimilarity?: number;
  referenceCategory?: string;
  userColorDesc?: string;
  referenceColorDesc?: string;
};

export default function ReliabilityAndColorSimilarityView({
  stoneId = "CEY-2026-0847",
  snapshotDate = "24 Sep 2026",
  origin = "Sri Lanka",
  originReliability = "Seller Provided",
  caratWeight = "2.45 ct",
  caratReliability = "Measured",
  color = "Vivid Blue",
  colorReliability = "User Observed",
  treatment = "Heated (H)",
  treatmentReliability = "Laboratory Verified",
  dimensionsReliability = "Measured",
  colorSimilarity = 91,
  referenceCategory = "Vivid Blue T6",
  userColorDesc = "Vivid · Tone 6",
  referenceColorDesc = "Vivid Blue · 38 stones",
}: ReliabilityAndColorSimilarityViewProps) {
  // Helper to render reliability badge styled like Figma screenshot
  const renderBadge = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes("laboratory") || l.includes("verified")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <span>✔</span>
          <span>Laboratory Verified</span>
        </span>
      );
    }
    if (l.includes("measured")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <span>✔</span>
          <span>Measured</span>
        </span>
      );
    }
    if (l.includes("user") || l.includes("observed")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          <span>👁</span>
          <span>User Observed</span>
        </span>
      );
    }
    // Seller Provided / Unverified fallback
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300">
        <span>⚠️</span>
        <span>Seller Provided</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Reliability & Color Similarity
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {stoneId} · Evidence sources and reference colour match
          </p>
        </div>

        <div className="self-start sm:self-auto">
          <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80">
            Snapshot {snapshotDate}
          </span>
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Card: Information Reliability (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-emerald-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <h3 className="text-sm font-bold text-slate-900">
                Information Reliability
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Information reliability indicates the evidence source used for the evaluation.
            </p>
          </div>

          {/* 5 Stacked Attribute Rows */}
          <div className="space-y-2.5 pt-1">
            {/* Row 1: Origin */}
            <div className="rounded-xl bg-slate-50/70 border border-slate-100 p-3.5 flex items-center justify-between gap-3">
              <span className="text-xs font-medium text-slate-800">
                Origin — {origin}
              </span>
              {renderBadge(originReliability)}
            </div>

            {/* Row 2: Carat Weight */}
            <div className="rounded-xl bg-slate-50/70 border border-slate-100 p-3.5 flex items-center justify-between gap-3">
              <span className="text-xs font-medium text-slate-800">
                Carat Weight — {caratWeight}
              </span>
              {renderBadge(caratReliability)}
            </div>

            {/* Row 3: Color */}
            <div className="rounded-xl bg-slate-50/70 border border-slate-100 p-3.5 flex items-center justify-between gap-3">
              <span className="text-xs font-medium text-slate-800">
                Color — {color}
              </span>
              {renderBadge(colorReliability)}
            </div>

            {/* Row 4: Treatment */}
            <div className="rounded-xl bg-slate-50/70 border border-slate-100 p-3.5 flex items-center justify-between gap-3">
              <span className="text-xs font-medium text-slate-800">
                Treatment — {treatment}
              </span>
              {renderBadge(treatmentReliability)}
            </div>

            {/* Row 5: Dimensions */}
            <div className="rounded-xl bg-slate-50/70 border border-slate-100 p-3.5 flex items-center justify-between gap-3">
              <span className="text-xs font-medium text-slate-800">
                Dimensions
              </span>
              {renderBadge(dimensionsReliability)}
            </div>
          </div>
        </div>

        {/* Right Card: Color Similarity (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col items-center text-center space-y-4">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
              COLOR SIMILARITY
            </span>
            <p className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
              {colorSimilarity}%
            </p>
            <p className="text-xs text-slate-500 font-medium">
              against reference category {referenceCategory}
            </p>
          </div>

          {/* 2 Color Swatches Side-by-Side */}
          <div className="grid grid-cols-2 gap-3.5 w-full pt-1">
            {/* User Swatch */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 flex flex-col items-center justify-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-[#1A56DB] shadow-inner" />
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-900 block">
                  Your colour
                </span>
                <span className="text-[10px] text-slate-500 font-medium block">
                  {userColorDesc}
                </span>
              </div>
            </div>

            {/* Reference Swatch */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 flex flex-col items-center justify-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-[#1E40AF] shadow-inner" />
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-900 block">
                  Reference category
                </span>
                <span className="text-[10px] text-slate-500 font-medium block">
                  {referenceColorDesc}
                </span>
              </div>
            </div>
          </div>

          {/* Footnote Caption */}
          <p className="text-[11px] text-slate-400 pt-3 border-t border-slate-100 w-full text-center">
            Computed from hue, tone and saturation distance under Rule COL-09.
          </p>
        </div>

      </div>

      {/* Bottom Alert Banner */}
      <div className="rounded-2xl border border-[#F6E7C4] bg-[#FEF9EE] p-4 flex items-center gap-3">
        <span className="text-base text-amber-600 flex-shrink-0">⚠️</span>
        <p className="text-xs text-amber-900/90 leading-relaxed font-medium">
          Suggested B2B Market Price Range only — not an official valuation, certification, or guaranteed selling price.
        </p>
      </div>
    </div>
  );
}
