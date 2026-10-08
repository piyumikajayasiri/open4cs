"use client";

import React, { useState } from "react";

type CutSectionProps = {
  length: string;
  width: string;
  depth: string;
  symmetry: string;
  polish: string;
  windowing: string;
  extinction: string;
  bulging: string;
  onLengthChange: (value: string) => void;
  onWidthChange: (value: string) => void;
  onDepthChange: (value: string) => void;
  onSymmetryChange: (value: string) => void;
  onPolishChange: (value: string) => void;
  onWindowingChange: (value: string) => void;
  onExtinctionChange: (value: string) => void;
  onBulgingChange: (value: string) => void;
};

export default function CutSection({
  length,
  width,
  depth,
  symmetry,
  polish,
  windowing,
  extinction,
  bulging,
  onLengthChange,
  onWidthChange,
  onDepthChange,
  onSymmetryChange,
  onPolishChange,
  onWindowingChange,
  onExtinctionChange,
  onBulgingChange,
}: CutSectionProps) {
  const [proportions, setProportions] = useState("Well proportioned");

  // Defaults if empty for preview match
  const lVal = parseFloat(length) || 8.42;
  const wVal = parseFloat(width) || 6.31;
  const dVal = parseFloat(depth) || 4.55;

  const lwRatio = wVal > 0 ? (lVal / wVal).toFixed(2) : "1.33";
  const depthPercent = wVal > 0 ? ((dVal / wVal) * 100).toFixed(1) : "72.1";

  // Helper score calculation for Cut preview
  const calculateCutScore = () => {
    let symScore = 85;
    if (symmetry === "Excellent") symScore = 100;
    else if (symmetry === "Fair") symScore = 65;
    else if (symmetry === "Poor") symScore = 40;

    let polScore = 100;
    if (polish === "Good") polScore = 85;
    else if (polish === "Fair") polScore = 65;
    else if (polish === "Poor") polScore = 40;

    let winScore = 100;
    if (windowing === "Slight") winScore = 85;
    else if (windowing === "Moderate") winScore = 60;
    else if (windowing === "Severe") winScore = 40;

    const total = (symScore * 0.30 + polScore * 0.30 + winScore * 0.40) / 10;
    return total.toFixed(1);
  };

  const previewScore = calculateCutScore();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Column 1: Measurements (mm) (4 cols on large) */}
      <div className="lg:col-span-4 space-y-5">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900">
            Measurements (mm)
          </h3>

          {/* 3 inline input fields */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor="cut-length" className="block text-xs font-medium text-slate-500 mb-1">
                Length
              </label>
              <input
                id="cut-length"
                type="number"
                step="0.01"
                value={length || "8.42"}
                onChange={(e) => onLengthChange(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 text-center outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label htmlFor="cut-width" className="block text-xs font-medium text-slate-500 mb-1">
                Width
              </label>
              <input
                id="cut-width"
                type="number"
                step="0.01"
                value={width || "6.31"}
                onChange={(e) => onWidthChange(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 text-center outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label htmlFor="cut-depth" className="block text-xs font-medium text-slate-500 mb-1">
                Depth
              </label>
              <input
                id="cut-depth"
                type="number"
                step="0.01"
                value={depth || "4.55"}
                onChange={(e) => onDepthChange(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 text-center outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Gemstone Visual Diagram Box */}
          <div className="rounded-xl border border-blue-100 bg-[#F4F8FF] p-4 flex items-center justify-around">
            {/* Top View Outline */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full border-2 border-blue-400 bg-white flex items-center justify-center relative shadow-xs">
                {/* Diamond facet lines icon */}
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 2L4 9l8 13 8-13-8-7zM4 9h16M12 2v20" />
                </svg>
              </div>
              <div className="mt-2 text-[10px] font-bold text-blue-600 leading-tight text-center">
                <p>↔ Length {length || "8.42"}</p>
                <p>↕ Width {width || "6.31"}</p>
              </div>
            </div>

            {/* Side Profile Outline */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-16 border-2 border-dashed border-amber-400 bg-white rounded-lg flex flex-col items-center justify-center relative shadow-xs">
                <span className="text-[10px] font-bold text-amber-600">Side</span>
              </div>
              <div className="mt-2 text-[10px] font-bold text-amber-600 leading-tight text-center">
                <p>Depth {depth || "4.55"}</p>
              </div>
            </div>
          </div>

          {/* Calculated Ratios Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-[#EBF3FF] p-3.5 border border-blue-100">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                L:W RATIO
              </p>
              <p className="text-xl font-extrabold text-slate-900 mt-1">
                {lwRatio}
              </p>
              <p className="text-[10px] font-semibold text-emerald-600 mt-0.5">
                Ideal oval range
              </p>
            </div>

            <div className="rounded-xl bg-[#EBF3FF] p-3.5 border border-blue-100">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                DEPTH %
              </p>
              <p className="text-xl font-extrabold text-slate-900 mt-1">
                {depthPercent}%
              </p>
              <p className="text-[10px] font-semibold text-blue-600 mt-0.5">
                Slightly deep
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Column 2: Cut characteristics (5 cols on large) */}
      <div className="lg:col-span-5 space-y-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-4">
            Cut characteristics
          </h3>

          <div className="space-y-4">
            {/* Proportions */}
            <div>
              <label htmlFor="cut-proportions" className="block text-xs font-semibold text-slate-600 mb-1.5">
                Proportions
              </label>
              <select
                id="cut-proportions"
                value={proportions}
                onChange={(e) => setProportions(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              >
                <option value="Well proportioned">Well proportioned</option>
                <option value="Deep pavilion">Deep pavilion</option>
                <option value="Shallow crown">Shallow crown</option>
                <option value="Bulging">Bulging</option>
              </select>
            </div>

            {/* Symmetry */}
            <div>
              <label htmlFor="cut-symmetry" className="block text-xs font-semibold text-slate-600 mb-1.5">
                Symmetry
              </label>
              <select
                id="cut-symmetry"
                value={symmetry || "Good"}
                onChange={(e) => onSymmetryChange(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              >
                <option value="Good">Good</option>
                <option value="Excellent">Excellent</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
            </div>

            {/* Polish */}
            <div>
              <label htmlFor="cut-polish" className="block text-xs font-semibold text-slate-600 mb-1.5">
                Polish
              </label>
              <select
                id="cut-polish"
                value={polish || "Excellent"}
                onChange={(e) => onPolishChange(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              >
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
            </div>

            {/* Windowing */}
            <div>
              <label htmlFor="cut-windowing" className="block text-xs font-semibold text-slate-600 mb-1.5">
                Windowing
              </label>
              <select
                id="cut-windowing"
                value={windowing || "None"}
                onChange={(e) => onWindowingChange(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              >
                <option value="None">None</option>
                <option value="Slight">Slight</option>
                <option value="Moderate">Moderate</option>
                <option value="Severe">Severe</option>
              </select>
            </div>

            {/* Extinction */}
            <div>
              <label htmlFor="cut-extinction" className="block text-xs font-semibold text-slate-600 mb-1.5">
                Extinction
              </label>
              <select
                id="cut-extinction"
                value={extinction || "Minimal"}
                onChange={(e) => onExtinctionChange(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              >
                <option value="Minimal">Minimal</option>
                <option value="None">None</option>
                <option value="Slight">Slight</option>
                <option value="Moderate">Moderate</option>
                <option value="Severe">Severe</option>
              </select>
            </div>

            {/* Bulging */}
            <div>
              <label htmlFor="cut-bulging" className="block text-xs font-semibold text-slate-600 mb-1.5">
                Bulging
              </label>
              <select
                id="cut-bulging"
                value={bulging || "None"}
                onChange={(e) => onBulgingChange(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              >
                <option value="None">None</option>
                <option value="Slight">Slight</option>
                <option value="Moderate">Moderate</option>
                <option value="Severe">Severe</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Column 3: Validation & Cut Preview Cards (3 cols on large) */}
      <div className="lg:col-span-3 space-y-4">
        {/* Card 1: Green Validation Alert */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 shadow-xs flex items-start gap-3">
          <div className="w-5 h-5 rounded-full border border-emerald-400 bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0 mt-0.5">
            <svg className="w-3 h-3 stroke-current" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-xs text-emerald-900 leading-relaxed">
            <strong className="font-bold">Measurements valid.</strong> Ratio {lwRatio} sits inside the oval tolerance 1.30–1.50 under Rule CUT-02.
          </p>
        </div>

        {/* Card 2: Yellow Warning Alert */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 shadow-xs flex items-start gap-3">
          <span className="text-sm flex-shrink-0 mt-0.5">⚠️</span>
          <p className="text-xs text-amber-900 leading-relaxed">
            <strong className="font-bold">Depth {depthPercent}% is slightly deep.</strong> Expect a -2% cut adjustment; recut note will appear in recommendations.
          </p>
        </div>

        {/* Card 3: CUT PREVIEW Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
            CUT PREVIEW
          </p>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {previewScore}
            </span>
            <span className="text-sm font-bold text-slate-800">
              · Well Cut
            </span>
          </div>

          <span className="inline-block rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold px-3 py-1">
            Polish {polish || "Excellent"} · Symmetry {symmetry || "Good"}
          </span>
        </div>
      </div>
    </div>
  );
}
