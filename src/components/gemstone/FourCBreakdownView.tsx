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
  caratAssessmentScore?: number;
  caratWeight?: number;
  caratLabel?: string;
  length?: string | number;
  width?: string | number;
  depth?: string | number;
  ratio?: string | number;
  depthPercentage?: string | number;
  colorSimilarity?: number;
  hue?: string;
  tone?: string;
  saturation?: string;
  distribution?: string;
  zoning?: string;
  nakedEye?: string;
  loupe10x?: string;
  inclusionType?: string;
  severity?: string;
  symmetry?: string;
  polish?: string;
  windowing?: string;
  extinction?: string;
  bulging?: string;
};

export default function FourCBreakdownView({
  stoneId = "CEY-2026-0847",
  ruleVersion = "prototype-v1",
  colorScore = 8.6,
  colorLabel = "Vivid Blue",
  clarityScore = 7.9,
  clarityLabel = "Eye-clean",
  cutScore = 8.1,
  cutLabel = "Well Cut",
  caratScore = 8.5,
  caratAssessmentScore = 85,
  caratWeight = 2.45,
  caratLabel = "Liquid band",
  length,
  width,
  depth,
  ratio: propRatio,
  depthPercentage: propDepthPercentage,
  colorSimilarity,
  hue,
  tone,
  saturation,
  distribution,
  zoning,
  nakedEye,
  loupe10x,
  inclusionType,
  severity,
  symmetry,
  polish,
  windowing,
  extinction,
  bulging,
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

  const lenNum = typeof length === "number" ? length : parseFloat(String(length || ""));
  const widNum = typeof width === "number" ? width : parseFloat(String(width || ""));
  const depNum = typeof depth === "number" ? depth : parseFloat(String(depth || ""));

  const hasDimensions = !isNaN(lenNum) && lenNum > 0 && !isNaN(widNum) && widNum > 0 && !isNaN(depNum) && depNum > 0;

  const calculatedRatio = propRatio ?? (hasDimensions ? (lenNum / widNum).toFixed(2) : null);
  const calculatedDepthPercent = propDepthPercentage ?? (hasDimensions ? ((depNum / widNum) * 100).toFixed(1) : null);

  const displayLength = hasDimensions ? lenNum.toFixed(2) : length ? String(length) : "Not assessed";
  const displayWidth = hasDimensions ? widNum.toFixed(2) : width ? String(width) : "Not assessed";
  const displayDepth = hasDimensions ? depNum.toFixed(2) : depth ? String(depth) : "Not assessed";

  const actualWeight = typeof caratWeight === "number" && caratWeight > 0 ? caratWeight : 2.45;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            4C Evaluation Breakdown
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {stoneId} · Each score cites the rule, observed metrics, and reference factors
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
              {colorLabel || (hue ? `${hue}${saturation ? ` (${saturation})` : ""}` : "Not assessed")}
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
                {saturation ? (
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">+</span>
                    <span>{saturation} saturation band (+)</span>
                  </li>
                ) : null}
                {distribution ? (
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">+</span>
                    <span>{distribution} distribution (+)</span>
                  </li>
                ) : null}
                {!saturation && !distribution && (
                  <li className="text-slate-400 italic">Not assessed</li>
                )}
              </ul>
            </div>

            {/* Watch Factors */}
            <div className="rounded-xl bg-[#FEF9EE] border border-amber-100 p-3.5 space-y-2">
              <span className="text-[11px] font-semibold text-amber-800/80 block">
                Watch factors
              </span>
              <ul className="space-y-1.5 text-xs text-slate-800 font-medium">
                {tone && Number(tone) >= 6 ? (
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-600 font-bold">−</span>
                    <span>Tone {tone} borderline deep/dark (−)</span>
                  </li>
                ) : tone && Number(tone) <= 4 ? (
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-600 font-bold">−</span>
                    <span>Tone {tone} slightly light (−)</span>
                  </li>
                ) : null}
                {zoning && zoning.toLowerCase() !== "none" ? (
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-600 font-bold">−</span>
                    <span>Zoning: {zoning} (−)</span>
                  </li>
                ) : null}
                {(!tone || Number(tone) === 5) && (!zoning || zoning.toLowerCase() === "none") && (
                  <li className="text-slate-500 font-normal">None noted</li>
                )}
              </ul>
            </div>
          </div>

          {/* Color Similarity Bar if available */}
          {typeof colorSimilarity === "number" && colorSimilarity > 0 ? (
            <div className="rounded-xl bg-slate-50/80 border border-slate-200/60 p-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-600">Color similarity to reference</span>
                <span className="font-bold text-blue-600">{Math.round(colorSimilarity)}%</span>
              </div>
              <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full"
                  style={{ width: `${Math.min(100, colorSimilarity)}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-slate-50/60 border border-slate-100 p-2.5 text-[11px] text-slate-500">
              Color similarity: Standalone observation score (no active benchmark stone selected).
            </div>
          )}

          {/* Collapsible Section */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => toggleSection("color")}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 transition cursor-pointer"
            >
              <span>{expandedSections.color ? "▴" : "▾"}</span>
              <span>Why did this result occur?</span>
            </button>
            {expandedSections.color && (
              <p className="mt-2 text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                Rule COL-01/COL-02: Hue ({hue || "Not assessed"}), Tone ({tone || "Not assessed"}), Saturation ({saturation || "Not assessed"}), Distribution ({distribution || "Not assessed"}), and Zoning ({zoning || "Not assessed"}). Evaluated deterministically with locked factor weights (Hue 25%, Tone 20%, Saturation 25%, Distribution 15%, Zoning 15%).
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
              {clarityLabel || nakedEye || "Not assessed"}
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
                {nakedEye ? (
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">+</span>
                    <span>Naked eye: {nakedEye} (+)</span>
                  </li>
                ) : null}
                {loupe10x && loupe10x.toLowerCase() !== "not examined" ? (
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">+</span>
                    <span>10× loupe: {loupe10x} (+)</span>
                  </li>
                ) : null}
                {!nakedEye && !loupe10x && (
                  <li className="text-slate-400 italic">Not assessed</li>
                )}
              </ul>
            </div>

            {/* Watch Factors */}
            <div className="rounded-xl bg-[#FEF9EE] border border-amber-100 p-3.5 space-y-2">
              <span className="text-[11px] font-semibold text-amber-800/80 block">
                Watch factors
              </span>
              <ul className="space-y-1.5 text-xs text-slate-800 font-medium">
                {inclusionType ? (
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-600 font-bold">−</span>
                    <span>{inclusionType} ({severity || "Severity noted"}) (−)</span>
                  </li>
                ) : null}
                {loupe10x && loupe10x.toLowerCase() === "not examined" ? (
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-600 font-bold">−</span>
                    <span>10× examination pending</span>
                  </li>
                ) : null}
                {!inclusionType && loupe10x?.toLowerCase() !== "not examined" && (
                  <li className="text-slate-500 font-normal">None noted</li>
                )}
              </ul>
            </div>
          </div>

          {/* Collapsible Section */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => toggleSection("clarity")}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 transition cursor-pointer"
            >
              <span>{expandedSections.clarity ? "▴" : "▾"}</span>
              <span>Why did this result occur?</span>
            </button>
            {expandedSections.clarity && (
              <p className="mt-2 text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                Rule CLA-01: Naked-eye observation ({nakedEye || "Not assessed"}), 10× loupe ({loupe10x || "Not assessed"}), Inclusions ({inclusionType || "None"}), Severity ({severity || "Not assessed"}). Graded using locked factor weights (Naked Eye 40%, 10× Loupe 35%, Severity 25%).
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
                {polish ? (
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">+</span>
                    <span>{polish} polish (+)</span>
                  </li>
                ) : null}
                {symmetry ? (
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">+</span>
                    <span>{symmetry} symmetry (+)</span>
                  </li>
                ) : null}
                {calculatedRatio ? (
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">+</span>
                    <span>L:W {calculatedRatio} in ratio tolerance (+)</span>
                  </li>
                ) : null}
                {!polish && !symmetry && !calculatedRatio && (
                  <li className="text-slate-400 italic">Not assessed</li>
                )}
              </ul>
            </div>

            {/* Watch Factors */}
            <div className="rounded-xl bg-[#FEF9EE] border border-amber-100 p-3.5 space-y-2">
              <span className="text-[11px] font-semibold text-amber-800/80 block">
                Watch factors
              </span>
              <ul className="space-y-1.5 text-xs text-slate-800 font-medium">
                {calculatedDepthPercent && Number(calculatedDepthPercent) > 70 ? (
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-600 font-bold">−</span>
                    <span>Depth {calculatedDepthPercent}% deep pavilion (−)</span>
                  </li>
                ) : null}
                {extinction && extinction.toLowerCase() !== "none" ? (
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-600 font-bold">−</span>
                    <span>Extinction: {extinction} (−)</span>
                  </li>
                ) : null}
                {windowing && windowing.toLowerCase() !== "none" ? (
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-600 font-bold">−</span>
                    <span>Windowing: {windowing} (−)</span>
                  </li>
                ) : null}
                {!calculatedDepthPercent && !extinction && !windowing && (
                  <li className="text-slate-500 font-normal">None noted</li>
                )}
              </ul>
            </div>
          </div>

          {/* Dimensions Pill Bar */}
          <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 text-xs text-slate-600 font-medium">
            {hasDimensions ? (
              `${displayLength} × ${displayWidth} × ${displayDepth} mm · L:W ${calculatedRatio || "—"} · Depth ${calculatedDepthPercent || "—"}% · Rule CUT-01`
            ) : (
              `Dimensions: ${displayLength} × ${displayWidth} × ${displayDepth} mm (Incomplete)`
            )}
          </div>

          {/* Collapsible Section */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => toggleSection("cut")}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 transition cursor-pointer"
            >
              <span>{expandedSections.cut ? "▴" : "▾"}</span>
              <span>Why did this result occur?</span>
            </button>
            {expandedSections.cut && (
              <p className="mt-2 text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                Rule CUT-01: Proportions evaluated from actual physical measurements ({displayLength} × {displayWidth} × {displayDepth} mm), symmetry ({symmetry || "Not assessed"}), polish ({polish || "Not assessed"}), windowing ({windowing || "None"}), extinction ({extinction || "None"}), and bulging ({bulging || "None"}).
              </p>
            )}
          </div>
        </div>

        {/* CARD 4: CARAT */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
              CARAT — {(caratScore > 10 ? caratScore / 10 : caratScore).toFixed(1)}
            </h3>
            <span className="text-sm font-bold text-slate-900">
              {caratLabel}
            </span>
          </div>

          {/* Green Line Indicator */}
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full"
              style={{ width: `${Math.min(100, (caratAssessmentScore ?? (caratScore > 10 ? caratScore : caratScore * 10)))}%` }}
            />
          </div>

          {/* Dual Weight & Size Assessment Badge */}
          <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-500">Weight:</span>
              <span className="text-slate-900 font-bold">
                {actualWeight.toFixed(2)} ct
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-500">Size assessment:</span>
              <span className="text-slate-900 font-bold font-mono">
                {caratAssessmentScore ?? (caratScore > 10 ? Math.round(caratScore) : Math.round(caratScore * 10))}/100
              </span>
              <span className="text-[10px] text-slate-400">
                ({(caratScore > 10 ? caratScore / 10 : caratScore).toFixed(1)}/10)
              </span>
            </div>
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
                  <span>Face-up calibrated weight ({actualWeight.toFixed(2)} ct) (+)</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-600 font-bold">+</span>
                  <span>{actualWeight >= 2.0 ? "2.00+ ct market demand band" : "Standard commercial weight band"} (+)</span>
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
                  <span>Size assessment {caratAssessmentScore ?? 85}/100 based on weight tier</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Collapsible Section */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => toggleSection("carat")}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 transition cursor-pointer"
            >
              <span>{expandedSections.carat ? "▴" : "▾"}</span>
              <span>Why did this result occur?</span>
            </button>
            {expandedSections.carat && (
              <p className="mt-2 text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                Rule CAR-01 applied: Calibrated electronic scale weight of {actualWeight.toFixed(2)} ct evaluated for physical weight tier rarity and spread consistency.
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
