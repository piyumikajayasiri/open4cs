"use client";

import React from "react";
import { ShadcnSelect } from "@/components/ui/select";
import { Eye, Search } from "lucide-react";

type ClaritySectionProps = {
  nakedEye: string;
  loupe10x: string;
  inclusionType: string;
  inclusionLocation: string;
  severity: string;
  onNakedEyeChange: (value: string) => void;
  onLoupe10xChange: (value: string) => void;
  onInclusionTypeChange: (value: string) => void;
  onInclusionLocationChange: (value: string) => void;
  onSeverityChange: (value: string) => void;
};

export default function ClaritySection({
  nakedEye,
  loupe10x,
  inclusionType,
  inclusionLocation,
  severity,
  onNakedEyeChange,
  onLoupe10xChange,
  onInclusionTypeChange,
  onInclusionLocationChange,
  onSeverityChange,
}: ClaritySectionProps) {
  const nakedEyeOptions = [
    { label: "Eye-clean", value: "Clean" },
    { label: "Slightly Included", value: "Slight" },
    { label: "Moderately Included", value: "Noticeable" },
    { label: "Heavily Included", value: "Obvious" },
  ];

  const loupeOptions = [
    { label: "Minute (VVS)", value: "Clean" },
    { label: "Minor (VS)", value: "Very Slight" },
    { label: "Noticeable (SI)", value: "Slight" },
    { label: "Obvious (I)", value: "Noticeable" },
    { label: "Not examined at 10×", value: "Not examined" },
  ];

  return (
    <div className="space-y-6">
      {/* Observation Protocol Advice Banner */}
      <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 text-xs text-blue-900 flex items-start gap-3">
        <Eye className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
        <div>
          <span className="font-bold">GIA Type II Corundum Clarity Protocol:</span>{" "}
          Natural corundum typically hosts microscopic rutile silk or crystalline minerals. Assess first at 30 cm naked-eye distance in daylight illumination, then confirm structure under 10× binocular magnification.
        </div>
      </div>

      {/* Card 1: Naked Eye Observation */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900">
            Naked Eye Observation (Unaided Vision at 30 cm)
          </h3>
          <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 rounded-md px-2 py-0.5">
            40% Clarity Weight
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {nakedEyeOptions.map((opt) => {
            const isSelected =
              nakedEye === opt.value ||
              (!nakedEye && opt.value === "Clean");

            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onNakedEyeChange(opt.value)}
                className={`px-4 py-3.5 rounded-xl text-xs sm:text-sm font-semibold transition border text-center ${
                  isSelected
                    ? "bg-[#0F172A] text-white border-[#0F172A] shadow-xs"
                    : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Card 2: 10x Loupe Examination */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-900">
              10× Loupe Magnification Examination
            </h3>
          </div>
          <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 rounded-md px-2 py-0.5">
            35% Clarity Weight
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {loupeOptions.map((opt) => {
            const isSelected =
              loupe10x === opt.value ||
              (!loupe10x && opt.value === "Very Slight");

            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onLoupe10xChange(opt.value)}
                className={`px-3 py-3 rounded-xl text-xs font-semibold transition border text-center ${
                  isSelected
                    ? "bg-[#0F172A] text-white border-[#0F172A] shadow-xs"
                    : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {loupe10x === "Not examined" && (
          <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 flex items-start gap-2">
            <span className="font-bold text-amber-600">⚠️ Notice:</span>
            <span>
              10× magnification was not performed. The clarity score uses a provisional neutral estimate based on unaided eye observation. Commercial valuation requires 10× loupe confirmation.
            </span>
          </div>
        )}
      </div>

      {/* Card 3: Inclusions Description, Location & Severity */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">
          Inclusion Characterization & Severity Matrix
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Inclusion Type */}
          <div>
            <label
              htmlFor="inclusion-type"
              className="block text-xs font-semibold text-slate-600 mb-2"
            >
              Primary Inclusion Type
            </label>
            <ShadcnSelect
              id="inclusion-type"
              value={inclusionType || "Silk needles"}
              onValueChange={onInclusionTypeChange}
              options={[
                "Silk needles",
                "Mineral crystals",
                "Liquid feathers / fingerprints",
                "Color zoning planes",
                "Cavities / pinpoints",
                "No inclusions resolved",
              ]}
            />
          </div>

          {/* Inclusion Location */}
          <div>
            <label
              htmlFor="inclusion-location"
              className="block text-xs font-semibold text-slate-600 mb-2"
            >
              Inclusion Location
            </label>
            <ShadcnSelect
              id="inclusion-location"
              value={inclusionLocation || "Near edge — low impact"}
              onValueChange={onInclusionLocationChange}
              options={[
                "Near edge — low impact",
                "Table center — high impact",
                "Pavilion side — moderate impact",
                "Girdle region — low impact",
                "Scattered throughout",
              ]}
            />
          </div>

          {/* Inclusion Severity */}
          <div>
            <label
              htmlFor="inclusion-severity"
              className="block text-xs font-semibold text-slate-600 mb-2"
            >
              Severity Rating
            </label>
            <ShadcnSelect
              id="inclusion-severity"
              value={severity || "Minor"}
              onValueChange={onSeverityChange}
              options={[
                { value: "None", label: "None (Clean)" },
                { value: "Minor", label: "Minor (Low Relief)" },
                { value: "Moderate", label: "Moderate" },
                { value: "Severe", label: "Severe (Structural Risk)" },
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
