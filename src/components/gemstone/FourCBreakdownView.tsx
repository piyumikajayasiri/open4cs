"use client";

import React, { useState } from "react";

type FourCBreakdownViewProps = {
  stoneId?: string;
  ruleVersion?: string;
  colorScore?: number;
  colorLabel?: string;
  clarityScore?: number;
  clarityLabel?: string;
  cutScore?: number;
  cutLabel?: string;
  caratScore?: number;
  caratLabel?: string;
  length?: string | number;
  width?: string | number;
  depth?: string | number;
  ratio?: string | number;
  depthPercentage?: string | number;
  colorSimilarity?: number;
};

export default function FourCBreakdownView({
  stoneId = "CEY-2026-0847",
  ruleVersion = "v4.2",
  colorScore = 8.6,
  colorLabel = "Vivid Blue",
  clarityScore = 7.9,
  clarityLabel = "Eye-clean",
  cutScore = 8.1,
  cutLabel = "Well Cut",
  caratScore = 2.45,
  caratLabel = "Liquid band",
  length = "8.42",
  width = "6.31",
  depth = "4.55",
  ratio = "1.33",
  depthPercentage = "72.1",
  colorSimilarity = 91,
}: FourCBreakdownViewProps) {
  const [expandedSections, setExpandedSections] = useState<{
    color: boolean;
    clarity: boolean;
    cut: boolean;
    carat: boolean;
  }>({
    color: false,
    clarity: false,
    cut: false,
    carat: false,
  });

  const toggleSection = (section: "color" | "clarity" | "cut" | "carat") => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            4C Evaluation Breakdown
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {stoneId} · Each score cites the rule, factors and reference percentile
          </p>
        </div>

        <div className="self-start sm:self-auto">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50/70 text-blue-700 border border-blue-200/80">
            Rule engine {ruleVersion}
          </span>
        </div>
      </div>

      {/* 2x2 Grid of 4C Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CARD 1: COLOR */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
              COLOR — {colorScore.toFixed(1)}
            </h3>
            <span className="text-sm font-bold text-slate-900">
              {colorLabel}
            </span>
          </div>

          {/* Green Line Indicator */}
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full"
              style={{ width: `${Math.min(100, colorScore * 10)}%` }}
            />
          </div>

          {/* Two Factor Boxes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Positive Factors */}
            <div className="rounded-xl bg-[#F0FDF4] border border-emerald-100 p-3.5 space-y-2">
              <span className="text-[11px] font-semibold text-emerald-800/80 block">
                Positive factors
              </span>
              <ul className="space-y-1.5 text-xs text-slate-800 font-medium">
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-600 font-bold">+</span>
                  <span>Vivid saturation band (+)</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-600 font-bold">+</span>
                  <span>Even distribution (+)</span>
                </li>
              </ul>
            </div>

            {/* Watch Factors */}
            <div className="rounded-xl bg-[#FEF9EE] border border-amber-100 p-3.5 space-y-2">
              <span className="text-[11px] font-semibold text-amber-800/80 block">
                Watch factors
              </span>
              <ul className="space-y-1.5 text-xs text-slate-800 font-medium">
                <li className="flex items-start gap-1.5">
                  <span className="text-amber-600 font-bold">−</span>
                  <span>Tone 6 borderline dark (−)</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Color Similarity Bar */}
          <div className="rounded-xl bg-slate-50/80 border border-slate-200/60 p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-600">Color similarity</span>
              <span className="font-bold text-blue-600">{colorSimilarity}%</span>
            </div>
            <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full"
                style={{ width: `${colorSimilarity}%` }}
              />
            </div>
          </div>

          {/* Collapsible Section */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => toggleSection("color")}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 transition"
            >
              <span>{expandedSections.color ? "▴" : "▾"}</span>
              <span>Why did this result occur?</span>
            </button>
            {expandedSections.color && (
              <p className="mt-2 text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                Rule COL-03 applied: Ceylon blue sapphires with saturated vivid hue scores at tone 5–6 receive high baseline liquidity multipliers, with minor deduction for slightly deeper tone.
              </p>
            )}
          </div>
        </div>

        {/* CARD 2: CLARITY */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
              CLARITY — {clarityScore.toFixed(1)}
            </h3>
            <span className="text-sm font-bold text-slate-900">
              {clarityLabel}
            </span>
          </div>

          {/* Green Line Indicator */}
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full"
              style={{ width: `${Math.min(100, clarityScore * 10)}%` }}
            />
          </div>

          {/* Two Factor Boxes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Positive Factors */}
            <div className="rounded-xl bg-[#F0FDF4] border border-emerald-100 p-3.5 space-y-2">
              <span className="text-[11px] font-semibold text-emerald-800/80 block">
                Positive factors
              </span>
              <ul className="space-y-1.5 text-xs text-slate-800 font-medium">
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-600 font-bold">+</span>
                  <span>Eye-clean face-up (+)</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-600 font-bold">+</span>
                  <span>Inclusions off-table (+)</span>
                </li>
              </ul>
            </div>

            {/* Watch Factors */}
            <div className="rounded-xl bg-[#FEF9EE] border border-amber-100 p-3.5 space-y-2">
              <span className="text-[11px] font-semibold text-amber-800/80 block">
                Watch factors
              </span>
              <ul className="space-y-1.5 text-xs text-slate-800 font-medium">
                <li className="flex items-start gap-1.5">
                  <span className="text-amber-600 font-bold">−</span>
                  <span>Fine silk at 10x (−)</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Collapsible Section */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => toggleSection("clarity")}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 transition"
            >
              <span>{expandedSections.clarity ? "▴" : "▾"}</span>
              <span>Why did this result occur?</span>
            </button>
            {expandedSections.clarity && (
              <p className="mt-2 text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                Rule CLA-02 applied: Eye-clean grade requires zero visible inclusions under standard diffused overhead classroom lighting. 10× loupe detects minor rutile silk, confirming natural corundum origin without compromising brilliance.
              </p>
            )}
          </div>
        </div>

        {/* CARD 3: CUT */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
              CUT — {cutScore.toFixed(1)}
            </h3>
            <span className="text-sm font-bold text-slate-900">
              {cutLabel}
            </span>
          </div>

          {/* Green Line Indicator */}
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full"
              style={{ width: `${Math.min(100, cutScore * 10)}%` }}
            />
          </div>

          {/* Two Factor Boxes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Positive Factors */}
            <div className="rounded-xl bg-[#F0FDF4] border border-emerald-100 p-3.5 space-y-2">
              <span className="text-[11px] font-semibold text-emerald-800/80 block">
                Positive factors
              </span>
              <ul className="space-y-1.5 text-xs text-slate-800 font-medium">
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-600 font-bold">+</span>
                  <span>Excellent polish (+)</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-600 font-bold">+</span>
                  <span>L:W {ratio} in tolerance (+)</span>
                </li>
              </ul>
            </div>

            {/* Watch Factors */}
            <div className="rounded-xl bg-[#FEF9EE] border border-amber-100 p-3.5 space-y-2">
              <span className="text-[11px] font-semibold text-amber-800/80 block">
                Watch factors
              </span>
              <ul className="space-y-1.5 text-xs text-slate-800 font-medium">
                <li className="flex items-start gap-1.5">
                  <span className="text-amber-600 font-bold">−</span>
                  <span>Depth {depthPercentage}% deep (−2%)</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-amber-600 font-bold">−</span>
                  <span>Minimal extinction (−)</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Dimensions Pill Bar */}
          <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 text-xs text-slate-600 font-medium">
            {length} × {width} × {depth} mm · L:W {ratio} · Depth {depthPercentage}% · Rule CUT-02
          </div>

          {/* Collapsible Section */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => toggleSection("cut")}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 transition"
            >
              <span>{expandedSections.cut ? "▴" : "▾"}</span>
              <span>Why did this result occur?</span>
            </button>
            {expandedSections.cut && (
              <p className="mt-2 text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                Rule CUT-02 applied: Standard oval ratio tolerance is 1.20–1.40 (current: {ratio}). Total depth percentage exceeds 70% benchmark, resulting in slight pavilion bulge penalty while retaining solid face-up brilliance.
              </p>
            )}
          </div>
        </div>

        {/* CARD 4: CARAT */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
              CARAT — {caratScore.toFixed(2)} CT
            </h3>
            <span className="text-sm font-bold text-slate-900">
              {caratLabel}
            </span>
          </div>

          {/* Green Line Indicator */}
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full"
              style={{ width: "85%" }}
            />
          </div>

          {/* Two Factor Boxes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Positive Factors */}
            <div className="rounded-xl bg-[#F0FDF4] border border-emerald-100 p-3.5 space-y-2">
              <span className="text-[11px] font-semibold text-emerald-800/80 block">
                Positive factors
              </span>
              <ul className="space-y-1.5 text-xs text-slate-800 font-medium">
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-600 font-bold">+</span>
                  <span>True face-up weight (+)</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-600 font-bold">+</span>
                  <span>2–3 ct demand band (+)</span>
                </li>
              </ul>
            </div>

            {/* Watch Factors */}
            <div className="rounded-xl bg-[#FEF9EE] border border-amber-100 p-3.5 space-y-2">
              <span className="text-[11px] font-semibold text-amber-800/80 block">
                Watch factors
              </span>
              <ul className="space-y-1.5 text-xs text-slate-800 font-medium">
                <li className="flex items-start gap-1.5">
                  <span className="text-amber-600 font-bold">−</span>
                  <span>Upper-band softening (−)</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Collapsible Section */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => toggleSection("carat")}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 transition"
            >
              <span>{expandedSections.carat ? "▴" : "▾"}</span>
              <span>Why did this result occur?</span>
            </button>
            {expandedSections.carat && (
              <p className="mt-2 text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                Rule CAR-01 applied: Commercial corundum market exhibits step-function price jumps at 1.00 ct, 2.00 ct, and 3.00 ct boundaries. Weight of {caratScore.toFixed(2)} ct sits comfortably in the highly liquid 2.00–2.99 ct bracket.
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
