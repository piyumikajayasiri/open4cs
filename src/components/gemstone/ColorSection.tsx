"use client";

import { useState } from "react";

type ColorSectionProps = {
  hue: string;
  tone: string;
  saturation: string;
  distribution: string;
  zoning: string;
  secondaryTone?: string;
  uniformity?: string;
  onHueChange: (value: string) => void;
  onToneChange: (value: string) => void;
  onSaturationChange: (value: string) => void;
  onDistributionChange: (value: string) => void;
  onZoningChange: (value: string) => void;
  onSecondaryToneChange?: (value: string) => void;
  onUniformityChange?: (value: string) => void;
};

const HUE_OPTIONS = [
  "Cornflower Blue",
  "Vivid Blue",
  "Royal Blue",
  "Steel Blue",
  "Teal-Blue",
];

const SATURATION_OPTIONS = [
  "Greyish",
  "Slightly Greyish",
  "Medium",
  "Strong",
  "Vivid",
];

export default function ColorSection({
  hue,
  tone,
  saturation,
  distribution,
  zoning,
  secondaryTone = "Slight violet",
  uniformity = "Uniform",
  onHueChange,
  onToneChange,
  onSaturationChange,
  onDistributionChange,
  onZoningChange,
  onSecondaryToneChange,
  onUniformityChange,
}: ColorSectionProps) {
  // Local fallbacks if state not initialized
  const currentHue = hue || "Cornflower Blue";
  const currentTone = tone || "6";
  const currentSat = saturation || "Vivid";
  const currentDist = distribution || "Even";
  const currentZoning = zoning || "None visible";
  const [localSecTone, setLocalSecTone] = useState(secondaryTone);
  const [localUniformity, setLocalUniformity] = useState(uniformity);

  // Dynamic score preview calculation for Ceylon Blue
  let colorScore = 8.6;
  if (currentSat === "Vivid") colorScore = 8.6;
  else if (currentSat === "Strong") colorScore = 7.8;
  else if (currentSat === "Medium") colorScore = 7.0;
  else colorScore = 6.2;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* LEFT COLUMN: COLOR FORM PARAMETERS (8-col) */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* CARD 1: HUE & MODIFIERS */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2.5">
              Hue
            </label>
            <div className="flex flex-wrap gap-2.5">
              {HUE_OPTIONS.map((hOption) => {
                const isSelected = currentHue === hOption;
                return (
                  <button
                    key={hOption}
                    type="button"
                    onClick={() => onHueChange(hOption)}
                    className={`px-4 py-2.5 rounded-xl text-xs transition duration-150 ${
                      isSelected
                        ? "bg-[#070D1E] text-white font-bold shadow-xs"
                        : "bg-white border border-slate-200 text-slate-700 hover:border-slate-300 font-medium"
                    }`}
                  >
                    {hOption}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Secondary Tone
              </label>
              <select
                value={secondaryTone || localSecTone}
                onChange={(e) => {
                  setLocalSecTone(e.target.value);
                  if (onSecondaryToneChange) onSecondaryToneChange(e.target.value);
                }}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs text-slate-900 outline-none transition focus:border-blue-600 cursor-pointer"
              >
                <option value="Slight violet">Slight violet</option>
                <option value="None">None</option>
                <option value="Violetish">Violetish</option>
                <option value="Greenish">Greenish</option>
                <option value="Purplish">Purplish</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Color Distribution
              </label>
              <select
                value={currentDist}
                onChange={(e) => onDistributionChange(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs text-slate-900 outline-none transition focus:border-blue-600 cursor-pointer"
              >
                <option value="Even">Even</option>
                <option value="Slightly uneven">Slightly uneven</option>
                <option value="Uneven">Uneven</option>
              </select>
            </div>
          </div>
        </div>

        {/* CARD 2: TONE & SATURATION SCALES */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800">
              Tone & Saturation scales
            </h3>
            <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 rounded-md px-2 py-0.5">
              Visual reference v4.2
            </span>
          </div>

          {/* Tone Scale (1 to 9) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">
                Tone · 1 (very light) — 9 (very dark)
              </span>
              <span className="font-bold text-slate-900">
                Selected: {currentTone}
              </span>
            </div>

            <div className="grid grid-cols-9 gap-1.5 pt-1">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((tNum) => {
                const isSelected = String(currentTone) === tNum;
                return (
                  <button
                    key={tNum}
                    type="button"
                    onClick={() => onToneChange(tNum)}
                    className={`py-2.5 rounded-xl text-xs transition duration-150 text-center ${
                      isSelected
                        ? "bg-[#070D1E] text-white font-bold shadow-xs"
                        : "bg-slate-100/80 text-slate-700 hover:bg-slate-200 font-medium"
                    }`}
                  >
                    {tNum}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Saturation Scale (Greyish -> Vivid) */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">
                Saturation · Greyish — Vivid
              </span>
              <span className="font-bold text-slate-900">
                Selected: {currentSat}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
              {SATURATION_OPTIONS.map((satOpt) => {
                const isSelected = currentSat === satOpt;
                return (
                  <button
                    key={satOpt}
                    type="button"
                    onClick={() => onSaturationChange(satOpt)}
                    className={`py-2.5 px-3 rounded-xl text-xs transition duration-150 text-center ${
                      isSelected
                        ? "bg-[#0A433A] text-white font-bold shadow-xs"
                        : "bg-white border border-slate-200 text-slate-700 hover:border-slate-300 font-medium"
                    }`}
                  >
                    {satOpt}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Uniformity & Color Zoning Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Uniformity
              </label>
              <select
                value={uniformity || localUniformity}
                onChange={(e) => {
                  setLocalUniformity(e.target.value);
                  if (onUniformityChange) onUniformityChange(e.target.value);
                }}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs text-slate-900 outline-none transition focus:border-blue-600 cursor-pointer"
              >
                <option value="Uniform">Uniform</option>
                <option value="Slightly non-uniform">Slightly non-uniform</option>
                <option value="Non-uniform">Non-uniform</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Color Zoning
              </label>
              <select
                value={currentZoning}
                onChange={(e) => onZoningChange(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs text-slate-900 outline-none transition focus:border-blue-600 cursor-pointer"
              >
                <option value="None visible">None visible</option>
                <option value="Slight">Slight</option>
                <option value="Moderate">Moderate</option>
                <option value="Severe">Severe</option>
              </select>
            </div>
          </div>

        </div>

      </div>

      {/* RIGHT COLUMN: EDUCATIONAL & COLOR PREVIEW (4-col) */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* Card 1: What does this mean? */}
        <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4 text-xs text-slate-600 space-y-1.5">
          <h4 className="font-bold text-emerald-950 text-xs">
            What does this mean?
          </h4>
          <p className="leading-relaxed text-[11px] text-emerald-900/80">
            Tone is lightness-darkness; saturation is colour intensity. For Ceylon blue, medium-medium-dark tone (5–6) with vivid saturation scores highest in Rule COL-03.
          </p>
        </div>

        {/* Card 2: Color Evaluation Preview */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <span className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase block">
            COLOR EVALUATION PREVIEW
          </span>

          <div>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
              {colorScore.toFixed(1)} · {currentSat} Blue
            </h3>
            <p className="text-xs font-semibold text-blue-600 mt-1">
              Top 12% of reference set
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${(colorScore / 10) * 100}%` }}
            />
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
            Positive: vivid saturation, even distribution. Watch: tone {currentTone} borderline dark under Rule COL-03.
          </p>
        </div>

      </div>

    </div>
  );
}
