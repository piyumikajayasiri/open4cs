"use client";

import { useState } from "react";
import { ShadcnSelect } from "@/components/ui/select";

type ColorSectionProps = {
  variety?: string;
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

const VARIETY_HUES: Record<string, string[]> = {
  "Blue Sapphire": [
    "Royal Blue",
    "Cornflower Blue",
    "Vivid Blue",
    "Violetish Blue",
    "Steel Blue",
    "Teal Blue",
  ],
  Padparadscha: [
    "Pinkish Orange",
    "Orangish Pink",
    "Orange-Pink",
    "Sunset Orange",
    "Salmon Pink",
  ],
  Ruby: [
    "Pigeon Blood Red",
    "Vivid Red",
    "Purplish Red",
    "Orangish Red",
  ],
};

const SATURATION_OPTIONS = [
  "Greyish",
  "Slightly Greyish",
  "Medium",
  "Strong",
  "Vivid",
];

export default function ColorSection({
  variety = "Blue Sapphire",
  hue,
  tone,
  saturation,
  distribution,
  zoning,
  secondaryTone = "None",
  uniformity = "Uniform",
  onHueChange,
  onToneChange,
  onSaturationChange,
  onDistributionChange,
  onZoningChange,
  onSecondaryToneChange,
  onUniformityChange,
}: ColorSectionProps) {
  const hueOptions =
    VARIETY_HUES[variety] ||
    (variety.toLowerCase().includes("pad")
      ? VARIETY_HUES["Padparadscha"]
      : variety.toLowerCase().includes("ruby")
      ? VARIETY_HUES["Ruby"]
      : VARIETY_HUES["Blue Sapphire"]);

  const currentHue = hue || hueOptions[0];
  const currentTone = tone || "6";
  const currentSat = saturation || "Vivid";
  const currentDist = distribution || "Even";
  const currentZoning = zoning || "None visible";
  const [localSecTone, setLocalSecTone] = useState(secondaryTone);
  const [localUniformity, setLocalUniformity] = useState(uniformity);

  const missingObservations: string[] = [];
  if (!hue) missingObservations.push("Primary Hue");
  if (!tone) missingObservations.push("Tone");
  if (!saturation) missingObservations.push("Saturation");

  return (
    <div className="space-y-6">
      {/* Observation Completeness Status Banner */}
      {missingObservations.length > 0 ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-xs text-amber-900 flex items-start gap-2.5">
          <span className="font-bold text-amber-700 shrink-0 mt-0.5">⚠️ Observation needed:</span>
          <div>
            Please record <span className="font-semibold">{missingObservations.join(", ")}</span> to enable calibrated color scoring.
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-xs text-emerald-900 flex items-center gap-2.5">
          <span className="font-bold text-emerald-700">✓ Color Observations Complete:</span>
          <div>Primary hue, tone, and saturation recorded for deterministic evaluation.</div>
        </div>
      )}

      {/* CARD 1: HUE & MODIFIERS */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold text-slate-800">
              Primary Hue ({variety})
            </label>
            <span className="text-[10px] text-slate-400 font-medium">
              Category-specific standard
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mb-3">
            Primary spectral color sensation characteristic of Sri Lankan corundum varieties.
          </p>
          <div className="flex flex-wrap gap-2.5">
            {hueOptions.map((hOption) => {
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
              Secondary Modifier
            </label>
            <ShadcnSelect
              value={secondaryTone || localSecTone}
              onValueChange={(val) => {
                setLocalSecTone(val);
                if (onSecondaryToneChange) onSecondaryToneChange(val);
              }}
              options={[
                "None",
                "Slight violet",
                "Violetish",
                "Greenish",
                "Purplish",
                "Pinkish",
                "Orangish",
              ]}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Color Distribution
            </label>
            <ShadcnSelect
              value={currentDist}
              onValueChange={onDistributionChange}
              options={["Even", "Slightly uneven", "Uneven"]}
            />
          </div>
        </div>
      </div>

      {/* CARD 2: TONE & SATURATION SCALES */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800">
            Tone & Saturation Scales
          </h3>
          <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 rounded-md px-2 py-0.5">
            GIA Standard Scale (1–9)
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
          <p className="text-[11px] text-slate-500">
            Measures relative lightness or darkness on the GIA scale; medium tones (5–6) optimize brilliance and color expression.
          </p>

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
          <p className="text-[11px] text-slate-500">
            Measures hue saturation and freedom from grey or brown masks; vivid saturation commands peak market premiums.
          </p>

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
              Face-Up Uniformity
            </label>
            <ShadcnSelect
              value={uniformity || localUniformity}
              onValueChange={(val) => {
                setLocalUniformity(val);
                if (onUniformityChange) onUniformityChange(val);
              }}
              options={["Uniform", "Slightly non-uniform", "Non-uniform"]}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Color Zoning
            </label>
            <ShadcnSelect
              value={currentZoning}
              onValueChange={onZoningChange}
              options={["None visible", "Slight", "Moderate", "Severe"]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
