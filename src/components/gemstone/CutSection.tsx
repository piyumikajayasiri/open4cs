"use client";

import React, { useState } from "react";
import { ShadcnSelect } from "@/components/ui/select";
import { Ruler, Sparkles } from "lucide-react";

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

  // Sanitize negative input strictly
  const handlePositiveInput = (val: string, setter: (v: string) => void) => {
    const clean = val.replace(/-/g, "");
    setter(clean);
  };

  const lVal = parseFloat(length);
  const wVal = parseFloat(width);
  const dVal = parseFloat(depth);

  const isValidL = !isNaN(lVal) && lVal > 0;
  const isValidW = !isNaN(wVal) && wVal > 0;
  const isValidD = !isNaN(dVal) && dVal > 0;

  const hasValidDimensions = isValidL && isValidW;
  const hasValidDepth = isValidD && isValidW;

  const lwRatioNumber = hasValidDimensions ? lVal / wVal : null;
  const lwRatio = lwRatioNumber !== null ? lwRatioNumber.toFixed(2) : "—";

  const depthPercentNumber = hasValidDepth ? (dVal / wVal) * 100 : null;
  const depthPercent = depthPercentNumber !== null ? depthPercentNumber.toFixed(1) : "—";

  const getLwAssessment = () => {
    if (lwRatioNumber === null) {
      return { text: "Dimensions required", color: "text-rose-500 font-medium" };
    }
    if (lwRatioNumber < 1.15) {
      return { text: "Nearly round / square", color: "text-slate-600 font-semibold" };
    }
    if (lwRatioNumber < 1.30) {
      return { text: "Slightly wide", color: "text-blue-600 font-semibold" };
    }
    if (lwRatioNumber <= 1.55) {
      return { text: "Ideal oval range", color: "text-emerald-600 font-semibold" };
    }
    return { text: "Elongated outline", color: "text-amber-600 font-semibold" };
  };

  const getDepthAssessment = () => {
    if (depthPercentNumber === null) {
      return { text: "Depth required", color: "text-rose-500 font-medium" };
    }
    if (depthPercentNumber < 55) {
      return { text: "Shallow cut (window risk)", color: "text-amber-600 font-semibold" };
    }
    if (depthPercentNumber <= 68) {
      return { text: "Ideal depth proportion", color: "text-emerald-600 font-semibold" };
    }
    if (depthPercentNumber <= 76) {
      return { text: "Slightly deep", color: "text-blue-600 font-semibold" };
    }
    return { text: "Deep pavilion (excess weight)", color: "text-amber-600 font-semibold" };
  };

  const lwAssessment = getLwAssessment();
  const depthAssessment = getDepthAssessment();

  return (
    <div className="space-y-6">
      {/* Card 1: Millimeter Dimensions & Proportional Ratios */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Ruler className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Millimeter Dimensions (Electronic Caliper)
            </h3>
          </div>
          <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 rounded-md px-2 py-0.5">
            Calibrated mm (Positive &gt; 0)
          </span>
        </div>

        {/* 3 Inline Input Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="cut-length" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Length (mm) <span className="text-rose-500">*</span>
            </label>
            <input
              id="cut-length"
              type="number"
              step="0.01"
              min="0.01"
              max="100"
              value={length}
              placeholder="e.g. 8.42"
              onChange={(e) => handlePositiveInput(e.target.value, onLengthChange)}
              className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-xs font-semibold outline-none transition focus:ring-1 ${
                !isValidL && length !== ""
                  ? "border-rose-400 text-rose-700 focus:border-rose-600 focus:ring-rose-200"
                  : "border-slate-200 text-slate-800 focus:border-blue-600 focus:ring-blue-600"
              }`}
            />
          </div>

          <div>
            <label htmlFor="cut-width" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Width (mm) <span className="text-rose-500">*</span>
            </label>
            <input
              id="cut-width"
              type="number"
              step="0.01"
              min="0.01"
              max="100"
              value={width}
              placeholder="e.g. 6.31"
              onChange={(e) => handlePositiveInput(e.target.value, onWidthChange)}
              className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-xs font-semibold outline-none transition focus:ring-1 ${
                !isValidW && width !== ""
                  ? "border-rose-400 text-rose-700 focus:border-rose-600 focus:ring-rose-200"
                  : "border-slate-200 text-slate-800 focus:border-blue-600 focus:ring-blue-600"
              }`}
            />
          </div>

          <div>
            <label htmlFor="cut-depth" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Depth (mm) <span className="text-rose-500">*</span>
            </label>
            <input
              id="cut-depth"
              type="number"
              step="0.01"
              min="0.01"
              max="100"
              value={depth}
              placeholder="e.g. 4.55"
              onChange={(e) => handlePositiveInput(e.target.value, onDepthChange)}
              className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-xs font-semibold outline-none transition focus:ring-1 ${
                !isValidD && depth !== ""
                  ? "border-rose-400 text-rose-700 focus:border-rose-600 focus:ring-rose-200"
                  : "border-slate-200 text-slate-800 focus:border-blue-600 focus:ring-blue-600"
              }`}
            />
          </div>
        </div>

        {/* Calculated Proportions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div className="rounded-xl bg-blue-50/60 p-4 border border-blue-100">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <span>Length-to-Width Ratio</span>
              <span className="text-blue-600 font-mono">Length ÷ Width</span>
            </div>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {lwRatio}
            </p>
            <p className={`text-xs mt-0.5 ${lwAssessment.color}`}>
              {lwAssessment.text}
            </p>
          </div>

          <div className="rounded-xl bg-blue-50/60 p-4 border border-blue-100">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <span>Depth Percentage</span>
              <span className="text-blue-600 font-mono">(Depth ÷ Width) × 100</span>
            </div>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {depthPercentNumber !== null ? `${depthPercent}%` : "—"}
            </p>
            <p className={`text-xs mt-0.5 ${depthAssessment.color}`}>
              {depthAssessment.text}
            </p>
          </div>
        </div>
      </div>

      {/* Card 2: Faceting & Lapidary Quality */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900">
            Faceting Precision, Polish & Optical Behavior
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Symmetry */}
          <div>
            <label htmlFor="cut-symmetry" className="block text-xs font-semibold text-slate-600 mb-1.5">
              Symmetry (25% Weight)
            </label>
            <ShadcnSelect
              id="cut-symmetry"
              value={symmetry || "Good"}
              onValueChange={onSymmetryChange}
              options={["Excellent", "Very Good", "Good", "Fair", "Poor"]}
            />
          </div>

          {/* Polish */}
          <div>
            <label htmlFor="cut-polish" className="block text-xs font-semibold text-slate-600 mb-1.5">
              Surface Polish (20% Weight)
            </label>
            <ShadcnSelect
              id="cut-polish"
              value={polish || "Good"}
              onValueChange={onPolishChange}
              options={["Excellent", "Very Good", "Good", "Fair", "Poor"]}
            />
          </div>

          {/* Windowing */}
          <div>
            <label htmlFor="cut-windowing" className="block text-xs font-semibold text-slate-600 mb-1.5">
              Windowing (Light Leakage, 20% Weight)
            </label>
            <ShadcnSelect
              id="cut-windowing"
              value={windowing || "None"}
              onValueChange={onWindowingChange}
              options={["None", "Slight", "Moderate", "Severe"]}
            />
          </div>

          {/* Extinction */}
          <div>
            <label htmlFor="cut-extinction" className="block text-xs font-semibold text-slate-600 mb-1.5">
              Extinction (Dark Zones, 20% Weight)
            </label>
            <ShadcnSelect
              id="cut-extinction"
              value={extinction || "None"}
              onValueChange={onExtinctionChange}
              options={["None", "Minimal", "Slight", "Moderate", "Severe"]}
            />
          </div>

          {/* Bulging */}
          <div>
            <label htmlFor="cut-bulging" className="block text-xs font-semibold text-slate-600 mb-1.5">
              Bulging (Pavilion Belly, 15% Weight)
            </label>
            <ShadcnSelect
              id="cut-bulging"
              value={bulging || "None"}
              onValueChange={onBulgingChange}
              options={["None", "Slight", "Moderate", "Severe"]}
            />
          </div>

          {/* Proportions descriptor */}
          <div>
            <label htmlFor="cut-proportions" className="block text-xs font-semibold text-slate-600 mb-1.5">
              Proportion Silhouette
            </label>
            <ShadcnSelect
              id="cut-proportions"
              value={proportions}
              onValueChange={setProportions}
              options={[
                "Well proportioned",
                "Deep pavilion",
                "Shallow crown",
                "Bulging belly",
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
